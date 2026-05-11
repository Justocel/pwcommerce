'use client';

import Link from 'next/link';
import { navLinks, secciones } from '../data/data';
import { useAuth } from '../context/AuthProvider';

/**
 * COMPONENTE HEADER
 * Contiene el título principal, la navegación sticky y el área de usuario
 * (Iniciar sesión / Mis revistas / Salir).
 */
function Header() {
  const { user, hydrated, logout } = useAuth();

  return (
    <>
      <header className="cuerpo">
        <Link href="/" className="cuerpo-link" aria-label="Ir al inicio">
          <h2>{secciones.hero.titulo}</h2>
          <h1>{secciones.hero.subtitulo}</h1>
        </Link>
      </header>

      <nav className="subheader" aria-label="Navegación interna de secciones">
        <div className="subheader-links">
          {navLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="subheader-auth" aria-label="Cuenta de usuario">
          {hydrated && user ? (
            <>
              <Link
                href="/mis-revistas"
                className="subheader-user"
                title={user.email}
              >
                Mis revistas
              </Link>
              <button
                type="button"
                className="subheader-logout"
                onClick={logout}
              >
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="subheader-login">
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

export default Header;
