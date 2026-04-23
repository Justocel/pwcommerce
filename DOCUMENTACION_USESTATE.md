# Documentación: Uso de useState en Picnic Magazine React

## Resumen de useState por Componente

### 1. **Events.jsx** 
**Ubicación:** `src/components/Events.jsx`

```javascript
const [todayDate] = useState(() => getTodayDate());
```

**¿Por qué se usa?**
- Almacena la fecha de hoy para comparar con las fechas de eventos
- Se inicializa una sola vez con una función para evitar recalcular en cada render

**¿Para qué sirve?**
- Determinar si un evento es "pasado" o "futuro"
- Condicionar la renderización: eventos futuros muestran fecha, eventos pasados muestran etiqueta "Pasado"

**Lógica:**
```
Si evento.fecha < hoy → mostrar "Pasado"
Si evento.fecha >= hoy → mostrar fecha
```

---

### 2. **VideoItem.jsx**
**Ubicación:** `src/components/VideoItem.jsx`

```javascript
const [isHovered, setIsHovered] = useState(false);
const [scaleValue, setScaleValue] = useState(1);
```

**¿Por qué se usa?**
- `isHovered`: detectar si el mouse está sobre el video
- `scaleValue`: almacenar el valor actual de escala para la animación suave

**¿Para qué sirve?**
- Animar el zoom suave (rápido al principio, lento al final - ease-out)
- Usar `requestAnimationFrame` para una animación fluida usando interpolación

**Animación:**
- **Hover:** video escala de 1 a 1.05 (5% más grande) en 300ms
- **Leave:** video vuelve a escala 1 en 300ms
- **Easing:** ease-out cubic para sensación de rebote

---

### 3. **Revistas.jsx**
**Ubicación:** `src/components/Revistas.jsx`

```javascript
const [cart, setCart] = useState([]);
const [showCart, setShowCart] = useState(false);
```

**¿Por qué se usa?**
- `cart`: arreglo con objetos `{ id, cantidad }` de revistas agregadas al carrito
- `showCart`: booleano para mostrar/ocultar el panel del carrito

**¿Para qué sirve?**
- **Carrito de compras:** agregar/eliminar revistas, calcular total
- **UI Dinámico:** mostrar/ocultar panel sin navegar a otra página

**Lógica del Carrito:**
```javascript
addToCart(id):
  - Si existe: incrementa cantidad
  - Si no existe: agrega con cantidad 1

removeFromCart(id):
  - Elimina revista del carrito

calculateTotal():
  - Suma: precio * cantidad para cada item
```

**Funcionalidades:**
- Agregar misma revista múltiples veces (incrementa cantidad)
- Botón "Carrito (n)" muestra cantidad de items
- Panel muestra desglose de precios
- Botón "Comprar" (placeholder para checkout)

---

## Patrones Usados en React

### Inicialización con Función
```javascript
// En Events.jsx
const [todayDate] = useState(() => getTodayDate());
// La función se ejecuta solo en el primer render
```

### Actualización con Función Anterior (Functional Update)
```javascript
// En Revistas.jsx
setCart((prevCart) => {
  // Acceder al estado anterior garantiza actualización correcta
  const existingItem = prevCart.find((item) => item.id === revistaId);
  // ...
});
```

### Animación con requestAnimationFrame
```javascript
// En VideoItem.jsx
const animate = () => {
  const progress = (Date.now() - startTimeRef.current) / duration;
  const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
  setScaleValue(1 + (targetScale - 1) * easeProgress);
  
  if (progress < 1) {
    animationRef.current = requestAnimationFrame(animate);
  }
};
```

---

## Color Especial para Contraste

**Color:** `#f9ff04` (amarillo neón)
**Variable CSS:** `--color-highlight`

**Dónde se utiliza:**
- ✅ Botones del carrito (agregar, comprar)
- ✅ Total del carrito (precio en amarillo)
- ✅ Botones de acción crítica

**Por qué solo en casos críticos:**
- Color muy llamativo para no saturar la UI
- Se reserva para acciones importantes
- Mantiene la coherencia visual con la paleta roja/secundaria

---

## Preparación para Next.js + Supabase

Los componentes están estructurados para facilitar migración:

1. **Datos en arrays:** Fácil reemplazar con fetch de Supabase
2. **useState bien delimitado:** Fácil migrar a Zustand/Redux si es necesario
3. **Componentes sin lógica acoplada:** Fácil hacer Server Components en Next.js
4. **IDs en datos:** Preparado para relaciones de BD

**Próximos pasos:**
- Reemplazar `data.js` con `useEffect` + fetch de Supabase
- Crear API routes en Next.js para operaciones CRUD
- Migrar estado global a Zustand si es necesario
- Usar Server Components para obtener datos iniciales

---

## Ejecución

```bash
npm start
```

La aplicación carga todos los datos desde arrays en `src/data/data.js`.
El estado React maneja interacción (carrito, animaciones, condicionales).

