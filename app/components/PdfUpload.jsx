'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Subir PDF al bucket privado `revistas-pdf` bajo el path
 * `<revista_id>/<uuid>.pdf` (la RLS exige que la primera carpeta del path sea
 * el UUID de la revista para que los compradores puedan descargarlo).
 *
 * Props:
 *  - revistaId: UUID (requerido — no se puede subir sin él)
 *  - currentPath: pdf_path actual (para mostrar estado)
 *  - onUploaded: (newPath: string) => void  — el caller hace el UPDATE en revistas.pdf_path
 */
const BUCKET = 'revistas-pdf';
const MAX_MB = 50;

export default function PdfUpload({ revistaId, currentPath, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!revistaId) {
    return (
      <p className="seccion-descripcion">
        Guardá la revista primero para poder subir el PDF.
      </p>
    );
  }

  const pick = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Solo PDFs');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Archivo muy grande (máx ${MAX_MB}MB)`);
      return;
    }
    setError('');
    setUploading(true);

    const newPath = `${revistaId}/${crypto.randomUUID()}.pdf`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(newPath, file, {
        upsert: false,
        contentType: 'application/pdf',
      });

    if (upErr) {
      setError(upErr.message || 'Error al subir');
      setUploading(false);
      return;
    }

    // Si había un PDF previo, lo borramos del storage para no dejarlo huérfano.
    if (currentPath && currentPath !== newPath) {
      await supabase.storage.from(BUCKET).remove([currentPath]);
    }

    onUploaded(newPath);
    setUploading(false);
  };

  return (
    <div className="pdf-upload">
      <div className="pdf-upload-status">
        {currentPath ? (
          <span className="pdf-upload-current">
            ✓ PDF cargado:{' '}
            <code>{currentPath.split('/').pop()}</code>
          </span>
        ) : (
          <span className="pdf-upload-empty">Sin PDF cargado</span>
        )}
      </div>
      <button
        type="button"
        onClick={pick}
        className="image-upload-btn"
        disabled={uploading}
      >
        {uploading
          ? 'Subiendo…'
          : currentPath
            ? 'Reemplazar PDF'
            : 'Subir PDF'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFile}
        hidden
      />
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
