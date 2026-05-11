import { eventos, secciones } from '../data/data';
import { classifyEvents, formatDate } from '../utils/utils';

/**
 * COMPONENTE EVENTS
 * Renderiza dos secciones: eventos próximos y eventos pasados.
 * La fecha se muestra siempre (en pasados también, para que se sepa cuándo
 * ocurrió). Empty state cuando no hay eventos en alguna categoría.
 */
function Events() {
  const { futuro, pasado } = classifyEvents(eventos);

  const renderEvento = (evento) => (
    <div key={evento.id} className="evento">
      <img src={evento.image} alt={evento.nombre} className="flyer" />
      <p className="evento-nombre">{evento.nombre}</p>
      <p className="evento-fecha">{formatDate(evento.fecha)}</p>
    </div>
  );

  return (
    <>
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
        {futuro.length > 0 ? (
          <div className="eventos-container eventos-container--grid">
            {futuro.map(renderEvento)}
          </div>
        ) : (
          <p className="eventos-empty">
            Pronto anunciamos los próximos. Seguinos en Instagram para enterarte.
          </p>
        )}
      </section>

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
        {pasado.length > 0 ? (
          <div className="eventos-container">{pasado.map(renderEvento)}</div>
        ) : (
          <p className="eventos-empty">Todavía no cubrimos ningún evento.</p>
        )}
      </section>
    </>
  );
}

export default Events;
