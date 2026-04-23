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
 *
 * Props:
 * - videoData: { id, link, titulo, thumbnail, alt }
 * - thumbnailUrl: URL completa de thumbnail
 */
function VideoItem({ videoData, thumbnailUrl }) {
  const [isHovered, setIsHovered] = useState(false);
  const [scaleValue, setScaleValue] = useState(1);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  /**
   * Animación de escala suave
   * Usa easing personalizado: rápido al principio, lento al final
   * Interpolación: ease-out
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
    // Escala a 1.05 (5% más grande) - rápido primero, lento después
    animateScale(1.05, 300);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Vuelve a escala normal - rápido primero, lento después
    animateScale(1, 300);
  };

  return (
    <a
      href={`https://youtu.be/${videoData.link}`}
      target="_blank"
      rel="noopener noreferrer"
      className="video-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `scale(${scaleValue})`
      }}
    >
      <img
        src={thumbnailUrl}
        alt={videoData.titulo}
        className="video-thumbnail"
      />
      <p>{videoData.titulo}</p>
    </a>
  );
}

export default VideoItem;
