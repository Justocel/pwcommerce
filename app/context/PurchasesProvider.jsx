'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

/**
 * PURCHASES PROVIDER — persistente en purchases (Supabase).
 *
 * - crearOrden() llama al stored procedure crear_orden_completa() vía RPC.
 *   El procedure corre en una sola transacción server-side: inserta purchases
 *   + vacía el carrito atómicamente. Si algo falla (carrito vacío, revista
 *   inactiva, constraint violation), todo se revierte — no queda compra a
 *   medias ni carrito a medias.
 * - Total y precio_pagado los calcula el server desde revistas.precio, no se
 *   pueden spoofear desde el cliente.
 * - hasPurchase(revistaId) responde sin consulta — usa el cache cargado.
 */
const PurchasesContext = createContext(null);

export function PurchasesProvider({ children }) {
  const { user, hydrated: authHydrated } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    if (!user) {
      setPurchases([]);
      setHydrated(true);
      return;
    }
    loadPurchases();
  }, [authHydrated, user?.id]);

  const loadPurchases = async () => {
    const { data, error } = await supabase
      .from('purchases')
      .select('id, revista_id, order_id, precio_pagado, estado, metodo_pago, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error cargando compras:', error.message);
      setPurchases([]);
    } else {
      setPurchases(data || []);
    }
    setHydrated(true);
  };

  /**
   * Crea una orden atómica a partir del carrito del usuario.
   * Returns: { data: { order_id, total, items_count } | null, error }
   */
  const crearOrden = async (metodoPago = 'mock') => {
    if (!user) return { data: null, error: { code: 'NO_AUTH', message: 'No logueado' } };
    const { data, error } = await supabase.rpc('crear_orden_completa', {
      p_metodo_pago: metodoPago,
    });
    if (error) {
      console.error('Error creando orden:', error.message);
      return { data: null, error };
    }
    await loadPurchases();
    return { data, error: null };
  };

  const hasPurchase = (revistaId) =>
    purchases.some((p) => p.revista_id === revistaId);

  return (
    <PurchasesContext.Provider
      value={{ purchases, hydrated, crearOrden, hasPurchase }}
    >
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases fuera de PurchasesProvider');
  return ctx;
}
