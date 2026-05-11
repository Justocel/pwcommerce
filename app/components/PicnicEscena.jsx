import VideoItem from './VideoItem';
import { secciones, videosGracias, videosPicnic } from '../data/data';

/**
 * COMPONENTE PICNIC EN LA ESCENA
 * Sección principal que unifica "Gracias por la intercomunicación"
 * y "Picnic en la tierra" como subsecciones con subtítulos más pequeños.
 */
function PicnicEscena() {
  const subsecciones = [
    { ...secciones.gracias, videos: videosGracias },
    { ...secciones.picnic, videos: videosPicnic },
  ];

  return (
    <section id={secciones.picnicEscena.id} className="seccion-placeholder">
      <div className="seccion-header">
        <h1>{secciones.picnicEscena.titulo}</h1>
      </div>

      {subsecciones.map((sub) => (
        <div key={sub.id} id={sub.id} className="subseccion">
          <div className="subseccion-header">
            <h3>{sub.titulo}</h3>
          </div>
          <div className="videos-grid">
            {sub.videos.map((video) => (
              <VideoItem key={video.id} videoData={video} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default PicnicEscena;
