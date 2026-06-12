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

  // Scene-layer opacity choreographed in CSS so text stays legible mid-page.
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.24, 0.78, 0.95, 1],
    [1, 0.95, 0.42, 0.42, 0.75, 0.75],
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
        shadows={false}
        camera={{ position: [-48, 4, 18], fov: 48 }}
        dpr={[1, 1.75]}
        frameloop={tabOn ? 'always' : 'never'}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          scene.background = new THREE.Color('#e6eff5');
        }}
      >
        {/* Sun + sky ambient + bounce hemisphere */}
        <ambientLight intensity={0.42} />
        <hemisphereLight args={['#bfd6ee', '#c6b291', 0.55]} />
        <directionalLight
          position={[-30, 22, -12]}
          intensity={1.4}
          color="#fff2dc"
        />
        {/* Soft warm fill from the opposite side so the substation has shape */}
        <directionalLight
          position={[40, 12, 20]}
          intensity={0.35}
          color="#ffd0a0"
        />
        {/* Atmospheric depth */}
        <fog attach="fog" args={['#dee9f0', 55, 160]} />

        <EnergySite />
        <ScrollCamera progress={scrollYProgress} />
      </Canvas>
    </motion.div>
  );
}
