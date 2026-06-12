import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { DatacenterHall } from './DatacenterHall';
import { cameraPose } from '@/lib/scroll-scene-path';

// Persistent landing backdrop: one fixed WebGL canvas behind the whole page,
// camera driven by scroll progress so the visitor travels through the
// datacenter as they read — entrance shot at the hero, down the cool aisle
// through the story chapters, up to a top-down overview at the pipeline,
// pulled back wide for the close. The wrapper's opacity is choreographed in
// CSS (framer-motion) so the scene dims under the reading sections.
//
// Performance: scroll progress is read inside useFrame from a MotionValue
// (zero React re-renders); the camera is damped toward the path target each
// frame; frameloop halts on tab hide. dpr clamped, no postprocessing.

function ScrollCamera({ progress }: { progress: MotionValue<number> }) {
  const lookTarget = useRef(new THREE.Vector3(2.5, 0.35, 0));

  useFrame(({ camera }) => {
    const { pos, look } = cameraPose(progress.get());
    camera.position.lerp(new THREE.Vector3(pos[0], pos[1], pos[2]), 0.07);
    lookTarget.current.lerp(new THREE.Vector3(look[0], look[1], look[2]), 0.07);
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
    } catch { /* static page without the scene */ }
  }, []);
  return ok;
}

export default function ScrollScene() {
  const canRender = useCanRender3D();
  const [tabOn, setTabOn] = useState(true);
  const { scrollYProgress } = useScroll();

  // CSS-side opacity choreography (mirrors sceneOpacity() in the path lib —
  // expressed as a useTransform so framer-motion drives it off-main-thread).
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.24, 0.8, 0.95, 1],
    [1, 0.95, 0.3, 0.3, 0.65, 0.65],
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
        camera={{ position: [-5.6, 0.55, 0], fov: 52 }}
        dpr={[1, 1.75]}
        frameloop={tabOn ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[6, 8, 4]} intensity={1.1} color="#ffffff" />
        <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#22d3ee" distance={12} decay={1.5} />
        <pointLight position={[3, 1, 0]} intensity={0.55} color="#f7931a" distance={10} decay={1.5} />
        <fog attach="fog" args={['#f4f7fc', 7, 17]} />

        <DatacenterHall />
        <ScrollCamera progress={scrollYProgress} />
      </Canvas>
    </motion.div>
  );
}
