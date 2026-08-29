import { useState, useCallback } from 'react';
import type { LoginResponse } from '@akuntask/shared';

const TOKEN_KEY = 'akuntask_token';
const USER_KEY = 'akuntask_user';

export function useAuth(): {
  token: string | null;
  user: LoginResponse['user'] | null;
  setSession: (data: LoginResponse) => void;
  logout: () => void;
} {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<LoginResponse['user'] | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as LoginResponse['user']) : null;
  });

  const setSession = useCallback((data: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, setSession, logout };
}
