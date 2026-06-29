import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * EnergyToComputeScene3D — a genuinely-3D react-three-fiber scene for the
 * "Hidden energy in. Productive compute out." payoff panel.
 *
 * Story (left -> right): a stream of glowing ORANGE energy particles flows in
 * from the left ("hidden energy in") and converges into a volumetric TEAL
 * lattice of instanced compute nodes that light up in a travelling wave
 * ("the datacenters behind modern AI switching on"). Additive pulses ride the
 * connecting struts; a navy base slab + soft ground glow anchor the cluster on
 * the near-white page. A slow orbital parallax reveals the lattice has real
 * depth (3 layers). Phase-based + seamless (no restart pop). Light brand theme.
 *
 * Stack: react-three-fiber v8 + three r160. No drei, no postprocessing — glow
 * is emissive material + additive billboard sprite halos, NOT a bloom pass.
 * Reduced-motion safe (renders one representative static frame, no rAF churn).
 */

// -- Brand palette -----------------------------------------------------------
const ORANGE = new THREE.Color('#F7931A'); // power / energy
const TEAL = new THREE.Color('#10a5c7'); //   data / AI / compute
const NAVY = new THREE.Color('#13203d'); //   deep contrast accent
const BG = new THREE.Color('#f4f7fb'); //     near-white page background + fog

// -- Lattice dimensions (volumetric: X wide, Y tall, Z deep) -----------------
const LX = 4; // columns
const LY = 4; // rows
const LZ = 3; // depth layers -> reveals 3D under parallax
const NODE_COUNT = LX * LY * LZ;
const SPACING = 0.62;
const LATTICE_X = 1.25; // world-x where the lattice sits (right of centre)

// Energy stream
const PARTICLE_COUNT = 44;
// Travelling pulses on the struts
const PULSES = 10;

// ---------------------------------------------------------------------------
// A soft radial-gradient alpha texture for additive glow sprites. Built once.
function makeGlowTexture(): THREE.Texture {
  const size = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(cv);
  tex.needsUpdate = true;
  return tex;
}

// Per-node static layout, precomputed once.
type NodeInfo = { pos: THREE.Vector3; wave: number };
function buildNodes(): NodeInfo[] {
  const out: NodeInfo[] = [];
  for (let z = 0; z < LZ; z++) {
    for (let y = 0; y < LY; y++) {
      for (let x = 0; x < LX; x++) {
        const px = LATTICE_X + (x - (LX - 1) / 2) * SPACING;
        const py = (y - (LY - 1) / 2) * SPACING;
        const pz = (z - (LZ - 1) / 2) * SPACING;
        // wave phase travels diagonally through the volume (front-left -> back-right)
        const wave = (x + y + z) / (LX + LY + LZ);
        out.push({ pos: new THREE.Vector3(px, py, pz), wave });
      }
    }
  }
  return out;
}

// Smooth activation amount (0..1) for a node at clock time t. Shared by the
// live loop AND the static reduced-motion frame so both render identically.
function nodeActivation(wave: number, t: number): number {
  const phaseRaw = (t * 0.28 - wave) % 1;
  const band = phaseRaw < 0 ? phaseRaw + 1 : phaseRaw;
  return Math.pow(Math.max(0, 1 - Math.abs(band - 0.5) * 2.4), 2);
}

// ===========================================================================
// Instanced lattice of compute nodes + their additive billboard halos.
function ComputeLattice({
  nodes,
  glowTex,
  animate,
  runningRef,
}: {
  nodes: NodeInfo[];
  glowTex: THREE.Texture;
  animate: boolean;
  runningRef: React.MutableRefObject<boolean>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const haloRef = useRef<THREE.InstancedMesh>(null);
  const { camera, invalidate } = useThree();

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const haloDummy = useMemo(() => new THREE.Object3D(), []);
  const scratch = useMemo(() => new THREE.Color(), []);
  // Dim baseline colour (navy-tinted slate) so the lattice always reads as a
  // solid object on the light panel, even where the wave isn't passing.
  const idleCol = useMemo(() => new THREE.Color('#cdd7e6').lerp(NAVY, 0.18), []);

  // Place + colour every instance for clock time t. Called from a mount effect
  // (so the reduced-motion static frame is correct) and every animated frame.
  const placeAll = (t: number) => {
    const mesh = meshRef.current;
    const halo = haloRef.current;
    if (!mesh) return;

    for (let i = 0; i < NODE_COUNT; i++) {
      const n = nodes[i];
      const lit = nodeActivation(n.wave, t);

      const s = 0.17 + lit * 0.05;
      dummy.position.copy(n.pos);
      dummy.scale.setScalar(s);
      dummy.rotation.set(0, 0, 0); // keep nodes crisp + axis-aligned (no spin)
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Colour: idle navy-slate -> bright teal as the wave front passes. Driving
      // brightness through instanceColor (not a constant emissive) is what makes
      // the wave legible on a near-white background.
      scratch.copy(idleCol).lerp(TEAL, 0.18 + lit * 0.82);
      mesh.setColorAt(i, scratch);

      if (halo) {
        const hs = 0.3 + lit * 0.5;
        haloDummy.position.copy(n.pos);
        haloDummy.quaternion.copy(camera.quaternion); // billboard toward camera
        haloDummy.scale.setScalar(hs);
        haloDummy.updateMatrix();
        halo.setMatrixAt(i, haloDummy.matrix);
        // Additive halo: faint when idle, bright teal as the wave passes.
        scratch.copy(TEAL).multiplyScalar(0.12 + lit * 0.88);
        halo.setColorAt(i, scratch);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (halo) {
      halo.instanceMatrix.needsUpdate = true;
      if (halo.instanceColor) halo.instanceColor.needsUpdate = true;
    }
  };

  // Mount: seed instanceColor buffers + place the representative frame, then
  // invalidate so a demand frameloop (reduced motion) actually paints it.
  useEffect(() => {
    const mesh = meshRef.current;
    const halo = haloRef.current;
    if (mesh) for (let i = 0; i < NODE_COUNT; i++) mesh.setColorAt(i, idleCol);
    if (halo) for (let i = 0; i < NODE_COUNT; i++) halo.setColorAt(i, TEAL);
    if (mesh?.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (halo?.instanceColor) halo.instanceColor.needsUpdate = true;
    placeAll(animate ? 0 : 1.9); // 1.9 = a lively, well-lit representative frame
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    if (!animate || !runningRef.current) return;
    placeAll(state.clock.elapsedTime);
  });

  return (
    <group>
      {/* solid emissive node cubes */}
      <instancedMesh ref={meshRef} args={[undefined as never, undefined as never, NODE_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          vertexColors
          emissive={TEAL}
          emissiveIntensity={0.35}
          roughness={0.35}
          metalness={0.1}
          toneMapped={false}
        />
      </instancedMesh>
      {/* (additive billboard "halos" removed — additive glow is invisible on a
          near-white background and produced dark fringing where it overlapped
          the cubes; the solid emissive cubes carry the lattice on their own.) */}
    </group>
  );
}

// ===========================================================================
// Static strut connections (one merged BufferGeometry) + additive pulses that
// travel along a subset of edges.
function Connections({
  nodes,
  glowTex,
  animate,
  runningRef,
}: {
  nodes: NodeInfo[];
  glowTex: THREE.Texture;
  animate: boolean;
  runningRef: React.MutableRefObject<boolean>;
}) {
  const { camera, invalidate } = useThree();

  // Build axis-aligned adjacency edges once -> a clean lattice.
  const { lineGeo, edges } = useMemo(() => {
    const idx = (x: number, y: number, z: number) => z * LX * LY + y * LX + x;
    const e: [number, number][] = [];
    for (let z = 0; z < LZ; z++)
      for (let y = 0; y < LY; y++)
        for (let x = 0; x < LX; x++) {
          if (x + 1 < LX) e.push([idx(x, y, z), idx(x + 1, y, z)]);
          if (y + 1 < LY) e.push([idx(x, y, z), idx(x, y + 1, z)]);
          if (z + 1 < LZ) e.push([idx(x, y, z), idx(x, y, z + 1)]);
        }
    const positions = new Float32Array(e.length * 2 * 3);
    e.forEach(([a, b], i) => {
      nodes[a].pos.toArray(positions, i * 6);
      nodes[b].pos.toArray(positions, i * 6 + 3);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { lineGeo: geo, edges: e };
  }, [nodes]);

  useEffect(() => () => lineGeo.dispose(), [lineGeo]);

  const pulseRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scratch = useMemo(() => new THREE.Color(), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  const p = useMemo(() => new THREE.Vector3(), []);

  const pulseEdges = useMemo(
    () =>
      Array.from({ length: PULSES }, (_, i) => ({
        edge: (i * 7) % edges.length,
        offset: i / PULSES,
        warm: i % 4 === 0, // a few orange "energy" pulses among teal data pulses
      })),
    [edges.length],
  );

  const placeAll = (t: number) => {
    const m = pulseRef.current;
    if (!m) return;
    pulseEdges.forEach((pe, i) => {
      const [ai, bi] = edges[pe.edge];
      a.copy(nodes[ai].pos);
      b.copy(nodes[bi].pos);
      const tt = (t * 0.5 + pe.offset) % 1; // seamless travel
      p.lerpVectors(a, b, tt);
      const fade = Math.sin(tt * Math.PI); // fade at edge ends
      dummy.position.copy(p);
      dummy.quaternion.copy(camera.quaternion);
      // brighter (larger) at the strut midpoint; colour is the uniform orange
      // material — do NOT set instanceColor here (an instanceColor attribute is
      // applied even without vertexColors, and teal×orange would read green).
      dummy.scale.setScalar((0.12 + fade * 0.12) * 0.85);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    placeAll(animate ? 0 : 1.9);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulseEdges]);

  useFrame((state) => {
    if (!animate || !runningRef.current) return;
    placeAll(state.clock.elapsedTime);
  });

  return (
    <group>
      <lineSegments geometry={lineGeo}>
        {/* warmed-up navy struts, opacity bumped so the lattice reads as solid */}
        <lineBasicMaterial color={NAVY} transparent opacity={0.32} />
      </lineSegments>
      {/* solid unlit orange energy pulses travelling the struts (uniform colour
          — reads cleanly on the light background) */}
      <instancedMesh ref={pulseRef} args={[undefined as never, undefined as never, PULSES]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="#F7931A" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// ===========================================================================
// Orange energy particles streaming in from the left and converging into the
// lattice's leading face. Instanced additive quads.
function EnergyStream({
  glowTex,
  animate,
  runningRef,
}: {
  glowTex: THREE.Texture;
  animate: boolean;
  runningRef: React.MutableRefObject<boolean>;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { camera, invalidate } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scratch = useMemo(() => new THREE.Color(), []);
  const start = useMemo(() => new THREE.Vector3(), []);
  const end = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);

  // Per-particle stable randomness.
  const seeds = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        offset: i / PARTICLE_COUNT,
        y: Math.sin(i * 12.9898) * 0.5 * 1.3, // spread vertically at the source
        z: Math.cos(i * 7.233) * 0.5 * 1.0,
        speed: 0.12 + (((i * 13) % 7) / 7) * 0.06,
      })),
    [],
  );

  const placeAll = (t: number) => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const s = seeds[i];
      const phase = (t * (0.18 + s.speed) + s.offset) % 1;
      // source: nearer-left (kept inside the fog so "energy in" stays visible),
      // converge point: the lattice leading face.
      start.set(-2.2, s.y, s.z - 0.2);
      end.set(LATTICE_X - SPACING * 1.6, s.y * 0.25, s.z * 0.25);
      pos.lerpVectors(start, end, phase);
      // gentle sine sway, damped as the stream converges
      pos.y += Math.sin(t * 2 + i) * 0.06 * (1 - phase);

      const fade = Math.sin(Math.min(1, phase * 1.05) * Math.PI);
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.085 + fade * 0.07);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  };

  useEffect(() => {
    // No setColorAt: the particles use the uniform orange material. Adding an
    // instanceColor attribute would multiply orange×orange (and break the hue).
    placeAll(animate ? 0 : 1.9);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    if (!animate || !runningRef.current) return;
    placeAll(state.clock.elapsedTime);
  });

  return (
    <instancedMesh ref={ref} args={[undefined as never, undefined as never, PARTICLE_COUNT]}>
      {/* Solid unlit orange spheres — crisp and guaranteed-visible on the light
          background (a soft additive/alpha glow sprite reads as a dark blob on
          near-white). Uniform material colour (instanceColor on an unlit basic
          material did not take); the fade is carried by per-instance scale. */}
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#F7931A" toneMapped={false} />
    </instancedMesh>
  );
}

// ===========================================================================
// Navy base slab + soft teal ground glow (grafted from the StrandedMW concept)
// to anchor the cluster and add brand contrast on the near-white panel.
function Anchor({ glowTex }: { glowTex: THREE.Texture }) {
  return (
    <group>
      {/* navy contrast slab beneath the lattice */}
      <mesh position={[LATTICE_X, -(LY / 2) * SPACING - 0.18, 0]}>
        <boxGeometry args={[LX * SPACING + 0.5, 0.12, LZ * SPACING + 0.5]} />
        <meshStandardMaterial color={NAVY} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* faint teal ground-glow halo for an "alive" feel (flat additive quad
          lying just above the slab) */}
      <mesh
        position={[LATTICE_X, -(LY / 2) * SPACING - 0.05, 0.1]}
        rotation={[-Math.PI / 2.1, 0, 0]}
      >
        <planeGeometry args={[LX * SPACING + 2.2, LZ * SPACING + 1.8]} />
        <meshBasicMaterial
          map={glowTex}
          color={TEAL}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// ===========================================================================
// Slow orbital camera parallax — reveals the lattice is volumetric. Frozen at a
// flattering angle under reduced motion.
function CameraRig({
  animate,
  runningRef,
}: {
  animate: boolean;
  runningRef: React.MutableRefObject<boolean>;
}) {
  const { camera, invalidate } = useThree();

  const apply = (t: number) => {
    const r = 5.6;
    const ang = Math.sin(t * 0.12) * 0.42; // gentle yaw sweep
    camera.position.x = 0.4 + Math.sin(ang) * r * 0.18;
    camera.position.y = 0.35 + Math.sin(t * 0.16) * 0.18;
    camera.position.z = r;
    camera.lookAt(0.5, 0, 0);
  };

  useEffect(() => {
    apply(0.6); // representative angle for both the first frame and static mode
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    if (!animate || !runningRef.current) return;
    apply(state.clock.elapsedTime);
  });

  return null;
}

// ===========================================================================
// Inner scene contents (inside <Canvas>).
function Scene({
  animate,
  glowTex,
  runningRef,
}: {
  animate: boolean;
  glowTex: THREE.Texture;
  runningRef: React.MutableRefObject<boolean>;
}) {
  const nodes = useMemo(() => buildNodes(), []);

  return (
    <>
      <color attach="background" args={[BG.r, BG.g, BG.b]} />
      {/* fog matches background; far plane pushed out so the orange "energy in"
          stream on the left is NOT washed into the near-white background */}
      <fog attach="fog" args={[BG.getHex(), 9, 18]} />

      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 4, 5]} intensity={0.8} color={'#ffffff'} />
      <directionalLight position={[-4, -1, 2]} intensity={0.3} color={ORANGE} />

      <CameraRig animate={animate} runningRef={runningRef} />
      <Anchor glowTex={glowTex} />
      <EnergyStream glowTex={glowTex} animate={animate} runningRef={runningRef} />
      <Connections nodes={nodes} glowTex={glowTex} animate={animate} runningRef={runningRef} />
      <ComputeLattice nodes={nodes} glowTex={glowTex} animate={animate} runningRef={runningRef} />
    </>
  );
}

// ===========================================================================
export default function EnergyToComputeScene3D({ className }: { className?: string }) {
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const runningRef = useRef(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  // prefers-reduced-motion (guarded for SSR / non-browser environments)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Pause per-frame work when the panel scrolls off-screen (battery saver).
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

  // One soft glow texture for every additive sprite; disposed on unmount.
  const glowTex = useMemo(() => makeGlowTexture(), []);
  useEffect(() => () => glowTex.dispose(), [glowTex]);

  const animate = !reduced && visible;

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0.4, 0.35, 5.6], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        // Animate when in view; under reduced motion (or off-screen) drop to a
        // single representative frame with no rAF churn.
        frameloop={animate ? 'always' : 'demand'}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene animate={animate} glowTex={glowTex} runningRef={runningRef} />
      </Canvas>
    </div>
  );
}