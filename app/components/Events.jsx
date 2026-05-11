import { eventos, secciones } from '../data/data';
import { classifyEvents, formatDate } from '../utils/utils';

/**
 * COMPONENTE EVENTS
 * Renderiza dos secciones: eventos próximos (sin slider) y eventos pasados.
 * Usa classifyEvents/formatDate de utils para separar y formatear.
 */
function Events() {
  const { futuro, pasado } = classifyEvents(eventos);

  const renderEvento = (evento, isPast) => (
    <div key={evento.id} className="evento">
      <img src={evento.image} alt={evento.nombre} className="flyer" />
      <p className="evento-nombre">{evento.nombre}</p>
      {!isPast && (
        <p className="evento-fecha">{formatDate(evento.fecha)}</p>
      )}
    </div>
  );

  return (
    <>
      <section
        id={secciones.eventosProximos.id}
        className="seccion-placeholder seccion-eventos"
      >
        <div className="seccion-header">
          <h1>{secciones.eventosProximos.titulo}</h1>
          <p className="seccion-descripcion">
            {secciones.eventosProximos.descripcion}
          </p>
        </div>
        <div className="eventos-container eventos-container--grid">
          {futuro.map((evento) => renderEvento(evento, false))}
        </div>
      </section>

      <section
        id={secciones.eventosPasados.id}
        className="seccion-placeholder seccion-eventos"
      >
        <div className="seccion-header">
          <h1>{secciones.eventosPasados.titulo}</h1>
          <p className="seccion-descripcion">
            {secciones.eventosPasados.descripcion}
          </p>
        </div>
        <div className="eventos-container">
          {pasado.map((evento) => renderEvento(evento, true))}
        </div>
      </section>
    </>
  );
}

export default Events;
