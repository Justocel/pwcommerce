'use client';

import { useState } from 'react';
import { eventos, secciones, getTodayDate } from '../data/data';

/**
 * COMPONENTE EVENTS
 * Muestra eventos pasados y futuros
 *
 * Estado:
 * - todayDate: fecha de hoy para determinar si un evento es pasado
 */
function Events() {
  const [todayDate] = useState(() => getTodayDate());

  const isPastEvent = (eventDate) => {
    const eventDateObj = new Date(eventDate);
    return eventDateObj < todayDate;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <section id={secciones.eventos.id} className="seccion-placeholder">
      <div className="seccion-header">
        <h1>{secciones.eventos.titulo}</h1>
        <p className="seccion-descripcion">{secciones.eventos.descripcion}</p>
      </div>
      <div className="eventos-container">
        {eventos.map((evento) => (
          <div key={evento.id} className="evento">
            <img src={evento.image} alt={evento.nombre} className="flyer" />
            <p className="evento-nombre">{evento.nombre}</p>
            {!isPastEvent(evento.fecha) && (
              <p className="evento-fecha">{formatDate(evento.fecha)}</p>
            )}
            {isPastEvent(evento.fecha) && (
              <span className="etiqueta-pasado">Pasado</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Events;
