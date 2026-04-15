"""
Aura Music - Flask Backend
"""

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import init_db
from routes.auth import auth_bp
from routes.songs import songs_bp
import os

app = Flask(__name__)

# Config
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "aura-music-super-secret-key-2024")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 60 * 60 * 24 * 7  # 7 days

CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
jwt = JWTManager(app)

# Init DB
init_db()

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(songs_bp, url_prefix="/api")


@app.route("/api/health")
def health():
    return {"status": "ok", "message": "Aura Music API is running 🎵"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"🎵 Starting Aura Music API on {host}:{port} (debug={debug})...")
    app.run(host=host, port=port, debug=debug)
