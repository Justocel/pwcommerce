'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

/**
 * ARTICULOS PROVIDER
 *
 * Carga los artículos desde la DB. Editores ven todos (incluyendo ocultos);
 * público ve solo `visible=true`. Expone CRUD: el RLS rechaza writes desde
 * usuarios no editores.
 */
const ArticulosContext = createContext(null);

export function ArticulosProvider({ children }) {
  const { isEditor, hydrated: authHydrated } = useAuth();
  const [articulos, setArticulos] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    loadArticulos();
  }, [authHydrated, isEditor]);

  const loadArticulos = async () => {
    let q = supabase
      .from('articulos')
      .select(
        'id, slug, categoria, titulo, subtitulo, contenido, imagen_path, orden, visible, fecha_publicacion'
      )
      .order('orden', { ascending: true });
    if (!isEditor) q = q.eq('visible', true);
    const { data, error } = await q;
    if (error) {
      console.error('Error cargando articulos:', error.message);
      setArticulos([]);
    } else {
      setArticulos(data || []);
    }
    setHydrated(true);
  };

  const createArticulo = async (input) => {
    const maxOrden = articulos.reduce(
      (m, a) => Math.max(m, a.orden ?? 0),
      0
    );
    const { error } = await supabase
      .from('articulos')
      .insert({ ...input, orden: maxOrden + 1 });
    if (error) return { error };
    await loadArticulos();
    return { error: null };
  };

  const updateArticulo = async (id, patch) => {
    const { error } = await supabase
      .from('articulos')
      .update(patch)
      .eq('id', id);
    if (error) return { error };
    await loadArticulos();
    return { error: null };
  };

  const deleteArticulo = async (id) => {
    const { error } = await supabase.from('articulos').delete().eq('id', id);
    if (error) return { error };
    await loadArticulos();
    return { error: null };
  };

  const toggleVisible = async (id) => {
    const art = articulos.find((a) => a.id === id);
    if (!art) return { error: { message: 'no encontrado' } };
    return updateArticulo(id, { visible: !art.visible });
  };

  const move = async (id, direction) => {
    const idx = articulos.findIndex((a) => a.id === id);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= articulos.length) return;
    const a = articulos[idx];
    const b = articulos[swapIdx];
    await supabase.from('articulos').update({ orden: b.orden }).eq('id', a.id);
    await supabase.from('articulos').update({ orden: a.orden }).eq('id', b.id);
    await loadArticulos();
  };

  return (
    <ArticulosContext.Provider
      value={{
        articulos,
        hydrated,
        createArticulo,
        updateArticulo,
        deleteArticulo,
        toggleVisible,
        moveUp: (id) => move(id, 'up'),
        moveDown: (id) => move(id, 'down'),
      }}
    >
      {children}
    </ArticulosContext.Provider>
  );
}

export function useArticulos() {
  const ctx = useContext(ArticulosContext);
  if (!ctx) throw new Error('useArticulos fuera de ArticulosProvider');
  return ctx;
}
