import { eventos, secciones } from '../data/data';
import { classifyEvents, formatDate } from '../utils/utils';

/**
 * COMPONENTE EVENTS
 * Renderiza eventos próximos y pasados como dos secciones separadas.
 * Cada sub-sección se oculta si no tiene eventos; si ambas están vacías,
 * el componente entero no renderiza nada (no hay edit mode para eventos).
 */
function Events() {
  const { futuro, pasado } = classifyEvents(eventos);

  if (futuro.length === 0 && pasado.length === 0) return null;

  const renderEvento = (evento) => (
    <div key={evento.id} className="evento">
      <img src={evento.image} alt={evento.nombre} className="flyer" />
      <p className="evento-nombre">{evento.nombre}</p>
      <p className="evento-fecha">{formatDate(evento.fecha)}</p>
    </div>
  );

  return (
    <>
      {futuro.length > 0 && (
        <section
          id={secciones.eventosProximos.id}
          className="seccion-placeholder seccion-placeholder--alt seccion-eventos"
        >
          <div className="seccion-header">
            <h1>{secciones.eventosProximos.titulo}</h1>
            <p className="seccion-descripcion">
              {secciones.eventosProximos.descripcion}
            </p>
          </div>
          <div className="eventos-container eventos-container--grid">
            {futuro.map(renderEvento)}
          </div>
        </section>
      )}

      {pasado.length > 0 && (
        <section
          id={secciones.eventosPasados.id}
          className="seccion-placeholder seccion-placeholder--alt seccion-eventos"
        >
          <div className="seccion-header">
            <h1>{secciones.eventosPasados.titulo}</h1>
            <p className="seccion-descripcion">
              {secciones.eventosPasados.descripcion}
            </p>
          </div>
          <div className="eventos-container">{pasado.map(renderEvento)}</div>
        </section>
      )}
    </>
  );
}

export default Events;
