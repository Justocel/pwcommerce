'use client';

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * PURCHASES PROVIDER (mock)
 * Persiste un array de compras por email en localStorage:
 *   { [email]: [{ revistaId, fecha }] }
 *
 * Cuando se conecte a una DB real, addPurchase() pasa a ser un INSERT en la
 * tabla purchases y getPurchases() pasa a ser un SELECT por user_id.
 */
const PurchasesContext = createContext(null);
const STORAGE_KEY = 'picnic.purchases';

function readStore() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function PurchasesProvider({ children }) {
  const [store, setStore] = useState({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(readStore());
    setHydrated(true);
  }, []);

  const persist = (next) => {
    setStore(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const getPurchases = (email) => (email ? store[email] || [] : []);

  const addPurchases = (email, revistaIds) => {
    if (!email || !revistaIds?.length) return;
    const fecha = new Date().toISOString();
    const previas = store[email] || [];
    const idsExistentes = new Set(previas.map((p) => p.revistaId));
    const nuevas = revistaIds
      .filter((id) => !idsExistentes.has(id))
      .map((revistaId) => ({ revistaId, fecha }));
    persist({ ...store, [email]: [...previas, ...nuevas] });
  };

  const hasPurchase = (email, revistaId) =>
    getPurchases(email).some((p) => p.revistaId === revistaId);

  return (
    <PurchasesContext.Provider
      value={{ hydrated, getPurchases, addPurchases, hasPurchase }}
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
