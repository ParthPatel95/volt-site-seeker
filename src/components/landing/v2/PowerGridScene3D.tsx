import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

// Procedural 3D power-grid scene. Everything in here is geometry — lattice
// transmission towers, sagging conductor lines, glowing current pulses, a
// receding ground plane — rendered inside a camera that orbits the scene.
// There's no source photograph, so the result is unambiguously a 3D
// animation: parallax between near/far towers, the catenary shape resolving
// from different angles, pulses streaming along the lines, all change as the
// camera moves.
//
// Performance:
//   * Canvas lazy-mounts on viewport intersection.
//   * Scene is small: 3 towers (~24 meshes each), 9 line tubes, 9 pulses.
//   * dpr clamped to [1, 1.6]; prefers-reduced-motion freezes the orbit.

// ── Geometry helpers ─────────────────────────────────────────────────────────

const STEEL = '#525d72';
const STEEL_LIGHT = '#74809a';
const INSULATOR = '#dbe0ea';
const PULSE = '#f7931a';
const PULSE_GLOW = '#ffd28a';
const FOG = '#0b1729';

// A single lattice transmission tower built from primitives. Four legs taper
// from base to top, three levels of horizontal bracing, a wide crossarm with
// insulator strings hanging from three conductor positions.
function Tower({
  position = [0, 0, 0],
  height = 6,
  baseRadius = 0.7,
  topRadius = 0.18,
  armHalfWidth = 1.3,
}: {
  position?: [number, number, number];
  height?: number;
  baseRadius?: number;
  topRadius?: number;
  armHalfWidth?: number;
}) {
  // Pre-compute the four leg transforms once: each leg is a thin cylinder
  // angled from a corner of the base to a corner of the top.
  const legs = useMemo(() => {
    const items: { pos: THREE.Vector3; quat: THREE.Quaternion; length: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const base = new THREE.Vector3(Math.cos(angle) * baseRadius, 0, Math.sin(angle) * baseRadius);
      const top = new THREE.Vector3(Math.cos(angle) * topRadius, height, Math.sin(angle) * topRadius);
      const dir = top.clone().sub(base);
      const len = dir.length();
      const mid = base.clone().add(top).multiplyScalar(0.5);
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.clone().normalize(),
      );
      items.push({ pos: mid, quat, length: len });
    }
    return items;
  }, [height, baseRadius, topRadius]);

  // Cross-bracing: at three heights along the tower, connect each leg to the
  // next with a thin horizontal box, plus an X of two diagonal boxes.
  const braces = useMemo(() => {
    const result: {
      pos: [number, number, number];
      rotY: number;
      length: number;
      kind: 'h' | 'd';
    }[] = [];
    const levels = [0.18, 0.45, 0.75];
    for (const t of levels) {
      const y = t * height;
      const r = baseRadius + (topRadius - baseRadius) * t;
      for (let i = 0; i < 4; i++) {
        const a1 = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const a2 = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4;
        const p1 = new THREE.Vector3(Math.cos(a1) * r, y, Math.sin(a1) * r);
        const p2 = new THREE.Vector3(Math.cos(a2) * r, y, Math.sin(a2) * r);
        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        const len = p1.distanceTo(p2);
        const rotY = -Math.atan2(p2.z - p1.z, p2.x - p1.x);
        result.push({ pos: [mid.x, mid.y, mid.z], rotY, length: len, kind: 'h' });
      }
    }
    return result;
  }, [height, baseRadius, topRadius]);

  return (
    <group position={position}>
      {/* legs */}
      {legs.map((leg, i) => (
        <mesh key={`leg-${i}`} position={leg.pos} quaternion={leg.quat} castShadow>
          <cylinderGeometry args={[0.05, 0.07, leg.length, 8]} />
          <meshStandardMaterial color={STEEL} metalness={0.65} roughness={0.45} />
        </mesh>
      ))}

      {/* cross-bracing */}
      {braces.map((b, i) => (
        <mesh key={`brace-${i}`} position={b.pos} rotation={[0, b.rotY, 0]}>
          <boxGeometry args={[b.length, 0.045, 0.045]} />
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.6} roughness={0.5} />
        </mesh>
      ))}

      {/* main crossarm */}
      <mesh position={[0, height + 0.4, 0]}>
        <boxGeometry args={[armHalfWidth * 2, 0.1, 0.1]} />
        <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.4} />
      </mesh>
      {/* secondary lower crossarm for depth */}
      <mesh position={[0, height - 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[armHalfWidth * 1.4, 0.06, 0.06]} />
        <meshStandardMaterial color={STEEL_LIGHT} metalness={0.6} roughness={0.5} />
      </mesh>

      {/* insulator strings — 3 hanging down from the crossarm */}
      {[-armHalfWidth * 0.85, 0, armHalfWidth * 0.85].map((x, i) => (
        <group key={`ins-${i}`} position={[x, height + 0.05, 0]}>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.5, 10]} />
            <meshStandardMaterial color={INSULATOR} roughness={0.25} metalness={0.05} />
          </mesh>
          {/* attachment point for the conductor (visual only) */}
          <mesh position={[0, -0.55, 0]}>
            <sphereGeometry args={[0.06, 12, 8]} />
            <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// A single conductor: catenary curve between two attachment points rendered
// as a thin tube. The sag depth scales with span so longer spans hang lower,
// matching how real transmission lines look.
function buildLineCurve(a: THREE.Vector3, b: THREE.Vector3): THREE.CatmullRomCurve3 {
  const span = a.distanceTo(b);
  const sag = Math.min(0.9, span * 0.06);
  // 5 control points so the catenary is smooth, not a triangle
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const p = a.clone().lerp(b, t);
    // parabolic sag — 0 at ends, max in the middle
    p.y -= sag * 4 * t * (1 - t);
    points.push(p);
  }
  return new THREE.CatmullRomCurve3(points);
}

function Conductor({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  // Thicker tube + slight emissive lift so the cable is visible against the
  // dark sky — otherwise the pulses look like they're floating in mid-air.
  const geom = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.035, 8, false), [curve]);
  useEffect(() => () => geom.dispose(), [geom]);
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color="#5a6478"
        emissive="#1a2536"
        emissiveIntensity={0.6}
        metalness={0.55}
        roughness={0.5}
      />
    </mesh>
  );
}

// A glowing sphere that rides along a curve at a constant speed. The trail of
// pulses on each conductor reads unmistakably as 3D — they curve with the
// catenary and shrink with perspective as they recede.
function Pulse({
  curve,
  offset,
  speed,
  reduced,
}: {
  curve: THREE.CatmullRomCurve3;
  offset: number;
  speed: number;
  reduced: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    const t = reduced
      ? offset
      : (state.clock.elapsedTime * speed + offset) % 1;
    curve.getPoint(t, tmp);
    if (meshRef.current) meshRef.current.position.copy(tmp);
    if (glowRef.current) glowRef.current.position.copy(tmp);
  });
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color={PULSE_GLOW} toneMapped={false} />
      </mesh>
      {/* additive halo for the "electric" feel */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial
          color={PULSE}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// Receding ground with a faint grid. The grid lines are the strongest visual
// cue for "this is a 3D space" — they obviously converge in perspective.
function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0a1322" roughness={0.95} metalness={0} />
      </mesh>
      <gridHelper args={[80, 40, '#1d2a44', '#0f1a2c']} position={[0, 0.005, 0]} />
    </group>
  );
}

// Camera rig: a slow orbit around the centre of the line of towers, with
// gentle vertical bob. No user input — the camera always moves so the scene
// reads as animated even on first paint.
function CameraOrbit({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  // Orbit around a point behind the foreground tower so it stays prominent
  // and the rear towers swing around it. ~38s per full revolution — fast
  // enough that motion is obvious within a glance, slow enough to feel
  // institutional.
  const target = useMemo(() => new THREE.Vector3(0, 4.5, -2), []);
  useFrame((state) => {
    if (reduced) {
      camera.position.set(8, 5.5, 8);
      camera.lookAt(target.x, target.y, target.z);
      return;
    }
    const t = state.clock.elapsedTime * 0.165;
    const radius = 10.5;
    camera.position.x = target.x + Math.sin(t) * radius;
    camera.position.z = target.z + Math.cos(t) * radius;
    camera.position.y = 5.2 + Math.sin(t * 1.4) * 0.7;
    camera.lookAt(target.x, target.y, target.z);
  });
  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  // One prominent tower in the foreground plus two receding into the scene at
  // varied depths. The depth variation is what makes the orbital camera read
  // as 3D — each tower parallaxes at a different rate as the camera moves.
  const towers: { x: number; z: number; h: number }[] = [
    { x: 0.0, z: 1.5, h: 6.8 },
    { x: -5.5, z: -4.0, h: 6.0 },
    { x: 5.5, z: -5.0, h: 6.0 },
  ];

  // Build the three conductors per span — left/centre/right insulator
  // positions match the Tower component's hard-coded crossarm spread.
  // Topology: both rear towers feed into the foreground tower (Y junction),
  // which keeps every conductor visible from any camera angle.
  const conductors = useMemo(() => {
    const armHalfWidth = 1.3;
    const insulatorDrop = 0.55;
    const xs = [-armHalfWidth * 0.85, 0, armHalfWidth * 0.85];
    const pairs: [number, number][] = [
      [1, 0], // back-left → foreground
      [2, 0], // back-right → foreground
    ];
    const curves: THREE.CatmullRomCurve3[] = [];
    for (const [aIdx, bIdx] of pairs) {
      const a = towers[aIdx];
      const b = towers[bIdx];
      for (const off of xs) {
        const start = new THREE.Vector3(a.x + off, a.h + 0.4 - insulatorDrop, a.z);
        const end = new THREE.Vector3(b.x + off, b.h + 0.4 - insulatorDrop, b.z);
        curves.push(buildLineCurve(start, end));
      }
    }
    return curves;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* atmospheric fog ties towers and ground together with depth cueing
          but stays back so lattice detail survives on the foreground tower */}
      <fog attach="fog" args={[FOG, 18, 55]} />
      <color attach="background" args={[FOG]} />

      {/* lighting — cool sky + warm rim from below for steel definition */}
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#b6d2ff', '#172238', 0.75]} />
      <directionalLight position={[6, 9, 4]} intensity={1.4} color="#ffd5a0" />
      {/* secondary cool fill from opposite side picks out the rear of the
          lattice so the bracing reads from every camera angle */}
      <directionalLight position={[-7, 5, -3]} intensity={0.5} color="#9ec3ff" />

      <Ground />

      {towers.map((t, i) => (
        <Tower key={i} position={[t.x, 0, t.z]} height={t.h} />
      ))}

      {conductors.map((curve, i) => (
        <Conductor key={i} curve={curve} />
      ))}

      {/* two pulses per conductor at staggered offsets — fewer than before so
          they read as a steady stream rather than a cluster */}
      {conductors.flatMap((curve, lineIdx) =>
        [0, 0.5].map((offset, j) => (
          <Pulse
            key={`p-${lineIdx}-${j}`}
            curve={curve}
            offset={(offset + lineIdx * 0.13) % 1}
            speed={0.22}
            reduced={reduced}
          />
        )),
      )}

      <CameraOrbit reduced={reduced} />
    </>
  );
}

// ── Public component ────────────────────────────────────────────────────────

export function PowerGridScene3D({
  className,
  eager = false,
  children,
}: {
  className?: string;
  eager?: boolean;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion() ?? false;
  const frameRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (eager) {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  return (
    <div ref={frameRef} className={cn('relative overflow-hidden', className)}>
      {/* Pre-mount and no-WebGL fallback: a tonal navy field rather than the
          source photograph (none exists for this procedural scene). */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 50% 45%, #142844 0%, #0a1729 60%, #060e1c 100%)',
        }}
      />

      {mounted && (
        <div className="absolute inset-0">
          <Canvas
            dpr={[1, 1.6]}
            shadows={false}
            camera={{ fov: 45, position: [11, 6, 9], near: 0.1, far: 80 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            style={{ display: 'block' }}
          >
            <Suspense fallback={null}>
              <Scene reduced={reduced} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Inner vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 0 140px rgba(0,0,0,0.55)' }}
        aria-hidden="true"
      />

      {children}
    </div>
  );
}
