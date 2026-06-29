import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ImmersionScene — immersion-cooled AI/HPC compute: a row of open-top tanks
 * filled with glowing teal dielectric coolant, submerged GPU boards breaking the
 * surface, and bubbles streaming up through the liquid. Built for the CryptoHpc
 * "AI & HPC" card. react-three-fiber v8 + three r160, no drei. Reduced-motion
 * safe, pauses off-screen, dpr-capped.
 */

const TEAL = '#10a5c7';
const TANKS = 3;
const TANK_W = 1.7;
const TANK_H = 0.95;
const TANK_D = 2.4;
const GAP = 0.35;
const BOARDS_PER = 6;
const BUBBLES_PER = 14;

export default function ImmersionScene({ className }: { className?: string }) {
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const runningRef = useRef(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { runningRef.current = e.isIntersecting; setVisible(e.isIntersecting); }, { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animate = !reduced && visible;
  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1.75, 3.5], fov: 52, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        frameloop={animate ? 'always' : 'demand'}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ camera }) => camera.lookAt(0, 0.05, -0.3)}
      >
        <Rig animate={animate} runningRef={runningRef} />
      </Canvas>
    </div>
  );
}

function Rig({ animate, runningRef }: { animate: boolean; runningRef: React.MutableRefObject<boolean> }) {
  const teal = useMemo(() => new THREE.Color(TEAL), []);
  return (
    <>
      <color attach="background" args={[0.03, 0.05, 0.07]} />
      <fog attach="fog" args={['#06101a', 8, 22]} />
      <ambientLight intensity={0.85} color="#a9cfe6" />
      <directionalLight position={[2, 5, 4]} intensity={0.9} color="#e6f5ff" />
      <pointLight position={[0, 1.6, 1.5]} intensity={9} distance={14} color={teal} />
      <pointLight position={[-4, 2, 1]} intensity={4} distance={12} color="#3aa0c8" />
      {/* dark floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -TANK_H / 2 - 0.02, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#060a10" roughness={0.4} metalness={0.5} />
      </mesh>
      <Tanks animate={animate} runningRef={runningRef} />
    </>
  );
}

function Tanks({ animate, runningRef }: { animate: boolean; runningRef: React.MutableRefObject<boolean> }) {
  const { invalidate } = useThree();
  const liquidRefs = useRef<(THREE.Mesh | null)[]>([]);
  const bubbleRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const tankX = (i: number) => (i - (TANKS - 1) / 2) * (TANK_W + GAP);

  // bubble layout: which tank, lateral/depth offset, phase, speed
  const bubbles = useMemo(() => {
    const out: { x: number; z: number; phase: number; speed: number }[] = [];
    for (let i = 0; i < TANKS; i++)
      for (let b = 0; b < BUBBLES_PER; b++) {
        const seed = i * 31 + b * 7;
        out.push({
          x: tankX(i) + (((seed * 13) % 100) / 100 - 0.5) * TANK_W * 0.7,
          z: (((seed * 29) % 100) / 100 - 0.5) * TANK_D * 0.7,
          phase: ((seed * 17) % 100) / 100,
          speed: 0.25 + (((seed * 11) % 100) / 100) * 0.3,
        });
      }
    return out;
  }, []);

  const place = (t: number) => {
    const m = bubbleRef.current;
    if (m) {
      bubbles.forEach((bub, i) => {
        const p = (bub.phase + t * bub.speed) % 1;
        const y = -TANK_H / 2 + 0.1 + p * (TANK_H - 0.18);
        const a = Math.sin(p * Math.PI);
        dummy.position.set(bub.x, y, bub.z);
        dummy.scale.setScalar(0.045 + a * 0.05);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    }
    // gentle surface shimmer
    liquidRefs.current.forEach((lm, i) => {
      if (!lm) return;
      const mat = lm.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.72 + 0.12 * Math.sin(t * 1.6 + i);
    });
  };

  useEffect(() => {
    place(0);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFrame((s) => {
    if (!animate || !runningRef.current) return;
    place(s.clock.elapsedTime);
  });

  return (
    <group>
      {Array.from({ length: TANKS }).map((_, i) => {
        const wall = '#0c1a26';
        const surfaceY = TANK_H / 2 - 0.14; // coolant level, below the open rim
        return (
          <group key={i} position={[tankX(i), 0, 0]}>
            {/* open-top tank: bottom + 4 walls (no lid, so the glow shows) */}
            <mesh position={[0, -TANK_H / 2, 0]}>
              <boxGeometry args={[TANK_W, 0.06, TANK_D]} />
              <meshStandardMaterial color={wall} roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[-TANK_W / 2, 0, 0]}>
              <boxGeometry args={[0.06, TANK_H, TANK_D]} />
              <meshStandardMaterial color={wall} roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[TANK_W / 2, 0, 0]}>
              <boxGeometry args={[0.06, TANK_H, TANK_D]} />
              <meshStandardMaterial color={wall} roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, TANK_D / 2]}>
              <boxGeometry args={[TANK_W, TANK_H, 0.06]} />
              <meshStandardMaterial color={wall} roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, -TANK_D / 2]}>
              <boxGeometry args={[TANK_W, TANK_H, 0.06]} />
              <meshStandardMaterial color={wall} roughness={0.5} metalness={0.6} />
            </mesh>
            {/* submerged GPU boards breaking the surface */}
            {Array.from({ length: BOARDS_PER }).map((_, b) => (
              <mesh key={b} position={[0, surfaceY - 0.18, (b - (BOARDS_PER - 1) / 2) * (TANK_D / (BOARDS_PER + 0.5))]}>
                <boxGeometry args={[TANK_W * 0.8, TANK_H * 0.66, 0.045]} />
                <meshStandardMaterial color="#16323f" emissive={TEAL} emissiveIntensity={0.5} roughness={0.5} metalness={0.3} />
              </mesh>
            ))}
            {/* glowing coolant surface */}
            <mesh
              ref={(el) => (liquidRefs.current[i] = el)}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, surfaceY, 0]}
            >
              <planeGeometry args={[TANK_W * 0.9, TANK_D * 0.9]} />
              <meshBasicMaterial color={TEAL} transparent opacity={0.78} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      {/* rising bubbles (additive — reads on the dark coolant) */}
      <instancedMesh ref={bubbleRef} args={[undefined as never, undefined as never, TANKS * BUBBLES_PER]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#cdf2fb" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
