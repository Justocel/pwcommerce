import { secciones } from '../data/data';

/**
 * COMPONENTE HERO
 * Sección con video de fondo
 */
function Hero() {
  return (
    <section id={secciones.hero.id} className="seccion-hero">
      <video autoPlay muted loop playsInline className="hero-video">
        <source src={secciones.hero.videoSrc} type="video/mp4" />
      </video>
    </section>
  );
}

export default Hero;
