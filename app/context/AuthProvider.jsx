'use client';

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * AUTH PROVIDER (mock)
 * Persiste { email } en localStorage. No valida nada — cualquier email/password
 * es aceptado. Cuando se conecte a una DB real, este archivo es lo único que
 * cambia (las páginas y componentes consumen useAuth() sin tocar nada).
 */
const AuthContext = createContext(null);
const STORAGE_KEY = 'picnic.auth.user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  const persist = (next) => {
    setUser(next);
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email) => {
    persist({ email });
    return { email };
  };

  const register = async (email) => {
    persist({ email });
    return { email };
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ user, hydrated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fuera de AuthProvider');
  return ctx;
}
