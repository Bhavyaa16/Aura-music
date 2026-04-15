import React, { useState } from 'react';
import api from '../utils/api';

const MOOD_EMOJI = { happy: '☀️', sad: '🌧️', party: '🎉', chill: '🌿', romantic: '🌹' };

export default function SongCard({ song, onLikeToggle, onShowSimilar }) {
  const [liked, setLiked] = useState(song.liked || false);
  const [liking, setLiking] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    try {
      const res = await api.post(`/like/${song.song_id}`);
      setLiked(res.data.liked);
      if (onLikeToggle) onLikeToggle(song.song_id, res.data.liked);
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Please log in to like songs.');
      }
    } finally {
      setLiking(false);
    }
  };

  const popularity = song.popularity || 0;

  return (
    <div className="group relative bg-aura-card border border-aura-border rounded-2xl overflow-hidden card-hover cursor-default"
      style={{ animationFillMode: 'forwards' }}>

      {/* Poster */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-900/30 to-indigo-900/30">
        {!imgError ? (
          <img
            src={song.poster_url}
            alt={song.track_name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-purple-900/50 to-indigo-900/50">
            🎵
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <a
            href={song.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold px-3 py-2 rounded-full transition-all active:scale-95"
            onClick={e => e.stopPropagation()}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Spotify
          </a>
          <a
            href={song.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#FF0000] hover:bg-[#cc0000] text-white text-xs font-bold px-3 py-2 rounded-full transition-all active:scale-95"
            onClick={e => e.stopPropagation()}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
            </svg>
            YT Music
          </a>
        </div>

        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={liking}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center 
                      transition-all duration-200 active:scale-90
                      ${liked
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-black/50 backdrop-blur-sm text-white/70 hover:bg-black/70 hover:text-red-400'}`}
        >
          {liking
            ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            : <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        </button>

        {/* Mood badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`mood-badge mood-${song.mood}`}>
            {MOOD_EMOJI[song.mood]} {song.mood}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-display font-semibold text-sm text-aura-text truncate leading-tight">
          {song.track_name}
        </h3>
        <p className="text-xs text-aura-muted mt-0.5 truncate">{song.artist}</p>

        {/* Genre + Popularity bar */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="text-xs bg-white/5 border border-white/10 text-aura-muted px-2 py-0.5 rounded-md capitalize truncate max-w-[80px]">
            {song.genre}
          </span>
          <div className="flex items-center gap-1.5 flex-1">
            <div className="flex-1 h-1 bg-aura-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                style={{ width: `${popularity}%` }}
              />
            </div>
            <span className="text-xs text-aura-muted w-6 text-right">{popularity}</span>
          </div>
        </div>

        {/* Similar songs button */}
        <button
          onClick={() => onShowSimilar && onShowSimilar(song)}
          className="mt-2.5 w-full text-xs text-center py-1.5 rounded-lg border border-purple-500/30 
                     text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 
                     transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Similar Songs
        </button>
      </div>
    </div>
  );
}
