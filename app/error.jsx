'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

/**
 * Error boundary global — captura excepciones en cualquier ruta dentro del
 * layout raíz. Next.js le pasa `error` y `reset` automáticamente.
 *
 * `reset()` reintenta el render del segmento que falló sin recargar la página.
 * El detalle del error solo se muestra en dev.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Error en la página:', error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="error-page">
        <div className="error-content">
          <h1 className="error-code">Ups</h1>
          <h2 className="error-title">Algo salió mal</h2>
          <p className="error-message">
            Tuvimos un problema cargando esta página. Reintentá, y si sigue
            fallando, volvé al inicio.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <pre className="error-dev-detail">{error.message}</pre>
          )}
          <div className="error-actions">
            <button
              type="button"
              onClick={() => reset()}
              className="auth-submit"
            >
              Reintentar
            </button>
            <Link href="/" className="auth-submit auth-submit--ghost">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
