import React from 'react';
import { secciones } from '../data/data';

/**
 * COMPONENTE HERO
 * Sección con video de fondo
 *
 * Props: ninguna
 */
function Hero() {
  return (
    <section id={secciones.hero.id} className="seccion-hero">
      <video autoPlay muted loop className="hero-video">
        <source src={secciones.hero.videoSrc} type="video/mp4" />
      </video>
    </section>
  );
}

export default Hero;
