import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('aura_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/me');
      setUser(res.data);
    } catch {
      localStorage.removeItem('aura_token');
      localStorage.removeItem('aura_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('aura_token', res.data.token);
    localStorage.setItem('aura_user', JSON.stringify({ username: res.data.username, email: res.data.email }));
    setUser({ username: res.data.username, email: res.data.email });
    return res.data;
  };

  const signup = async (username, email, password) => {
    const res = await api.post('/signup', { username, email, password });
    localStorage.setItem('aura_token', res.data.token);
    localStorage.setItem('aura_user', JSON.stringify({ username: res.data.username, email: res.data.email }));
    setUser({ username: res.data.username, email: res.data.email });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
