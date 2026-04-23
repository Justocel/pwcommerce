import React from 'react';
import { navLinks, secciones } from '../data/data';
import '../styles/header.css';

/**
 * COMPONENTE HEADER
 * Contiene el título principal y la navegación sticky
 *
 * Props: ninguna
 */
function Header() {
  return (
    <>
      {/* Sección principal con título */}
      <header className="cuerpo">
        <h2>{secciones.hero.titulo}</h2>
        <h1>{secciones.hero.subtitulo}</h1>
      </header>

      {/* Navegación sticky */}
      <nav className="subheader" aria-label="Navegación interna de secciones">
        {navLinks.map((link, index) => (
          <a key={index} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </>
  );
}

export default Header;
