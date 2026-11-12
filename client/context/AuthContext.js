"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, tokenStore } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = tokenStore.get();

    const restore = token
      ? api
          .me()
          .then((res) => res.user)
          .catch(() => {
            tokenStore.clear();
            return null;
          })
      : Promise.resolve(null);

    restore.then((restored) => {
      if (cancelled) return;
      setUser(restored);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await api.login(credentials);
    tokenStore.set(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (details) => {
    const res = await api.register(details);
    tokenStore.set(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
