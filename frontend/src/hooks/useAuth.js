import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'commute_agent_token';
const USER_KEY = 'commute_agent_user';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((accessToken, userId, email) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify({ userId, email }));
    setToken(accessToken);
    setUser({ userId, email });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, isAuthenticated: !!token, login, logout };
}