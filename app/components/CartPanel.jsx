'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';
import { usePurchases } from '../context/PurchasesProvider';
import { useRevistas } from '../context/RevistasProvider';
import { trackEvent } from '@/lib/analytics';
import { friendlyCartError } from '@/lib/errorMessages';

function CartPanel() {
  const router = useRouter();
  const { user } = useAuth();
  const { crearOrden } = usePurchases();
  const { getRevistaById } = useRevistas();
  const {
    cart,
    removeFromCart,
    refreshCart,
    showCart,
    setShowCart,
  } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  if (!showCart || cart.length === 0) return null;

  const items = cart
    .map((c) => {
      const revista = getRevistaById(c.revista_id);
      return revista ? { ...revista, revista_id: c.revista_id } : null;
    })
    .filter(Boolean);

  // Items que están en cart_items pero cuya revista ya no existe / no está activa
  // (ej: el editor la borró o desactivó mientras estaba en tu carrito).
  const unavailableCount = cart.length - items.length;

  const total = items.reduce((acc, r) => acc + Number(r.precio || 0), 0);

  const handleCheckout = async () => {
    if (!user) {
      setShowCart(false);
      router.push('/login?next=/mis-revistas');
      return;
    }
    setError('');
    setCheckingOut(true);
    const revistaIds = items.map((r) => r.revista_id);
    if (revistaIds.length === 0) {
      setError('Ninguna de las revistas del carrito está disponible.');
      setCheckingOut(false);
      return;
    }
    // crear_orden_completa() en Postgres: inserta purchases + vacía carrito
    // en la misma transacción. Si falla algo, todo se revierte.
    const { data, error: err } = await crearOrden('mock');
    if (err) {
      setError(friendlyCartError(err));
      setCheckingOut(false);
      return;
    }
    trackEvent('purchase', {
      userId: user.id,
      metadata: {
        order_id: data?.order_id,
        items_count: data?.items_count,
        total: data?.total,
      },
    });
    await refreshCart();
    setShowCart(false);
    setCheckingOut(false);
    router.push('/mis-revistas');
  };

  return (
    <div className="cart-panel" role="dialog" aria-label="Carrito de compras">
      <div className="cart-panel-header">
        <h2>Tu Carrito</h2>
        <button
          className="cart-close-btn"
          onClick={() => setShowCart(false)}
          aria-label="Cerrar carrito"
        >
          ✕
        </button>
      </div>
      <div className="cart-items">
        {items.map((revista) => (
          <div key={revista.revista_id} className="cart-item">
            <img
              src={revista.portada_path}
              alt={`Edición ${revista.numero_edicion}`}
              className="cart-item-img"
            />
            <div className="cart-item-info">
              <p className="cart-item-title">
                {revista.titulo || `Edición ${revista.numero_edicion}`}
              </p>
              <p className="cart-item-price">${revista.precio}</p>
            </div>
            <button
              className="cart-remove-btn"
              onClick={() => removeFromCart(revista.revista_id)}
              aria-label={`Eliminar Edición ${revista.numero_edicion}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <strong>Total: ${total}</strong>
      </div>
      {unavailableCount > 0 && (
        <p className="cart-warning">
          {unavailableCount === 1
            ? '1 revista de tu carrito ya no está disponible y no se va a comprar.'
            : `${unavailableCount} revistas de tu carrito ya no están disponibles y no se van a comprar.`}
        </p>
      )}
      {error && <p className="auth-error">{error}</p>}
      <button
        className="cart-checkout-btn"
        onClick={handleCheckout}
        disabled={checkingOut}
      >
        {checkingOut
          ? 'Procesando…'
          : user
            ? 'Comprar'
            : 'Iniciar sesión para comprar'}
      </button>
    </div>
  );
}

export default CartPanel;
