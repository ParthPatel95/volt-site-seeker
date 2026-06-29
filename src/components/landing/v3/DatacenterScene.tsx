import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * DatacenterScene — a realistic 3D server-hall flythrough (react-three-fiber v8
 * + three r160, no drei / no postprocessing). Two rows of instanced rack
 * cabinets form an aisle that recedes to a vanishing point; the aisle-facing
 * fronts are stacked server units with glowing status LEDs; overhead light
 * strips and cool ambient + a warm brand accent light the hall, which scrolls
 * continuously toward the camera (a seamless dolly down the aisle).
 *
 * Two looks:
 *  - "dark"  : atmospheric server hall (sits inside a framed panel like a window).
 *  - "light" : a clean, bright white datacenter whose background fades into the
 *              light page — used full-bleed behind the hero copy.
 *
 * Reduced-motion safe (one representative static frame, frameloop="demand"),
 * pauses off-screen via IntersectionObserver, dpr-capped.
 */

const PER_SIDE = 16;
const SPACING = 1.15;
const AISLE_HALF = 1.25;
const RACK_W = 0.78;
const RACK_H = 2.05;
const RACK_D = 1.05;
const HALL = PER_SIDE * SPACING;
const Z_NEAR = 3.5;
const SPEED = 1.05;

type Accent = 'orange' | 'teal';
type Variant = 'dark' | 'light';
const ACCENTS: Record<Accent, string> = { orange: '#F7931A', teal: '#10a5c7' };

interface Palette {
  bg: [number, number, number];
  fog: { color: string; near: number; far: number };
  body: string;
  bodyRough: number;
  bodyMetal: number;
  floor: string;
  floorRough: number;
  floorMetal: number;
  strip: string;
  ambient: { color: string; intensity: number };
  hemi: { sky: string; ground: string; intensity: number };
  dir: { color: string; intensity: number };
  accentLight: number;
  coolLight: { color: string; intensity: number };
  tex: {
    panel: string;
    slabA: string;
    slabB: string;
    vent: string;
    bezel: string;
    handle: string;
  };
}

const PALETTES: Record<Variant, Palette> = {
  dark: {
    bg: [0.03, 0.05, 0.09],
    fog: { color: '#070b13', near: 6, far: 22 },
    body: '#0b0f17',
    bodyRough: 0.55,
    bodyMetal: 0.5,
    floor: '#070a11',
    floorRough: 0.32,
    floorMetal: 0.6,
    strip: '#cfe6ff',
    ambient: { color: '#5b7ea8', intensity: 0.45 },
    hemi: { sky: '#9fc6ff', ground: '#0a0e16', intensity: 0.5 },
    dir: { color: '#bcd6ff', intensity: 0.6 },
    accentLight: 6,
    coolLight: { color: '#9fc0ff', intensity: 8 },
    tex: {
      panel: '#0c111b',
      slabA: '#161d2b',
      slabB: '#111825',
      vent: '#0a0e16',
      bezel: 'rgba(255,255,255,0.05)',
      handle: 'rgba(255,255,255,0.05)',
    },
  },
  light: {
    bg: [0.965, 0.976, 0.988], // ~#f6f9fc — matches the light page
    fog: { color: '#f6f9fc', near: 7, far: 27 },
    body: '#c2cddd',
    bodyRough: 0.5,
    bodyMetal: 0.25,
    floor: '#e6ebf3',
    floorRough: 0.5,
    floorMetal: 0.2,
    strip: '#eaf2ff',
    ambient: { color: '#ffffff', intensity: 0.95 },
    hemi: { sky: '#ffffff', ground: '#c2ccdd', intensity: 0.85 },
    dir: { color: '#ffffff', intensity: 0.75 },
    accentLight: 3,
    coolLight: { color: '#e3edff', intensity: 3 },
    tex: {
      panel: '#cdd6e3',
      slabA: '#e7ecf4',
      slabB: '#dbe2ec',
      vent: '#aab4c4',
      bezel: 'rgba(255,255,255,0.6)',
      handle: 'rgba(15,23,42,0.14)',
    },
  },
};

// Procedurally-drawn rack-front texture: stacked 1U server units, vent grilles,
// drive bays and rows of coloured status LEDs.
function makeRackTexture(accentHex: string, pal: Palette): THREE.CanvasTexture {
  const W = 128;
  const H = 512;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;

  ctx.fillStyle = pal.tex.panel;
  ctx.fillRect(0, 0, W, H);

  const LED = ['#37d67a', '#ffb020', '#21b3d6', accentHex];
  const units = 26;
  const uh = H / units;
  for (let i = 0; i < units; i++) {
    const y = i * uh;
    ctx.fillStyle = i % 2 === 0 ? pal.tex.slabA : pal.tex.slabB;
    ctx.fillRect(4, y + 1, W - 8, uh - 2);
    ctx.fillStyle = pal.tex.bezel;
    ctx.fillRect(4, y + 1, W - 8, 1);

    ctx.fillStyle = pal.tex.vent;
    for (let v = 0; v < 5; v++) ctx.fillRect(58 + v * 12, y + 4, 7, uh - 8);

    const n = 2 + ((i * 7) % 3);
    for (let k = 0; k < n; k++) {
      const c = LED[(i + k) % LED.length];
      ctx.fillStyle = c;
      ctx.shadowColor = c;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(14 + k * 9, y + uh / 2, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = pal.tex.handle;
    ctx.fillRect(40, y + uh / 2 - 1, 12, 2);
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function Racks({
  accentHex,
  pal,
  animate,
  runningRef,
}: {
  accentHex: string;
  pal: Palette;
  animate: boolean;
  runningRef: React.MutableRefObject<boolean>;
}) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const faceRef = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useMemo(() => makeRackTexture(accentHex, pal), [accentHex, pal]);
  useEffect(() => () => tex.dispose(), [tex]);

  const COUNT = PER_SIDE * 2;
  const layout = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const side = i < PER_SIDE ? -1 : 1;
        const row = i % PER_SIDE;
        return { side, baseZ: -row * SPACING };
      }),
    [COUNT],
  );

  const place = (t: number) => {
    const body = bodyRef.current;
    const face = faceRef.current;
    if (!body || !face) return;
    const scroll = (t * SPEED) % SPACING;
    for (let i = 0; i < COUNT; i++) {
      const { side, baseZ } = layout[i];
      let z = baseZ + scroll + Z_NEAR;
      z = (((z - Z_NEAR) % HALL) + HALL) % HALL;
      z = Z_NEAR - z;

      dummy.position.set(side * AISLE_HALF, 0, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(RACK_W, RACK_H, RACK_D);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);

      dummy.position.set(side * (AISLE_HALF - RACK_W / 2 - 0.012), 0, z);
      dummy.rotation.set(0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0);
      dummy.scale.set(RACK_D * 0.96, RACK_H * 0.97, 1);
      dummy.updateMatrix();
      face.setMatrixAt(i, dummy.matrix);
    }
    body.instanceMatrix.needsUpdate = true;
    face.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    place(0);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    if (!animate || !runningRef.current) return;
    place(state.clock.elapsedTime);
  });

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[undefined as never, undefined as never, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={pal.body} roughness={pal.bodyRough} metalness={pal.bodyMetal} />
      </instancedMesh>
      <instancedMesh ref={faceRef} args={[undefined as never, undefined as never, COUNT]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

function Hall({ pal }: { pal: Palette }) {
  const strips = [];
  for (let i = 0; i < 7; i++) strips.push(-i * 2.4 + 2);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -RACK_H / 2, -6]}>
        <planeGeometry args={[14, 48]} />
        <meshStandardMaterial color={pal.floor} roughness={pal.floorRough} metalness={pal.floorMetal} />
      </mesh>
      {strips.map((z, i) => (
        <mesh key={i} position={[0, RACK_H / 2 + 0.05, z]}>
          <boxGeometry args={[0.5, 0.04, 1.1]} />
          <meshBasicMaterial color={pal.strip} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({
  accentHex,
  pal,
  animate,
  runningRef,
}: {
  accentHex: string;
  pal: Palette;
  animate: boolean;
  runningRef: React.MutableRefObject<boolean>;
}) {
  const accent = useMemo(() => new THREE.Color(accentHex), [accentHex]);
  return (
    <>
      <color attach="background" args={pal.bg} />
      <fog attach="fog" args={[pal.fog.color, pal.fog.near, pal.fog.far]} />
      <ambientLight intensity={pal.ambient.intensity} color={pal.ambient.color} />
      <hemisphereLight args={[pal.hemi.sky, pal.hemi.ground, pal.hemi.intensity]} />
      <directionalLight position={[3, 6, 4]} intensity={pal.dir.intensity} color={pal.dir.color} />
      <pointLight position={[0, 1.2, 2]} intensity={pal.accentLight} distance={12} color={accent} />
      <pointLight position={[0, 1.4, -6]} intensity={pal.coolLight.intensity} distance={16} color={pal.coolLight.color} />
      <Hall pal={pal} />
      <Racks accentHex={accentHex} pal={pal} animate={animate} runningRef={runningRef} />
    </>
  );
}

export default function DatacenterScene({
  className,
  accent = 'teal',
  variant = 'dark',
}: {
  className?: string;
  accent?: Accent;
  variant?: Variant;
}) {
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
    const io = new IntersectionObserver(
      ([e]) => {
        runningRef.current = e.isIntersecting;
        setVisible(e.isIntersecting);
      },
      { threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animate = !reduced && visible;
  const accentHex = ACCENTS[accent];
  const pal = PALETTES[variant];

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.25, 4.2], fov: 58, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        frameloop={animate ? 'always' : 'demand'}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ camera }) => camera.lookAt(0, 0.1, -8)}
      >
        <Rig accentHex={accentHex} pal={pal} animate={animate} runningRef={runningRef} />
      </Canvas>
    </div>
  );
}
