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
    fecha: '2026-04-05',
    image: 'Eventos/1.png',
    estado: 'futuro',
  },
  {
    id: 2,
    nombre: 'Evento Próximo 2',
    fecha: '2026-04-10',
    image: 'Eventos/2.png',
    estado: 'futuro',
  },
  {
    id: 3,
    nombre: 'Evento Próximo 3',
    fecha: '2026-04-15',
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
    url: 'https://youtu.be/gKdnwWDJEDM?si=QEVlXmfU42n65TEQ',
    thumbnail: 'https://img.youtube.com/vi/gKdnwWDJEDM/maxresdefault.jpg',
    alt: 'Portada LOLA TABA',
  },
  {
    id: 2,
    titulo: 'JERO JONES | Gracias por la Intercomunicación #2',
    url: 'https://youtu.be/L-POc5KiwPI?si=ntWpOggc7x6u2Z4R',
    thumbnail: 'https://img.youtube.com/vi/L-POc5KiwPI/maxresdefault.jpg',
    alt: 'Portada JERO JONES',
  },
  {
    id: 3,
    titulo: 'LUCY PATANÉ en el SONIDO KONEX | Gracias por la Intercomunicación MINI',
    url: 'https://youtu.be/K3IoicFrKv8?si=R3mqcTwn7iToZRAo',
    thumbnail: 'https://img.youtube.com/vi/K3IoicFrKv8/maxresdefault.jpg',
    alt: 'Portada LUCY PATANÉ',
  },
  {
    id: 4,
    titulo: 'DUM CHICA - SONIDO KONEX | Gracias por la Intercomunicación MINI',
    url: 'https://youtu.be/CPx_9g0yqFA?si=dJqY118LLYZ7abJ7',
    thumbnail: 'https://img.youtube.com/vi/CPx_9g0yqFA/maxresdefault.jpg',
    alt: 'Portada DUM CHICA',
  },
];

// VIDEOS - Picnic en la tierra
export const videosPicnic = [
  {
    id: 1,
    titulo: 'DOBLE FECHA LIVERPOOL-MARADENTRO 16/09/25 | Picnic en la Tierra #1',
    url: 'https://youtu.be/r0OWf4eB92w?si=UsqDfiavqbYFTcMC',
    thumbnail: 'https://img.youtube.com/vi/r0OWf4eB92w/maxresdefault.jpg',
    alt: 'Portada DOBLE FECHA LIVERPOOL-MARADENTRO',
  },
  {
    id: 2,
    titulo: 'JAMMIN Y RAESVORIA EN MOSCÚ | Picnic en la Tierra',
    url: 'https://youtu.be/hv16HuuGCfo?si=Q6e_RQTNYtdLjqt7',
    thumbnail: 'https://img.youtube.com/vi/hv16HuuGCfo/maxresdefault.jpg',
    alt: 'Portada JAMMIN Y RAESVORIA',
  },
  {
    id: 3,
    titulo: 'LUCY PATANÉ Y DUM CHICA EN EL SONIDO KONEX | Picnic en la Tierra',
    url: 'https://youtu.be/2kVHDyyp-FA?si=soWblOsmQsuJyqsv',
    thumbnail: 'https://img.youtube.com/vi/2kVHDyyp-FA/maxresdefault.jpg',
    alt: 'Portada LUCY PATANÉ Y DUM CHICA',
  },
];

// REVISTAS
export const revistas = [
  {
    id: 7,
    numero: 7,
    image: 'Revistas/7.png',
    alt: 'Revista 7',
  },
  {
    id: 8,
    numero: 8,
    image: 'Revistas/8.png',
    alt: 'Revista 8',
  },
  {
    id: 9,
    numero: 9,
    image: 'Revistas/9.png',
    alt: 'Revista 9',
  },
  {
    id: 10,
    numero: 10,
    image: 'Revistas/10.png',
    alt: 'Revista 10',
  },
  {
    id: 11,
    numero: 11,
    image: 'Revistas/11.png',
    alt: 'Revista 11',
  },
  {
    id: 12,
    numero: 12,
    image: 'Revistas/12.png',
    alt: 'Revista 12',
  },
];

// INTEGRANTES / EQUIPO
export const integrantes = [
  {
    id: 1,
    nombre: 'Juan',
    image: 'Integrantes/Juan.png',
    descripcion: 'Descripción de Juan.',
    rol: 'Rol de Juan', // placeholder para futuro
  },
  {
    id: 2,
    nombre: 'Eva',
    image: 'Integrantes/Eva.png',
    descripcion: 'Descripción de Eva.',
    rol: 'Rol de Eva',
  },
  {
    id: 3,
    nombre: 'Mey',
    image: 'Integrantes/Mey.png',
    descripcion: 'Descripción de Mey.',
    rol: 'Rol de Mey',
  },
  {
    id: 4,
    nombre: 'Vic',
    image: 'Integrantes/Vic.png',
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
