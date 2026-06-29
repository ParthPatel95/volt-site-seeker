import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * TransmissionScene — a realistic high-voltage transmission line: lattice steel
 * towers marching into the distance, conductors drooping (catenary) between
 * them, and energy pulses streaming along the wires toward the flagship. Built
 * for the PowerFirst "power-first / 144 kV interconnection" panel. Dusk sky.
 * react-three-fiber v8 + three r160, no drei. Reduced-motion safe, pauses
 * off-screen, dpr-capped.
 */

const TEAL = '#10a5c7';
const TOWERS = 4;
const SPAN = 3.6;
const TH = 2.55;
const STEEL = '#b9c6d8';
const STEEL_DARK = '#5a6b84';
const HORIZON = '#a98e74';

const ARMS = [
  { y: TH * 0.62, x: 0.66 },
  { y: TH * 0.76, x: 0.56 },
  { y: TH * 0.9, x: 0.44 },
];
function attachPoints(): THREE.Vector3[] {
  const p: THREE.Vector3[] = [];
  for (const a of ARMS) {
    p.push(new THREE.Vector3(-a.x, a.y, 0));
    p.push(new THREE.Vector3(a.x, a.y, 0));
  }
  p.push(new THREE.Vector3(0, TH, 0));
  return p;
}

function buildTowerSegments(z: number, out: number[]) {
  const seg = (a: THREE.Vector3, b: THREE.Vector3) => out.push(a.x, a.y, a.z + z, b.x, b.y, b.z + z);
  const levels = [
    { y: 0, w: 0.5 },
    { y: 0.55, w: 0.32 },
    { y: 0.95, w: 0.17 },
    { y: 1.5, w: 0.16 },
    { y: TH * 0.62, w: 0.15 },
    { y: TH * 0.9, w: 0.13 },
    { y: TH, w: 0.0 },
  ];
  const cs = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  // legs
  for (const [sx, sz] of cs) {
    for (let i = 0; i < levels.length - 1; i++) {
      seg(
        new THREE.Vector3(sx * levels[i].w, levels[i].y, sz * levels[i].w),
        new THREE.Vector3(sx * levels[i + 1].w, levels[i + 1].y, sz * levels[i + 1].w),
      );
    }
  }
  // rings + X-braces between consecutive levels
  for (let i = 0; i < levels.length - 1; i++) {
    const A = levels[i];
    const B = levels[i + 1];
    for (let k = 0; k < 4; k++) {
      const [sx, sz] = cs[k];
      const [nx, nz] = cs[(k + 1) % 4];
      const aTop = new THREE.Vector3(sx * A.w, A.y, sz * A.w);
      const bTop = new THREE.Vector3(nx * A.w, A.y, nz * A.w);
      const aBot = new THREE.Vector3(sx * B.w, B.y, sz * B.w);
      const bBot = new THREE.Vector3(nx * B.w, B.y, nz * B.w);
      seg(aTop, bTop);
      seg(aTop, bBot);
      seg(bTop, aBot);
    }
  }
  // crossarms out to each conductor tip + brace
  for (const a of ARMS) {
    const tipL = new THREE.Vector3(-a.x, a.y, 0);
    const tipR = new THREE.Vector3(a.x, a.y, 0);
    seg(new THREE.Vector3(-0.15, a.y, 0), tipL);
    seg(new THREE.Vector3(0.15, a.y, 0), tipR);
    seg(new THREE.Vector3(-0.15, a.y + 0.16, 0), tipL);
    seg(new THREE.Vector3(0.15, a.y + 0.16, 0), tipR);
  }
}

function catenary(a: THREE.Vector3, b: THREE.Vector3, sag: number, n = 14): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = new THREE.Vector3().lerpVectors(a, b, t);
    p.y -= sag * Math.sin(Math.PI * t);
    pts.push(p);
  }
  return pts;
}

function makeSkyTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 4;
  cv.height = 256;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  // Sphere maps v=0.5 to the horizon (equator); upper sky is v<0.5.
  g.addColorStop(0, '#142747'); // zenith
  g.addColorStop(0.3, '#33548a'); // upper sky
  g.addColorStop(0.44, '#6f8bb2'); // haze approaching horizon
  g.addColorStop(0.5, '#d9b488'); // warm dusk band AT horizon
  g.addColorStop(0.54, '#e6bf8f'); // bright horizon glow
  g.addColorStop(0.62, '#8f8276'); // dusty band just below horizon
  g.addColorStop(1, '#2b3344'); // ground haze (hidden)
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function TransmissionScene({ className }: { className?: string }) {
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
        camera={{ position: [2.0, 0.7, 4.2], fov: 54, near: 0.1, far: 120 }}
        gl={{ antialias: true, alpha: false }}
        frameloop={animate ? 'always' : 'demand'}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ camera }) => camera.lookAt(-0.15, 2.05, -6)}
      >
        <Scene animate={animate} runningRef={runningRef} />
      </Canvas>
    </div>
  );
}

function Scene({ animate, runningRef }: { animate: boolean; runningRef: React.MutableRefObject<boolean> }) {
  const { invalidate } = useThree();
  const zs = useMemo(() => Array.from({ length: TOWERS }, (_, i) => -i * SPAN - 1.5), []);

  const skyTex = useMemo(() => makeSkyTexture(), []);
  useEffect(() => () => skyTex.dispose(), [skyTex]);

  const towerGeo = useMemo(() => {
    const arr: number[] = [];
    zs.forEach((z) => buildTowerSegments(z, arr));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, [zs]);
  useEffect(() => () => towerGeo.dispose(), [towerGeo]);

  const { conductorGeo, wires } = useMemo(() => {
    const ap = attachPoints();
    const arr: number[] = [];
    const wireList: THREE.Vector3[][] = [];
    for (let i = 0; i < zs.length - 1; i++) {
      for (let k = 0; k < ap.length; k++) {
        const a = ap[k].clone().setZ(zs[i]);
        const b = ap[k].clone().setZ(zs[i + 1]);
        const sag = k === ap.length - 1 ? 0.18 : 0.42;
        const pts = catenary(a, b, sag);
        wireList.push(pts);
        for (let j = 0; j < pts.length - 1; j++) {
          arr.push(pts[j].x, pts[j].y, pts[j].z, pts[j + 1].x, pts[j + 1].y, pts[j + 1].z);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    return { conductorGeo: g, wires: wireList };
  }, [zs]);
  useEffect(() => () => conductorGeo.dispose(), [conductorGeo]);

  const pulseRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pulses = useMemo(
    () => wires.flatMap((_, wi) => [0, 0.5].map((off, j) => ({ wi, off, speed: 0.16 + ((wi * 7 + j) % 5) * 0.03 }))),
    [wires],
  );

  const place = (t: number) => {
    const m = pulseRef.current;
    if (!m) return;
    pulses.forEach((p, i) => {
      const pts = wires[p.wi];
      const phase = (t * p.speed + p.off) % 1;
      const frac = (1 - phase) * (pts.length - 1);
      const idx = Math.min(Math.floor(frac), pts.length - 2);
      const lerp = frac - idx;
      const a = pts[idx];
      const b = pts[idx + 1];
      dummy.position.set(a.x + (b.x - a.x) * lerp, a.y + (b.y - a.y) * lerp, a.z + (b.z - a.z) * lerp);
      const fade = Math.sin(phase * Math.PI);
      dummy.scale.setScalar(0.012 + fade * 0.022);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
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
      <color attach="background" args={[HORIZON]} />
      <fog attach="fog" args={[HORIZON, 10, 34]} />
      <hemisphereLight args={['#dbe7f7', '#2a3346', 1.15]} />
      <directionalLight position={[-3, 4, 2]} intensity={1.2} color="#ffe0bc" />

      {/* Dusk sky dome */}
      <mesh>
        <sphereGeometry args={[40, 32, 16]} />
        <meshBasicMaterial map={skyTex} side={THREE.BackSide} fog={false} toneMapped={false} />
      </mesh>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -8]}>
        <planeGeometry args={[80, 90]} />
        <meshStandardMaterial color="#5a5a5e" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Towers — two passes: dark weight + bright edge */}
      <lineSegments geometry={towerGeo}>
        <lineBasicMaterial color={STEEL_DARK} transparent opacity={0.9} />
      </lineSegments>
      <group position={[0.012, 0.012, 0]}>
        <lineSegments geometry={towerGeo}>
          <lineBasicMaterial color={STEEL} transparent opacity={0.95} />
        </lineSegments>
      </group>

      <lineSegments geometry={conductorGeo}>
        <lineBasicMaterial color="#1d2738" transparent opacity={0.92} />
      </lineSegments>
      <instancedMesh ref={pulseRef} args={[undefined as never, undefined as never, pulses.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={TEAL} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
