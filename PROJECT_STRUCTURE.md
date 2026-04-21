# Estructura del Proyecto Picnic - Guía para React

## 📋 Descripción General
Este proyecto está siendo preparado para migración a React. Se ha centralizado toda la información y se han creado variables CSS para facilitar la transición.

---

## 📁 Archivos Principales

### 1. **data.js** 
**Ubicación:** `/data.js`

**Propósito:** Centro único de datos y configuración del proyecto.

**Contenido:**
- `COLORS` - Paleta de colores principal
- `eventos` - Array con todos los eventos (futuro/pasado)
- `videosGracias` - Videos de "Gracias por la intercomunicación"
- `videosPicnic` - Videos de "Picnic en la tierra"
- `revistas` - Colección de revistas (7-12)
- `integrantes` - Miembros del equipo (Juan, Eva, Mey, Vic)
- `secciones` - Metadatos de cada sección
- `navLinks` - Enlaces de navegación
- `footer` - Información del footer

**Uso en React:**
```javascript
import { eventos, integrantes, COLORS } from './data.js';
```

---

### 2. **style.css**
**Ubicación:** `/style.css`

**Mejoras implementadas:**
- ✅ Variables CSS centralizadas (`:root`)
- ✅ Colores estandarizados
- ✅ Espaciado consistente
- ✅ Tamaños de fuente predefinidos
- ✅ Sombras y transiciones reutilizables

**Variables CSS disponibles:**
```css
/* Colores */
--color-primary: #fe3031
--color-primary-dark: #cc2929
--color-secondary: #98002b
--color-light: #fafafa
--color-dark: #333

/* Tamaños de fuente */
--font-size-xs: 0.8em
--font-size-sm: 1.1em
--font-size-base: 1.2em
--font-size-lg: 1.5em
--font-size-2xl: 2.5em
--font-size-3xl: 3em
--font-size-4xl: 3.5em

/* Espaciado */
--spacing-xs: 5px
--spacing-sm: 8px
--spacing-md: 12px
--spacing-lg: 20px
--spacing-xl: 30px
--spacing-2xl: 40px
--spacing-3xl: 60px

/* Otros */
--radius-sm: 4px
--radius-md: 8px
--radius-full: 50%
--shadow-sm: 0 2px 8px rgba(0,0,0,0.2)
--transition-fast: 0.2s
--transition-normal: 0.3s
```

---

## 🎯 Componentes Principales

### Secciones HTML (Futuras componentes React)

1. **Header** (`<header class="cuerpo">`)
   - Logo Picnic
   - Título y subtítulo

2. **Navigation** (`<nav class="subheader">`)
   - Links a todas las secciones
   - Sticky (se mantiene en la parte superior)

3. **Hero Section** (`#hero`)
   - Video fullscreen de fondo
   - Altura: 50vh
   - Background: color primario

4. **Eventos** (`#eventos`)
   - Grid horizontal scrollable
   - Cards con imagen, nombre, fecha
   - Etiqueta de "Pasado" para eventos anteriores

5. **Gracias por la intercomunicación** (`#gracias-intercomunicacion`)
   - Grid de videos (YouTube thumbnails)
   - Enlaces externos

6. **Picnic en la tierra** (`#picnic-en-la-tierra`)
   - Similar a Gracias, con videos diferentes

7. **Conseguí tu revista** (`#consegui-tu-revista`)
   - Grid de revistas
   - Hover effect (escala 1.1x)
   - Preparado para carrito de compras

8. **Quiénes Somos** (`#quienes-somos`)
   - Cards de integrantes
   - Imagen circular
   - Gradiente de fondo
   - Hover effect (traslación)

9. **Footer** (`<footer>`)
   - Copyright
   - Información general

---

## 🚀 Preparación para React

### Pasos para migración:

#### 1. **Crear estructura de componentes**
```
src/
├── components/
│   ├── Header.jsx
│   ├── Navigation.jsx
│   ├── Hero.jsx
│   ├── Eventos.jsx
│   ├── VideosSection.jsx
│   ├── Revistas.jsx
│   ├── Team.jsx
│   └── Footer.jsx
├── pages/
│   └── Home.jsx
├── data/
│   └── data.js (ya existe)
├── styles/
│   └── variables.css (extraído de style.css)
└── App.jsx
```

#### 2. **Usar data.js en componentes**
Todos los componentes importarán datos de `data.js` en lugar de tener HTML hardcodeado.

#### 3. **Reutilizar variables CSS**
Las variables CSS se mantendrán para estilos consistentes.

#### 4. **Manejo de estado (si es necesario)**
- Filtrado de eventos (futuro/pasado)
- Carrito de revistas
- Modal de videos

---

## 📊 Estructura de Datos

### Eventos
```javascript
{
  id: number,
  nombre: string,
  fecha: string,
  image: string,
  estado: 'futuro' | 'pasado'
}
```

### Integrantes
```javascript
{
  id: number,
  nombre: string,
  image: string,
  descripcion: string,
  rol: string
}
```

### Videos
```javascript
{
  id: number,
  titulo: string,
  url: string,
  thumbnail: string,
  alt: string
}
```

### Revistas
```javascript
{
  id: number,
  numero: number,
  image: string,
  alt: string
}
```

---

## 🎨 Guía de Estilos

- **Color Primario:** #fe3031 (Rojo Picnic)
- **Hover effects:** Scale o TranslateY
- **Transiciones:** 0.2s para efectos rápidos, 0.3s para normales
- **Espaciado:** Múltiplos de 5px (5, 12, 20, 30, 40, 60)
- **Border Radius:** 4px (pequeño), 8px (medio), 50% (circular)

---

## ✅ Checklist antes de React

- [x] Centralizar datos en `data.js`
- [x] Variables CSS implementadas
- [x] HTML semántico y bien estructurado
- [x] IDs únicos en secciones
- [x] Clases CSS reutilizables
- [ ] (Próximo) Crear componentes React
- [ ] (Próximo) Integrar con Node.js/Express backend
- [ ] (Próximo) API para datos dinámicos

---

## 📝 Notas Importantes

1. **Videos de YouTube:** Se usan thumbnails directos con enlace a YouTube
2. **Video local:** `icon.mp4` se reproduce en loop en Hero
3. **Imágenes:** Se organizan en carpetas `Eventos/`, `Integrantes/`, `Revistas/`
4. **Responsive:** El CSS está preparado para mobile (flexbox, media queries si es necesario)

---

## 🔗 Referencias Rápidas

- **Data:** `import { eventos, integrantes, COLORS } from './data.js'`
- **Colores:** Usar variables CSS `var(--color-primary)`
- **Espaciado:** Usar variables CSS `var(--spacing-lg)`
- **Transiciones:** Usar variables CSS `var(--transition-fast)`

---

*Documento creado el 21/04/2026 - Picnic Zine Project*
