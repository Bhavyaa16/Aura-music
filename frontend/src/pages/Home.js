import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import SongCard from '../components/SongCard';
import SimilarSongsModal from '../components/SimilarSongsModal';

const MOODS = ['', 'happy', 'sad', 'party', 'chill', 'romantic'];
const MOOD_EMOJI = { happy: '☀️', sad: '🌧️', party: '🎉', chill: '🌿', romantic: '🌹' };

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [similarSong, setSimilarSong] = useState(null);
  const searchTimer = useRef(null);
  const LIMIT = 24;

  // Load meta
  useEffect(() => {
    api.get('/meta').then(res => {
      setGenres(res.data.genres || []);
      setLanguages(res.data.languages || []);
    }).catch(() => {});
  }, []);

  const fetchSongs = useCallback(async (reset = true) => {
    if (reset) { setLoading(true); setOffset(0); }
    else setLoadingMore(true);
    setError(null);
    try {
      const currentOffset = reset ? 0 : offset;
      let res;
      if (search) {
        res = await api.get('/search', { params: { q: search } });
        setSongs(res.data.songs || []);
        setTotal(res.data.songs?.length || 0);
      } else {
        res = await api.get('/songs', { params: { mood: mood || undefined, genre: genre || undefined, language: language || undefined, limit: LIMIT, offset: currentOffset } });
        if (reset) setSongs(res.data.songs || []);
        else setSongs(prev => [...prev, ...(res.data.songs || [])]);
        setTotal(res.data.total || 0);
        setOffset(currentOffset + LIMIT);
      }
    } catch (e) {
      setError('Failed to load songs. Make sure the backend is running.');
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, [mood, genre, language, search, offset]);

  useEffect(() => { fetchSongs(true); }, [mood, genre, language, search]); // eslint-disable-line

  // Debounced search
  const handleSearchInput = e => {
    setSearchInput(e.target.value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(e.target.value.trim()), 400);
  };

  const clearSearch = () => { setSearch(''); setSearchInput(''); };

  const handleLikeToggle = (songId, liked) => {
    setSongs(prev => prev.map(s => s.song_id === songId ? { ...s, liked } : s));
  };

  const hasMore = !search && songs.length < total;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Discover Music</h1>
        <p className="text-aura-muted text-sm">{total > 0 ? `${total} songs in your library` : 'Loading your library...'}</p>
      </div>

      {/* Filters */}
      <div className="glass border border-aura-border rounded-2xl p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={searchInput} onChange={handleSearchInput} placeholder="Search songs, artists..."
              className="input-field pl-10 pr-8 text-sm" />
            {searchInput && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-aura-muted hover:text-white transition-colors text-xs">✕</button>
            )}
          </div>

          {/* Mood */}
          <select value={mood} onChange={e => setMood(e.target.value)} className="input-field text-sm appearance-none cursor-pointer">
            <option value="">🎭 All Moods</option>
            {MOODS.filter(Boolean).map(m => (
              <option key={m} value={m}>{MOOD_EMOJI[m]} {m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>

          {/* Genre */}
          <select value={genre} onChange={e => setGenre(e.target.value)} className="input-field text-sm appearance-none cursor-pointer">
            <option value="">🎸 All Genres</option>
            {genres.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
          </select>

          {/* Language */}
          <select value={language} onChange={e => setLanguage(e.target.value)} className="input-field text-sm appearance-none cursor-pointer">
            <option value="">🌍 All Languages</option>
            {languages.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
        </div>

        {/* Active filters */}
        {(mood || genre || language || search) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-aura-border">
            {[mood, genre, language, search].filter(Boolean).map((f, i) => (
              <span key={i} className="text-xs bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                {f}
                <button onClick={() => {
                  if (f === mood) setMood('');
                  else if (f === genre) setGenre('');
                  else if (f === language) setLanguage('');
                  else clearSearch();
                }} className="hover:text-white">✕</button>
              </span>
            ))}
            <button onClick={() => { setMood(''); setGenre(''); setLanguage(''); clearSearch(); }}
              className="text-xs text-aura-muted hover:text-white transition-colors">Clear all</button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center mb-8">
          <p className="text-red-400 font-medium mb-2">⚠ {error}</p>
          <button onClick={() => fetchSongs(true)} className="btn-secondary text-sm">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-aura-card border border-aura-border">
              <div className="aspect-square skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-3 skeleton rounded-full w-3/4" />
                <div className="h-2.5 skeleton rounded-full w-1/2" />
                <div className="h-2 skeleton rounded-full w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && !error && songs.length === 0 && (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🎵</div>
          <h3 className="font-display font-semibold text-xl text-white mb-2">No songs found</h3>
          <p className="text-aura-muted text-sm">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Song grid */}
      {!loading && songs.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {songs.map((song, i) => (
              <div key={song.song_id} className="animate-fade-in" style={{ animationDelay: `${(i % 12) * 0.04}s` }}>
                <SongCard song={song} onLikeToggle={handleLikeToggle} onShowSimilar={setSimilarSong} />
              </div>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-10">
              <button onClick={() => fetchSongs(false)} disabled={loadingMore}
                className="btn-secondary px-8 py-3 text-sm">
                {loadingMore
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />Loading...</span>
                  : `Load More (${total - songs.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}

      {/* Similar songs modal */}
      {similarSong && (
        <SimilarSongsModal song={similarSong} onClose={() => setSimilarSong(null)} />
      )}
    </div>
  );
}
