import Link from 'next/link';
import { footer, navLinks } from '../data/data';

/**
 * COMPONENTE FOOTER
 * Cuatro bloques: marca, navegación rápida, redes, contacto.
 * El año se calcula en cada render (server component) para no quedar viejo.
 */
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <p className="footer-brand-name">{footer.brand}</p>
          <p className="footer-brand-tagline">{footer.tagline}</p>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Navegación</h3>
          <ul className="footer-list">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Seguinos</h3>
          <ul className="footer-list">
            {footer.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Contacto</h3>
          <ul className="footer-list">
            <li>
              <a href={`mailto:${footer.contacto.email}`}>
                {footer.contacto.email}
              </a>
            </li>
            <li className="footer-list-note">
              {footer.contacto.colaboraciones}
            </li>
          </ul>
        </div>
      </div>

      <p className="footer-copyright">
        © {year} {footer.copyright}
      </p>
    </footer>
  );
}

export default Footer;
