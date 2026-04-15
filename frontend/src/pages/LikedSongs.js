import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import SongCard from '../components/SongCard';
import SimilarSongsModal from '../components/SimilarSongsModal';

export default function LikedSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarSong, setSimilarSong] = useState(null);

  useEffect(() => {
    api.get('/liked')
      .then(res => setSongs(res.data.songs || []))
      .catch(() => setError('Failed to load liked songs.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLikeToggle = (songId, liked) => {
    if (!liked) setSongs(prev => prev.filter(s => s.song_id !== songId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1 flex items-center gap-3">
            <span className="text-red-400 text-2xl">♥</span> Liked Songs
          </h1>
          <p className="text-aura-muted text-sm">
            {songs.length > 0 ? `${songs.length} song${songs.length !== 1 ? 's' : ''} you love` : 'Your liked songs appear here'}
          </p>
        </div>
        {songs.length > 0 && (
          <Link to="/playlist" className="btn-primary text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Generate AI Playlist
          </Link>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-aura-card border border-aura-border">
              <div className="aspect-square skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-3 skeleton rounded-full w-3/4" />
                <div className="h-2.5 skeleton rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <div className="text-center py-20 text-red-400">{error}</div>}

      {/* Empty */}
      {!loading && !error && songs.length === 0 && (
        <div className="text-center py-24">
          <div className="text-6xl mb-6 animate-float">♡</div>
          <h3 className="font-display font-semibold text-xl text-white mb-3">No liked songs yet</h3>
          <p className="text-aura-muted text-sm mb-6">
            Tap the heart on any song to save it here. Your likes also power the AI playlist!
          </p>
          <Link to="/home" className="btn-primary">Discover Songs →</Link>
        </div>
      )}

      {/* Grid */}
      {!loading && songs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {songs.map((song, i) => (
            <div key={song.song_id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
              <SongCard song={song} onLikeToggle={handleLikeToggle} onShowSimilar={setSimilarSong} />
            </div>
          ))}
        </div>
      )}

      {similarSong && <SimilarSongsModal song={similarSong} onClose={() => setSimilarSong(null)} />}
    </div>
  );
}
