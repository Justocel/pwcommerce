'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

/**
 * INTEGRANTES PROVIDER
 *
 * Editores ven todos (incluyendo ocultos); público ve solo visible=true.
 * CRUD: las policies RLS rechazan writes desde no-editores.
 */
const IntegrantesContext = createContext(null);

export function IntegrantesProvider({ children }) {
  const { isEditor, hydrated: authHydrated } = useAuth();
  const [integrantes, setIntegrantes] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    loadIntegrantes();
  }, [authHydrated, isEditor]);

  const loadIntegrantes = async () => {
    let q = supabase
      .from('integrantes')
      .select('id, nombre, rol, foto_path, bio, orden, visible')
      .order('orden', { ascending: true });
    if (!isEditor) q = q.eq('visible', true);
    const { data, error } = await q;
    if (error) {
      console.error('Error cargando integrantes:', error.message);
      setIntegrantes([]);
    } else {
      setIntegrantes(data || []);
    }
    setHydrated(true);
  };

  const createIntegrante = async (input) => {
    const maxOrden = integrantes.reduce(
      (m, i) => Math.max(m, i.orden ?? 0),
      0
    );
    const { error } = await supabase
      .from('integrantes')
      .insert({ ...input, orden: maxOrden + 1 });
    if (error) return { error };
    await loadIntegrantes();
    return { error: null };
  };

  const updateIntegrante = async (id, patch) => {
    const { error } = await supabase
      .from('integrantes')
      .update(patch)
      .eq('id', id);
    if (error) return { error };
    await loadIntegrantes();
    return { error: null };
  };

  const deleteIntegrante = async (id) => {
    const { error } = await supabase
      .from('integrantes')
      .delete()
      .eq('id', id);
    if (error) return { error };
    await loadIntegrantes();
    return { error: null };
  };

  const toggleVisible = async (id) => {
    const i = integrantes.find((x) => x.id === id);
    if (!i) return { error: { message: 'no encontrado' } };
    return updateIntegrante(id, { visible: !i.visible });
  };

  const move = async (id, direction) => {
    const idx = integrantes.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= integrantes.length) return;
    const a = integrantes[idx];
    const b = integrantes[swapIdx];
    await supabase.from('integrantes').update({ orden: b.orden }).eq('id', a.id);
    await supabase.from('integrantes').update({ orden: a.orden }).eq('id', b.id);
    await loadIntegrantes();
  };

  return (
    <IntegrantesContext.Provider
      value={{
        integrantes,
        hydrated,
        createIntegrante,
        updateIntegrante,
        deleteIntegrante,
        toggleVisible,
        moveUp: (id) => move(id, 'up'),
        moveDown: (id) => move(id, 'down'),
      }}
    >
      {children}
    </IntegrantesContext.Provider>
  );
}

export function useIntegrantes() {
  const ctx = useContext(IntegrantesContext);
  if (!ctx) throw new Error('useIntegrantes fuera de IntegrantesProvider');
  return ctx;
}
