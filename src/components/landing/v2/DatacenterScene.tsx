import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DatacenterHall } from './DatacenterHall';

// Hero datacenter scene. Camera is locked to the iconic "down the cool aisle"
// shot — both rack rows recede to a vanishing point — with only a gentle
// forward dolly + slight sway so the image stays recognizable at every
// instant. (The previous full-orbit catch was showing racks edge-on, reading
// as black slabs.)

function AisleCamera({ active }: { active: boolean }) {
  useFrame(({ camera, clock }) => {
    if (!active) return;
    const t = clock.elapsedTime;
    // Camera sits just inside the cool aisle entrance, looking toward the
    // far end. Gentle inhale/exhale dolly + a few-degrees lateral sway.
    camera.position.x = -5.4 + Math.sin(t * 0.18) * 0.5;
    camera.position.y = 0.55 + Math.sin(t * 0.12) * 0.08;
    camera.position.z = Math.sin(t * 0.22) * 0.18;
    camera.lookAt(2.5, 0.35, 0);
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
        camera={{ position: [-5.4, 0.55, 0], fov: 52 }}
        dpr={[1, 1.75]}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Lighting tuned for the light-mode page: bright ambient with a soft
            sky-tone fog so the canvas blends into the white backdrop. */}
        <ambientLight intensity={0.95} />
        <directionalLight position={[6, 8, 4]} intensity={1.1} color="#ffffff" />
        <pointLight position={[0, 2.2, 0]} intensity={0.8} color="#22d3ee" distance={12} decay={1.5} />
        <pointLight position={[3, 1, 0]} intensity={0.55} color="#f7931a" distance={10} decay={1.5} />
        <fog attach="fog" args={['#f4f7fc', 6, 14]} />

        <DatacenterHall />
        <AisleCamera active={active} />
      </Canvas>
    </div>
  );
}
