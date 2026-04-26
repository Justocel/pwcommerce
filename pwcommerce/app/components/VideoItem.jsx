'use client';

import { useState, useRef } from 'react';

/**
 * COMPONENTE VIDEO ITEM
 * Componente reutilizable para cada video con animación suave de scale
 *
 * Estado:
 * - scaleValue: valor actual de escala (animado)
 * - thumbnailError: si el thumbnail falló al cargar
 */
function VideoItem({ videoData }) {
  const [scaleValue, setScaleValue] = useState(1);
  const [thumbnailError, setThumbnailError] = useState(false);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  const getThumbnailUrl = () => {
    return `https://img.youtube.com/vi/${videoData.link}/hqdefault.jpg`;
  };

  const getYoutubeUrl = () => {
    return `https://youtu.be/${videoData.link}`;
  };

  // Ease-out cubic: rápido al principio, lento al final
  const animateScale = (targetScale, duration = 300) => {
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const newScale = 1 + (targetScale - 1) * easeProgress;

      setScaleValue(newScale);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseEnter = () => animateScale(1.05, 300);
  const handleMouseLeave = () => animateScale(1, 300);
  const handleThumbnailError = () => setThumbnailError(true);

  return (
    <a
      href={getYoutubeUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="video-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `scale(${scaleValue})` }}
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
