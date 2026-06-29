import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * DatacenterScene — a realistic 3D server-hall flythrough (react-three-fiber v8
 * + three r160, no drei / no postprocessing). Two rows of dark rack cabinets
 * form an aisle that recedes to a vanishing point; the aisle-facing fronts are
 * covered in stacked server units with glowing status LEDs; overhead light
 * strips and cool ambient + a warm brand accent light the hall. The racks
 * scroll continuously toward the camera (a seamless dolly down the aisle).
 *
 * Atmospheric/dark by design (that is what a real datacenter looks like); it
 * sits inside a framed panel on the light page like a window into the hall.
 * Reduced-motion safe (one representative static frame, frameloop="demand").
 */

// ── Tunables ────────────────────────────────────────────────────────────────
const PER_SIDE = 16; //   rack cabinets per row
const SPACING = 1.15; //  z-gap between racks
const AISLE_HALF = 1.25; // half-width of the walking aisle
const RACK_W = 0.78;
const RACK_H = 2.05;
const RACK_D = 1.05;
const HALL = PER_SIDE * SPACING; // total scroll length before recycle
const Z_NEAR = 3.5; //    nearest a rack gets before wrapping to the back
const SPEED = 1.05; //    world units / second the hall scrolls toward camera

type Accent = 'orange' | 'teal';
const ACCENTS: Record<Accent, string> = { orange: '#F7931A', teal: '#10a5c7' };

// A procedurally-drawn rack-front texture: stacked 1U server units, vent grilles,
// drive bays and rows of coloured status LEDs. Used (emissive) on the inner face.
function makeRackTexture(accentHex: string): THREE.CanvasTexture {
  const W = 128;
  const H = 512;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;

  // dark cabinet face
  ctx.fillStyle = '#0c111b';
  ctx.fillRect(0, 0, W, H);

  const LED = ['#37d67a', '#ffb020', '#21b3d6', accentHex]; // green / amber / cyan / brand
  const units = 26;
  const uh = H / units;
  for (let i = 0; i < units; i++) {
    const y = i * uh;
    // server chassis slab
    ctx.fillStyle = i % 2 === 0 ? '#161d2b' : '#111825';
    ctx.fillRect(4, y + 1, W - 8, uh - 2);
    // thin bezel highlight
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(4, y + 1, W - 8, 1);

    // vent grille block (right side)
    ctx.fillStyle = '#0a0e16';
    for (let v = 0; v < 5; v++) ctx.fillRect(58 + v * 12, y + 4, 7, uh - 8);

    // a few status LEDs (left side) — bright, self-lit
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
    // drive-bay handle line
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(40, y + uh / 2 - 1, 12, 2);
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// One InstancedMesh of rack bodies + one of glowing front panels, scrolled.
function Racks({
  accentHex,
  animate,
  runningRef,
}: {
  accentHex: string;
  animate: boolean;
  runningRef: React.MutableRefObject<boolean>;
}) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const faceRef = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tex = useMemo(() => makeRackTexture(accentHex), [accentHex]);
  useEffect(() => () => tex.dispose(), [tex]);

  const COUNT = PER_SIDE * 2;
  // static per-rack layout: side (-1 left / +1 right), index along the row.
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
      // wrap each rack into [Z_NEAR - HALL, Z_NEAR]
      let z = baseZ + scroll + Z_NEAR;
      z = ((z - Z_NEAR) % HALL + HALL) % HALL; // 0..HALL
      z = Z_NEAR - z; // Z_NEAR (near) .. Z_NEAR-HALL (far)

      // body
      dummy.position.set(side * AISLE_HALF, 0, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(RACK_W, RACK_H, RACK_D);
      dummy.updateMatrix();
      body.setMatrixAt(i, dummy.matrix);

      // glowing front panel on the aisle-facing side (normal toward x=0)
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
      <instancedMesh ref={bodyRef} args={[undefined as never, undefined as never, COUNT]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0b0f17" roughness={0.55} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={faceRef} args={[undefined as never, undefined as never, COUNT]}>
        <planeGeometry args={[1, 1]} />
        {/* self-lit server fronts: the texture carries the glow */}
        <meshBasicMaterial map={tex} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// Overhead linear light strips + floor for the hall context.
function Hall() {
  const strips = [];
  for (let i = 0; i < 7; i++) strips.push(-i * 2.4 + 2);
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -RACK_H / 2, -6]} receiveShadow>
        <planeGeometry args={[14, 48]} />
        <meshStandardMaterial color="#070a11" roughness={0.32} metalness={0.6} />
      </mesh>
      {/* ceiling light strips running down the aisle */}
      {strips.map((z, i) => (
        <mesh key={i} position={[0, RACK_H / 2 + 0.05, z]}>
          <boxGeometry args={[0.5, 0.04, 1.1]} />
          <meshBasicMaterial color="#cfe6ff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({
  accentHex,
  animate,
  runningRef,
}: {
  accentHex: string;
  animate: boolean;
  runningRef: React.MutableRefObject<boolean>;
}) {
  const accent = useMemo(() => new THREE.Color(accentHex), [accentHex]);
  return (
    <>
      <color attach="background" args={[0.03, 0.05, 0.09]} />
      <fog attach="fog" args={['#070b13', 6, 22]} />
      <ambientLight intensity={0.45} color="#5b7ea8" />
      <hemisphereLight args={['#9fc6ff', '#0a0e16', 0.5]} />
      {/* cool key + warm brand accent */}
      <directionalLight position={[3, 6, 4]} intensity={0.6} color="#bcd6ff" />
      <pointLight position={[0, 1.2, 2]} intensity={6} distance={12} color={accent} />
      <pointLight position={[0, 1.4, -6]} intensity={8} distance={16} color="#9fc0ff" />
      <Hall />
      <Racks accentHex={accentHex} animate={animate} runningRef={runningRef} />
    </>
  );
}

export default function DatacenterScene({
  className,
  accent = 'teal',
}: {
  className?: string;
  accent?: Accent;
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
        <Rig accentHex={accentHex} animate={animate} runningRef={runningRef} />
      </Canvas>
    </div>
  );
}
