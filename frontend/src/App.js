import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import LikedSongs from './pages/LikedSongs';
import Playlist from './pages/Playlist';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-aura-bg flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
  </div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-aura-bg">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/home" replace /> : <Signup />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Navbar /><Home />
            </ProtectedRoute>
          } />
          <Route path="/liked" element={
            <ProtectedRoute>
              <Navbar /><LikedSongs />
            </ProtectedRoute>
          } />
          <Route path="/playlist" element={
            <ProtectedRoute>
              <Navbar /><Playlist />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
