"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, ApiRequestError, setToken } from "@/lib/api";

interface DecodedAuth {
  token: string;
}

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("nodeship_token");
    setTokenState(stored);
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ status: string; token: string }>("/auth/login", {
      email,
      password,
    });
    setToken(res.token);
    setTokenState(res.token);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<{ status: string; message: string }>("/auth/register", {
        name,
        email,
        password,
      });
      return { message: res.message };
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      ready,
      login,
      register,
      logout,
    }),
    [token, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiRequestError };
