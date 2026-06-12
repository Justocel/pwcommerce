'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Document, Page, pdfjs } from 'react-pdf';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { useAuth } from '@/app/context/AuthProvider';
import { useRevistas } from '@/app/context/RevistasProvider';
import { usePurchases } from '@/app/context/PurchasesProvider';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SIGNED_URL_TTL = 3600; // 1 hora

export default function LeerRevistaPage() {
  const router = useRouter();
  const params = useParams();
  const revistaId = params.revistaId;

  const { user, hydrated: authReady } = useAuth();
  const { revistas, hydrated: revistasReady } = useRevistas();
  const { purchases, hydrated: purchasesReady } = usePurchases();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);
  const touchStartX = useRef(null);

  const revista = revistas.find((r) => r.id === revistaId) || null;
  const hasIt = purchases.some(
    (p) =>
      p.revista_id === revistaId &&
      ['completada', 'pagada', 'confirmada'].includes(p.estado)
  );

  // Resolver la signed URL una vez que tengamos todo cargado
  useEffect(() => {
    if (!authReady || !revistasReady || !purchasesReady) return;
    if (!user) {
      router.replace(`/login?next=/leer/${revistaId}`);
      return;
    }
    if (!revista) {
      setLoadError('Esta revista no existe.');
      return;
    }
    if (!hasIt) {
      setLoadError('Todavía no compraste esta revista.');
      return;
    }
    if (!revista.pdf_path) {
      setLoadError('Esta revista no tiene PDF cargado todavía.');
      return;
    }

    let cancelled = false;
    supabase.storage
      .from('revistas-pdf')
      .createSignedUrl(revista.pdf_path, SIGNED_URL_TTL)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('createSignedUrl error:', error.message);
          setLoadError('No se pudo cargar la revista.');
        } else {
          setPdfUrl(data.signedUrl);
          trackEvent('pdf_open', {
            userId: user.id,
            metadata: { revista_id: revistaId },
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    authReady,
    revistasReady,
    purchasesReady,
    user?.id,
    revistaId,
    revista,
    hasIt,
    router,
  ]);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setWidth(Math.min(containerRef.current.clientWidth - 24, 900));
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const goPrev = useCallback(
    () => setPage((p) => Math.max(1, p - 1)),
    []
  );
  const goNext = useCallback(
    () => setPage((p) => Math.min(numPages || 1, p + 1)),
    [numPages]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Escape') router.back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext, router]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      if (dx > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="lector"
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="lector-header">
        <button
          className="lector-back"
          onClick={() => router.back()}
          aria-label="Volver"
        >
          ←
        </button>
        <span className="lector-titulo">
          {revista?.titulo || 'Picnic'}
        </span>
        <span className="lector-page-indicator">
          {numPages > 0 ? `${page} / ${numPages}` : '…'}
        </span>
      </header>

      <div
        ref={containerRef}
        className="lector-canvas-wrap"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {loadError ? (
          <div className="lector-msg lector-msg--error">
            {loadError}
            <div>
              <Link href="/mis-revistas" className="auth-submit">
                Ir a Mis revistas
              </Link>
            </div>
          </div>
        ) : !pdfUrl ? (
          <div className="lector-msg">Cargando revista…</div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="lector-msg">Cargando revista…</div>}
            error={
              <div className="lector-msg lector-msg--error">
                No se pudo renderizar el PDF.
              </div>
            }
          >
            {width > 0 && (
              <Page
                pageNumber={page}
                width={width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading=""
              />
            )}
          </Document>
        )}
      </div>

      <footer className="lector-nav">
        <button onClick={goPrev} disabled={page <= 1 || !pdfUrl}>
          ← Anterior
        </button>
        <button
          onClick={goNext}
          disabled={numPages === 0 || page >= numPages || !pdfUrl}
        >
          Siguiente →
        </button>
      </footer>
    </div>
  );
}
