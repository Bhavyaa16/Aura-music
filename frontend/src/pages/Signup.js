import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aura-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-display font-bold shadow-lg">A</div>
            <span className="font-display font-bold text-xl text-white">Aura <span className="text-purple-400">Music</span></span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Create account</h1>
          <p className="text-aura-muted text-sm">Join Aura and discover music with AI</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-aura-border shadow-2xl">
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-aura-muted mb-2 uppercase tracking-wide">Username</label>
              <input name="username" type="text" value={form.username} onChange={handleChange}
                className="input-field" placeholder="musiclover" required minLength={3} autoComplete="username" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-aura-muted mb-2 uppercase tracking-wide">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="input-field" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-aura-muted mb-2 uppercase tracking-wide">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                className="input-field" placeholder="Min 6 characters" required minLength={6} autoComplete="new-password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2 shadow-lg shadow-purple-500/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>
          <p className="text-center text-sm text-aura-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
