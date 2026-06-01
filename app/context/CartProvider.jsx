'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

/**
 * CART PROVIDER — persistente en cart_items (Supabase).
 *
 * - Requiere user logueado para agregar items.
 * - Cada item es un { revista_id }: no hay cantidad (revista digital, máx 1
 *   por user, garantizado por UNIQUE(user_id, revista_id)).
 * - El total se calcula en el componente que renderiza (CartPanel), usando
 *   useRevistas() para resolver el precio de cada item.
 */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [cart, setCart] = useState([]); // [{ revista_id, created_at }]
  const [showCart, setShowCart] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    if (!user) {
      setCart([]);
      setHydrated(true);
      return;
    }
    loadCart();
  }, [authHydrated, user?.id]);

  useEffect(() => {
    if (cart.length === 0 && showCart) setShowCart(false);
  }, [cart, showCart]);

  const loadCart = async () => {
    const { data, error } = await supabase
      .from('cart_items')
      .select('revista_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error cargando carrito:', error.message);
      setCart([]);
    } else {
      setCart(data || []);
    }
    setHydrated(true);
  };

  const addToCart = async (revistaId) => {
    if (!user) return { error: { code: 'NO_AUTH', message: 'Necesitás iniciar sesión' } };
    const { error } = await supabase
      .from('cart_items')
      .upsert(
        { user_id: user.id, revista_id: revistaId },
        { onConflict: 'user_id,revista_id', ignoreDuplicates: true }
      );
    if (error) {
      console.error('Error agregando al carrito:', error.message);
      return { error };
    }
    await loadCart();
    return { error: null };
  };

  const removeFromCart = async (revistaId) => {
    if (!user) return;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('revista_id', revistaId);
    if (error) {
      console.error('Error eliminando del carrito:', error.message);
      return;
    }
    await loadCart();
  };

  const clearCart = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);
    if (error) {
      console.error('Error vaciando carrito:', error.message);
      return;
    }
    setCart([]);
  };

  const hasInCart = (revistaId) =>
    cart.some((c) => c.revista_id === revistaId);
  const totalItems = cart.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        hydrated,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart: loadCart,
        hasInCart,
        showCart,
        setShowCart,
        totalItems,
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
