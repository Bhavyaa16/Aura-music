# 🎵 Aura Music — AI-Powered Music Recommendation App

> College Project | React + Flask + Scikit-learn + SQLite

---

## 🏗️ Tech Stack

| Layer      | Tech                              |
|------------|-----------------------------------|
| Frontend   | React 18, Tailwind CSS, React Router |
| Backend    | Python Flask, Flask-JWT-Extended  |
| ML Engine  | Scikit-learn (KNN, K-Means, NB)   |
| Database   | SQLite                            |
| Auth       | JWT (JSON Web Tokens)             |

## 🧠 ML Algorithms Used

| Algorithm              | Usage                                              |
|------------------------|----------------------------------------------------|
| K-Nearest Neighbours   | Similar song recommendation + Playlist generation  |
| K-Means Clustering     | Mood clustering (Happy/Sad/Party/Chill/Romantic)   |
| Multinomial Naive Bayes| Mood classification from audio features            |

---

## 📁 Project Structure

```
aura-music/
├── backend/
│   ├── app.py                  # Flask entry point
│   ├── database.py             # SQLite setup
│   ├── requirements.txt
│   ├── generate_dataset.py     # Dataset generator (run first!)
│   ├── data/
│   │   └── songs.csv           # Generated dataset
│   ├── ml/
│   │   └── recommender.py      # KNN + K-Means + NB engine
│   └── routes/
│       ├── auth.py             # /signup, /login, /me
│       └── songs.py            # /songs, /search, /recommend, /playlist, /like, /liked
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   └── api.js
        ├── components/
        │   ├── Navbar.js
        │   ├── SongCard.js
        │   └── SimilarSongsModal.js
        └── pages/
            ├── Landing.js
            ├── Login.js
            ├── Signup.js
            ├── Home.js
            ├── LikedSongs.js
            └── Playlist.js
```

---

## 🚀 Setup & Run

### Prerequisites
- Python 3.9+
- Node.js 18+
- pip

### Step 1 — Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Step 2 — Generate Dataset

```bash
cd backend
python generate_dataset.py
```

This creates `data/songs.csv` with 180+ songs including audio features, mood labels, Spotify & YouTube Music links.

### Step 3 — Start Backend

```bash
cd backend
python app.py
```

The API runs at **http://localhost:5000**

> On first run, the ML models (KNN, K-Means, Naive Bayes) are trained and cached automatically. This takes ~5 seconds.

### Step 4 — Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## 🔌 API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/signup` | Register new user |
| POST | `/api/login` | Login, get JWT token |
| GET | `/api/me` | Get current user (JWT required) |

### Songs
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/songs` | All songs (filter: mood, genre, language, limit, offset) |
| GET | `/api/search?q=` | Search by name or artist |
| GET | `/api/recommend/<song_id>` | KNN similar songs |
| GET | `/api/playlist` | AI playlist (JWT optional, mood/genre filters) |
| POST | `/api/like/<song_id>` | Toggle like (JWT required) |
| GET | `/api/liked` | Get liked songs (JWT required) |
| GET | `/api/meta` | Get genres, moods, languages list |

---

## 🎨 Features

- **Landing Page** — animated particle background, feature showcase
- **Auth** — JWT-based Sign Up / Login / Logout
- **Home** — song grid with mood/genre/language/search filters, pagination
- **Song Cards** — poster, like button, mood badge, popularity bar, similar songs, Spotify & YT Music links
- **Similar Songs Modal** — KNN-powered 10 similar songs
- **Liked Songs** — heart-toggle, persisted per user
- **AI Playlist** — KNN generates 20-song playlist from liked songs + optional filters
- **Responsive UI** — works on mobile, tablet, desktop

---

## 📊 Dataset

Auto-generated from 180+ real songs spanning:
- **Genres**: Pop, Hip-Hop, Rock, EDM, Bollywood, K-Pop, Latin, Metal, Indie, Alternative, Country
- **Languages**: English, Hindi, Korean, Spanish
- **Moods**: Happy, Sad, Party, Chill, Romantic (assigned via audio features)
- **Audio Features**: danceability, energy, valence, tempo, popularity
- **Links**: Spotify search + YouTube Music search (auto-generated)

---

## 🎓 College Project Notes

- All ML algorithms are standard college curriculum algorithms
- No external recommendation APIs used
- Full JWT authentication from scratch
- SQLite for zero-setup database
- Clean, modular code structure

---

## ☁️ Production Deployment

This repo is now ready for a real hosted deployment without keeping your terminal open.

### Docker compose (quick hosted preview)

From the project root:

```bash
docker compose build
docker compose up -d
```

- Frontend will be visible at `http://localhost:3000`
- Backend API is available at `http://localhost:5000`

### Production host setup

1. Deploy `backend/` as a Python web service.
   - Use `gunicorn app:app --bind 0.0.0.0:$PORT`.
   - Expose `PORT`, `HOST`, and `FLASK_DEBUG=0`.

2. Deploy `frontend/` as a static site.
   - Build the app with `npm run build`.
   - Set `REACT_APP_API_BASE_URL=https://<your-backend-host>/api` during build.

### Recommended hosts

- Frontend: Vercel, Netlify, or static site service
- Backend: Render, Railway, or any Docker-compatible host

### Example environment

For a deployed frontend:

```text
REACT_APP_API_BASE_URL=https://your-backend.example.com/api
```

Then rebuild the frontend to bake the API URL into the production bundle.

### Useful files added

- `.gitignore`
- `docker-compose.yml`
- `backend/Procfile`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `frontend/.env.production.example`
- `backend/.dockerignore`
- `frontend/.dockerignore`

