'use client';

import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';

/**
 * Modal para crear o editar un integrante del equipo.
 * Props:
 *  - integrante: objeto existente o null (crear)
 *  - onSave: (formData) => Promise<{ error }>
 *  - onClose: () => void
 */
export default function IntegranteEditModal({ integrante, onSave, onClose }) {
  const isNew = !integrante;
  const [form, setForm] = useState({
    nombre: integrante?.nombre || '',
    rol: integrante?.rol || '',
    foto_path: integrante?.foto_path || '',
    bio: integrante?.bio || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    setError('');
    setSaving(true);
    const { error: err } = await onSave({
      nombre: form.nombre.trim(),
      rol: form.rol.trim() || null,
      foto_path: form.foto_path.trim() || null,
      bio: form.bio.trim() || null,
    });
    if (err) {
      setError(err.message || 'Error al guardar');
      setSaving(false);
      return;
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{isNew ? 'Nuevo integrante' : 'Editar integrante'}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="auth-field">
            <span>Nombre *</span>
            <input
              type="text"
              value={form.nombre}
              onChange={setField('nombre')}
              maxLength={100}
              required
            />
          </label>
          <label className="auth-field">
            <span>Rol</span>
            <input
              type="text"
              value={form.rol}
              onChange={setField('rol')}
              placeholder="ej: Diseño, Fotografía"
              maxLength={100}
            />
          </label>
          <div className="auth-field">
            <span>Foto</span>
            <ImageUpload
              value={form.foto_path}
              onChange={(v) => setForm((f) => ({ ...f, foto_path: v || '' }))}
              folder="integrantes"
            />
          </div>
          <label className="auth-field">
            <span>Bio</span>
            <textarea
              value={form.bio}
              onChange={setField('bio')}
              rows={5}
              maxLength={2000}
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="modal-save">
              {saving ? 'Guardando…' : isNew ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
