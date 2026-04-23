import React from 'react';
import { integrantes, secciones } from '../data/data';
import '../styles/integrantes.css';

/**
 * COMPONENTE INTEGRANTES
 * Muestra el equipo de Picnic con imágenes y descripciones
 *
 * Props: ninguna
 */
function Integrantes() {
  return (
    <section id={secciones.equipo.id} className="seccion-placeholder seccion-final">
      <div className="seccion-header">
        <h1>{secciones.equipo.titulo}</h1>
        <p className="seccion-descripcion">{secciones.equipo.descripcion}</p>
      </div>
      <div className="integrantes-container">
        {integrantes.map((integrante) => (
          <div key={integrante.id} className="integrante">
            <img
              src={integrante.image}
              alt={integrante.nombre}
              className="integrante-img"
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

export default Integrantes;
