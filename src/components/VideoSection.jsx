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
 * - videos: array de objetos video
 */
function VideoSection({ sectionData, videos }) {
  /**
   * Genera la URL del thumbnail de YouTube
   * YouTube proporciona thumbnails en: https://img.youtube.com/vi/{videoId}/maxresdefault.jpg
   */
  const getThumbnailUrl = (youtubeId) => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  };

  return (
    <section id={sectionData.id} className="seccion-placeholder">
      <div className="seccion-header">
        <h1>{sectionData.titulo}</h1>
        <p className="seccion-descripcion">{sectionData.descripcion}</p>
      </div>
      <div className="videos-grid">
        {videos.map((video) => (
          <VideoItem
            key={video.id}
            videoData={video}
            thumbnailUrl={getThumbnailUrl(video.link)}
          />
        ))}
      </div>
    </section>
  );
}

export default VideoSection;
