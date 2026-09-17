'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, getApiErrorMessage } from '@/lib/api';
import type { ApiResponse, User } from '@/types';

export type LoginResult =
  | { requires2FA: false }
  | { requires2FA: true; method: 'app' | 'sms'; tempToken: string };

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  completeTwoFactorLogin: (tempToken: string, code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem('shopspace_token');
    if (!stored) {
      setIsLoading(false);
      return;
    }
    setToken(stored);
    api
      .get<ApiResponse<{ user: User }>>('/auth/me')
      .then((res) => setUser(res.data.data.user))
      .catch(() => {
        window.localStorage.removeItem('shopspace_token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const applySessionToken = useCallback(async (nextToken: string, userFromResponse?: User) => {
    window.localStorage.setItem('shopspace_token', nextToken);
    setToken(nextToken);

    if (userFromResponse) {
      setUser(userFromResponse);
    } else {
      const me = await api.get<ApiResponse<{ user: User }>>('/auth/me', {
        headers: { Authorization: `Bearer ${nextToken}` },
      });
      setUser(me.data.data.user);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const res = await api.post<
      ApiResponse<{ user?: User }> & {
        requires2FA?: boolean;
        twoFactorMethod?: 'app' | 'sms';
        tempToken?: string;
      }
    >('/auth/login', { email, password });

    if (res.data.requires2FA) {
      return { requires2FA: true, method: res.data.twoFactorMethod as 'app' | 'sms', tempToken: res.data.tempToken as string };
    }

    const nextToken = res.data.token;
    if (!nextToken) throw new Error('Login failed');
    await applySessionToken(nextToken, res.data.data?.user);
    return { requires2FA: false };
  }, [applySessionToken]);

  const completeTwoFactorLogin = useCallback(async (tempToken: string, code: string) => {
    const res = await api.post<ApiResponse<{ user?: User }>>('/auth/login/verify-2fa', { tempToken, code });
    const nextToken = res.data.token;
    if (!nextToken) throw new Error('Verification failed');
    await applySessionToken(nextToken, res.data.data?.user);
  }, [applySessionToken]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      await api.post('/auth/register', { name, email, password });
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
    await login(email, password);
  }, [login]);

  const loginWithToken = useCallback(async (nextToken: string) => {
    await applySessionToken(nextToken);
  }, [applySessionToken]);

  const refreshUser = useCallback(async () => {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    setUser(res.data.data.user);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('shopspace_token');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, loginWithToken, completeTwoFactorLogin, refreshUser, logout }),
    [user, token, isLoading, login, register, loginWithToken, completeTwoFactorLogin, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
