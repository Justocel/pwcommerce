'use client';

import dynamic from 'next/dynamic';
import { revistas, secciones } from '../data/data';
import { useCart } from '../context/CartProvider';

const Revista3D = dynamic(() => import('./Revista3D'), {
  ssr: false,
  loading: () => <div className="revista-3d-canvas revista-3d-fallback" />,
});

/**
 * COMPONENTE REVISTAS
 * Sección de revistas. El estado del carrito vive en CartProvider y el
 * panel flotante se renderiza desde el Header.
 */
function Revistas() {
  const { addToCart, setShowCart } = useCart();

  const handleAdd = (revistaId) => {
    addToCart(revistaId);
    setShowCart(true);
  };

  const revistasDisponibles = revistas.slice(0, 1);

  return (
    <section
      id={secciones.revistas.id}
      className="seccion-placeholder seccion-placeholder--alt"
    >
      <div className="seccion-header">
        <h1>{secciones.revistas.titulo}</h1>
        <p className="seccion-descripcion">{secciones.revistas.descripcion}</p>
      </div>

      <div className="revistas-container revistas-container--3d">
        {revistasDisponibles.map((revista) => (
          <div key={revista.id} className="revista-item revista-item--3d">
            <Revista3D />
            <button
              className="revista-add-btn revista-add-btn--3d"
              onClick={() => handleAdd(revista.id)}
              aria-label={`Agregar Revista ${revista.numero} al carrito`}
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Revistas;
