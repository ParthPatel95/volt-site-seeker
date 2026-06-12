import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { EnergySite } from './EnergySite';
import { cameraPose } from '@/lib/scroll-scene-path';

// Persistent landing backdrop: a real outdoor energy site (transmission line
// approaching a substation with three power transformers, datacenter beyond)
// behind the whole page. The camera flies through the site as the visitor
// scrolls, with story-tied keyframes defined in src/lib/scroll-scene-path.ts.

function ScrollCamera({ progress }: { progress: MotionValue<number> }) {
  const lookTarget = useRef(new THREE.Vector3(6, 4, 0));

  useFrame(({ camera }) => {
    const { pos, look } = cameraPose(progress.get());
    camera.position.lerp(new THREE.Vector3(pos[0], pos[1], pos[2]), 0.08);
    lookTarget.current.lerp(new THREE.Vector3(look[0], look[1], look[2]), 0.08);
    camera.lookAt(lookTarget.current);
  });
  return null;
}

function useCanRender3D(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      const canvas = document.createElement('canvas');
      if (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) setOk(true);
    } catch { /* static page */ }
  }, []);
  return ok;
}

export default function RealisticScene() {
  const canRender = useCanRender3D();
  const [tabOn, setTabOn] = useState(true);
  const { scrollYProgress } = useScroll();

  // Glass content panels now carry text legibility, so the scene stays
  // near-full strength the whole way — only a slight mid-page easing.
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.24, 0.78, 0.95, 1],
    [1, 1, 0.88, 0.88, 1, 1],
  );

  useEffect(() => {
    const onVis = () => setTabOn(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  if (!canRender) return null;

  return (
    <motion.div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity }}
      aria-hidden="true"
    >
      <Canvas
        shadows
        camera={{ position: [-48, 4, 18], fov: 48 }}
        dpr={[1, 1.75]}
        frameloop={tabOn ? 'always' : 'never'}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          // Matches the sky-dome horizon + fog tint so there is no band at
          // the far plane (the earlier white stripe at the horizon).
          scene.background = new THREE.Color('#e9ddc8');
        }}
      >
        {/* Sun + sky ambient + bounce hemisphere */}
        <ambientLight intensity={0.42} />
        <hemisphereLight args={['#bfd6ee', '#c6b291', 0.55]} />
        {/* Sun — single shadow-casting light; soft PCF shadows ground every
            structure and are the single biggest realism cue outdoors. */}
        <directionalLight
          position={[-30, 26, -14]}
          intensity={1.4}
          color="#fff2dc"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-65}
          shadow-camera-right={45}
          shadow-camera-top={45}
          shadow-camera-bottom={-30}
          shadow-camera-near={1}
          shadow-camera-far={120}
          shadow-bias={-0.0004}
        />
        {/* Soft warm fill from the opposite side so the substation has shape */}
        <directionalLight
          position={[40, 12, 20]}
          intensity={0.35}
          color="#ffd0a0"
        />
        {/* Atmospheric depth — same family as the sky horizon */}
        <fog attach="fog" args={['#e9ddc8', 60, 170]} />

        <EnergySite />
        <ScrollCamera progress={scrollYProgress} />
      </Canvas>
    </motion.div>
  );
}
