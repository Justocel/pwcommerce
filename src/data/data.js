/**
 * DATOS CENTRALIZADOS PARA PICNIC
 * Este archivo contiene toda la información que será consumida por React
 * Facilita cambios y mantenimiento sin tocar componentes
 */

// Colores principales
export const COLORS = {
  primary: '#fe3031',
  primaryDark: '#cc2929',
  secondary: '#98002b',
  light: '#fafafa',
  dark: '#333',
};

// EVENTOS
export const eventos = [
  {
    id: 1,
    nombre: 'Evento Próximo 1',
    fecha: '2026-05-05',
    image: 'Eventos/1.png',
    estado: 'futuro',
  },
  {
    id: 2,
    nombre: 'Evento Próximo 2',
    fecha: '2026-05-10',
    image: 'Eventos/2.png',
    estado: 'futuro',
  },
  {
    id: 3,
    nombre: 'Evento Próximo 3',
    fecha: '2026-05-15',
    image: 'Eventos/3.png',
    estado: 'futuro',
  },
  {
    id: 4,
    nombre: 'Evento Pasado 1',
    fecha: '2026-03-30',
    image: 'Eventos/4.png',
    estado: 'pasado',
  },
  {
    id: 5,
    nombre: 'Evento Pasado 2',
    fecha: '2026-03-25',
    image: 'Eventos/5.png',
    estado: 'pasado',
  },
  {
    id: 6,
    nombre: 'Evento Pasado 3',
    fecha: '2026-03-20',
    image: 'Eventos/6.png',
    estado: 'pasado',
  },
];

// VIDEOS - Gracias por la intercomunicación
export const videosGracias = [
  {
    id: 1,
    titulo: 'LOLA TABA | Gracias por la Intercomunicación #1',
    link: 'gKdnwWDJEDM',
    seccion: 'gracias-por-la-intercomunicacion'
  },
  {
    id: 2,
    titulo: 'JERO JONES | Gracias por la Intercomunicación #2',
    link: 'L-POc5KiwPI',
    seccion: 'gracias-por-la-intercomunicacion'
  },
  {
    id: 3,
    titulo: 'LUCY PATANÉ en el SONIDO KONEX | Gracias por la Intercomunicación MINI',
    link: 'K3IoicFrKv8',
    seccion: 'gracias-por-la-intercomunicacion'
  },
  {
    id: 4,
    titulo: 'DUM CHICA - SONIDO KONEX | Gracias por la Intercomunicación MINI',
    link: 'CPx_9g0yqFA',
    seccion: 'gracias-por-la-intercomunicacion'
  },
];

// VIDEOS - Picnic en la tierra
export const videosPicnic = [
  {
    id: 5,
    titulo: 'DOBLE FECHA LIVERPOOL-MARADENTRO 16/09/25 | Picnic en la Tierra #1',
    link: 'r0OWf4eB92w',
    seccion: 'picnic-en-la-tierra'
  },
  {
    id: 6,
    titulo: 'JAMMIN Y RAESVORIA EN MOSCÚ | Picnic en la Tierra',
    link: 'hv16HuuGCfo',
    seccion: 'picnic-en-la-tierra'
  },
  {
    id: 7,
    titulo: 'LUCY PATANÉ Y DUM CHICA EN EL SONIDO KONEX | Picnic en la Tierra',
    link: '2kVHDyyp-FA',
    seccion: 'picnic-en-la-tierra'
  },
];

// REVISTAS
export const revistas = [
  {
    id: 7,
    numero: 7,
    image: 'Revistas/7.png',
    alt: 'Revista 7',
    precio: 500,
  },
  {
    id: 8,
    numero: 8,
    image: 'Revistas/8.png',
    alt: 'Revista 8',
    precio: 500,
  },
  {
    id: 9,
    numero: 9,
    image: 'Revistas/9.png',
    alt: 'Revista 9',
    precio: 500,
  },
  {
    id: 10,
    numero: 10,
    image: 'Revistas/10.png',
    alt: 'Revista 10',
    precio: 500,
  },
  {
    id: 11,
    numero: 11,
    image: 'Revistas/11.png',
    alt: 'Revista 11',
    precio: 500,
  },
  {
    id: 12,
    numero: 12,
    image: 'Revistas/12.png',
    alt: 'Revista 12',
    precio: 500,
  },
];

// INTEGRANTES / EQUIPO
export const integrantes = [
  {
    id: 1,
    nombre: 'Juan',
    image: 'Integrantes/juan.jpg',
    descripcion: 'Descripción de Juan.',
    rol: 'Rol de Juan', // placeholder para futuro
  },
  {
    id: 2,
    nombre: 'Eva',
    image: 'Integrantes/eva.jpg',
    descripcion: 'Descripción de Eva.',
    rol: 'Rol de Eva',
  },
  {
    id: 3,
    nombre: 'Mey',
    image: 'Integrantes/mey.jpg',
    descripcion: 'Descripción de Mey.',
    rol: 'Rol de Mey',
  },
  {
    id: 4,
    nombre: 'Vic',
    image: 'Integrantes/vic.jpg',
    descripcion: 'Descripción de Vic.',
    rol: 'Rol de Vic',
  },
];

// SECCIONES - Metadata para navegación y descripciones
export const secciones = {
  hero: {
    id: 'hero',
    titulo: 'Picnic',
    subtitulo: 'La revista del arte fino',
    videoSrc: 'icon.mp4',
  },
  eventos: {
    id: 'eventos',
    titulo: 'Eventos',
    descripcion: 'No te los pierdas',
  },
  gracias: {
    id: 'gracias-intercomunicacion',
    titulo: 'Gracias por la intercomunicación',
    descripcion: 'Conversaciones con artistas emergentes',
  },
  picnic: {
    id: 'picnic-en-la-tierra',
    titulo: 'Picnic en la tierra',
    descripcion: 'Cobertura periodística de la escena con la esencia picnic',
  },
  revistas: {
    id: 'consegui-tu-revista',
    titulo: 'Conseguí tu revista',
    descripcion: 'No te quedes afuera',
  },
  equipo: {
    id: 'quienes-somos',
    titulo: 'Quiénes Somos',
    descripcion: 'Conoce al equipo Picnic',
  },
};

// NAVEGACIÓN
export const navLinks = [
  { label: 'Eventos', href: '#eventos' },
  { label: 'Gracias por la intercomunicación', href: '#gracias-intercomunicacion' },
  { label: 'Picnic en la tierra', href: '#picnic-en-la-tierra' },
  { label: 'Conseguí tu revista', href: '#consegui-tu-revista' },
  { label: 'Quiénes Somos', href: '#quienes-somos' },
];

// FOOTER
export const footer = {
  copyright: '© 2024 Picniczine. Todos los derechos reservados.',
};

// UTILIDADES
/**
 * Retorna la fecha de hoy
 * Se usa en Events.jsx para comparar eventos pasados vs futuros
 */
export const getTodayDate = () => new Date();
