'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { navLinks, secciones } from '../data/data';
import { useAuth } from '../context/AuthProvider';
import { useCart } from '../context/CartProvider';
import { useEditMode } from '../context/EditModeProvider';
import CartPanel from './CartPanel';

/**
 * COMPONENTE HEADER
 * Contiene el título principal, la navegación sticky y el área de usuario
 * (Iniciar sesión / Mis revistas / Salir).
 */
function Header() {
  const { user, hydrated, isEditor, logout } = useAuth();
  const { totalItems, showCart, setShowCart } = useCart();
  const { editMode, toggleEditMode } = useEditMode();
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const ids = navLinks
      .map((l) => l.href.split('#')[1])
      .filter(Boolean);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
      const triggerY = window.innerHeight * 0.3;
      let current = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= triggerY) current = id;
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className="cuerpo">
        <Link href="/" className="cuerpo-link" aria-label="Ir al inicio">
          <h2>{secciones.hero.titulo}</h2>
          <h1>{secciones.hero.subtitulo}</h1>
        </Link>
      </header>

      <nav
        className={`subheader${isScrolled ? ' subheader--scrolled' : ''}`}
        aria-label="Navegación interna de secciones"
      >
        <div className="subheader-links">
          {navLinks.map((link, index) => {
            const id = link.href.split('#')[1];
            const isActive = id === activeSection;
            return (
              <Link
                key={index}
                href={link.href}
                className={isActive ? 'subheader-link--active' : ''}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="subheader-auth" aria-label="Cuenta de usuario">
          <button
            type="button"
            className="subheader-cart"
            onClick={() => setShowCart((prev) => !prev)}
            aria-label={`Carrito (${totalItems} ${
              totalItems === 1 ? 'item' : 'items'
            })`}
            aria-expanded={showCart}
          >
            Carrito
            {totalItems > 0 && (
              <span className="subheader-cart-badge">{totalItems}</span>
            )}
          </button>
          {hydrated && user ? (
            <>
              {isEditor && (
                <>
                  <button
                    type="button"
                    className={`subheader-edit${editMode ? ' subheader-edit--active' : ''}`}
                    onClick={toggleEditMode}
                    aria-pressed={editMode}
                    title={editMode ? 'Salir del modo edición' : 'Activar modo edición'}
                  >
                    {editMode ? 'Salir de edición' : 'Editar'}
                  </button>
                  <Link
                    href="/admin/analytics"
                    className="subheader-edit"
                    title="Analytics"
                  >
                    Analytics
                  </Link>
                </>
              )}
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
      <CartPanel />
    </>
  );
}

export default Header;
