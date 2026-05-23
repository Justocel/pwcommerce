'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * AUTH PROVIDER — Supabase Auth
 *
 * `user` mantiene la forma del mock anterior ({ id, email, nombre, role })
 * para que los componentes que ya consumen useAuth() no necesiten cambios.
 * `isEditor` se expone como shortcut para el modo edición.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        fetchProfile(data.session.user.id).finally(() => {
          if (mounted) setHydrated(true);
        });
      } else {
        setHydrated(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, role')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('Error cargando profile:', error.message);
      setProfile(null);
      return;
    }
    if (!data) {
      console.warn(
        'Profile no existe para el usuario',
        userId,
        '— corré el backfill SQL.'
      );
      setProfile(null);
      return;
    }
    setProfile(data);
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, nombre) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre: nombre || '' },
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        nombre: profile?.nombre || '',
        role: profile?.role || 'user',
      }
    : null;

  const isEditor = profile?.role === 'editor';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        hydrated,
        isEditor,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fuera de AuthProvider');
  return ctx;
}
