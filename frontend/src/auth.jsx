import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, isAuthenticated, setToken } from './api';

const AuthContext = createContext(null);

export const THEME_KEY = 'resume_theme';

export function readTheme() {
  const stored = localStorage.getItem(THEME_KEY) || 'system';
  if (stored === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return stored;
}

function applyTheme(theme) {
  const resolved = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState(() => readTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    if (isAuthenticated()) {
      authApi
        .me()
        .then((u) => {
          if (active) setUser(u);
        })
        .catch(() => {
          setToken(null);
        })
        .finally(() => {
          if (active) setReady(true);
        });
    } else {
      setReady(true);
    }
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const res = await authApi.register(fullName, email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (fullName) => {
    const updated = await authApi.updateProfile(fullName);
    setUser(updated);
    return updated;
  }, []);

  const setTheme = useCallback((next) => {
    localStorage.setItem(THEME_KEY, next);
    setThemeState(next);
  }, []);

  const value = useMemo(
    () => ({ user, ready, isAuthed: !!user, login, register, logout, updateProfile, theme, setTheme }),
    [user, ready, login, register, logout, updateProfile, theme, setTheme]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}