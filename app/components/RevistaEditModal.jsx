'use client';

import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import PdfUpload from './PdfUpload';

/**
 * Modal para crear/editar una revista.
 *
 * Para creación, el PDF no se puede subir hasta tener la revista persistida
 * (la RLS de storage exige path con UUID de revista). Mostramos un hint y
 * el editor sube el PDF después con el botón inline del card.
 *
 * Props:
 *  - revista: objeto existente o null (crear)
 *  - onSave: (form) => Promise<{ data?, error }>
 *  - onPdfUploaded: (revistaId, newPath) => Promise<{ error }>  — el caller persiste pdf_path
 *  - onClose: () => void
 */
export default function RevistaEditModal({
  revista,
  onSave,
  onPdfUploaded,
  onClose,
}) {
  const isNew = !revista;
  const [form, setForm] = useState({
    numero_edicion: revista?.numero_edicion ?? '',
    titulo: revista?.titulo || '',
    descripcion: revista?.descripcion || '',
    portada_path: revista?.portada_path || '',
    precio: revista?.precio ?? 0,
    fecha_lanzamiento: revista?.fecha_lanzamiento || '',
    activa: revista?.activa ?? true,
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
    if (!form.titulo.trim() || !form.numero_edicion) {
      setError('Número y título son requeridos');
      return;
    }
    setError('');
    setSaving(true);
    const payload = {
      numero_edicion: Number(form.numero_edicion),
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || null,
      portada_path: form.portada_path || null,
      precio: Number(form.precio) || 0,
      fecha_lanzamiento: form.fecha_lanzamiento || null,
      activa: !!form.activa,
    };
    const { error: err } = await onSave(payload);
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
          <h2>{isNew ? 'Nueva edición' : `Editar edición #${revista.numero_edicion}`}</h2>
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
            <span>Número de edición *</span>
            <input
              type="number"
              min={1}
              value={form.numero_edicion}
              onChange={setField('numero_edicion')}
              required
            />
          </label>
          <label className="auth-field">
            <span>Título *</span>
            <input
              type="text"
              value={form.titulo}
              onChange={setField('titulo')}
              maxLength={200}
              required
            />
          </label>
          <label className="auth-field">
            <span>Descripción</span>
            <textarea
              value={form.descripcion}
              onChange={setField('descripcion')}
              rows={3}
              maxLength={1000}
            />
          </label>
          <label className="auth-field">
            <span>Precio</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.precio}
              onChange={setField('precio')}
            />
          </label>
          <label className="auth-field">
            <span>Fecha de lanzamiento</span>
            <input
              type="date"
              value={form.fecha_lanzamiento}
              onChange={setField('fecha_lanzamiento')}
            />
          </label>
          <label className="auth-field auth-field--inline">
            <input
              type="checkbox"
              checked={form.activa}
              onChange={(e) =>
                setForm((f) => ({ ...f, activa: e.target.checked }))
              }
            />
            <span>Activa (visible al público)</span>
          </label>
          <div className="auth-field">
            <span>Portada</span>
            <ImageUpload
              value={form.portada_path}
              onChange={(v) =>
                setForm((f) => ({ ...f, portada_path: v || '' }))
              }
              folder="portadas"
            />
          </div>
          {!isNew && (
            <div className="auth-field">
              <span>PDF de la revista</span>
              <PdfUpload
                revistaId={revista.id}
                currentPath={revista.pdf_path}
                onUploaded={async (newPath) => {
                  await onPdfUploaded(revista.id, newPath);
                }}
              />
            </div>
          )}
          {isNew && (
            <p className="seccion-descripcion">
              Vas a poder subir el PDF después de crear la edición.
            </p>
          )}
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
