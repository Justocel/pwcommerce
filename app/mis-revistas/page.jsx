'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthProvider';
import { usePurchases } from '../context/PurchasesProvider';
import { revistas } from '../data/data';
import { formatDate } from '../utils/utils';

function MisRevistasContent() {
  const { user, hydrated: authReady } = useAuth();
  const { getPurchases, hydrated: purchasesReady } = usePurchases();
  const [aviso, setAviso] = useState('');

  if (!authReady || !purchasesReady) {
    return <main className="mis-revistas-page" />;
  }

  if (!user) {
    return (
      <main className="mis-revistas-page">
        <div className="mis-revistas-header">
          <h1>Mis revistas</h1>
          <p className="seccion-descripcion">
            Iniciá sesión para ver las revistas que ya compraste.
          </p>
        </div>
        <div className="mis-revistas-vacio">
          <Link
            href="/login?next=/mis-revistas"
            className="auth-submit"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registrarme?next=/mis-revistas"
            className="auth-submit auth-submit--ghost"
          >
            Crear cuenta
          </Link>
        </div>
      </main>
    );
  }

  const compras = getPurchases(user.email);
  const items = compras
    .map((compra) => {
      const revista = revistas.find((r) => r.id === compra.revistaId);
      return revista ? { ...revista, fecha: compra.fecha } : null;
    })
    .filter(Boolean);

  const handleDescarga = (revista, formato) => {
    setAviso(
      `Descarga simulada: ${formato.toUpperCase()} de Revista #${revista.numero}. ` +
      `Disponible cuando se conecte la base de datos y el storage.`
    );
    setTimeout(() => setAviso(''), 4000);
  };

  return (
    <main className="mis-revistas-page">
      <div className="mis-revistas-header">
        <h1>Mis revistas</h1>
        <p className="seccion-descripcion">
          Hola, {user.email}. Acá vas a ver todo lo que compraste.
        </p>
      </div>

      {aviso && <div className="mis-revistas-aviso">{aviso}</div>}

      {items.length === 0 ? (
        <div className="mis-revistas-vacio">
          <p>Todavía no compraste ninguna revista.</p>
          <Link href="/#consegui-tu-revista" className="auth-submit">
            Ver revistas disponibles
          </Link>
        </div>
      ) : (
        <div className="mis-revistas-grid">
          {items.map((revista) => (
            <article key={revista.id} className="mis-revistas-card">
              <img
                src={revista.image}
                alt={revista.alt}
                className="mis-revistas-cover"
              />
              <div className="mis-revistas-info">
                <h2>Revista #{revista.numero}</h2>
                <p className="mis-revistas-fecha">
                  Comprada el {formatDate(revista.fecha)}
                </p>
                <div className="mis-revistas-acciones">
                  <button
                    className="auth-submit"
                    onClick={() => handleDescarga(revista, 'pdf')}
                  >
                    Descargar PDF
                  </button>
                  <button
                    className="auth-submit auth-submit--ghost"
                    onClick={() => handleDescarga(revista, 'epub')}
                  >
                    Descargar EPUB
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default function MisRevistasPage() {
  return (
    <>
      <Header />
      <MisRevistasContent />
      <Footer />
    </>
  );
}
