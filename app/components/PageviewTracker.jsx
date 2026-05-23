'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthProvider';
import { trackEvent } from '@/lib/analytics';

/**
 * Dispara `page_view` en cada cambio de pathname.
 * Solo cuenta una vez que auth está hidratado para no perder el user_id.
 */
export default function PageviewTracker() {
  const pathname = usePathname();
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    trackEvent('page_view', { userId: user?.id || null, path: pathname });
  }, [pathname, hydrated, user?.id]);

  return null;
}
