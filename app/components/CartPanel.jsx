'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';
import { usePurchases } from '../context/PurchasesProvider';
import { useRevistas } from '../context/RevistasProvider';
import { trackEvent } from '@/lib/analytics';

function CartPanel() {
  const router = useRouter();
  const { user } = useAuth();
  const { addPurchases } = usePurchases();
  const { getRevistaById } = useRevistas();
  const {
    cart,
    removeFromCart,
    clearCart,
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

  const total = items.reduce((acc, r) => acc + Number(r.precio || 0), 0);

  const handleCheckout = async () => {
    if (!user) {
      setShowCart(false);
      router.push('/login?next=/mis-revistas');
      return;
    }
    setError('');
    setCheckingOut(true);
    const revistaIds = cart.map((c) => c.revista_id);
    const { error: err } = await addPurchases(revistaIds);
    if (err) {
      setError(err.message || 'No pudimos procesar la compra');
      setCheckingOut(false);
      return;
    }
    trackEvent('purchase', {
      userId: user.id,
      metadata: { revista_ids: revistaIds, total },
    });
    await clearCart();
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
