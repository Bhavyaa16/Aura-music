import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '◈', title: 'KNN Recommendations', desc: 'K-Nearest Neighbours finds songs similar to what you love, based on audio features.' },
  { icon: '◉', title: 'K-Means Mood Clusters', desc: 'Songs are clustered into Happy, Sad, Party, Chill, and Romantic using K-Means.' },
  { icon: '◍', title: 'Naive Bayes Classifier', desc: 'Multinomial Naive Bayes classifies mood from audio features for smarter suggestions.' },
  { icon: '♥', title: 'Liked Songs Engine', desc: 'Like songs to power your personal AI playlist generator.' },
];

const FLOATING_NOTES = ['♪', '♫', '♩', '♬', '𝄞', '𝄢'];

export default function Landing() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192,132,252,${p.alpha})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <div className="min-h-screen bg-aura-bg relative overflow-hidden flex flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOATING_NOTES.map((note, i) => (
          <span key={i} className="absolute text-purple-500/20 font-display animate-float select-none"
            style={{ fontSize: `${Math.random() * 2 + 1.5}rem`, left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.8}s`, animationDuration: `${5 + i}s` }}>
            {note}
          </span>
        ))}
      </div>
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-display font-bold shadow-lg">A</div>
          <span className="font-display font-bold text-xl text-white tracking-tight">Aura <span className="text-purple-400">Music</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm">Login</Link>
          <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
        </div>
      </header>
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-purple-300 font-medium tracking-wide">AI-Powered Music Discovery</span>
          </div>
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl text-white leading-none tracking-tight mb-6">
            Music that{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">feels you</span>
          </h1>
          <p className="text-lg text-aura-muted max-w-lg mx-auto mb-10 leading-relaxed">
            Aura Music uses <span className="text-purple-300">KNN</span>, <span className="text-indigo-300">K-Means</span>, and{' '}
            <span className="text-pink-300">Naive Bayes</span> to recommend songs matched to your mood and taste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary px-8 py-3 text-base shadow-xl shadow-purple-500/20">Start Listening Free →</Link>
            <Link to="/login" className="btn-secondary px-8 py-3 text-base">Sign In</Link>
          </div>
        </div>
        <div className="mt-16 flex items-end gap-1 h-12 opacity-30">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="w-1.5 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-full animate-pulse"
              style={{ height: `${20 + Math.sin(i * 0.7) * 15 + Math.random() * 15}px`, animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full text-left">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="bg-aura-card border border-aura-border rounded-2xl p-5 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-2xl text-purple-400 mb-3 font-display">{f.icon}</div>
              <h3 className="font-display font-semibold text-sm text-white mb-1.5">{f.title}</h3>
              <p className="text-xs text-aura-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="relative z-10 text-center py-5 text-xs text-aura-muted border-t border-aura-border">
        Aura Music — Built with React, Flask, Scikit-learn and love | College Project
      </footer>
    </div>
  );
}
