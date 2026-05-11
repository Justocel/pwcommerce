'use client';

import { useRouter } from 'next/navigation';
import { revistas } from '../data/data';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';
import { usePurchases } from '../context/PurchasesProvider';

function CartPanel() {
  const router = useRouter();
  const { user } = useAuth();
  const { addPurchases } = usePurchases();
  const {
    cart,
    removeFromCart,
    clearCart,
    showCart,
    setShowCart,
    total,
  } = useCart();

  if (!showCart || cart.length === 0) return null;

  const getRevistaById = (id) => revistas.find((r) => r.id === id);

  const handleCheckout = () => {
    if (!user) {
      setShowCart(false);
      router.push('/login?next=/mis-revistas');
      return;
    }
    addPurchases(
      user.email,
      cart.map((item) => item.id)
    );
    clearCart();
    setShowCart(false);
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
        {cart.map((cartItem) => {
          const revista = getRevistaById(cartItem.id);
          return (
            <div key={cartItem.id} className="cart-item">
              <img
                src={revista?.image}
                alt={`Revista ${revista?.numero}`}
                className="cart-item-img"
              />
              <div className="cart-item-info">
                <p className="cart-item-title">Revista #{revista?.numero}</p>
                <p className="cart-item-price">
                  ${revista?.precio} x {cartItem.cantidad} = $
                  {revista && revista.precio * cartItem.cantidad}
                </p>
              </div>
              <button
                className="cart-remove-btn"
                onClick={() => removeFromCart(cartItem.id)}
                aria-label={`Eliminar Revista ${revista?.numero}`}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <div className="cart-total">
        <strong>Total: ${total}</strong>
      </div>
      <button className="cart-checkout-btn" onClick={handleCheckout}>
        {user ? 'Comprar' : 'Iniciar sesión para comprar'}
      </button>
    </div>
  );
}

export default CartPanel;
