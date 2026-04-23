/**
 * EJEMPLO: Componente React para Eventos
 * Demuestra cómo usar data.js con React
 * 
 * Nota: Este es un ejemplo de referencia.
 * Copiar la estructura cuando se migre a React.
 */

import React from 'react';
import { eventos } from '../data';
import '../styles/eventos.css';

export default function EventosComponent() {
  // Separar eventos por estado
  const eventosFuturos = eventos.filter(e => e.estado === 'futuro');
  const eventosPasados = eventos.filter(e => e.estado === 'pasado');

  return (
    <section id="eventos" className="seccion-placeholder">
      <div className="seccion-header">
        <h1>Eventos</h1>
        <p className="seccion-descripcion">No te los pierdas</p>
      </div>
      
      <div className="eventos-container">
        {/* Renderizar todos los eventos */}
        {eventos.map(evento => (
          <div 
            key={evento.id} 
            className={`evento ${evento.estado}`}
          >
            <img 
              src={evento.image} 
              alt={evento.nombre} 
              className="flyer"
            />
            <p className="evento-nombre">{evento.nombre}</p>
            <p className="evento-fecha">{evento.fecha}</p>
            
            {evento.estado === 'pasado' && (
              <span className="etiqueta-pasado">Pasado</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * EJEMPLO: Componente de Integrantes
 */

export function TeamComponent() {
  const { integrantes } = require('../data');

  return (
    <section id="quienes-somos" className="seccion-placeholder seccion-final">
      <div className="seccion-header">
        <h1>Quiénes Somos</h1>
        <p className="seccion-descripcion">Conoce al equipo Picnic</p>
      </div>
      
      <div className="integrantes-container">
        {integrantes.map(integrante => (
          <div key={integrante.id} className="integrante">
            <img 
              src={integrante.image} 
              alt={integrante.nombre}
            />
            <div className="info">
              <h3>{integrante.nombre}</h3>
              <p>{integrante.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * EJEMPLO: Componente de Videos
 */

export function VideosComponent({ videoList, sectionId, title, description }) {
  return (
    <section id={sectionId} className="seccion-placeholder">
      <div className="seccion-header">
        <h1>{title}</h1>
        <p className="seccion-descripcion">{description}</p>
      </div>
      
      <div className="videos-grid">
        {videoList.map(video => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener"
            className="video-item"
          >
            <img
              src={video.thumbnail}
              alt={video.alt}
              className="video-thumbnail"
            />
            <p>{video.titulo}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

/**
 * BENEFICIOS DE ESTA ESTRUCTURA:
 * 
 * 1. REUTILIZACIÓN - Los mismos datos se usan en múltiples componentes
 * 2. MANTENIBILIDAD - Cambios en data.js afectan todo automáticamente
 * 3. ESCALABILIDAD - Fácil agregar filtros, búsqueda, paginación
 * 4. TIPADO - Podemos usar TypeScript para type safety
 * 5. TESTING - Los componentes son puros y fáciles de testear
 * 
 * PRÓXIMOS PASOS:
 * - Crear los componentes reales en React
 * - Implementar manejo de estado global (Context, Redux)
 * - Agregar rutas con React Router
 * - Conectar con backend API
 */
