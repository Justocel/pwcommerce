/**
 * DATOS CENTRALIZADOS PARA PICNIC
 * Toda la información que será consumida por los componentes de Next.js.
 * Las rutas de imágenes empiezan con "/" para apuntar a /public.
 */

export const COLORS = {
  primary: '#fe3031',
  primaryDark: '#cc2929',
  secondary: '#98002b',
  light: '#fafafa',
  dark: '#333',
};

// BIENVENIDA
export const welcome = {
  paragraphs: [
    'Si estás leyendo esto seguramente ya sabés dónde estás. ¡Bienvenidx a PICNIC! Este es nuestro primer número y te agradecemos profundamente que lo estés leyendo. También si estás acá, en un principio, hay una gran probabilidad de que compartamos bastantes gustos. Eso es también lo que hacemos. Recapitulemos: PICNIC, la revista del arte fino, tiene como razón de ser la creación de contenidos periodísticos sobre arte en general (¡no dejamos afuera a nadie!). Nos gusta el cine, la música, el teatro, la pintura, la escultura, la literatura, la poesía. Todo tipo de arte.',
    '¿Por qué arte fino? Consideramos que toda expresión artística, si atraviesa un sentimiento, tiene una razón de ser. Si hacés una búsqueda rápida en Google sobre qué es el arte fino, seguramente te salga que es un tipo de arte visual creado principalmente con propósitos estéticos, intelectuales o emocionales, en contraposición a las artes decorativas o utilitarias.',
    'Por eso mismo es que consideramos que hacemos periodismo de arte fino. El arte fino nos emociona y por eso es que todos los días elegimos poner el cuerpo a su disposición: ir a lugares donde se respire arte fino y nos rodee por completo y, justamente por eso, es que nos pareció incluso más interesante también hablar con los artistas y hacerles toda clase de preguntas.',
    'Creemos que también es otra forma de popularizar el arte y democratizarlo. Hay momentos en que pensamos: "si nadie graba esto, ¿realmente existió?" Consideramos que hay artistas que nos gustan tanto que queremos compartirlos con todo el mundo. Esa será la base de siempre. Y, por último, en la base de la revista también estás vos, ¡fiel lectorx! Ahora vos también tenés la potestad de contarle a todo el mundo que hay un lugar en donde hablan de lo que te gusta',
  ],
  pullQuote: 'Si nadie graba esto, ¿realmente existió?',
  pullQuoteAfter: 1,
};

// ARTICULOS — ahora viven en la tabla articulos (Supabase). Ver ArticulosProvider.

// EVENTOS
export const eventos = [
  {
    id: 1,
    nombre: 'Evento Próximo 1',
    fecha: '2026-05-05',
    image: '/Eventos/1.png',
    estado: 'futuro',
  },
  {
    id: 2,
    nombre: 'Evento Próximo 2',
    fecha: '2026-05-10',
    image: '/Eventos/2.png',
    estado: 'futuro',
  },
  {
    id: 3,
    nombre: 'Evento Próximo 3',
    fecha: '2026-05-15',
    image: '/Eventos/3.png',
    estado: 'futuro',
  },
  {
    id: 4,
    nombre: 'Evento Pasado 1',
    fecha: '2026-03-30',
    image: '/Eventos/4.png',
    estado: 'pasado',
  },
  {
    id: 5,
    nombre: 'Evento Pasado 2',
    fecha: '2026-03-25',
    image: '/Eventos/5.png',
    estado: 'pasado',
  },
  {
    id: 6,
    nombre: 'Evento Pasado 3',
    fecha: '2026-03-20',
    image: '/Eventos/6.png',
    estado: 'pasado',
  },
];

// VIDEOS — ahora viven en la tabla videos (Supabase). Ver VideosProvider.

// REVISTAS — ahora viven en la tabla revistas (Supabase). Ver RevistasProvider.

// INTEGRANTES — ahora viven en la tabla integrantes (Supabase). Ver IntegrantesProvider.

// SECCIONES - Metadata para navegación y descripciones
export const secciones = {
  hero: {
    id: 'hero',
    titulo: 'Picnic',
    subtitulo: 'La revista del arte fino',
    videoSrc: '/icon.mp4',
  },
  articulos: {
    id: 'articulos',
    titulo: 'Artículos',
    descripcion: 'Lecturas para llevarte',
  },
  eventosProximos: {
    id: 'eventos-proximos',
    titulo: 'Eventos próximos',
    descripcion: 'No te los pierdas',
  },
  eventosPasados: {
    id: 'eventos-pasados',
    titulo: 'Eventos pasados',
    descripcion: 'Lo que ya vivimos',
  },
  picnicEscena: {
    id: 'picnic-en-la-escena',
    titulo: 'Picnic en la escena',
    descripcion: 'La escena en primera persona',
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
    titulo: 'Conseguí la revista',
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
  { label: 'Artículos', href: '/#articulos' },
  { label: 'Eventos próximos', href: '/#eventos-proximos' },
  { label: 'Eventos pasados', href: '/#eventos-pasados' },
  { label: 'Picnic en la escena', href: '/#picnic-en-la-escena' },
  { label: 'Conseguí la revista', href: '/#consegui-tu-revista' },
  { label: 'Quiénes Somos', href: '/#quienes-somos' },
];

// FOOTER
export const footer = {
  brand: 'Picnic',
  tagline: 'La revista del arte fino',
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'TikTok', href: 'https://tiktok.com/' },
    { label: 'YouTube', href: 'https://youtube.com/' },
  ],
  contacto: {
    email: 'contacto@picniczine.com',
    colaboraciones: 'Para colaborar, escribinos.',
  },
  copyright: 'Picniczine. Todos los derechos reservados.',
};

/**
 * Retorna la fecha de hoy.
 * Se usa en Events.jsx para comparar eventos pasados vs futuros.
 */
export const getTodayDate = () => new Date();
