import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SongCard from './SongCard';

export default function SimilarSongsModal({ song, onClose }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!song) return;
    setLoading(true);
    setError(null);
    api.get(`/recommend/${song.song_id}`)
      .then(res => setSongs(res.data.songs || []))
      .catch(() => setError('Failed to load recommendations.'))
      .finally(() => setLoading(false));
  }, [song]);

  if (!song) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col border border-aura-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-aura-border">
          <div>
            <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-1">
              KNN Recommendations
            </p>
            <h2 className="font-display font-bold text-lg text-white">
              Similar to <span className="text-purple-300">{song.track_name}</span>
            </h2>
            <p className="text-sm text-aura-muted">{song.artist}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center 
                       text-aura-muted hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 flex-1">
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
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

          {error && (
            <div className="text-center py-16 text-red-400">{error}</div>
          )}

          {!loading && !error && songs.length === 0 && (
            <div className="text-center py-16 text-aura-muted">No similar songs found.</div>
          )}

          {!loading && !error && songs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {songs.map((s) => (
                <SongCard key={s.song_id} song={s} onShowSimilar={() => {}} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
