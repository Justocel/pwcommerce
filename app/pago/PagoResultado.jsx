'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartProvider';
import { usePurchases } from '../context/PurchasesProvider';

/**
 * Componente compartido para las páginas /pago/exito, /pendiente, /error.
 * Refresca purchases y carrito cuando vuelve el user del checkout de MP.
 */
export default function PagoResultado({ titulo, subtitulo, mensaje, variant, primaryHref, primaryText }) {
  const { refreshCart } = useCart();
  const { hydrated: purchasesHydrated } = usePurchases();

  useEffect(() => {
    refreshCart();
    // PurchasesProvider se rehidrata por su cuenta cuando cambia el auth state.
    // No tenemos un reloadPurchases expuesto, pero el provider re-fetcha en el
    // mount si el user está logueado.
  }, [refreshCart]);

  return (
    <>
      <Header />
      <main className="mis-revistas-page">
        <div className={`pago-resultado pago-resultado--${variant}`}>
          <h1>{titulo}</h1>
          {subtitulo && <p className="pago-resultado-sub">{subtitulo}</p>}
          {mensaje && <p className="pago-resultado-msg">{mensaje}</p>}
          <div className="pago-resultado-actions">
            <Link href={primaryHref} className="auth-submit">
              {primaryText}
            </Link>
            <Link href="/" className="auth-submit auth-submit--ghost">
              Volver al inicio
            </Link>
          </div>
          {!purchasesHydrated && (
            <p className="pago-resultado-loading">Actualizando tu cuenta…</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
