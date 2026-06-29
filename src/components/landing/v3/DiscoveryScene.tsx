import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * DiscoveryScene — the VoltScout "Hidden Gems" discovery engine: a dark map with
 * a radar sweep rotating over it; as the beam passes a hidden power site the
 * site lights up and pulses an expanding ring. Built for the Platform
 * "Hidden Gems discovery" feature. react-three-fiber v8 + three r160, no drei.
 * Reduced-motion safe, pauses off-screen, dpr-capped.
 */

const TEAL = '#10a5c7';
const ORANGE = '#F7931A';
const SWEEP_SPEED = 0.42; // rad/sec

// fixed "sites" on the map (polar: angle, radius), a couple flagged as gems (orange)
const SITES = [
  { a: 0.4, r: 1.4, gem: true },
  { a: 1.5, r: 2.5, gem: false },
  { a: 2.3, r: 1.1, gem: false },
  { a: 3.1, r: 2.2, gem: true },
  { a: 3.9, r: 1.7, gem: false },
  { a: 4.8, r: 2.7, gem: false },
  { a: 5.6, r: 1.3, gem: true },
  { a: 0.9, r: 3.1, gem: false },
];

function makeMapTexture(): THREE.CanvasTexture {
  const S = 512;
  const cv = document.createElement('canvas');
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#081019';
  ctx.fillRect(0, 0, S, S);
  // grid
  ctx.strokeStyle = 'rgba(80,150,180,0.12)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 16; i++) {
    const p = (i / 16) * S;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(S, p); ctx.stroke();
  }
  // faint "terrain" contour blobs
  ctx.strokeStyle = 'rgba(80,150,180,0.10)';
  for (let k = 0; k < 6; k++) {
    const cx = (Math.sin(k * 12.9) * 0.5 + 0.5) * S;
    const cy = (Math.cos(k * 7.7) * 0.5 + 0.5) * S;
    for (let r = 18; r < 70; r += 16) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// radar sweep: a quarter-ish sector that's bright at the leading edge, fading back.
function makeSweepTexture(): THREE.CanvasTexture {
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext('2d')!;
  const cx = S / 2;
  const cy = S / 2;
  const steps = 64;
  const span = Math.PI * 0.6;
  for (let i = 0; i < steps; i++) {
    const a0 = -span + (i / steps) * span;
    const a1 = -span + ((i + 1) / steps) * span;
    const alpha = (i / steps) ** 2 * 0.5; // bright at the leading edge (i→steps)
    ctx.fillStyle = `rgba(40,190,225,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, S / 2 - 2, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  // bright leading edge line
  ctx.strokeStyle = 'rgba(150,235,250,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(0) * (S / 2 - 2), cy + Math.sin(0) * (S / 2 - 2));
  ctx.stroke();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function DiscoveryScene({ className }: { className?: string }) {
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
        camera={{ position: [0, 4.4, 3.6], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        frameloop={animate ? 'always' : 'demand'}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ camera }) => camera.lookAt(0, 0, -0.2)}
      >
        <Map animate={animate} runningRef={runningRef} />
      </Canvas>
    </div>
  );
}

function Map({ animate, runningRef }: { animate: boolean; runningRef: React.MutableRefObject<boolean> }) {
  const { invalidate } = useThree();
  const mapTex = useMemo(() => makeMapTexture(), []);
  const sweepTex = useMemo(() => makeSweepTexture(), []);
  useEffect(() => () => { mapTex.dispose(); sweepTex.dispose(); }, [mapTex, sweepTex]);

  const sweepRef = useRef<THREE.Mesh>(null);
  const pinRefs = useRef<(THREE.Mesh | null)[]>([]);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const litRef = useRef<number[]>(SITES.map(() => -10)); // time each site was last swept

  const pos = useMemo(
    () => SITES.map((s) => new THREE.Vector3(Math.cos(s.a) * s.r, 0, Math.sin(s.a) * s.r)),
    [],
  );

  const apply = (t: number) => {
    const ang = t * SWEEP_SPEED;
    if (sweepRef.current) sweepRef.current.rotation.z = -ang;
    // normalize sweep angle to [0,2π)
    const sweepA = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    SITES.forEach((s, i) => {
      const siteA = ((s.a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      let d = Math.abs(sweepA - siteA);
      if (d > Math.PI) d = Math.PI * 2 - d;
      if (d < 0.05) litRef.current[i] = t; // beam just passed → trigger
      const since = t - litRef.current[i];
      const glow = Math.max(0, 1 - since / 1.6); // fade over 1.6s

      const pin = pinRefs.current[i];
      if (pin) {
        const col = s.gem ? ORANGE : TEAL;
        const m = pin.material as THREE.MeshBasicMaterial;
        m.color.set(col);
        const base = s.gem ? 0.55 : 0.3;
        pin.scale.setScalar(0.5 + glow * 1.1);
        m.opacity = base + glow * 0.45;
      }
      const ring = ringRefs.current[i];
      if (ring) {
        const rm = ring.material as THREE.MeshBasicMaterial;
        const sc = 0.12 + (1 - glow) * 0.5; // expands as it fades
        ring.scale.setScalar(glow > 0 ? sc * 6 : 0.001);
        rm.opacity = glow * 0.6;
        rm.color.set(s.gem ? ORANGE : TEAL);
      }
    });
  };

  useEffect(() => {
    apply(0);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFrame((s) => {
    if (!animate || !runningRef.current) return;
    apply(s.clock.elapsedTime);
  });

  return (
    <group>
      <color attach="background" args={[0.02, 0.04, 0.06]} />
      <fog attach="fog" args={['#05090f', 8, 22]} />
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 4, 2]} intensity={5} distance={16} color={TEAL} />

      {/* map */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial map={mapTex} toneMapped={false} />
      </mesh>
      {/* range rings */}
      {[1, 2, 3].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <ringGeometry args={[r - 0.012, r + 0.012, 64]} />
          <meshBasicMaterial color={TEAL} transparent opacity={0.18} toneMapped={false} />
        </mesh>
      ))}
      {/* rotating radar sweep, lying flat on the map */}
      <mesh ref={sweepRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[6.4, 6.4]} />
        <meshBasicMaterial map={sweepTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* centre hub */}
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#bff0fb" toneMapped={false} />
      </mesh>

      {/* sites: a glowing marker + an expanding ground ring */}
      {SITES.map((s, i) => (
        <group key={i} position={[pos[i].x, 0, pos[i].z]}>
          <mesh ref={(el) => (pinRefs.current[i] = el)} position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color={s.gem ? ORANGE : TEAL} transparent opacity={0.4} toneMapped={false} />
          </mesh>
          <mesh ref={(el) => (ringRefs.current[i] = el)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
            <ringGeometry args={[0.08, 0.1, 40]} />
            <meshBasicMaterial color={TEAL} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
