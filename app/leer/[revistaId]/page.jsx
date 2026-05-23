'use client';

import dynamic from 'next/dynamic';

/**
 * Wrapper que importa el Reader dinámicamente con ssr:false.
 * react-pdf toca APIs del browser (DOMMatrix) al evaluarse, así que no puede
 * cargarse del lado del server. Mismo patrón que Revista3D.
 */
const Reader = dynamic(() => import('./Reader'), {
  ssr: false,
  loading: () => (
    <div className="lector">
      <div className="lector-msg">Cargando lector…</div>
    </div>
  ),
});

export default function LeerRevistaPage() {
  return <Reader />;
}
