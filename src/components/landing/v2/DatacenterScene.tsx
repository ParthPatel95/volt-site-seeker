import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DatacenterHall } from './DatacenterHall';

// Lazy scene wrapper for the hero. Camera drifts a slow orbit; frame loop
// halts when the canvas leaves the viewport or the tab hides so the rest of
// the page stays buttery.

function CameraRig({ active }: { active: boolean }) {
  const cam = useRef<THREE.PerspectiveCamera>();
  useFrame(({ camera, clock }) => {
    if (!active) return;
    const t = clock.elapsedTime * 0.08;
    camera.position.x = Math.sin(t) * 6.5;
    camera.position.z = Math.cos(t) * 6.5;
    camera.position.y = 2.2 + Math.sin(t * 0.7) * 0.4;
    camera.lookAt(0, 0.1, 0);
    cam.current = camera as THREE.PerspectiveCamera;
  });
  return null;
}

export default function DatacenterScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabOn, setTabOn] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    const onVis = () => setTabOn(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  const active = inView && tabOn;

  return (
    <div ref={wrap} className="w-full h-full" aria-hidden="true">
      <Canvas
        shadows={false}
        camera={{ position: [6.5, 2.3, 6.5], fov: 44 }}
        dpr={[1, 1.75]}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* lighting */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 8, 4]} intensity={0.9} color="#dbeafe" />
        <pointLight position={[0, 3, 0]} intensity={0.8} color="#22d3ee" distance={12} decay={1.5} />
        <pointLight position={[-5, 1, -2]} intensity={0.5} color="#f7931a" distance={10} decay={1.5} />
        <fog attach="fog" args={['#070c1a', 9, 18]} />

        <DatacenterHall />
        <CameraRig active={active} />
        {/* Disabled user controls — the page owns scroll/zoom — but kept for
            the gentle damping smoothing on the auto camera. */}
        <OrbitControls enabled={false} />
      </Canvas>
    </div>
  );
}
