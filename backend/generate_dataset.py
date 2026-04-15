"""
Aura Music - Dataset Generator
Generates a realistic music dataset with Spotify/YouTube links.
Uses a synthetic dataset based on Kaggle Spotify tracks schema.
"""

import pandas as pd
import numpy as np
import urllib.parse
import os

np.random.seed(42)

SONGS_DATA = [
    # (track_name, artist, genre, language)
    ("Blinding Lights", "The Weeknd", "pop", "english"),
    ("Shape of You", "Ed Sheeran", "pop", "english"),
    ("Dance Monkey", "Tones and I", "pop", "english"),
    ("Rockstar", "Post Malone", "hip-hop", "english"),
    ("God's Plan", "Drake", "hip-hop", "english"),
    ("HUMBLE.", "Kendrick Lamar", "hip-hop", "english"),
    ("Old Town Road", "Lil Nas X", "country", "english"),
    ("Sunflower", "Post Malone", "pop", "english"),
    ("Someone You Loved", "Lewis Capaldi", "pop", "english"),
    ("Bad Guy", "Billie Eilish", "pop", "english"),
    ("Happier", "Marshmello", "edm", "english"),
    ("Closer", "The Chainsmokers", "edm", "english"),
    ("Levitating", "Dua Lipa", "pop", "english"),
    ("Watermelon Sugar", "Harry Styles", "pop", "english"),
    ("Peaches", "Justin Bieber", "pop", "english"),
    ("Save Your Tears", "The Weeknd", "pop", "english"),
    ("Stay", "The Kid LAROI", "pop", "english"),
    ("Montero", "Lil Nas X", "pop", "english"),
    ("Driver's License", "Olivia Rodrigo", "pop", "english"),
    ("Good 4 U", "Olivia Rodrigo", "pop", "english"),
    ("Industry Baby", "Lil Nas X", "hip-hop", "english"),
    ("Heat Waves", "Glass Animals", "indie", "english"),
    ("Cold Heart", "Elton John", "pop", "english"),
    ("Permission to Dance", "BTS", "k-pop", "korean"),
    ("Butter", "BTS", "k-pop", "korean"),
    ("Dynamite", "BTS", "k-pop", "korean"),
    ("Savage Love", "Jawsh 685", "pop", "english"),
    ("Mood", "24kGoldn", "pop", "english"),
    ("Lemon Tree", "Fools Garden", "pop", "english"),
    ("Astronaut in the Ocean", "Masked Wolf", "hip-hop", "english"),
    ("Beggin", "Maneskin", "rock", "english"),
    ("Believer", "Imagine Dragons", "rock", "english"),
    ("Thunder", "Imagine Dragons", "rock", "english"),
    ("Enemy", "Imagine Dragons", "rock", "english"),
    ("Bones", "Imagine Dragons", "rock", "english"),
    ("Radioactive", "Imagine Dragons", "rock", "english"),
    ("Natural", "Imagine Dragons", "rock", "english"),
    ("Demons", "Imagine Dragons", "rock", "english"),
    ("Warriors", "Imagine Dragons", "rock", "english"),
    ("Centuries", "Fall Out Boy", "rock", "english"),
    ("Immortals", "Fall Out Boy", "rock", "english"),
    ("Sugar", "Maroon 5", "pop", "english"),
    ("Girls Like You", "Maroon 5", "pop", "english"),
    ("Animals", "Maroon 5", "pop", "english"),
    ("Memories", "Maroon 5", "pop", "english"),
    ("Maps", "Maroon 5", "pop", "english"),
    ("Uptown Funk", "Bruno Mars", "funk", "english"),
    ("24K Magic", "Bruno Mars", "pop", "english"),
    ("That's What I Like", "Bruno Mars", "pop", "english"),
    ("Treasure", "Bruno Mars", "pop", "english"),
    ("Locked Out of Heaven", "Bruno Mars", "pop", "english"),
    ("Grenade", "Bruno Mars", "pop", "english"),
    ("Just the Way You Are", "Bruno Mars", "pop", "english"),
    ("When I Was Your Man", "Bruno Mars", "pop", "english"),
    ("Bohemian Rhapsody", "Queen", "rock", "english"),
    ("We Will Rock You", "Queen", "rock", "english"),
    ("Don't Stop Me Now", "Queen", "rock", "english"),
    ("Under Pressure", "Queen", "rock", "english"),
    ("Somebody to Love", "Queen", "rock", "english"),
    ("We Are the Champions", "Queen", "rock", "english"),
    ("Hotel California", "Eagles", "rock", "english"),
    ("Sweet Home Alabama", "Lynyrd Skynyrd", "rock", "english"),
    ("Enter Sandman", "Metallica", "metal", "english"),
    ("Nothing Else Matters", "Metallica", "metal", "english"),
    ("Smells Like Teen Spirit", "Nirvana", "rock", "english"),
    ("Come as You Are", "Nirvana", "rock", "english"),
    ("Wonderwall", "Oasis", "rock", "english"),
    ("Champagne Supernova", "Oasis", "rock", "english"),
    ("Africa", "Toto", "pop", "english"),
    ("Take on Me", "a-ha", "pop", "english"),
    ("Never Gonna Give You Up", "Rick Astley", "pop", "english"),
    ("Don't You Want Me", "Human League", "pop", "english"),
    ("Sweet Dreams", "Eurythmics", "pop", "english"),
    ("Girls Just Want to Have Fun", "Cyndi Lauper", "pop", "english"),
    ("Wake Me Up", "Avicii", "edm", "english"),
    ("Levels", "Avicii", "edm", "english"),
    ("Lean On", "Major Lazer", "edm", "english"),
    ("Titanium", "David Guetta", "edm", "english"),
    ("Animals", "Martin Garrix", "edm", "english"),
    ("One More Time", "Daft Punk", "edm", "english"),
    ("Get Lucky", "Daft Punk", "pop", "english"),
    ("Around the World", "Daft Punk", "edm", "english"),
    ("Thinking Out Loud", "Ed Sheeran", "pop", "english"),
    ("Perfect", "Ed Sheeran", "pop", "english"),
    ("Photograph", "Ed Sheeran", "pop", "english"),
    ("Castle on the Hill", "Ed Sheeran", "pop", "english"),
    ("Galway Girl", "Ed Sheeran", "pop", "english"),
    ("Bad Habits", "Ed Sheeran", "pop", "english"),
    ("Shivers", "Ed Sheeran", "pop", "english"),
    ("Overpass Graffiti", "Ed Sheeran", "pop", "english"),
    ("Hello", "Adele", "pop", "english"),
    ("Rolling in the Deep", "Adele", "pop", "english"),
    ("Someone Like You", "Adele", "pop", "english"),
    ("Skyfall", "Adele", "pop", "english"),
    ("Set Fire to the Rain", "Adele", "pop", "english"),
    ("Easy On Me", "Adele", "pop", "english"),
    ("Lose Yourself", "Eminem", "hip-hop", "english"),
    ("Rap God", "Eminem", "hip-hop", "english"),
    ("Not Afraid", "Eminem", "hip-hop", "english"),
    ("The Real Slim Shady", "Eminem", "hip-hop", "english"),
    ("Without Me", "Eminem", "hip-hop", "english"),
    ("Sicko Mode", "Travis Scott", "hip-hop", "english"),
    ("Antidote", "Travis Scott", "hip-hop", "english"),
    ("Goosebumps", "Travis Scott", "hip-hop", "english"),
    ("Money in the Grave", "Drake", "hip-hop", "english"),
    ("Hotline Bling", "Drake", "hip-hop", "english"),
    ("Started From the Bottom", "Drake", "hip-hop", "english"),
    ("In My Feelings", "Drake", "hip-hop", "english"),
    ("Nonstop", "Drake", "hip-hop", "english"),
    ("SICKO MODE", "Travis Scott", "hip-hop", "english"),
    ("Highest in the Room", "Travis Scott", "hip-hop", "english"),
    # Hindi songs
    ("Kesariya", "Arijit Singh", "bollywood", "hindi"),
    ("Tum Hi Ho", "Arijit Singh", "bollywood", "hindi"),
    ("Channa Mereya", "Arijit Singh", "bollywood", "hindi"),
    ("Raabta", "Arijit Singh", "bollywood", "hindi"),
    ("Ae Dil Hai Mushkil", "Arijit Singh", "bollywood", "hindi"),
    ("Dil Diyan Gallan", "Atif Aslam", "bollywood", "hindi"),
    ("Tera Fitoor", "Arijit Singh", "bollywood", "hindi"),
    ("Hawayein", "Arijit Singh", "bollywood", "hindi"),
    ("Phir Le Aya Dil", "Arijit Singh", "bollywood", "hindi"),
    ("Kabira", "Arijit Singh", "bollywood", "hindi"),
    ("Iktara", "Amit Trivedi", "indie", "hindi"),
    ("Bulleya", "Papon", "bollywood", "hindi"),
    ("Dilbaro", "Harshdeep Kaur", "bollywood", "hindi"),
    ("Gerua", "Arijit Singh", "bollywood", "hindi"),
    ("Teri Mitti", "B Praak", "bollywood", "hindi"),
    ("Baarish", "Atif Aslam", "bollywood", "hindi"),
    ("Pehla Nasha", "Udit Narayan", "bollywood", "hindi"),
    ("Lal Ishq", "Arijit Singh", "bollywood", "hindi"),
    ("Jag Soona Soona Lage", "Udit Narayan", "bollywood", "hindi"),
    ("Moh Moh Ke Dhaage", "Papon", "bollywood", "hindi"),
    # K-pop songs
    ("DNA", "BTS", "k-pop", "korean"),
    ("Boy With Luv", "BTS", "k-pop", "korean"),
    ("Black Swan", "BTS", "k-pop", "korean"),
    ("Spring Day", "BTS", "k-pop", "korean"),
    ("IDOL", "BTS", "k-pop", "korean"),
    ("How You Like That", "BLACKPINK", "k-pop", "korean"),
    ("Kill This Love", "BLACKPINK", "k-pop", "korean"),
    ("Lovesick Girls", "BLACKPINK", "k-pop", "korean"),
    ("Pink Venom", "BLACKPINK", "k-pop", "korean"),
    ("Shut Down", "BLACKPINK", "k-pop", "korean"),
    ("Peek-A-Boo", "Red Velvet", "k-pop", "korean"),
    ("Power", "EXO", "k-pop", "korean"),
    ("Growl", "EXO", "k-pop", "korean"),
    ("Likey", "TWICE", "k-pop", "korean"),
    ("Fancy", "TWICE", "k-pop", "korean"),
    ("Feel Special", "TWICE", "k-pop", "korean"),
    ("Cheer Up", "TWICE", "k-pop", "korean"),
    ("Yes or Yes", "TWICE", "k-pop", "korean"),
    # Spanish/Latin
    ("Despacito", "Luis Fonsi", "latin", "spanish"),
    ("Bailando", "Enrique Iglesias", "latin", "spanish"),
    ("Mi Gente", "J Balvin", "latin", "spanish"),
    ("Con Calma", "Daddy Yankee", "latin", "spanish"),
    ("Taki Taki", "DJ Snake", "latin", "spanish"),
    ("MIA", "Bad Bunny", "latin", "spanish"),
    ("Mayores", "Becky G", "latin", "spanish"),
    ("Boom", "Daddy Yankee", "latin", "spanish"),
    ("X", "J Balvin", "latin", "spanish"),
    ("Loca", "Shakira", "latin", "spanish"),
    ("Hips Don't Lie", "Shakira", "latin", "spanish"),
    ("Waka Waka", "Shakira", "pop", "spanish"),
    ("La Tortura", "Shakira", "latin", "spanish"),
    ("Photograph", "Nickelback", "rock", "english"),
    ("How You Remind Me", "Nickelback", "rock", "english"),
    ("Rockstar", "Nickelback", "rock", "english"),
    ("Far Away", "Nickelback", "rock", "english"),
    ("Iris", "Goo Goo Dolls", "rock", "english"),
    ("Black Hole Sun", "Soundgarden", "rock", "english"),
    ("Jeremy", "Pearl Jam", "rock", "english"),
    ("Even Flow", "Pearl Jam", "rock", "english"),
    ("Yellow", "Coldplay", "alternative", "english"),
    ("The Scientist", "Coldplay", "alternative", "english"),
    ("Clocks", "Coldplay", "alternative", "english"),
    ("Fix You", "Coldplay", "alternative", "english"),
    ("Speed of Sound", "Coldplay", "alternative", "alternative"),
    ("Viva la Vida", "Coldplay", "alternative", "english"),
    ("A Sky Full of Stars", "Coldplay", "alternative", "english"),
    ("Adventure of a Lifetime", "Coldplay", "alternative", "english"),
    ("My Universe", "Coldplay", "pop", "english"),
    ("higher power", "Coldplay", "pop", "english"),
]

MOODS = {
    "happy":    {"energy": (0.65, 1.0),  "valence": (0.6, 1.0),  "danceability": (0.6, 1.0),  "tempo": (100, 180)},
    "sad":      {"energy": (0.1, 0.5),   "valence": (0.0, 0.35), "danceability": (0.1, 0.5),  "tempo": (50, 100)},
    "party":    {"energy": (0.75, 1.0),  "valence": (0.5, 1.0),  "danceability": (0.75, 1.0), "tempo": (110, 180)},
    "chill":    {"energy": (0.2, 0.6),   "valence": (0.3, 0.7),  "danceability": (0.2, 0.6),  "tempo": (60, 110)},
    "romantic": {"energy": (0.3, 0.7),   "valence": (0.4, 0.8),  "danceability": (0.3, 0.65), "tempo": (60, 120)},
}

GENRE_POSTERS = {
    "pop":         "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80",
    "hip-hop":     "https://images.unsplash.com/photo-1547355253-ff0740f859a2?w=300&q=80",
    "rock":        "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80",
    "edm":         "https://images.unsplash.com/photo-1504380804541-2f8c04d8a30e?w=300&q=80",
    "bollywood":   "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=300&q=80",
    "k-pop":       "https://images.unsplash.com/photo-1615886753866-979d8f2d9b90?w=300&q=80",
    "latin":       "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&q=80",
    "metal":       "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=300&q=80",
    "indie":       "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&q=80",
    "alternative": "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=300&q=80",
    "country":     "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&q=80",
    "funk":        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80",
}

POSTER_POOL = [
    "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80",
    "https://images.unsplash.com/photo-1461784121038-f088ca1e7714?w=300&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80",
    "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=300&q=80",
    "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&q=80",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&q=80",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&q=80",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80",
    "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=300&q=80",
    "https://images.unsplash.com/photo-1430135585878-b0b5ddb2f949?w=300&q=80",
    "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=300&q=80",
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=300&q=80",
    "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&q=80",
]


def assign_mood(genre, energy, valence, danceability, tempo):
    if valence > 0.65 and energy > 0.65 and danceability > 0.7:
        return "party"
    elif valence > 0.6 and energy > 0.55:
        return "happy"
    elif valence < 0.35 and energy < 0.5:
        return "sad"
    elif energy < 0.55 and 0.35 <= valence <= 0.7:
        return "chill"
    else:
        return "romantic"


def generate_features(genre):
    base = {
        "pop":         (0.65, 0.70, 0.60, 120),
        "hip-hop":     (0.75, 0.65, 0.45, 130),
        "rock":        (0.55, 0.80, 0.40, 135),
        "edm":         (0.80, 0.85, 0.50, 140),
        "bollywood":   (0.60, 0.65, 0.55, 110),
        "k-pop":       (0.72, 0.75, 0.60, 125),
        "latin":       (0.78, 0.72, 0.55, 128),
        "metal":       (0.45, 0.90, 0.30, 150),
        "indie":       (0.55, 0.60, 0.45, 105),
        "alternative": (0.55, 0.65, 0.45, 115),
        "country":     (0.58, 0.60, 0.50, 100),
        "funk":        (0.75, 0.72, 0.58, 125),
    }.get(genre, (0.60, 0.65, 0.50, 115))

    dance = min(1.0, max(0.0, base[0] + np.random.uniform(-0.18, 0.18)))
    energy = min(1.0, max(0.0, base[1] + np.random.uniform(-0.18, 0.18)))
    valence = min(1.0, max(0.0, base[2] + np.random.uniform(-0.25, 0.25)))
    tempo = max(50, base[3] + np.random.uniform(-25, 25))
    return dance, energy, valence, tempo


def make_url(name, artist):
    q = urllib.parse.quote(f"{name} {artist}")
    spotify = f"https://open.spotify.com/search/{q}"
    youtube = f"https://music.youtube.com/search?q={urllib.parse.quote(name + ' ' + artist)}"
    return spotify, youtube


def generate():
    rows = []
    seen = set()
    for i, (name, artist, genre, language) in enumerate(SONGS_DATA):
        key = (name.lower(), artist.lower())
        if key in seen:
            continue
        seen.add(key)

        dance, energy, valence, tempo = generate_features(genre)
        mood = assign_mood(genre, energy, valence, dance, tempo)
        popularity = int(np.random.uniform(40, 100))
        poster = GENRE_POSTERS.get(genre, POSTER_POOL[i % len(POSTER_POOL)])
        spotify_url, youtube_url = make_url(name, artist)

        rows.append({
            "song_id": f"song_{i+1:04d}",
            "track_name": name,
            "artist": artist,
            "genre": genre,
            "language": language,
            "mood": mood,
            "popularity": popularity,
            "danceability": round(dance, 4),
            "energy": round(energy, 4),
            "valence": round(valence, 4),
            "tempo": round(tempo, 2),
            "poster_url": poster,
            "spotify_url": spotify_url,
            "youtube_url": youtube_url,
        })

    df = pd.DataFrame(rows)
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/songs.csv", index=False)
    print(f"✅ Dataset generated: {len(df)} songs → data/songs.csv")
    print(df.groupby("mood")["song_id"].count().to_string())
    return df


if __name__ == "__main__":
    generate()
