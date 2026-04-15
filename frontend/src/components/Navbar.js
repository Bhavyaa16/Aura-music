import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/home', label: 'Discover', icon: '✦' },
  { to: '/liked', label: 'Liked', icon: '♥' },
  { to: '/playlist', label: 'AI Playlist', icon: '◈' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-aura-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-display font-bold text-sm shadow-lg group-hover:scale-105 transition-transform">
            A
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            Aura <span className="text-purple-400">Music</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${location.pathname === to
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-aura-muted hover:text-aura-text hover:bg-white/5'}`}
            >
              <span className="text-xs">{icon}</span>
              {label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-aura-muted">
            Hey, <span className="text-purple-300 font-medium">{user?.username}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-aura-muted hover:text-red-400 border border-aura-border hover:border-red-500/40 
                       px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            Logout
          </button>

          {/* Mobile menu */}
          <button
            className="md:hidden text-aura-muted hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-aura-border px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${location.pathname === to ? 'bg-purple-500/20 text-purple-300' : 'text-aura-muted hover:text-white hover:bg-white/5'}`}
            >
              <span>{icon}</span>{label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
