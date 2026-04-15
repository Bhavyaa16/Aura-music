"""
Aura Music - ML Recommendation Engine
Algorithms: KNN (recommendations), K-Means (mood clustering), Multinomial Naive Bayes (mood classification)
"""

import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import KMeans
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
import pickle
import os

FEATURES = ["danceability", "energy", "valence", "tempo", "popularity"]
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "songs.csv")

os.makedirs(MODEL_DIR, exist_ok=True)


class AuraRecommender:
    def __init__(self):
        self.df = None
        self.scaler = MinMaxScaler()
        self.knn_model = None
        self.kmeans_model = None
        self.nb_model = None
        self.nb_le = None  # label encoder for NB
        self.X_scaled = None
        self._load_or_train()

    def _load_data(self):
        df = pd.read_csv(DATA_PATH)
        df = df.drop_duplicates(subset=["track_name", "artist"])
        df = df.reset_index(drop=True)
        return df

    def _load_or_train(self):
        knn_path = os.path.join(MODEL_DIR, "knn.pkl")
        km_path = os.path.join(MODEL_DIR, "kmeans.pkl")
        nb_path = os.path.join(MODEL_DIR, "nb.pkl")
        scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
        df_path = os.path.join(MODEL_DIR, "df.pkl")

        if all(os.path.exists(p) for p in [knn_path, km_path, nb_path, scaler_path, df_path]):
            with open(knn_path, "rb") as f:
                self.knn_model = pickle.load(f)
            with open(km_path, "rb") as f:
                self.kmeans_model = pickle.load(f)
            with open(nb_path, "rb") as f:
                self.nb_model, self.nb_le = pickle.load(f)
            with open(scaler_path, "rb") as f:
                self.scaler = pickle.load(f)
            with open(df_path, "rb") as f:
                self.df = pickle.load(f)
            X = self.df[FEATURES].values
            self.X_scaled = self.scaler.transform(X)
            print("✅ ML models loaded from cache.")
        else:
            self._train()

    def _train(self):
        print("🔧 Training ML models...")
        self.df = self._load_data()
        X = self.df[FEATURES].values

        # --- Scale features ---
        self.X_scaled = self.scaler.fit_transform(X)

        # --- KNN (K=11 to get top 10 neighbors excluding self) ---
        self.knn_model = NearestNeighbors(n_neighbors=11, metric="euclidean", algorithm="auto")
        self.knn_model.fit(self.X_scaled)

        # --- K-Means Clustering (5 mood clusters) ---
        self.kmeans_model = KMeans(n_clusters=5, random_state=42, n_init=10)
        clusters = self.kmeans_model.fit_predict(self.X_scaled)
        self.df["cluster"] = clusters

        # Map clusters to moods based on centroid characteristics
        centroids = self.kmeans_model.cluster_centers_
        # centroids columns: danceability, energy, valence, tempo, popularity (all scaled 0-1)
        MOOD_LABELS = []
        for c in centroids:
            d, e, v, t, p = c
            if v > 0.6 and e > 0.6 and d > 0.65:
                MOOD_LABELS.append("party")
            elif v > 0.55 and e > 0.5:
                MOOD_LABELS.append("happy")
            elif v < 0.35 and e < 0.45:
                MOOD_LABELS.append("sad")
            elif e < 0.5 and 0.35 <= v <= 0.65:
                MOOD_LABELS.append("chill")
            else:
                MOOD_LABELS.append("romantic")
        self.df["cluster_mood"] = self.df["cluster"].map(lambda c: MOOD_LABELS[c])

        # --- Multinomial Naive Bayes for Mood Classification ---
        # Discretize features to non-negative integers for MultinomialNB
        X_int = np.round(self.X_scaled * 100).astype(int)
        self.nb_le = LabelEncoder()
        y = self.nb_le.fit_transform(self.df["mood"].values)
        self.nb_model = MultinomialNB(alpha=1.0)
        self.nb_model.fit(X_int, y)

        # Save models
        knn_path = os.path.join(MODEL_DIR, "knn.pkl")
        km_path = os.path.join(MODEL_DIR, "kmeans.pkl")
        nb_path = os.path.join(MODEL_DIR, "nb.pkl")
        scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
        df_path = os.path.join(MODEL_DIR, "df.pkl")

        with open(knn_path, "wb") as f:
            pickle.dump(self.knn_model, f)
        with open(km_path, "wb") as f:
            pickle.dump(self.kmeans_model, f)
        with open(nb_path, "wb") as f:
            pickle.dump((self.nb_model, self.nb_le), f)
        with open(scaler_path, "wb") as f:
            pickle.dump(self.scaler, f)
        with open(df_path, "wb") as f:
            pickle.dump(self.df, f)

        print(f"✅ Training done. Dataset: {len(self.df)} songs.")
        nb_acc = (self.nb_le.inverse_transform(self.nb_model.predict(X_int)) == self.df["mood"].values).mean()
        print(f"   Naive Bayes train accuracy: {nb_acc:.2%}")

    def get_similar_songs(self, song_id, n=10):
        """KNN-based similar song recommendation."""
        idx_list = self.df.index[self.df["song_id"] == song_id].tolist()
        if not idx_list:
            return []
        idx = idx_list[0]
        query = self.X_scaled[idx].reshape(1, -1)
        distances, indices = self.knn_model.kneighbors(query, n_neighbors=n + 1)
        neighbor_indices = [i for i in indices[0] if i != idx][:n]
        return self.df.iloc[neighbor_indices].to_dict(orient="records")

    def generate_playlist(self, liked_song_ids, mood=None, genre=None, n=20):
        """KNN-based playlist generation from liked songs."""
        if not liked_song_ids:
            # Fallback: filter by mood/genre and return popular songs
            filtered = self.df.copy()
            if mood:
                filtered = filtered[filtered["mood"] == mood]
            if genre:
                filtered = filtered[filtered["genre"] == genre]
            if filtered.empty:
                filtered = self.df.copy()
            return filtered.sort_values("popularity", ascending=False).head(n).to_dict(orient="records")

        # Get indices of liked songs
        liked_indices = []
        for sid in liked_song_ids:
            idx_list = self.df.index[self.df["song_id"] == sid].tolist()
            if idx_list:
                liked_indices.append(idx_list[0])

        if not liked_indices:
            return []

        # Compute average feature vector of liked songs
        avg_vector = self.X_scaled[liked_indices].mean(axis=0).reshape(1, -1)

        # Use KNN to find nearest songs to this average vector
        distances, indices = self.knn_model.kneighbors(avg_vector, n_neighbors=min(n * 2, len(self.df)))
        candidate_indices = [i for i in indices[0] if i not in liked_indices]

        candidates = self.df.iloc[candidate_indices].copy()

        # Optional mood/genre filter
        if mood:
            filtered = candidates[candidates["mood"] == mood]
            if len(filtered) >= n // 2:
                candidates = filtered
        if genre:
            filtered = candidates[candidates["genre"] == genre]
            if len(filtered) >= n // 2:
                candidates = filtered

        return candidates.head(n).to_dict(orient="records")

    def classify_mood_nb(self, features_dict):
        """Use Multinomial Naive Bayes to classify mood of a song."""
        vec = np.array([[
            features_dict.get("danceability", 0.5),
            features_dict.get("energy", 0.5),
            features_dict.get("valence", 0.5),
            features_dict.get("tempo", 120) / 200,  # normalize tempo
            features_dict.get("popularity", 50) / 100,
        ]])
        vec_scaled = self.scaler.transform(vec)
        vec_int = np.round(vec_scaled * 100).astype(int)
        pred = self.nb_model.predict(vec_int)
        return self.nb_le.inverse_transform(pred)[0]

    def get_songs(self, mood=None, genre=None, language=None, limit=50, offset=0):
        """Filter songs with optional mood/genre/language."""
        df = self.df.copy()
        if mood:
            df = df[df["mood"] == mood]
        if genre:
            df = df[df["genre"] == genre]
        if language:
            df = df[df["language"] == language]
        df = df.sort_values("popularity", ascending=False)
        total = len(df)
        page = df.iloc[offset: offset + limit]
        return page.to_dict(orient="records"), total

    def search_songs(self, query, limit=20):
        """Search by track name or artist."""
        q = query.lower().strip()
        df = self.df.copy()
        mask = (
            df["track_name"].str.lower().str.contains(q, na=False) |
            df["artist"].str.lower().str.contains(q, na=False)
        )
        results = df[mask].sort_values("popularity", ascending=False).head(limit)
        return results.to_dict(orient="records")

    def get_song_by_id(self, song_id):
        row = self.df[self.df["song_id"] == song_id]
        if row.empty:
            return None
        return row.iloc[0].to_dict()

    def get_meta(self):
        return {
            "genres": sorted(self.df["genre"].unique().tolist()),
            "moods": sorted(self.df["mood"].unique().tolist()),
            "languages": sorted(self.df["language"].unique().tolist()),
            "total": len(self.df),
        }


# Singleton
_recommender = None


def get_recommender():
    global _recommender
    if _recommender is None:
        _recommender = AuraRecommender()
    return _recommender
