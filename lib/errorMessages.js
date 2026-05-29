/**
 * Traduce errores de Supabase / PostgREST / red a mensajes claros en español
 * para el usuario. Evita mostrar `error.message` crudo (técnico y en inglés).
 *
 * Códigos relevantes:
 *  - 23503 foreign_key_violation  → la revista referenciada no existe
 *  - 23505 unique_violation       → ya está en el carrito / ya comprada
 *  - 42501 insufficient_privilege → RLS rechazó (sesión/permisos)
 *  - PGRST301 / 401               → JWT expirado
 *  - HTTP 5xx                     → servidor caído/saturado
 *  - "Failed to fetch"            → sin conexión
 */
export function friendlyCartError(error) {
  if (!error) return 'Ocurrió un error inesperado. Reintentá.';

  const code = error.code || '';
  const status = Number(error.status || error.statusCode || 0);
  const msg = (error.message || '').toLowerCase();

  if (code === '23503') {
    return 'Esta revista ya no está disponible.';
  }
  if (code === '23505') {
    return 'Ya tenés esta revista.';
  }
  if (code === '42501' || code === 'PGRST301' || status === 401 || status === 403) {
    return 'Tu sesión expiró o no tenés permiso. Volvé a iniciar sesión.';
  }
  if (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('load failed')
  ) {
    return 'Problema de conexión. Revisá tu internet y reintentá.';
  }
  if (status >= 500) {
    return 'El servidor está saturado. Probá de nuevo en unos minutos.';
  }

  return error.message || 'No pudimos completar la operación. Reintentá.';
}
