import Link from 'next/link';
import { articulos } from '../../data/data';

export const metadata = {
  title: 'Clara Osimani — Picnic',
  description:
    'Entrevista a Clara Osimani: "Yo escribo de alguna forma para eternizar".',
};

export default function ArticuloClaraOsimaniPage() {
  const articulo = articulos.find(
    (a) => a.slug === 'entrevista-clara-osimani'
  );

  return (
    <div className="App">
      <header className="cuerpo">
        <h2>Picnic</h2>
        <h1>{articulo.categoria}</h1>
      </header>

      <nav className="subheader" aria-label="Navegación interna">
        <Link href="/">← Volver</Link>
      </nav>

      <article className="articulo-detalle">
        <img
          src={articulo.image}
          alt={articulo.titulo}
          className="articulo-detalle-image"
        />
        <div className="articulo-detalle-contenido">
          <h1 className="articulo-detalle-titulo">{articulo.titulo}</h1>
          <p className="articulo-detalle-subtitulo">
            &ldquo;{articulo.subtitulo}&rdquo;
          </p>
          <p className="articulo-detalle-cuerpo">{articulo.contenido}</p>
        </div>
      </article>
    </div>
  );
}
