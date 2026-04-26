import { navLinks, secciones } from '../data/data';

/**
 * COMPONENTE HEADER
 * Contiene el título principal y la navegación sticky
 */
function Header() {
  return (
    <>
      <header className="cuerpo">
        <h2>{secciones.hero.titulo}</h2>
        <h1>{secciones.hero.subtitulo}</h1>
      </header>

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
