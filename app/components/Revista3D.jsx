'use client';

import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  TextureLoader,
  SRGBColorSpace,
  ClampToEdgeWrapping,
} from 'three';
import { Suspense, useEffect, useState } from 'react';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

const DEFAULT_PORTADA = '/Revistas/7.png';
const STATIC_TEXTURES = {
  contratapa: '/Revistas/contratapa.jpg',
  lomo: '/Revistas/lomo.jpg',
  paginasH: '/Revistas/paginas-h.jpg',
  paginasV: '/Revistas/paginas-v.jpg',
};

function MagazineMesh({ portadaPath }) {
  // useLoader cachea por URL. Si portadaPath cambia (editor sube nueva portada),
  // se trae la textura nueva y re-renderiza. Las texturas estáticas (lomo,
  // contratapa, páginas) son placeholders compartidos entre todas las ediciones.
  const [portada, contraTex, lomoTex, pagH, pagV] = useLoader(
    TextureLoader,
    [
      portadaPath || DEFAULT_PORTADA,
      STATIC_TEXTURES.contratapa,
      STATIC_TEXTURES.lomo,
      STATIC_TEXTURES.paginasH,
      STATIC_TEXTURES.paginasV,
    ]
  );

  [portada, contraTex, lomoTex, pagH, pagV].forEach((t) => {
    t.colorSpace = SRGBColorSpace;
    t.wrapS = ClampToEdgeWrapping;
    t.wrapT = ClampToEdgeWrapping;
    t.anisotropy = 8;
  });

  // Dimensiones tipo A4 escaladas (en metros)
  const W = 0.21;
  const H = 0.297;
  const D = 0.012;

  // Orden de caras de BoxGeometry:
  // 0:+X derecho  1:-X lomo  2:+Y arriba  3:-Y abajo  4:+Z portada  5:-Z contratapa
  const maps = [pagH, lomoTex, pagV, pagV, portada, contraTex];

  return (
    <mesh>
      <boxGeometry args={[W, H, D]} />
      {maps.map((m, i) => (
        <meshBasicMaterial
          key={i}
          attach={`material-${i}`}
          map={m}
          toneMapped={false}
        />
      ))}
    </mesh>
  );
}

export default function Revista3D({ portadaPath }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="revista-3d-canvas">
      <Canvas camera={{ position: [0, 0, 0.75], fov: 35 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          {/* key fuerza re-mount cuando cambia la portada — evita problemas de
              cache de Suspense entre re-renders con distintos arrays de URLs */}
          <MagazineMesh
            key={portadaPath || 'default'}
            portadaPath={portadaPath}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minDistance={0.3}
          maxDistance={1.0}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
