/**
 * UTILIDADES COMUNES
 * Funciones auxiliares reutilizables en el proyecto React
 */

/**
 * Formatear fecha a formato legible
 * @param {string} dateString - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

/**
 * Scroll suave a una sección
 * @param {string} sectionId - ID de la sección
 */
export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Verificar si el evento está en el futuro
 * @param {string} eventDate - Fecha del evento
 * @returns {boolean}
 */
export const isEventFuture = (eventDate) => {
  return new Date(eventDate) > new Date();
};

/**
 * Clasificar eventos por estado
 * @param {Array} events - Array de eventos
 * @returns {Object} { futuro: [], pasado: [] }
 */
export const classifyEvents = (events) => {
  return {
    futuro: events.filter(e => isEventFuture(e.fecha)),
    pasado: events.filter(e => !isEventFuture(e.fecha)),
  };
};

/**
 * Obtener thumbnail de YouTube
 * @param {string} url - URL de YouTube
 * @returns {string} URL del thumbnail
 */
export const getYoutubeThumbnail = (url) => {
  const videoId = extractYoutubeId(url);
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

/**
 * Extraer ID de video de YouTube
 * @param {string} url - URL de YouTube
 * @returns {string} ID del video
 */
export const extractYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * Truncar texto a cierta longitud
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Crear slug de texto
 * @param {string} text - Texto a convertir
 * @returns {string} Slug generado
 */
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generar clase CSS condicional
 * @param {Object} classes - Objeto con clases y condiciones
 * @returns {string} Clases combinadas
 */
export const classNames = (classes) => {
  return Object.keys(classes)
    .filter(key => classes[key])
    .join(' ');
};

/**
 * Verificar si está en el viewport
 * @param {Element} element - Elemento a verificar
 * @returns {boolean}
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Debounce de función
 * @param {Function} func - Función a debounce
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función debounced
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle de función
 * @param {Function} func - Función a throttle
 * @param {number} limit - Límite en ms
 * @returns {Function} Función throttled
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Copiar texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error al copiar:', err);
    return false;
  }
};

/**
 * Obtener parámetro de URL
 * @param {string} param - Nombre del parámetro
 * @returns {string|null} Valor del parámetro
 */
export const getUrlParam = (param) => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param);
};

/**
 * Establecer parámetro de URL sin recargar
 * @param {string} param - Nombre del parámetro
 * @param {string} value - Valor del parámetro
 */
export const setUrlParam = (param, value) => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(param, value);
  window.history.replaceState({}, '', `?${searchParams.toString()}`);
};

/**
 * Local Storage - Wrapper seguro
 */
export const storage = {
  get: (key) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (err) {
      console.error(`Error al obtener ${key}:`, err);
      return null;
    }
  },

  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Error al guardar ${key}:`, err);
      return false;
    }
  },

  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Error al eliminar ${key}:`, err);
      return false;
    }
  },

  clear: () => {
    try {
      window.localStorage.clear();
      return true;
    } catch (err) {
      console.error('Error al limpiar localStorage:', err);
      return false;
    }
  },
};

/**
 * Exportar todas las utilidades
 */
export const Utils = {
  formatDate,
  scrollToSection,
  isEventFuture,
  classifyEvents,
  getYoutubeThumbnail,
  extractYoutubeId,
  truncateText,
  createSlug,
  classNames,
  isInViewport,
  debounce,
  throttle,
  copyToClipboard,
  getUrlParam,
  setUrlParam,
  storage,
};

export default Utils;
