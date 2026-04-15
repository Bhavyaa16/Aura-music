"""
Aura Music - Songs Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db
from ml.recommender import get_recommender

songs_bp = Blueprint("songs", __name__)


def _serialize(song):
    """Ensure all values are JSON serializable."""
    if isinstance(song, dict):
        return {k: (None if (isinstance(v, float) and (v != v)) else v) for k, v in song.items()}
    return song


@songs_bp.route("/meta", methods=["GET"])
def meta():
    rec = get_recommender()
    return jsonify(rec.get_meta())


@songs_bp.route("/songs", methods=["GET"])
def get_songs():
    mood = request.args.get("mood")
    genre = request.args.get("genre")
    language = request.args.get("language")
    limit = min(int(request.args.get("limit", 50)), 100)
    offset = int(request.args.get("offset", 0))

    rec = get_recommender()
    songs, total = rec.get_songs(mood=mood, genre=genre, language=language, limit=limit, offset=offset)

    # Inject liked status if authenticated
    liked_ids = set()
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            conn = get_db()
            rows = conn.execute(
                "SELECT song_id FROM liked_songs WHERE user_id=?", (int(user_id),)
            ).fetchall()
            conn.close()
            liked_ids = {r["song_id"] for r in rows}
    except Exception:
        pass

    result = []
    for s in songs:
        s = _serialize(s)
        s["liked"] = s["song_id"] in liked_ids
        result.append(s)

    return jsonify({"songs": result, "total": total, "offset": offset, "limit": limit})


@songs_bp.route("/search", methods=["GET"])
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"songs": []})

    rec = get_recommender()
    songs = rec.search_songs(q, limit=30)

    liked_ids = set()
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            conn = get_db()
            rows = conn.execute(
                "SELECT song_id FROM liked_songs WHERE user_id=?", (int(user_id),)
            ).fetchall()
            conn.close()
            liked_ids = {r["song_id"] for r in rows}
    except Exception:
        pass

    result = [dict(**_serialize(s), liked=s["song_id"] in liked_ids) for s in songs]
    return jsonify({"songs": result, "query": q})


@songs_bp.route("/recommend/<song_id>", methods=["GET"])
def recommend(song_id):
    rec = get_recommender()
    similar = rec.get_similar_songs(song_id, n=10)
    return jsonify({"songs": [_serialize(s) for s in similar], "song_id": song_id})


@songs_bp.route("/playlist", methods=["GET"])
@jwt_required(optional=True)
def playlist():
    mood = request.args.get("mood")
    genre = request.args.get("genre")

    liked_song_ids = []
    user_id = get_jwt_identity()
    if user_id:
        conn = get_db()
        rows = conn.execute(
            "SELECT song_id FROM liked_songs WHERE user_id=?", (int(user_id),)
        ).fetchall()
        conn.close()
        liked_song_ids = [r["song_id"] for r in rows]

    rec = get_recommender()
    songs = rec.generate_playlist(liked_song_ids, mood=mood, genre=genre, n=20)
    return jsonify({"songs": [_serialize(s) for s in songs], "mood": mood, "genre": genre})


@songs_bp.route("/like/<song_id>", methods=["POST"])
@jwt_required()
def toggle_like(song_id):
    user_id = int(get_jwt_identity())
    conn = get_db()

    existing = conn.execute(
        "SELECT id FROM liked_songs WHERE user_id=? AND song_id=?", (user_id, song_id)
    ).fetchone()

    if existing:
        conn.execute("DELETE FROM liked_songs WHERE user_id=? AND song_id=?", (user_id, song_id))
        conn.commit()
        conn.close()
        return jsonify({"liked": False, "song_id": song_id})
    else:
        conn.execute(
            "INSERT INTO liked_songs (user_id, song_id) VALUES (?, ?)", (user_id, song_id)
        )
        conn.commit()
        conn.close()
        return jsonify({"liked": True, "song_id": song_id})


@songs_bp.route("/liked", methods=["GET"])
@jwt_required()
def get_liked():
    user_id = int(get_jwt_identity())
    conn = get_db()
    rows = conn.execute(
        "SELECT song_id FROM liked_songs WHERE user_id=? ORDER BY liked_at DESC", (user_id,)
    ).fetchall()
    conn.close()

    liked_ids = [r["song_id"] for r in rows]
    rec = get_recommender()
    songs = [rec.get_song_by_id(sid) for sid in liked_ids]
    songs = [_serialize(dict(**s, liked=True)) for s in songs if s]

    return jsonify({"songs": songs})


@songs_bp.route("/classify-mood", methods=["POST"])
def classify_mood():
    data = request.get_json()
    rec = get_recommender()
    mood = rec.classify_mood_nb(data)
    return jsonify({"mood": mood})
