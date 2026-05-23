'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

/**
 * REVISTAS PROVIDER
 *
 * Carga el catálogo. Editores ven todas (incluyendo `activa=false`) para
 * poder administrarlas. Público ve solo activas. Expone CRUD para edit mode.
 */
const RevistasContext = createContext(null);

export function RevistasProvider({ children }) {
  const { isEditor, hydrated: authHydrated } = useAuth();
  const [revistas, setRevistas] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    loadRevistas();
  }, [authHydrated, isEditor]);

  const loadRevistas = async () => {
    let q = supabase
      .from('revistas')
      .select(
        'id, numero_edicion, titulo, descripcion, portada_path, pdf_path, precio, fecha_lanzamiento, activa'
      )
      .order('numero_edicion', { ascending: false });
    if (!isEditor) q = q.eq('activa', true);
    const { data, error } = await q;
    if (error) {
      console.error('Error cargando revistas:', error.message);
      setRevistas([]);
    } else {
      setRevistas(data || []);
    }
    setHydrated(true);
  };

  const getRevistaById = (id) => revistas.find((r) => r.id === id);

  const createRevista = async (input) => {
    const { data, error } = await supabase
      .from('revistas')
      .insert(input)
      .select()
      .single();
    if (error) return { error };
    await loadRevistas();
    return { data, error: null };
  };

  const updateRevista = async (id, patch) => {
    const { error } = await supabase
      .from('revistas')
      .update(patch)
      .eq('id', id);
    if (error) return { error };
    await loadRevistas();
    return { error: null };
  };

  const deleteRevista = async (id) => {
    const { error } = await supabase.from('revistas').delete().eq('id', id);
    if (error) return { error };
    await loadRevistas();
    return { error: null };
  };

  const toggleActiva = async (id) => {
    const r = revistas.find((x) => x.id === id);
    if (!r) return { error: { message: 'no encontrada' } };
    return updateRevista(id, { activa: !r.activa });
  };

  return (
    <RevistasContext.Provider
      value={{
        revistas,
        hydrated,
        getRevistaById,
        createRevista,
        updateRevista,
        deleteRevista,
        toggleActiva,
      }}
    >
      {children}
    </RevistasContext.Provider>
  );
}

export function useRevistas() {
  const ctx = useContext(RevistasContext);
  if (!ctx) throw new Error('useRevistas fuera de RevistasProvider');
  return ctx;
}
