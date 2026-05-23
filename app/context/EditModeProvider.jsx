'use client';

import { createContext, useContext, useState } from 'react';

/**
 * EDIT MODE PROVIDER
 *
 * Toggle global del modo edición. Solo los componentes que renderizan UI
 * editable lo consumen. El Header decide si el botón de toggle se muestra
 * (solo cuando useAuth().isEditor === true).
 *
 * El provider no hace check de role — la RLS de Supabase garantiza que
 * un usuario no-editor que intentara escribir vía DevTools no podría.
 */
const EditModeContext = createContext(null);

export function EditModeProvider({ children }) {
  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = () => setEditMode((v) => !v);

  return (
    <EditModeContext.Provider value={{ editMode, setEditMode, toggleEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error('useEditMode fuera de EditModeProvider');
  return ctx;
}
