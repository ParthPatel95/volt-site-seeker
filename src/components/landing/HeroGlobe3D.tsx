import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  PIPELINE_PROJECTS, HQ, ENERGY_TYPE_COLORS, type PipelineProject,
} from '@/data/advisory-pipeline';
import { latLngToVec3, greatCircleArc, mwToMarkerSize } from '@/lib/globe-math';

// Landing-page hero globe. Every marker and arc maps 1:1 to a row in
// src/data/advisory-pipeline.ts — the same source the Advisory page renders —
// so the animation can never drift from the published pipeline numbers.
//
// Performance contract (the "no glitches or lag" rule):
//   * dpr clamped to [1, 1.75]; ~7 markers + 7 arcs + 2 spheres = tiny scene.
//   * The render loop pauses when the canvas leaves the viewport or the tab
//     is hidden (IntersectionObserver + visibilitychange via `active` flag).
//   * No OrbitControls zoom — the page must own the scroll wheel.
//   * Pointer parallax is spring-damped in the frame loop, not React state.

const GLOBE_RADIUS = 2;
const MAX_MW = Math.max(...PIPELINE_PROJECTS.map((p) => p.capacityMw));

function Globe() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshStandardMaterial color="#0A1628" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* graticule */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.003, 36, 24]} />
        <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.08} />
      </mesh>
      {/* atmosphere: slightly larger back-face shell, additive */}
      <mesh scale={1.12}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#10a5c7" transparent opacity={0.07}
          side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function SiteMarker({
  project, hovered, onHover,
}: {
  project: PipelineProject;
  hovered: boolean;
  onHover: (id: string | null) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const pos = useMemo(
    () => latLngToVec3(project.lat, project.lng, GLOBE_RADIUS * 1.012),
    [project.lat, project.lng],
  );
  const size = mwToMarkerSize(project.capacityMw, MAX_MW);
  const color = ENERGY_TYPE_COLORS[project.energyType]?.hex ?? '#F7931A';

  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + pos.x * 3) * 0.08;
    const target = (hovered ? 1.5 : 1) * pulse;
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, target, 0.15));
  });

  return (
    <group ref={ref} position={[pos.x, pos.y, pos.z]}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onHover(project.id); }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh scale={1.8}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial
          color={color} transparent opacity={0.25}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>
      {hovered && (
        <Html center distanceFactor={6} style={{ pointerEvents: 'none' }} position={[0, size * 3, 0]}>
          <div className="px-3 py-2 rounded-lg bg-background/95 border border-border shadow-xl whitespace-nowrap text-center">
            <div className="text-base leading-none mb-1">{project.flagEmoji}</div>
            <div className="text-xs font-semibold text-foreground">{project.location}</div>
            <div className="text-xs font-bold" style={{ color }}>{project.capacityMw} MW · {project.energyType}</div>
            <div className="text-[10px] text-muted-foreground">{project.status}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function EnergyArc({ project }: { project: PipelineProject }) {
  const points = useMemo(() => {
    const pts = greatCircleArc(
      { lat: HQ.lat, lng: HQ.lng },
      { lat: project.lat, lng: project.lng },
      GLOBE_RADIUS * 1.01,
      48,
    );
    return pts.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  }, [project.lat, project.lng]);
  const color = ENERGY_TYPE_COLORS[project.energyType]?.hex ?? '#F7931A';

  // Animated flow pulse riding the arc.
  const pulseRef = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((state) => {
    if (!pulseRef.current) return;
    const t = (Math.sin(state.clock.elapsedTime * 0.6 + offset) + 1) / 2; // 0..1
    const idx = Math.min(points.length - 1, Math.floor(t * (points.length - 1)));
    pulseRef.current.position.copy(points[idx]);
  });

  return (
    <group>
      <Line points={points} color={color} lineWidth={1.2} transparent opacity={0.45} />
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function Scene({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    if (!group.current || !active) return;
    // Slow base rotation + gentle pointer parallax, all damped in-loop so
    // there is never a React re-render per frame.
    group.current.rotation.y += delta * 0.06;
    const targetX = pointer.current.y * 0.12;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.04);
  });

  const hqPos = useMemo(() => latLngToVec3(HQ.lat, HQ.lng, GLOBE_RADIUS * 1.012), []);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} />
      <Stars radius={60} depth={30} count={1500} factor={3} saturation={0} fade speed={0.5} />

      <group ref={group} rotation={[0.25, 2.4, 0]}>
        <Globe />
        {/* HQ beacon */}
        <mesh position={[hqPos.x, hqPos.y, hqPos.z]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {PIPELINE_PROJECTS.map((p) => (
          <EnergyArc key={`arc-${p.id}`} project={p} />
        ))}
        {PIPELINE_PROJECTS.map((p) => (
          <SiteMarker key={p.id} project={p} hovered={hovered === p.id} onHover={setHovered} />
        ))}
      </group>
    </>
  );
}

export default function HeroGlobe3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  // Pause the frame loop when offscreen or the tab is hidden — keeps the
  // landing page idle-cheap and prevents background jank.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  const active = inView && tabVisible;

  return (
    <div ref={wrapRef} className="w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.6, 6.2], fov: 42 }}
        dpr={[1, 1.75]}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Scene active={active} />
      </Canvas>
    </div>
  );
}
