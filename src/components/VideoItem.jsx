import React, { useState, useRef } from 'react';
import '../styles/video-item.css';

/**
 * COMPONENTE VIDEO ITEM
 * Componente reutilizable para cada video
 * Implementa animación suave de scale (rápido al principio, lento al final)
 *
 * Estado:
 * - isHovered: controla si el mouse está sobre el video
 * - scaleValue: valor actual de escala (animado)
 * - thumbnailError: si el thumbnail falló al cargar
 *
 * Props:
 * - videoData: { id, link (YouTubeId), titulo, seccion }
 */
function VideoItem({ videoData }) {
  const [isHovered, setIsHovered] = useState(false);
  const [scaleValue, setScaleValue] = useState(1);
  const [thumbnailError, setThumbnailError] = useState(false);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  /**
   * Genera URL de thumbnail de YouTube
   * Usa hqdefault que es más confiable que maxresdefault
   */
  const getThumbnailUrl = () => {
    return `https://img.youtube.com/vi/${videoData.link}/hqdefault.jpg`;
  };

  /**
   * Genera URL de YouTube para abrir en nueva ventana
   */
  const getYoutubeUrl = () => {
    return `https://youtu.be/${videoData.link}`;
  };

  /**
   * Animación de escala suave
   * Usa easing personalizado: rápido al principio, lento al final
   * Interpolación: ease-out cubic
   */
  const animateScale = (targetScale, duration = 300) => {
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: 1 - (1-t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const newScale = 1 + (targetScale - 1) * easeProgress;

      setScaleValue(newScale);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    animateScale(1.05, 300);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    animateScale(1, 300);
  };

  const handleThumbnailError = () => {
    setThumbnailError(true);
  };

  return (
    <a
      href={getYoutubeUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="video-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `scale(${scaleValue})`
      }}
    >
      {!thumbnailError ? (
        <img
          src={getThumbnailUrl()}
          alt={videoData.titulo}
          className="video-thumbnail"
          onError={handleThumbnailError}
        />
      ) : (
        <div className="video-thumbnail video-thumbnail-error">
          <span>Thumbnail no disponible</span>
        </div>
      )}
      <p>{videoData.titulo}</p>
    </a>
  );
}

export default VideoItem;
