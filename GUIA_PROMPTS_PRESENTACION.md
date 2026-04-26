# Guía de Prompts — Picnic Magazine (PWCommerce)

> Documento de presentación. Cubre objetivo del producto, decisiones técnicas, prompts usados con IA, validación y aprendizajes.

---

## 1. Resumen del trabajo

**Picnic Magazine** es un sitio web one-page para una revista de arte fino. El producto muestra:

- Una portada con video de fondo (`Hero`).
- Un texto de bienvenida editorial (`Welcome`).
- Una agenda de **eventos pasados y futuros** que se calcula dinámicamente comparando fechas (`Events`).
- Dos secciones de **videos de YouTube** con thumbnails (`VideoSection` + `VideoItem`).
- Un **carrito de compras** funcional para las revistas, con sumas, cantidades y eliminación de items (`Revistas`).
- Un equipo (`Integrantes`) y un footer.

El proyecto pasó por **tres etapas** documentadas en el repo:

1. **HTML + CSS + JS plano** — versión inicial en [index.html](index.html), [style.css](style.css), [data.js](data.js). Aquí se separó la estructura (HTML), el estilo (CSS) y los datos (JS).
2. **Migración a React (Create React App)** — se rompió el HTML monolítico en componentes en [src/components/](src/components/) y se introdujo `useState`. Documentado en [MIGRACION_REACT_RESUMEN.md](MIGRACION_REACT_RESUMEN.md) y [DOCUMENTACION_USESTATE.md](DOCUMENTACION_USESTATE.md).
3. **Migración a Next.js (App Router)** — versión final en [pwcommerce/app/](pwcommerce/app/), con `layout.js`, `page.js`, ruteo basado en archivos y la directiva `'use client'` solo donde hay estado/eventos.

### Diferencia entre estructura, estilo y lógica

| Capa | Tecnología | Archivos representativos |
|---|---|---|
| **Estructura** | HTML / JSX semántico | [pwcommerce/app/page.js](pwcommerce/app/page.js), [pwcommerce/app/components/](pwcommerce/app/components/) |
| **Estilo** | CSS (variables, flex, grid) + Tailwind v4 | [pwcommerce/app/globals.css](pwcommerce/app/globals.css), [src/styles/](src/styles/) |
| **Lógica** | JS / React (useState, useRef, handlers) | [pwcommerce/app/components/Revistas.jsx](pwcommerce/app/components/Revistas.jsx), [pwcommerce/app/components/VideoItem.jsx](pwcommerce/app/components/VideoItem.jsx) |
| **Datos** | Módulo JS exportado | [pwcommerce/app/data/data.js](pwcommerce/app/data/data.js) |

### Organización en componentes y rutas

- **Una sola ruta `/`** servida por [pwcommerce/app/page.js](pwcommerce/app/page.js). Next.js usa el App Router: cada carpeta dentro de `app/` puede ser una ruta; `layout.js` envuelve a todas las páginas hijas.
- **Componentes separados por responsabilidad** en [pwcommerce/app/components/](pwcommerce/app/components/): `Header`, `Hero`, `Welcome`, `Events`, `VideoSection`, `VideoItem`, `Revistas`, `Integrantes`, `Footer`.
- **`VideoSection`** es reutilizable: recibe `sectionData` y `videos` por **props** y se monta dos veces en la home (una para "Gracias por la intercomunicación", otra para "Picnic en la tierra"). Ver [pwcommerce/app/page.js:32-33](pwcommerce/app/page.js#L32-L33).

### Cómo se actualiza la interfaz

React mantiene un **árbol virtual del DOM**. Cuando se llama a un setter de `useState` (por ejemplo `setCart` en [pwcommerce/app/components/Revistas.jsx:19](pwcommerce/app/components/Revistas.jsx#L19)), React marca el componente como "sucio", vuelve a ejecutar la función del componente, compara el árbol nuevo con el anterior y aplica solo las diferencias al DOM real. Por eso al hacer click en "Agregar al carrito" se actualiza el contador del botón y el panel del carrito, pero el resto de la página no se vuelve a renderizar.

### Flujo de deploy (conceptual)

```
[código local]
   │  git push (rama react → main)
   ▼
[GitHub repo]
   │  webhook
   ▼
[Vercel / Next.js build]
   │  next build → genera HTML estático + bundles JS + assets
   ▼
[CDN edge]
   │  el navegador del usuario pide la URL
   ▼
[Usuario]
```

`next build` produce salida híbrida: páginas server-rendered + componentes cliente hidratados en el navegador. Solo los componentes con `'use client'` se ejecutan en el browser; el resto se renderiza en el server.

---

## 2. Diagrama de flujo lógico

```
                 ┌──────────────────────────────────┐
                 │        Usuario (navegador)       │
                 └───────────────┬──────────────────┘
                                 │ pide /
                                 ▼
   ┌────────────────────────────────────────────────────────┐
   │  Next.js App Router                                    │
   │  app/layout.js  →  app/page.js                         │
   │      │                  │                              │
   │      │                  ├── <Header/>  (server)        │
   │      │                  ├── <Hero/>    (server)        │
   │      │                  ├── <Welcome/> (server)        │
   │      │                  ├── <Events/>  ('use client')──┼─► useState(todayDate)
   │      │                  ├── <VideoSection/> ×2         │       │
   │      │                  │     └── <VideoItem/> ('use client')──┼─► useState(scaleValue)
   │      │                  ├── <Revistas/> ('use client')─┼─► useState(cart, showCart)
   │      │                  ├── <Integrantes/> (server)    │
   │      │                  └── <Footer/>     (server)     │
   └─────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                         data/data.js (módulo JS)
                                 │
                                 ▼
                         public/ (imágenes, video)

                                 │
                                 │  git push
                                 ▼
                         GitHub  ──► Vercel build ──► CDN ──► Usuario
                                       (next build)
```

Flechas: pedido HTTP, render server-side, hidratación cliente, cambios de estado que disparan re-render.

---

## 3. Justificación técnica

### ¿Por qué Next.js sobre CRA?

- **Ruteo por archivos**: agregar `app/checkout/page.js` ya genera `/checkout` sin configurar un router.
- **Server Components por default**: `Header`, `Hero`, `Welcome`, `Footer` no necesitan estado → se renderizan en el server, llegan como HTML, no consumen JS en el cliente.
- **Optimización automática**: `next/image`, code-splitting por ruta, prefetch de links.
- **Migración natural a backend**: las API routes (`app/api/...`) viven al lado del frontend.

### ¿Por qué HTML semántico?

En [pwcommerce/app/components/Header.jsx](pwcommerce/app/components/Header.jsx) se usan `<header>`, `<nav>`, `<h1>`, `<h2>`. En el resto, `<section>`, `<footer>`, `<main>`. Razones:

- **SEO**: Google interpreta jerarquías y secciones.
- **Accesibilidad**: lectores de pantalla navegan por landmarks (`nav`, `main`, `footer`).
- **Mantenibilidad**: el HTML cuenta lo que cada bloque significa, no solo cómo se ve.

### Responsive con flex y grid

- **Flex** en `subheader` (nav horizontal), en `evento` (columna vertical apilando imagen + texto).
- **Grid** en `videos-grid` y `revistas-container` (filas/columnas con `auto-fit` o `repeat`).
- Regla mental: **flex para una dirección, grid para dos**.

### Eventos del DOM

Todo el listener registration se hace declarativamente con props `onClick`, `onMouseEnter`, `onMouseLeave`, `onError`. React unifica el sistema de eventos y los limpia cuando el componente se desmonta. Ejemplo: [pwcommerce/app/components/VideoItem.jsx:57-58](pwcommerce/app/components/VideoItem.jsx#L57-L58).

### Asincronía y `await`

Aunque este proyecto no consume APIs externas todavía, el concepto se aplica al fetch futuro de datos:

```js
// con await: el código espera la respuesta antes de seguir
const res = await fetch('/api/revistas');
const data = await res.json();

// sin await: data sería una Promise pendiente, no el JSON
const data = fetch('/api/revistas');  // ❌ data === Promise<Response>
```

Sin `await`, la siguiente línea se ejecuta antes de que la promesa resuelva, y se intentaría usar un objeto `Promise` como si fuera el resultado.

### Validación de formularios

El carrito de [Revistas.jsx](pwcommerce/app/components/Revistas.jsx) hoy no tiene checkout real, pero la validación de formularios se haría con:

- **HTML nativo**: `required`, `type="email"`, `pattern`, `min`/`max`.
- **Estado controlado en React**: cada `<input>` lee de `useState` y dispara `onChange`, validando antes de habilitar el submit.
- **Mensajes accesibles**: `aria-invalid`, `aria-describedby` para que el lector de pantalla anuncie el error.

### Accesibilidad (ARIA)

- `aria-label` en botones sin texto visible: ver `cart-toggle`, `cart-remove-btn`, `revista-add-btn` en [Revistas.jsx](pwcommerce/app/components/Revistas.jsx).
- `aria-label="Navegación interna de secciones"` en el `<nav>` del [Header.jsx:15](pwcommerce/app/components/Header.jsx#L15).
- `alt` descriptivo en todas las `<img>`.
- Estructura por landmarks (`<header>`, `<nav>`, `<section>`, `<footer>`).

### Módulos

Cada componente es un **módulo ES**: tiene `import` arriba y `export default` abajo. Permite tree-shaking y orden mental: cada archivo expone una sola cosa.

---

## 4. React: conceptos clave aplicados al proyecto

### ¿Qué es un componente?

Una **función JavaScript que retorna JSX**. JSX se compila a llamadas a `React.createElement`. El componente es la unidad mínima de UI con su propio ciclo de vida y estado.

### Props vs State

- **Props** = entrada inmutable que un padre pasa al hijo. Ejemplo: `VideoSection` recibe `sectionData` y `videos` desde [page.js:32](pwcommerce/app/page.js#L32). El hijo no las puede mutar.
- **State** = memoria interna del componente que cambia con el tiempo. Ejemplo: `cart` en [Revistas.jsx:15](pwcommerce/app/components/Revistas.jsx#L15). Cuando muta, el componente se re-renderiza.

Regla: si un dato lo controla el padre, es prop; si lo controla el componente mismo, es state.

### ¿Cuándo y por qué se re-renderiza?

Un componente se re-renderiza cuando:

1. Su `useState` cambia (vía setter).
2. Sus props cambian.
3. Su componente padre se re-renderiza.

Ejemplo en [VideoItem.jsx](pwcommerce/app/components/VideoItem.jsx): cada llamada a `setScaleValue` durante la animación dispara un re-render → React recalcula el `style={{ transform: scale(...) }}` → el DOM se actualiza con el nuevo zoom.

### `useEffect` (concepto)

`useEffect` ejecuta código **después** del render, para sincronizar el componente con sistemas externos (APIs, timers, suscripciones). Forma:

```js
useEffect(() => {
  // efecto: fetch, listener, timer
  return () => { /* cleanup al desmontar */ };
}, [dependencias]);
```

En este proyecto no se usó porque los datos son estáticos en `data.js`. Se usaría si en el futuro se hace `fetch('/api/eventos')` para traerlos del backend.

### Rutas en Next.js

El **App Router** mapea carpetas a rutas:

```
app/
├── layout.js   → wrapper de toda la app
├── page.js     → ruta /
├── eventos/
│   └── page.js → ruta /eventos
└── api/
    └── revistas/
        └── route.js → endpoint /api/revistas
```

El proyecto hoy tiene una sola ruta (`/`), pero la estructura ya soporta crecer.

### Cliente vs servidor

- **Server Components** (por default en Next.js App Router): se ejecutan en el servidor, devuelven HTML. No tienen acceso a `window`, `useState` ni `useEffect`.
- **Client Components** (con `'use client'` en la primera línea): se ejecutan también en el navegador, pueden usar hooks y eventos.

En el proyecto, son client: [Events.jsx](pwcommerce/app/components/Events.jsx), [VideoItem.jsx](pwcommerce/app/components/VideoItem.jsx), [Revistas.jsx](pwcommerce/app/components/Revistas.jsx). El resto se renderiza en el server, lo que reduce el JS enviado al usuario.

---

## 5. Documentación de prompts utilizados

A continuación, los prompts más relevantes que le pasé a la IA durante el desarrollo, agrupados por etapa. Cada uno con **objetivo**, **prompt**, **resultado** y **validación**.

### Etapa 1 — Estructura inicial (HTML + CSS plano)

#### Prompt 1.1 — Esqueleto HTML semántico

> "Necesito armar el HTML de una revista digital llamada Picnic. Tiene que tener: header con título y subtítulo, nav sticky con anchors a 5 secciones (eventos, gracias por la intercomunicación, picnic en la tierra, conseguí tu revista, quiénes somos), hero con video de fondo, y secciones para cada uno. Usá HTML semántico (header, nav, main, section, footer) y agregá `aria-label` en el nav. El idioma es español."

- **Objetivo**: arrancar con estructura limpia y accesible.
- **Resultado**: [index.html](index.html). Anchors funcionan, landmarks correctos, video con `autoplay muted loop`.
- **Validación**: abrir en el navegador, comprobar que cada link del nav scrollea a su sección. Pasar Lighthouse → score de accesibilidad alto.

#### Prompt 1.2 — Variables CSS y paleta

> "Quiero centralizar la paleta y el espaciado de mi sitio en variables CSS dentro de `:root`. Colores: rojo principal #fe3031, rojo oscuro #cc2929, púrpura #98002b, claro #fafafa, oscuro #333. Necesito también escalas para tamaños de fuente (xs hasta 4xl), espaciado (xs hasta 3xl), border-radius (sm, md, full) y dos transiciones (fast 0.2s, normal 0.3s). Después usá esas variables en todo el `style.css` en vez de valores hardcodeados."

- **Objetivo**: tema consistente y fácil de migrar a React.
- **Resultado**: [style.css](style.css) con `:root` al principio.
- **Validación**: cambiar `--color-primary` y verificar que toda la UI cambia.

#### Prompt 1.3 — Datos centralizados

> "Antes de migrar a React, quiero sacar todo el contenido (eventos, videos, revistas, integrantes) del HTML y ponerlo en un archivo `data.js` exportando arrays de objetos con `id`, nombres descriptivos y rutas de imagen. Que cada array sea un `export const`."

- **Objetivo**: separar **datos** de **presentación**, requisito previo a React.
- **Resultado**: [data.js](data.js) raíz y luego [pwcommerce/app/data/data.js](pwcommerce/app/data/data.js).
- **Validación**: importar desde un componente y comprobar que la sección renderiza igual que con los datos hardcoded.

---

### Etapa 2 — Migración a React (CRA)

#### Prompt 2.1 — Romper el HTML en componentes

> "Tengo un `index.html` monolítico con 9 secciones. Necesito migrarlo a React con Create React App. Generá un componente por cada sección dentro de `src/components/` (Header, Hero, Welcome, Events, VideoSection, VideoItem, Revistas, Integrantes, Footer). Cada componente debe importar lo que necesite de `data/data.js`. Mantené las mismas clases CSS para no romper estilos. JSX, no TSX."

- **Objetivo**: reemplazar HTML estático por componentes reutilizables.
- **Resultado**: archivos en [src/components/](src/components/).
- **Validación**: levantar con `npm start`, comparar visualmente con `index.html`. No debe haber diferencias.

#### Prompt 2.2 — `useState` para eventos pasados/futuros

> "En el componente Events, necesito comparar la fecha de cada evento contra la fecha de hoy. Si la fecha del evento es anterior a hoy, mostrar un span con clase `etiqueta-pasado` que diga 'Pasado'. Si es futuro, mostrar la fecha formateada en español (DD/MM/YYYY). Usá useState con función inicializadora para guardar `today` una sola vez (no recalcular en cada render)."

- **Objetivo**: introducir estado y derivación.
- **Resultado**: [Events.jsx:14](pwcommerce/app/components/Events.jsx#L14) — `useState(() => getTodayDate())`.
- **Validación**: editar un evento en `data.js` con fecha pasada y verificar que aparece "Pasado".

#### Prompt 2.3 — Carrito con `useState`

> "En el componente Revistas necesito un carrito de compras. State: `cart` (array de `{id, cantidad}`) y `showCart` (booleano). Cada revista tiene un botón 'Agregar al carrito' que llama a `addToCart(id)`: si la revista ya está en el carrito, incrementa cantidad; si no, la agrega con cantidad 1. El botón flotante 'Carrito (n)' togglea `showCart`. El panel del carrito muestra cada item con imagen, número, precio × cantidad, subtotal, y un botón ✕ para eliminar. Al final, total general. Usá actualizaciones funcionales (`setCart(prev => ...)`) y nunca mutes el array directamente."

- **Objetivo**: practicar inmutabilidad y estado complejo.
- **Resultado**: [Revistas.jsx:18-43](pwcommerce/app/components/Revistas.jsx#L18-L43).
- **Validación**: agregar 3 veces la misma revista → cantidad pasa a 3, total se multiplica. Click en ✕ → la revista desaparece del carrito.

#### Prompt 2.4 — Animación con `useState` + `useRef` + `requestAnimationFrame`

> "En VideoItem quiero una animación suave de hover: la tarjeta crece de scale 1 a 1.05 en 300ms con curva ease-out cubic. No quiero usar CSS transitions, lo necesito manual con requestAnimationFrame para entender cómo funciona. Guardá el scaleValue en useState y los refs (animationRef, startTimeRef) en useRef. Aplicá el transform inline."

- **Objetivo**: ver la diferencia entre `useState` (re-render) y `useRef` (no re-render).
- **Resultado**: [VideoItem.jsx:14-49](pwcommerce/app/components/VideoItem.jsx#L14-L49).
- **Validación**: hover en una tarjeta → crece suavemente, no a saltos.

---

### Etapa 3 — Migración a Next.js

#### Prompt 3.1 — Pasar de CRA a Next.js App Router

> "Migrá los componentes de `src/components/` a Next.js App Router. Estructura: `pwcommerce/app/layout.js` (con `<html lang='es'>` y metadata title/description), `pwcommerce/app/page.js` que importa todos los componentes y los renderiza en orden, `pwcommerce/app/components/` con los .jsx, `pwcommerce/app/data/data.js` con los datos. Las imágenes van en `pwcommerce/public/` y se referencian con paths absolutos `/Eventos/1.png`. Marcá con `'use client'` SOLO los componentes que usan useState o eventos del DOM. Los demás dejalos como Server Components."

- **Objetivo**: separar correctamente cliente y servidor para reducir el JS bundle.
- **Resultado**: [pwcommerce/app/](pwcommerce/app/). Solo `Events`, `VideoItem` y `Revistas` tienen `'use client'`.
- **Validación**: `npm run build` → ver tamaño del bundle. `npm run dev` → verificar que la página renderiza igual.

#### Prompt 3.2 — Metadata y layout raíz

> "El `layout.js` debe exportar metadata con title 'Picnic — La revista del arte fino' y description en español. Importar `globals.css`. Lang='es'."

- **Objetivo**: SEO y carga global de estilos.
- **Resultado**: [pwcommerce/app/layout.js](pwcommerce/app/layout.js).
- **Validación**: ver el `<title>` en la pestaña del navegador.

---

### Etapa 4 — Refactor y limpieza

#### Prompt 4.1 — Extraer datos repetidos

> "En `Welcome.jsx` tengo 4 párrafos hardcodeados con un `<p>` cada uno. Refactorizá: poné los strings en un array `welcomeText` y mapealo con `.map((p, i) => <p key={i}>{p}</p>)`. Más DRY."

- **Resultado**: [Welcome.jsx:6-18](pwcommerce/app/components/Welcome.jsx#L6-L18).
- **Validación**: el render no cambia.

#### Prompt 4.2 — Manejo de error en thumbnails de YouTube

> "En VideoItem, si el thumbnail de YouTube falla al cargar, en vez de mostrar imagen rota mostrá un div con clase `video-thumbnail-error` y texto 'Thumbnail no disponible'. Usá un useState `thumbnailError` y el evento `onError` de la `<img>`."

- **Resultado**: [VideoItem.jsx:60-72](pwcommerce/app/components/VideoItem.jsx#L60-L72).
- **Validación**: pasar un ID de YouTube inválido en data.js → aparece el placeholder.

---

## 6. Cómo validé el código generado por la IA

| Validación | Cómo |
|---|---|
| Visual | Levantar `npm run dev` y comparar con `index.html` original lado a lado. |
| Estructura | Inspector del navegador → ver landmarks (`<header>`, `<nav>`, `<main>`). |
| Accesibilidad | Lighthouse audit → score ≥ 90 en a11y. |
| Estado | DevTools de React → ver el árbol de componentes y los hooks de cada uno. |
| Re-render | Marcar "Highlight updates" en React DevTools → comprobar que solo el componente que cambió parpadea. |
| Build | `npm run build` → 0 errores de compilación, advertencias de ESLint resueltas. |
| Responsive | Toggle device toolbar (Chrome) → probar 375px, 768px, 1280px. |

---

## 7. Errores de la IA y cómo los resolví

### Error 1 — Mutación del state del carrito

La IA generó al inicio:

```js
const addToCart = (id) => {
  cart.push({ id, cantidad: 1 });   // ❌ muta el array
  setCart(cart);
};
```

**Síntoma**: el componente no se re-renderizaba porque React compara por referencia y la referencia no cambió.

**Resolución**: pedí explícitamente "usá actualización funcional con `setCart(prev => [...prev, nuevo])` y nunca mutes el array". Quedó como en [Revistas.jsx:19-31](pwcommerce/app/components/Revistas.jsx#L19-L31).

### Error 2 — `useState` recalculando en cada render

```js
const [today] = useState(new Date());   // ❌ se ejecuta en cada render aunque solo se usa el primer valor
```

Aunque funcionalmente da igual, se crea un `Date` nuevo en cada render y se descarta. Lo corregí pasando una función inicializadora:

```js
const [todayDate] = useState(() => getTodayDate());  // ✅
```

Ver [Events.jsx:14](pwcommerce/app/components/Events.jsx#L14).

### Error 3 — Olvidó `'use client'` en componentes con estado

Al migrar a Next.js, la IA no agregó `'use client'` en `Revistas.jsx`. Next.js tiró:

```
Error: useState only works in Client Components.
```

**Resolución**: agregar `'use client';` como primera línea de cualquier archivo que use hooks o eventos del DOM. Ver [Revistas.jsx:1](pwcommerce/app/components/Revistas.jsx#L1), [VideoItem.jsx:1](pwcommerce/app/components/VideoItem.jsx#L1), [Events.jsx:1](pwcommerce/app/components/Events.jsx#L1).

### Error 4 — Rutas relativas a imágenes

En CRA usaba `import imagen from '../../assets/...'`. En Next.js las imágenes en `public/` se referencian con path absoluto `/Eventos/1.png`. La IA mezcló los dos estilos al migrar.

**Resolución**: mover todo a `pwcommerce/public/` y unificar los paths en [data.js](pwcommerce/app/data/data.js) con `/Eventos/...`, `/Integrantes/...`, `/Revistas/...`.

### Error 5 — `key` con `index` del map

En varios componentes la IA usaba `key={index}`. Para listas estables (como `revistas` o `eventos` que tienen `id`) la mejor práctica es `key={item.id}`. Lo corregí donde el array tenía IDs estables. En el `welcomeText` (array de strings sin id) sí queda `key={index}` porque la lista es fija y no se reordena.

---

## 8. Lo que comprendí (en mis palabras)

- **React no es magia**: cada `useState` es una variable que React asocia con el componente y vuelve a leer en cada render. Si la cambio, React vuelve a llamar a la función.
- **Server vs cliente** en Next.js no es una decisión de runtime, es una decisión de **archivo**: `'use client'` cambia dónde se ejecuta el componente.
- **Props = configuración del padre, state = vida interna**. Confundirlos lleva a duplicación o a estados inconsistentes.
- **HTML semántico no es estético, es funcional**: cambia cómo lee el contenido un screen reader y cómo lo indexa Google.
- **CSS Grid y Flex no compiten**: grid resuelve layout 2D, flex resuelve alineación 1D. Mezclarlos está bien.
- **La IA acelera, pero no entiende el contexto del proyecto**: yo soy responsable de revisar inmutabilidad, accesibilidad y de validar visualmente cada cambio. Los prompts más útiles son los que dan **restricciones** ("no uses CSS transitions", "marcá `'use client'` solo donde haga falta"), no los que piden "hacelo bonito".

---

## 9. Lo que todavía no terminé de cerrar

- **`useEffect`**: lo entiendo conceptualmente pero no lo usé en producción todavía. Aparece en cuanto haga `fetch` real.
- **API routes de Next.js** (`app/api/...`): el carrito hoy vive solo en memoria del cliente; con un backend persistiría.
- **Validación de formularios**: no hay form de checkout todavía, solo entiendo el patrón teórico.
- **Tests**: el proyecto no tiene tests automatizados; toda validación fue manual.
