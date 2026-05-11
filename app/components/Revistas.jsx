'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { revistas, secciones } from '../data/data';
import { useAuth } from '../context/AuthProvider';
import { usePurchases } from '../context/PurchasesProvider';

const Revista3D = dynamic(() => import('./Revista3D'), {
  ssr: false,
  loading: () => <div className="revista-3d-canvas revista-3d-fallback" />,
});

/**
 * COMPONENTE REVISTAS
 * Sección de revistas con carrito flotante.
 * - El botón del carrito sólo aparece cuando hay items.
 * - El panel del carrito es una ventana fija en pantalla y se cierra solo al vaciarse.
 */
function Revistas() {
  const router = useRouter();
  const { user } = useAuth();
  const { addPurchases } = usePurchases();
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (cart.length === 0 && showCart) {
      setShowCart(false);
    }
  }, [cart, showCart]);

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?next=/mis-revistas');
      return;
    }
    const ids = cart.map((item) => item.id);
    addPurchases(user.email, ids);
    setCart([]);
    setShowCart(false);
    router.push('/mis-revistas');
  };

  const addToCart = (revistaId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === revistaId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === revistaId
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prevCart, { id: revistaId, cantidad: 1 }];
    });
  };

  const removeFromCart = (revistaId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== revistaId));
  };

  const calculateTotal = () =>
    cart.reduce((total, cartItem) => {
      const revista = revistas.find((r) => r.id === cartItem.id);
      return total + (revista?.precio || 0) * cartItem.cantidad;
    }, 0);

  const getRevistaById = (id) => revistas.find((r) => r.id === id);

  const revistasDisponibles = revistas.slice(0, 1);
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <section id={secciones.revistas.id} className="seccion-placeholder">
      <div className="seccion-header">
        <h1>{secciones.revistas.titulo}</h1>
        <p className="seccion-descripcion">{secciones.revistas.descripcion}</p>
      </div>

      <div className="revistas-container revistas-container--3d">
        {revistasDisponibles.map((revista) => (
          <div key={revista.id} className="revista-item revista-item--3d">
            <Revista3D />
            <button
              className="revista-add-btn revista-add-btn--3d"
              onClick={() => addToCart(revista.id)}
              aria-label={`Agregar Revista ${revista.numero} al carrito`}
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <button
          className="cart-toggle"
          onClick={() => setShowCart((prev) => !prev)}
          aria-label="Mostrar/ocultar carrito"
        >
          Carrito ({totalItems})
        </button>
      )}

      {showCart && cart.length > 0 && (
        <div
          className="cart-panel"
          role="dialog"
          aria-label="Carrito de compras"
        >
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
                    <p className="cart-item-title">
                      Revista #{revista?.numero}
                    </p>
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
            <strong>Total: ${calculateTotal()}</strong>
          </div>
          <button className="cart-checkout-btn" onClick={handleCheckout}>
            {user ? 'Comprar' : 'Iniciar sesión para comprar'}
          </button>
        </div>
      )}
    </section>
  );
}

export default Revistas;
