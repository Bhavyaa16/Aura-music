import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SongCard from '../components/SongCard';
import SimilarSongsModal from '../components/SimilarSongsModal';

const MOODS = ['happy', 'sad', 'party', 'chill', 'romantic'];
const MOOD_EMOJI = { happy: '☀️', sad: '🌧️', party: '🎉', chill: '🌿', romantic: '🌹' };

export default function Playlist() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [similarSong, setSimilarSong] = useState(null);
  const [likedCount, setLikedCount] = useState(0);

  useEffect(() => {
    api.get('/meta').then(r => setGenres(r.data.genres || [])).catch(() => {});
    api.get('/liked').then(r => setLikedCount((r.data.songs || []).length)).catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.get('/playlist', { params: { mood: mood || undefined, genre: genre || undefined } });
      setSongs(res.data.songs || []);
      setGenerated(true);
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1 flex items-center gap-3">
          <span className="text-purple-400 text-2xl">◈</span> AI Playlist Generator
        </h1>
        <p className="text-aura-muted text-sm">
          Powered by KNN — generates 20 songs based on your{' '}
          <span className="text-red-400">♥ {likedCount} liked songs</span>
          {likedCount === 0 && ' (like some songs first for better results)'}
        </p>
      </div>

      {/* Controls */}
      <div className="glass border border-aura-border rounded-2xl p-6 mb-8">
        <h2 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-widest">Playlist Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs text-aura-muted mb-2 font-semibold uppercase tracking-wide">Mood Filter</label>
            <select value={mood} onChange={e => setMood(e.target.value)} className="input-field text-sm appearance-none">
              <option value="">Any Mood</option>
              {MOODS.map(m => <option key={m} value={m}>{MOOD_EMOJI[m]} {m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-aura-muted mb-2 font-semibold uppercase tracking-wide">Genre Filter</label>
            <select value={genre} onChange={e => setGenre(e.target.value)} className="input-field text-sm appearance-none">
              <option value="">Any Genre</option>
              {genres.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Generate Playlist</>}
          </button>
        </div>
      </div>

      {/* ML Info banner */}
      {!generated && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '◈', label: 'KNN Algorithm', desc: 'Finds 20 nearest songs to your taste in feature space' },
            { icon: '♥', label: 'Liked Songs Bias', desc: 'Computes mean audio vector from your liked songs' },
            { icon: '🎛️', label: 'Mood + Genre Filter', desc: 'Optionally constrains results by mood or genre cluster' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-aura-card border border-aura-border rounded-2xl p-5 flex items-start gap-3">
              <span className="text-xl text-purple-400 mt-0.5">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{label}</p>
                <p className="text-xs text-aura-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full animate-ping" />
              <div className="absolute inset-2 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-white font-display font-semibold">Running KNN Algorithm...</p>
            <p className="text-aura-muted text-sm">Finding your perfect songs</p>
          </div>
        </div>
      )}

      {/* Playlist grid */}
      {!loading && generated && (
        <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-white">
              Your AI Playlist
              {mood && <span className="text-purple-400 text-base ml-2">{MOOD_EMOJI[mood]} {mood}</span>}
            </h2>
            <span className="text-aura-muted text-sm">{songs.length} songs</span>
          </div>
          {songs.length === 0 ? (
            <div className="text-center py-20 text-aura-muted">No songs found. Try different filters.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {songs.map((song, i) => (
                <div key={song.song_id} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  <SongCard song={song} onShowSimilar={setSimilarSong} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {similarSong && <SimilarSongsModal song={similarSong} onClose={() => setSimilarSong(null)} />}
    </div>
  );
}
