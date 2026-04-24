import React from 'react';
import VideoItem from './VideoItem';
import '../styles/video-section.css';

/**
 * COMPONENTE VIDEO SECTION
 * Contenedor reutilizable para secciones de videos
 * Se usa tanto para "Gracias por la intercomunicación" como "Picnic en la tierra"
 *
 * Props:
 * - sectionData: { id, titulo, descripcion }
 * - videos: array de objetos video { id, link (YouTubeId), titulo, seccion }
 */
function VideoSection({ sectionData, videos }) {
  return (
    <section id={sectionData.id} className="seccion-placeholder">
      <div className="seccion-header">
        <h1>{sectionData.titulo}</h1>
        <p className="seccion-descripcion">{sectionData.descripcion}</p>
      </div>
      <div className="videos-grid">
        {videos.map((video) => (
          <VideoItem key={video.id} videoData={video} />
        ))}
      </div>
    </section>
  );
}

export default VideoSection;
