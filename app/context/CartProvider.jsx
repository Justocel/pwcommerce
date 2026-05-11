'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { revistas } from '../data/data';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (cart.length === 0 && showCart) setShowCart(false);
  }, [cart, showCart]);

  const addToCart = (revistaId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === revistaId);
      if (existing) {
        return prev.map((item) =>
          item.id === revistaId
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { id: revistaId, cantidad: 1 }];
    });
  };

  const removeFromCart = (revistaId) => {
    setCart((prev) => prev.filter((item) => item.id !== revistaId));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const total = cart.reduce((acc, item) => {
    const revista = revistas.find((r) => r.id === item.id);
    return acc + (revista?.precio || 0) * item.cantidad;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        showCart,
        setShowCart,
        totalItems,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart fuera de CartProvider');
  return ctx;
}
