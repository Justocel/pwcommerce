import React, { useState } from 'react';
import { revistas, secciones } from '../data/data';
import '../styles/revistas.css';

/**
 * COMPONENTE REVISTAS
 * Sección de revistas que funciona como carrito de compras
 * Las revistas se pueden agregar al carrito
 *
 * Estado:
 * - cart: array con IDs de revistas agregadas al carrito y sus cantidades
 * - showCart: booleano para mostrar/ocultar el carrito
 *
 * Los datos ya están cargados en arrays (revistas)
 */
function Revistas() {
  // Estado del carrito: { revistaId, cantidad }
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  /**
   * Agrega una revista al carrito o incrementa su cantidad
   * Usa setState con función para mantener referencia correcta
   */
  const addToCart = (revistaId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === revistaId);

      if (existingItem) {
        // Si ya existe, incrementa cantidad
        return prevCart.map((item) =>
          item.id === revistaId
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Si no existe, agrega con cantidad 1
        return [...prevCart, { id: revistaId, cantidad: 1 }];
      }
    });
  };

  /**
   * Elimina una revista del carrito
   */
  const removeFromCart = (revistaId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id !== revistaId)
    );
  };

  /**
   * Calcula el total del carrito
   */
  const calculateTotal = () => {
    return cart.reduce((total, cartItem) => {
      const revista = revistas.find((r) => r.id === cartItem.id);
      return total + (revista?.precio || 0) * cartItem.cantidad;
    }, 0);
  };

  /**
   * Obtiene una revista por ID
   */
  const getRevistaById = (id) => {
    return revistas.find((r) => r.id === id);
  };

  return (
    <section id={secciones.revistas.id} className="seccion-placeholder">
      <div className="seccion-header">
        <h1>{secciones.revistas.titulo}</h1>
        <p className="seccion-descripcion">{secciones.revistas.descripcion}</p>
      </div>

      {/* Botón para mostrar/ocultar carrito */}
      <button
        className="cart-toggle"
        onClick={() => setShowCart(!showCart)}
        aria-label="Mostrar/ocultar carrito"
      >
        🛒 Carrito ({cart.length})
      </button>

      {/* Vista del carrito */}
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

      {/* Grid de revistas */}
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
