'use client';

import { AuthProvider } from './context/AuthProvider';
import { PurchasesProvider } from './context/PurchasesProvider';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <PurchasesProvider>{children}</PurchasesProvider>
    </AuthProvider>
  );
}
