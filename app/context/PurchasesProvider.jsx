'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

/**
 * PURCHASES PROVIDER — persistente en purchases (Supabase).
 *
 * - addPurchases() inserta filas con (user_id, revista_id). El trigger
 *   snapshot_purchase_price() pisa precio_pagado con revistas.precio y
 *   estado='completada' del lado del server (no se puede spoofear desde el cliente).
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
      .select('id, revista_id, order_id, precio_pagado, estado, created_at')
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

  const addPurchases = async (revistaIds) => {
    if (!user) return { error: { code: 'NO_AUTH', message: 'No logueado' } };
    if (!revistaIds?.length) return { error: { code: 'EMPTY', message: 'No hay items' } };
    // order_id compartido agrupa los items de este checkout en una orden.
    const orderId = crypto.randomUUID();
    const rows = revistaIds.map((revistaId) => ({
      user_id: user.id,
      revista_id: revistaId,
      order_id: orderId,
    }));
    const { error } = await supabase
      .from('purchases')
      .upsert(rows, { onConflict: 'user_id,revista_id', ignoreDuplicates: true });
    if (error) {
      console.error('Error en compra:', error.message);
      return { error };
    }
    await loadPurchases();
    return { error: null };
  };

  const hasPurchase = (revistaId) =>
    purchases.some((p) => p.revista_id === revistaId);

  return (
    <PurchasesContext.Provider
      value={{ purchases, hydrated, addPurchases, hasPurchase }}
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
