'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthProvider';
import { usePurchases } from '../context/PurchasesProvider';
import { useRevistas } from '../context/RevistasProvider';
import { formatDate } from '../utils/utils';

function MisOrdenesContent() {
  const { user, hydrated: authReady } = useAuth();
  const { purchases, hydrated: purchasesReady } = usePurchases();
  const { getRevistaById, hydrated: revistasReady } = useRevistas();

  // Agrupa purchases por order_id. Las compras viejas sin order_id quedan como
  // órdenes individuales (key derivada del id de la compra).
  const orders = useMemo(() => {
    const groups = new Map();
    for (const p of purchases) {
      const key = p.order_id || `single-${p.id}`;
      if (!groups.has(key)) {
        groups.set(key, { key, fecha: p.created_at, items: [], total: 0 });
      }
      const g = groups.get(key);
      g.items.push(p);
      g.total += Number(p.precio_pagado || 0);
      if (p.created_at < g.fecha) g.fecha = p.created_at;
    }
    return Array.from(groups.values()).sort((a, b) =>
      b.fecha.localeCompare(a.fecha)
    );
  }, [purchases]);

  if (!authReady || !purchasesReady || !revistasReady) {
    return <main className="mis-revistas-page" />;
  }

  if (!user) {
    return (
      <main className="mis-revistas-page">
        <div className="mis-revistas-header">
          <h1>Mis órdenes</h1>
          <p className="seccion-descripcion">
            Iniciá sesión para ver tu historial de compras.
          </p>
        </div>
        <div className="mis-revistas-vacio">
          <Link href="/login?next=/mis-ordenes" className="auth-submit">
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mis-revistas-page">
      <div className="mis-revistas-header">
        <h1>Mis órdenes</h1>
        <p className="seccion-descripcion">
          Tu historial de compras, agrupado por orden.
        </p>
        <Link href="/mis-revistas" className="auth-submit auth-submit--ghost">
          Ver mis revistas
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mis-revistas-vacio">
          <p>Todavía no hiciste ninguna compra.</p>
          <Link href="/#consegui-tu-revista" className="auth-submit">
            Ver revistas disponibles
          </Link>
        </div>
      ) : (
        <div className="ordenes-list">
          {orders.map((order) => (
            <article key={order.key} className="orden-card">
              <header className="orden-header">
                <div>
                  <span className="orden-fecha">
                    {formatDate(order.fecha)}
                  </span>
                  <span className="orden-items-count">
                    {order.items.length}{' '}
                    {order.items.length === 1 ? 'revista' : 'revistas'}
                  </span>
                </div>
                <strong className="orden-total">${order.total}</strong>
              </header>
              <ul className="orden-items">
                {order.items.map((item) => {
                  const revista = getRevistaById(item.revista_id);
                  return (
                    <li key={item.id} className="orden-item">
                      <span className="orden-item-titulo">
                        {revista
                          ? revista.titulo ||
                            `Edición ${revista.numero_edicion}`
                          : 'Revista no disponible'}
                      </span>
                      <span className="orden-item-precio">
                        ${item.precio_pagado}
                      </span>
                      {revista && (
                        <Link
                          href={`/leer/${revista.id}`}
                          className="orden-item-leer"
                        >
                          Leer
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default function MisOrdenesPage() {
  return (
    <>
      <Header />
      <MisOrdenesContent />
      <Footer />
    </>
  );
}
