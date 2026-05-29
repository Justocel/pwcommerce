'use client';

import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';

/**
 * Modal para crear o editar un artículo.
 * Props:
 *  - articulo: objeto existente (modo edición) o null (modo crear)
 *  - onSave: (formData) => Promise<{ error }>
 *  - onClose: () => void
 */
export default function ArticuloEditModal({ articulo, onSave, onClose }) {
  const isNew = !articulo;
  const [form, setForm] = useState({
    slug: articulo?.slug || '',
    categoria: articulo?.categoria || '',
    titulo: articulo?.titulo || '',
    subtitulo: articulo?.subtitulo || '',
    contenido: articulo?.contenido || '',
    imagen_path: articulo?.imagen_path || '',
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

  const slugify = (s) =>
    s
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.slug.trim()) {
      setError('Título y slug son requeridos');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setError('El slug solo puede tener minúsculas, números y guiones');
      return;
    }
    setError('');
    setSaving(true);
    const { error: err } = await onSave({
      ...form,
      // Campos opcionales: vacíos → null
      categoria: form.categoria.trim() || null,
      subtitulo: form.subtitulo.trim() || null,
      imagen_path: form.imagen_path.trim() || null,
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
          <h2>{isNew ? 'Nuevo artículo' : 'Editar artículo'}</h2>
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
            <span>Título *</span>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({
                  ...f,
                  titulo: v,
                  slug: isNew && !f.slug ? slugify(v) : f.slug,
                }));
              }}
              maxLength={200}
              required
            />
          </label>
          <label className="auth-field">
            <span>Slug * (URL: /articulos/&lt;slug&gt;)</span>
            <input
              type="text"
              value={form.slug}
              onChange={setField('slug')}
              pattern="[a-z0-9-]+"
              maxLength={100}
              required
            />
          </label>
          <label className="auth-field">
            <span>Categoría</span>
            <input
              type="text"
              value={form.categoria}
              onChange={setField('categoria')}
              placeholder="ej: ENTREVISTAS"
              maxLength={50}
            />
          </label>
          <label className="auth-field">
            <span>Subtítulo</span>
            <input
              type="text"
              value={form.subtitulo}
              onChange={setField('subtitulo')}
              maxLength={300}
            />
          </label>
          <div className="auth-field">
            <span>Imagen</span>
            <ImageUpload
              value={form.imagen_path}
              onChange={(v) => setForm((f) => ({ ...f, imagen_path: v || '' }))}
              folder="articulos"
            />
          </div>
          <label className="auth-field">
            <span>Contenido (markdown)</span>
            <textarea
              value={form.contenido}
              onChange={setField('contenido')}
              rows={10}
              maxLength={20000}
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-cancel">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="modal-save"
            >
              {saving ? 'Guardando…' : isNew ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
