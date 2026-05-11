'use client';

import { AuthProvider } from './context/AuthProvider';
import { PurchasesProvider } from './context/PurchasesProvider';
import { CartProvider } from './context/CartProvider';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <PurchasesProvider>
        <CartProvider>{children}</CartProvider>
      </PurchasesProvider>
    </AuthProvider>
  );
}
