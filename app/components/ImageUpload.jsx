'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Componente reusable de upload de imágenes al bucket público.
 *
 * Sube a `imagenes-publicas/<folder>/<uuid>.<ext>` y devuelve la public URL
 * vía onChange. Acepta también pegar un path/URL manualmente como fallback
 * (útil si querés referenciar una imagen del /public local).
 *
 * Props:
 *  - value: string | null  — URL o path actual
 *  - onChange: (newValue: string | null) => void
 *  - folder: string  — prefijo de carpeta dentro del bucket (ej: "articulos")
 *  - accept: string  — MIME types permitidos (default: "image/*")
 *  - maxSizeMB: number  — tamaño máximo en MB (default: 5)
 */
const BUCKET = 'imagenes-publicas';

export default function ImageUpload({
  value,
  onChange,
  folder = 'misc',
  accept = 'image/*',
  maxSizeMB = 5,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pick = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite re-seleccionar el mismo archivo
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Archivo muy grande (máx ${maxSizeMB}MB)`);
      return;
    }
    setError('');
    setUploading(true);

    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const name = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(name, file, { upsert: false, contentType: file.type });

    if (upErr) {
      setError(upErr.message || 'Error al subir');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
    onChange(data.publicUrl);
    setUploading(false);
  };

  const handleClear = () => onChange(null);

  return (
    <div className="image-upload">
      {value && (
        <div className="image-upload-preview-wrap">
          <img
            src={value}
            alt="preview"
            className="image-upload-preview"
            onError={(e) => {
              e.currentTarget.style.opacity = '0.3';
            }}
          />
          <button
            type="button"
            className="image-upload-clear"
            onClick={handleClear}
            title="Quitar imagen"
          >
            ✕
          </button>
        </div>
      )}
      <div className="image-upload-actions">
        <button
          type="button"
          className="image-upload-btn"
          onClick={pick}
          disabled={uploading}
        >
          {uploading ? 'Subiendo…' : value ? 'Cambiar' : 'Subir imagen'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFile}
          hidden
        />
      </div>
      <input
        type="text"
        className="image-upload-url"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder="o pegá un path/URL (ej: /Articulos/foto.png)"
      />
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
