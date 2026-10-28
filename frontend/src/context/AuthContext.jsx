import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bookleaf_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('bookleaf_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.data) {
            setUser(res.data.data);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('bookleaf_token');
          localStorage.removeItem('bookleaf_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (!res.data || !res.data.data) {
      throw new Error(res.data?.message || 'Login failed');
    }

    const { token: receivedToken, user: loggedInUser } = res.data.data;
    setToken(receivedToken);
    setUser(loggedInUser);

    localStorage.setItem('bookleaf_token', receivedToken);
    localStorage.setItem('bookleaf_user', JSON.stringify(loggedInUser));

    return loggedInUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Continue client cleanup even if network fails
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('bookleaf_token');
    localStorage.removeItem('bookleaf_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
