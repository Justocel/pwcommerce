'use client';

import { useState } from 'react';
import { revistas, secciones } from '../data/data';

/**
 * COMPONENTE REVISTAS
 * Sección de revistas que funciona como carrito de compras
 *
 * Estado:
 * - cart: array con IDs de revistas agregadas al carrito y sus cantidades
 * - showCart: booleano para mostrar/ocultar el carrito
 */
function Revistas() {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (revistaId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === revistaId);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === revistaId
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prevCart, { id: revistaId, cantidad: 1 }];
      }
    });
  };

  const removeFromCart = (revistaId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== revistaId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, cartItem) => {
      const revista = revistas.find((r) => r.id === cartItem.id);
      return total + (revista?.precio || 0) * cartItem.cantidad;
    }, 0);
  };

  const getRevistaById = (id) => revistas.find((r) => r.id === id);

  return (
    <section id={secciones.revistas.id} className="seccion-placeholder">
      <div className="seccion-header">
        <h1>{secciones.revistas.titulo}</h1>
        <p className="seccion-descripcion">{secciones.revistas.descripcion}</p>
      </div>

      <button
        className="cart-toggle"
        onClick={() => setShowCart(!showCart)}
        aria-label="Mostrar/ocultar carrito"
      >
        🛒 Carrito ({cart.length})
      </button>

      {showCart && (
        <div className="cart-panel">
          <h2>Tu Carrito</h2>
          {cart.length === 0 ? (
            <p className="cart-empty">Tu carrito está vacío</p>
          ) : (
            <>
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
              <button className="cart-checkout-btn">Comprar</button>
            </>
          )}
        </div>
      )}

      <div className="revistas-container">
        {revistas.map((revista) => (
          <div key={revista.id} className="revista-item">
            <img src={revista.image} alt={revista.alt} />
            <button
              className="revista-add-btn"
              onClick={() => addToCart(revista.id)}
              aria-label={`Agregar Revista ${revista.numero} al carrito`}
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Revistas;
