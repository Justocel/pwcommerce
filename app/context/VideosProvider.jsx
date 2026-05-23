'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

/**
 * VIDEOS PROVIDER
 *
 * Editores ven todos los videos (incluyendo ocultos y sin clasificar) para
 * poder asignarles seccion. Público ve solo visible=true con seccion no null.
 *
 * Videos son creados por el cron de YouTube, no manualmente. Los editores
 * pueden: asignar seccion, ocultar/mostrar, reordenar y borrar (aunque el
 * cron los volvería a meter si siguen en el canal).
 */
const VideosContext = createContext(null);

export function VideosProvider({ children }) {
  const { isEditor, hydrated: authHydrated } = useAuth();
  const [videos, setVideos] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    loadVideos();
  }, [authHydrated, isEditor]);

  const loadVideos = async () => {
    let q = supabase
      .from('videos')
      .select(
        'id, youtube_id, titulo, thumbnail_url, seccion, visible, orden, published_at'
      )
      .order('orden', { ascending: true, nullsFirst: false })
      .order('published_at', { ascending: false, nullsFirst: false });
    if (!isEditor) {
      q = q.eq('visible', true).not('seccion', 'is', null);
    }
    const { data, error } = await q;
    if (error) {
      console.error('Error cargando videos:', error.message);
      setVideos([]);
    } else {
      setVideos(data || []);
    }
    setHydrated(true);
  };

  const updateVideo = async (id, patch) => {
    const { error } = await supabase.from('videos').update(patch).eq('id', id);
    if (error) return { error };
    await loadVideos();
    return { error: null };
  };

  const setSeccion = async (id, seccion) => updateVideo(id, { seccion });

  const toggleVisible = async (id) => {
    const v = videos.find((x) => x.id === id);
    if (!v) return { error: { message: 'no encontrado' } };
    return updateVideo(id, { visible: !v.visible });
  };

  const deleteVideo = async (id) => {
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) return { error };
    await loadVideos();
    return { error: null };
  };

  const move = async (id, direction) => {
    // Reordena dentro de la misma sección.
    const v = videos.find((x) => x.id === id);
    if (!v) return;
    const sameSeccion = videos.filter((x) => x.seccion === v.seccion);
    const idx = sameSeccion.findIndex((x) => x.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameSeccion.length) return;
    const a = sameSeccion[idx];
    const b = sameSeccion[swapIdx];
    // Si los orden son null/iguales, asignamos posicionales.
    const aOrden = a.orden ?? idx;
    const bOrden = b.orden ?? swapIdx;
    await supabase.from('videos').update({ orden: bOrden }).eq('id', a.id);
    await supabase.from('videos').update({ orden: aOrden }).eq('id', b.id);
    await loadVideos();
  };

  const videosBySeccion = (seccion) =>
    videos.filter((v) => v.seccion === seccion);

  return (
    <VideosContext.Provider
      value={{
        videos,
        hydrated,
        videosBySeccion,
        setSeccion,
        toggleVisible,
        deleteVideo,
        moveUp: (id) => move(id, 'up'),
        moveDown: (id) => move(id, 'down'),
      }}
    >
      {children}
    </VideosContext.Provider>
  );
}

export function useVideos() {
  const ctx = useContext(VideosContext);
  if (!ctx) throw new Error('useVideos fuera de VideosProvider');
  return ctx;
}
