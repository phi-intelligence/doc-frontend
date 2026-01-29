import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_TOKEN_KEY = 'phidocs_auth_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY) || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(token);

  const saveToken = useCallback((newToken) => {
    if (!newToken) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      return;
    }
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    saveToken(null);
    setUser(null);
    setError(null);
  }, [saveToken]);

  const me = useCallback(async () => {
    if (!token) {
      setUser(null);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Failed to load user');
      }
      const data = await res.json();
      setUser(data);
      return data;
    } catch (e) {
      // token invalid/expired
      logout();
      setError(e?.message || 'Authentication failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Login failed');
      }
      const data = await res.json();
      if (!data?.token) throw new Error('Login failed: missing token');
      saveToken(data.token);
      // eager load user
      setUser(data.user || null);
      return data;
    } catch (e) {
      setError(e?.message || 'Login failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [saveToken]);

  useEffect(() => {
    // On mount, try to hydrate user if token exists
    if (token) {
      me();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    me
  }), [token, user, loading, error, isAuthenticated, login, logout, me]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

