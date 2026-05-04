import Link from 'next/link';
import { articulos, secciones } from '../data/data';

function Articulos() {
  return (
    <section id={secciones.articulos.id} className="seccion-placeholder">
      <div className="seccion-header">
        <h1>{secciones.articulos.titulo}</h1>
        <p className="seccion-descripcion">{secciones.articulos.descripcion}</p>
      </div>

      <div className="articulos-container">
        {articulos.map((articulo) => (
          <Link
            key={articulo.id}
            href={`/articulos/${articulo.slug}`}
            className="articulo-card"
          >
            <img
              src={articulo.image}
              alt={articulo.titulo}
              className="articulo-image"
            />
            <div className="articulo-overlay">
              <span className="articulo-categoria">{articulo.categoria}</span>
              <h2 className="articulo-titulo">{articulo.titulo}</h2>
              <p className="articulo-subtitulo">
                &ldquo;{articulo.subtitulo}&rdquo;
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Articulos;
