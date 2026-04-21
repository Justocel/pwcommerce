/**
 * CONFIGURACIÓN GLOBAL DEL PROYECTO
 * Centraliza constantes, configuración y ajustes del sitio
 */

// CONFIGURACIÓN DEL SITIO
export const SITE_CONFIG = {
  title: 'Picnic Zine',
  description: 'La revista del arte fino',
  author: 'Equipo Picnic',
  year: 2024,
  url: 'https://picnic-zine.com', // Actualizar cuando esté en producción
};

// TAMAÑOS Y BREAKPOINTS RESPONSIVE
export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

// DURACIONES DE ANIMACIONES (en ms)
export const ANIMATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// CONFIGURACIÓN DE SCROLL
export const SCROLL_CONFIG = {
  behavior: 'smooth',
  smooth: true,
};

// SECCIONES DEL SITIO (para navegación programática)
export const SECTIONS = [
  'hero',
  'eventos',
  'gracias-intercomunicacion',
  'picnic-en-la-tierra',
  'consegui-tu-revista',
  'quienes-somos',
];

// RUTAS (para futuro uso con React Router)
export const ROUTES = {
  home: '/',
  eventos: '/#eventos',
  videos: '/#gracias-intercomunicacion',
  revistas: '/#consegui-tu-revista',
  team: '/#quienes-somos',
};

// URLS EXTERNAS
export const EXTERNAL_URLS = {
  youtube: 'https://www.youtube.com',
  instagram: 'https://www.instagram.com/picnicpicnic', // Actualizar si existe
  twitter: 'https://twitter.com', // Actualizar si existe
};

// FORMATOS Y VALIDACIONES
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9+\-\s()]*$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

// MENSAJES DEL SITIO
export const MESSAGES = {
  loading: 'Cargando...',
  error: 'Ocurrió un error',
  success: 'Éxito',
  notFound: 'No encontrado',
  noData: 'No hay datos disponibles',
};

// LIMITES Y PAGINACIÓN
export const LIMITS = {
  eventsPerPage: 6,
  videosPerPage: 4,
  revistasPerPage: 6,
  teamMembers: 4,
};

// CARACTERÍSTICAS DEL SITIO
export const FEATURES = {
  enableComments: false,
  enableSharing: true,
  enableSearch: false, // Para futuro
  enableAnalytics: false,
  enableNotifications: false,
};

// CONFIGURACIÓN DE VIDEOS
export const VIDEO_CONFIG = {
  autoplay: true,
  muted: true,
  loop: true,
  controls: false,
  playsinline: true,
};

// CONFIGURACIÓN DE IMÁGENES
export const IMAGE_CONFIG = {
  thumbnailWidth: 300,
  thumbnailHeight: 300,
  fullWidth: 1200,
  fullHeight: 800,
  formats: ['webp', 'jpg', 'png'],
};

/**
 * EXPORTAR TODO COMO OBJETO PARA MEJOR ORGANIZACIÓN
 */
export const CONFIG = {
  SITE_CONFIG,
  BREAKPOINTS,
  ANIMATIONS,
  SCROLL_CONFIG,
  SECTIONS,
  ROUTES,
  EXTERNAL_URLS,
  VALIDATION,
  MESSAGES,
  LIMITS,
  FEATURES,
  VIDEO_CONFIG,
  IMAGE_CONFIG,
};

export default CONFIG;
