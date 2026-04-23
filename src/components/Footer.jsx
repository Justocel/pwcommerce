import React from 'react';
import { footer } from '../data/data';
import '../styles/footer.css';

/**
 * COMPONENTE FOOTER
 * Pie de página con información de derechos
 *
 * Props: ninguna
 */
function Footer() {
  return (
    <footer>
      <p>{footer.copyright}</p>
    </footer>
  );
}

export default Footer;
