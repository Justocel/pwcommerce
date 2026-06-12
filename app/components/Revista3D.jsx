'use client';

import { Canvas, useLoader } from '@react-three/fiber';
import {
  PresentationControls,
  ContactShadows,
  Float,
} from '@react-three/drei';
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
    <mesh castShadow>
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

/**
 * Revista3D — estilo Stripe Press.
 * PresentationControls: el user arrastra para "espiarla", al soltar vuelve sola
 * con un resorte. Float agrega un cabeceo idle muy leve. ContactShadows pone
 * la sombra de contacto debajo para que se sienta apoyada y no flotando.
 */
export default function Revista3D({ portadaPath }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="revista-3d-canvas">
      <Canvas camera={{ position: [0, 0, 0.75], fov: 35 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PresentationControls
            global
            cursor
            snap
            polar={[-Math.PI / 6, Math.PI / 6]}
            azimuth={[-Math.PI / 3, Math.PI / 3]}
            config={{ mass: 1, tension: 170, friction: 26 }}
          >
            <Float
              speed={reducedMotion ? 0 : 1.4}
              rotationIntensity={reducedMotion ? 0 : 0.25}
              floatIntensity={reducedMotion ? 0 : 0.35}
            >
              {/* key fuerza re-mount cuando cambia la portada — evita problemas
                  de cache de Suspense entre re-renders con distintos arrays. */}
              <MagazineMesh
                key={portadaPath || 'default'}
                portadaPath={portadaPath}
              />
            </Float>
          </PresentationControls>
          <ContactShadows
            position={[0, -0.17, 0]}
            opacity={0.45}
            scale={0.6}
            blur={2.4}
            far={0.4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
