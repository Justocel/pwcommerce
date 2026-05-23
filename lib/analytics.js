import { supabase } from './supabase';

/**
 * Cliente de tracking de eventos.
 *
 * - session_id persiste en sessionStorage (se renueva al cerrar la pestaña).
 * - user_id se pasa explícito (la RLS de analytics_events rechaza si no
 *   coincide con auth.uid()).
 * - Los errores los logueamos pero no los propagamos: tracking no debe
 *   romper la UX.
 */

const SESSION_KEY = 'picnic.session_id';
const VALID_EVENTS = new Set([
  'page_view',
  'video_play',
  'add_to_cart',
  'purchase',
  'pdf_open',
  'login',
  'signup',
]);

function getSessionId() {
  if (typeof window === 'undefined') return null;
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return null;
  }
}

export async function trackEvent(eventType, options = {}) {
  if (!VALID_EVENTS.has(eventType)) {
    console.warn(`trackEvent: tipo desconocido "${eventType}"`);
    return;
  }
  if (typeof window === 'undefined') return;

  const { userId = null, metadata = {}, path } = options;
  const finalPath = path ?? window.location.pathname;

  const { error } = await supabase.from('analytics_events').insert({
    event_type: eventType,
    user_id: userId,
    session_id: getSessionId(),
    path: finalPath,
    metadata,
  });

  if (error) {
    console.warn('trackEvent error:', error.message);
  }
}
