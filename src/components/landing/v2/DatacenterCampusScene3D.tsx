import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene3DFrame } from './Scene3DFrame';

// Realistic aerial view of a hyperscale datacenter campus: parallel rows of
// long rectangular halls with rooftop HVAC + cooling units (fans spinning),
// a transmission feed coming into a substation yard with transformers and a
// gantry, a row of backup diesel generators, perimeter fence, landscaping,
// and a paved internal road. Everything in here is geometry; the orbiting
// camera resolves the layout from every angle so it reads unmistakably as a
// real site at scale.
//
// Performance budget:
//   * Canvas lazy-mounts via Scene3DFrame; dpr clamped [1, 1.6].
//   * Six halls × ~16 meshes, one substation, ~6 generators, ~16 trees,
//     2 transmission towers. Well under typical mid-tier GPU budget.

// ── Material palette (PBR-ish neutrals) ──────────────────────────────────────
const HALL_BODY = '#e0e4ec';      // light concrete-panel cladding
const HALL_ROOF = '#3a4250';      // dark grey membrane roof
const HALL_TRIM = '#b8bec9';      // accent banding around the building
const HALL_DOOR = '#1f2630';      // loading-bay doors
const HVAC_WHITE = '#dfe4ec';     // rooftop air handler box
const CHILLER_BLUE = '#9aaab8';
const FAN_BLADE = '#222831';
const STACK_GREY = '#6a7280';
const ASPHALT = '#2c3036';
const ROAD_LINE = '#e0c873';
const CONCRETE_PAD = '#a8aeb6';
const STEEL_GRID = '#5a6376';
const STEEL_LIGHT = '#7c8694';
const INSULATOR = '#dde2ea';
const TRANSFORMER_GREY = '#4f5868';
const GENERATOR_YELLOW = '#bf9a3a';
const GRASS = '#5e7d49';
const TREE_DARK = '#3c5a36';
const TREE_LIGHT = '#6a8e54';
const FENCE = '#404856';
const ACCENT_GLOW = '#f7931a';
const ACCENT_CYAN = '#22b8e6';

// ── Atoms ────────────────────────────────────────────────────────────────────

// A rooftop HVAC/CRAC unit with a slowly spinning fan blade on top. The fan
// rotation is the strongest "this is a live datacenter" cue in the scene.
function HvacUnit({
  position, size = [1.4, 0.55, 1.4], spin = 1, reduced,
}: {
  position: [number, number, number];
  size?: [number, number, number];
  spin?: number;
  reduced: boolean;
}) {
  const blade = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((s) => {
    if (blade.current && !reduced) blade.current.rotation.y = phase + s.clock.elapsedTime * spin;
  });
  const [w, h, d] = size;
  return (
    <group position={position}>
      {/* base box */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={HVAC_WHITE} roughness={0.55} metalness={0.2} />
      </mesh>
      {/* fan ring */}
      <mesh position={[0, h + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[w * 0.18, w * 0.36, 24]} />
        <meshStandardMaterial color="#1a1f28" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* spinning blades */}
      <group ref={blade} position={[0, h + 0.04, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, (i / 4) * Math.PI * 2, 0]} position={[w * 0.18, 0, 0]}>
            <boxGeometry args={[w * 0.32, 0.02, 0.08]} />
            <meshStandardMaterial color={FAN_BLADE} roughness={0.4} metalness={0.4} />
          </mesh>
        ))}
        {/* hub */}
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 12]} />
          <meshStandardMaterial color={STEEL_GRID} metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// A tall vertical chiller (cooling tower) — taller than HVAC units, with a
// big fan on top, sits in the cooling yard rather than on building roofs.
function Chiller({
  position, reduced,
}: {
  position: [number, number, number];
  reduced: boolean;
}) {
  const blade = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((s) => {
    if (blade.current && !reduced) blade.current.rotation.y = phase + s.clock.elapsedTime * 0.6;
  });
  return (
    <group position={position}>
      {/* main tower */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[1.8, 2.4, 1.8]} />
        <meshStandardMaterial color={CHILLER_BLUE} roughness={0.55} metalness={0.3} />
      </mesh>
      {/* louvers (visual band) */}
      <mesh position={[0, 1.0, 0.91]}>
        <planeGeometry args={[1.6, 1.4]} />
        <meshStandardMaterial color="#3a4452" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.0, -0.91]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.6, 1.4]} />
        <meshStandardMaterial color="#3a4452" roughness={0.85} />
      </mesh>
      {/* fan on top */}
      <group ref={blade} position={[0, 2.45, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation={[0, (i / 6) * Math.PI * 2, 0]} position={[0.4, 0, 0]}>
            <boxGeometry args={[0.72, 0.02, 0.16]} />
            <meshStandardMaterial color={FAN_BLADE} roughness={0.4} metalness={0.4} />
          </mesh>
        ))}
        <mesh>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 12]} />
          <meshStandardMaterial color={STEEL_GRID} metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// One datacenter hall: long box, dark roof with HVAC array, side-wall trim,
// loading-bay doors at the visible end, narrow accent LED band along the roof.
function Hall({
  position, size, reduced,
}: {
  position: [number, number, number];
  size: [number, number, number]; // [W, H, D]
  reduced: boolean;
}) {
  const [W, H, D] = size;
  // HVAC array: rows × cols on the roof, count proportional to building size.
  const hvac = useMemo(() => {
    const items: { x: number; z: number; spin: number }[] = [];
    const cols = Math.max(2, Math.floor(W / 3.2));
    const rows = Math.max(1, Math.floor(D / 4.5));
    const stepX = W / (cols + 1);
    const stepZ = D / (rows + 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({
          x: -W / 2 + stepX * (c + 1),
          z: -D / 2 + stepZ * (r + 1),
          spin: 0.6 + Math.random() * 0.6,
        });
      }
    }
    return items;
  }, [W, D]);

  return (
    <group position={position}>
      {/* body */}
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color={HALL_BODY} roughness={0.7} metalness={0.05} />
      </mesh>
      {/* horizontal trim band */}
      <mesh position={[0, H * 0.85, 0]}>
        <boxGeometry args={[W + 0.02, 0.18, D + 0.02]} />
        <meshStandardMaterial color={HALL_TRIM} roughness={0.6} metalness={0.15} />
      </mesh>
      {/* membrane roof — slightly inset so the parapet shows */}
      <mesh position={[0, H + 0.02, 0]}>
        <boxGeometry args={[W * 0.985, 0.04, D * 0.985]} />
        <meshStandardMaterial color={HALL_ROOF} roughness={0.9} metalness={0.05} />
      </mesh>
      {/* loading-bay doors on the visible long side */}
      {[-W * 0.32, -W * 0.1, W * 0.12, W * 0.34].map((x, i) => (
        <mesh key={i} position={[x, H * 0.32, D / 2 + 0.001]}>
          <planeGeometry args={[1.6, H * 0.55]} />
          <meshStandardMaterial color={HALL_DOOR} roughness={0.75} metalness={0.2} />
        </mesh>
      ))}
      {/* roof-edge accent LED strip — daytime visible as a thin cyan band */}
      <mesh position={[0, H + 0.05, D / 2 + 0.005]}>
        <planeGeometry args={[W * 0.96, 0.06]} />
        <meshStandardMaterial color="#0a141f" emissive={ACCENT_CYAN} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      {/* rooftop HVAC units */}
      {hvac.map((u, i) => (
        <HvacUnit key={i} position={[u.x, H + 0.04, u.z]} spin={u.spin} reduced={reduced} />
      ))}
      {/* two taller exhaust stacks per hall */}
      {[-W * 0.32, W * 0.32].map((x, i) => (
        <mesh key={i} position={[x, H + 0.45, -D * 0.34]}>
          <cylinderGeometry args={[0.18, 0.22, 0.9, 12]} />
          <meshStandardMaterial color={STACK_GREY} roughness={0.55} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// Transformer with three bushings on top.
function Transformer({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color={TRANSFORMER_GREY} roughness={0.55} metalness={0.4} />
      </mesh>
      {/* radiator fins on sides (visual hint) */}
      <mesh position={[0.62, 0.6, 0]}>
        <boxGeometry args={[0.05, 1.0, 1.0]} />
        <meshStandardMaterial color="#3a424e" roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh position={[-0.62, 0.6, 0]}>
        <boxGeometry args={[0.05, 1.0, 1.0]} />
        <meshStandardMaterial color="#3a424e" roughness={0.7} metalness={0.5} />
      </mesh>
      {/* bushings */}
      {[-0.35, 0, 0.35].map((x, i) => (
        <group key={i} position={[x, 1.3, 0]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.08, 0.45, 10]} />
            <meshStandardMaterial color={INSULATOR} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.27, 0]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color={STEEL_GRID} metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Substation yard: gantry uprights with a crossbeam, three transformers,
// concrete pad, gravel surround.
function Substation({ position, reduced }: { position: [number, number, number]; reduced: boolean }) {
  return (
    <group position={position}>
      {/* gravel pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#7c7368" roughness={0.95} />
      </mesh>
      {/* concrete strip in the middle */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[8.5, 0.1, 2.2]} />
        <meshStandardMaterial color={CONCRETE_PAD} roughness={0.85} />
      </mesh>
      {/* three transformers in a row */}
      {[-2.6, 0, 2.6].map((x, i) => (
        <Transformer key={i} position={[x, 0.1, 0]} />
      ))}
      {/* gantry: 4 uprights + 2 crossbeams */}
      {[-4.2, -1.4, 1.4, 4.2].map((x, i) => (
        <mesh key={i} position={[x, 1.4, -2.3]}>
          <cylinderGeometry args={[0.07, 0.07, 2.8, 8]} />
          <meshStandardMaterial color={STEEL_LIGHT} metalness={0.55} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 2.75, -2.3]}>
        <boxGeometry args={[9.2, 0.1, 0.1]} />
        <meshStandardMaterial color={STEEL_LIGHT} metalness={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.35, -2.3]}>
        <boxGeometry args={[9.2, 0.06, 0.06]} />
        <meshStandardMaterial color={STEEL_LIGHT} metalness={0.55} roughness={0.5} />
      </mesh>
      {/* insulator strings hanging from crossbeam, three per transformer */}
      {[-2.6, 0, 2.6].map((x, t) =>
        [-0.35, 0, 0.35].map((dx, i) => (
          <mesh key={`${t}-${i}`} position={[x + dx, 2.45, -2.3]}>
            <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
            <meshStandardMaterial color={INSULATOR} roughness={0.25} />
          </mesh>
        )),
      )}
      {/* small status lamp pulsing on the gantry */}
      <StatusLamp position={[-4.2, 2.85, -2.3]} color={ACCENT_GLOW} reduced={reduced} />
      <StatusLamp position={[4.2, 2.85, -2.3]} color={ACCENT_GLOW} reduced={reduced} />
    </group>
  );
}

function StatusLamp({
  position, color, reduced,
}: { position: [number, number, number]; color: string; reduced: boolean }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((s) => {
    if (!mat.current) return;
    mat.current.emissiveIntensity = reduced ? 1.0 : 0.6 + Math.abs(Math.sin(s.clock.elapsedTime * 1.4)) * 1.4;
  });
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshStandardMaterial ref={mat} color="#0a0d12" emissive={color} emissiveIntensity={1.0} toneMapped={false} />
    </mesh>
  );
}

// Backup diesel generator: rectangular yellow enclosure with vents.
function Generator({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* concrete pad */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2.4, 0.1, 1.2]} />
        <meshStandardMaterial color={CONCRETE_PAD} roughness={0.85} />
      </mesh>
      {/* enclosure */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[2.2, 1.1, 1.0]} />
        <meshStandardMaterial color={GENERATOR_YELLOW} roughness={0.6} metalness={0.25} />
      </mesh>
      {/* radiator vent on the front */}
      <mesh position={[0, 0.65, 0.51]}>
        <planeGeometry args={[1.6, 0.7]} />
        <meshStandardMaterial color="#231d10" roughness={0.85} />
      </mesh>
      {/* exhaust stack */}
      <mesh position={[0.85, 1.45, -0.3]}>
        <cylinderGeometry args={[0.07, 0.09, 0.7, 10]} />
        <meshStandardMaterial color={STACK_GREY} roughness={0.5} metalness={0.45} />
      </mesh>
    </group>
  );
}

// Low-poly tree (cone over short trunk) for landscaping.
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.5, 6]} />
        <meshStandardMaterial color="#4a352a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <coneGeometry args={[0.7, 1.6, 8]} />
        <meshStandardMaterial color={TREE_DARK} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <coneGeometry args={[0.5, 1.2, 8]} />
        <meshStandardMaterial color={TREE_LIGHT} roughness={0.95} />
      </mesh>
    </group>
  );
}

// One transmission tower with a single conductor running to the next.
function TransmissionTower({ position }: { position: [number, number, number] }) {
  const h = 5;
  return (
    <group position={position}>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const bx = Math.cos(a) * 0.45;
        const bz = Math.sin(a) * 0.45;
        const tx = Math.cos(a) * 0.12;
        const tz = Math.sin(a) * 0.12;
        const dir = new THREE.Vector3(tx - bx, h, tz - bz);
        const len = dir.length();
        const mid = new THREE.Vector3((bx + tx) / 2, h / 2, (bz + tz) / 2);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        return (
          <mesh key={i} position={mid.toArray()} quaternion={q.toArray() as [number, number, number, number]}>
            <cylinderGeometry args={[0.04, 0.05, len, 6]} />
            <meshStandardMaterial color={STEEL_GRID} metalness={0.55} roughness={0.55} />
          </mesh>
        );
      })}
      {/* crossarm */}
      <mesh position={[0, h + 0.3, 0]}>
        <boxGeometry args={[2.6, 0.07, 0.07]} />
        <meshStandardMaterial color={STEEL_GRID} metalness={0.6} roughness={0.5} />
      </mesh>
      {/* three insulator strings */}
      {[-1.0, 0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, h + 0.05, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.5, 8]} />
          <meshStandardMaterial color={INSULATOR} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

// Catenary conductor between two points + an animated current pulse.
function ConductorWithPulse({
  start, end, reduced,
}: { start: THREE.Vector3; end: THREE.Vector3; reduced: boolean }) {
  const curve = useMemo(() => {
    const span = start.distanceTo(end);
    const sag = Math.min(0.9, span * 0.04);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const p = start.clone().lerp(end, t);
      p.y -= sag * 4 * t * (1 - t);
      pts.push(p);
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [start, end]);
  const geom = useMemo(() => new THREE.TubeGeometry(curve, 32, 0.022, 6, false), [curve]);
  const pulse = useRef<THREE.Mesh>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((s) => {
    if (!pulse.current) return;
    const t = reduced ? 0.6 : (1 - ((s.clock.elapsedTime * 0.22) % 1));
    curve.getPoint(t, tmp);
    pulse.current.position.copy(tmp);
  });
  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial color="#1f2530" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color={ACCENT_GLOW} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── Ground + landscaping ─────────────────────────────────────────────────────

function Ground() {
  return (
    <group>
      {/* grass field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={GRASS} roughness={1} metalness={0} />
      </mesh>
      {/* asphalt site footprint — wide rectangle covering the campus */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[78, 60]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* internal road dashed centre lines */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[-22 + i * 4.4, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 0.18]} />
          <meshStandardMaterial color={ROAD_LINE} roughness={0.7} emissive={ROAD_LINE} emissiveIntensity={0.1} />
        </mesh>
      ))}
      {/* parking-lot rows at the front */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} position={[-19 + i * 2.4, 0.02, 27]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.08, 3]} />
          <meshStandardMaterial color="#9aa1ac" />
        </mesh>
      ))}
    </group>
  );
}

// Perimeter fence — a series of short posts + a thin top rail.
function Fence({ corners }: { corners: [number, number][] }) {
  // build segment lines between consecutive corners
  return (
    <group>
      {corners.map((c, i) => {
        const n = corners[(i + 1) % corners.length];
        const dx = n[0] - c[0];
        const dz = n[1] - c[1];
        const len = Math.hypot(dx, dz);
        const cx = (c[0] + n[0]) / 2;
        const cz = (c[1] + n[1]) / 2;
        const rotY = -Math.atan2(dz, dx);
        const posts = Math.floor(len / 2.4);
        return (
          <group key={i} position={[cx, 0, cz]} rotation={[0, rotY, 0]}>
            {/* top rail */}
            <mesh position={[0, 1.05, 0]}>
              <boxGeometry args={[len, 0.04, 0.04]} />
              <meshStandardMaterial color={FENCE} roughness={0.6} metalness={0.4} />
            </mesh>
            {/* posts */}
            {Array.from({ length: posts }).map((_, p) => (
              <mesh key={p} position={[-len / 2 + (p + 0.5) * (len / posts), 0.55, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
                <meshStandardMaterial color={FENCE} roughness={0.6} metalness={0.4} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

// ── Scene ────────────────────────────────────────────────────────────────────

function CameraOrbit({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 2.5, 0), []);
  useFrame((state) => {
    if (reduced) {
      camera.position.set(34, 22, 28);
      camera.lookAt(target.x, target.y, target.z);
      return;
    }
    // ~45-second revolution; subtle altitude bob for cinematic feel.
    const t = state.clock.elapsedTime * 0.14;
    const radius = 42;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = 21 + Math.sin(t * 1.2) * 1.5;
    camera.lookAt(target.x, target.y, target.z);
  });
  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  // Six halls in two parallel rows. Hall footprint chosen to look like real
  // hyperscale halls (long, low, wide aisles between them).
  const HALL_W = 20;
  const HALL_H = 5.2;
  const HALL_D = 9;
  const halls = useMemo<{ position: [number, number, number]; size: [number, number, number] }[]>(() => {
    const rowZ = [-10.5, 10.5];
    const colX = [-22, 0, 22];
    const items: { position: [number, number, number]; size: [number, number, number] }[] = [];
    for (const z of rowZ) {
      for (const x of colX) items.push({ position: [x, 0, z], size: [HALL_W, HALL_H, HALL_D] });
    }
    return items;
  }, []);

  const chillers = useMemo<[number, number, number][]>(() => [
    [-29, 0, 0], [-26, 0, 0], [-23, 0, 0],
    [29, 0, 0], [26, 0, 0], [23, 0, 0],
  ], []);

  const generators = useMemo<[number, number, number][]>(() => [
    [-12, 0, 22], [-7.5, 0, 22], [-3, 0, 22], [3, 0, 22], [7.5, 0, 22], [12, 0, 22],
  ], []);

  // Landscaping along the front
  const trees = useMemo<{ pos: [number, number, number]; scale: number }[]>(() => {
    const items: { pos: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const x = -36 + i * 5.2;
      items.push({ pos: [x, 0, 31], scale: 0.9 + (i % 3) * 0.12 });
    }
    return items;
  }, []);

  // Perimeter fence corners (CCW)
  const fenceCorners: [number, number][] = useMemo(() => [
    [-38, 30], [38, 30], [38, -30], [-38, -30],
  ], []);

  // Transmission feed: two towers carrying a power line into the substation
  const tower1 = new THREE.Vector3(-38, 0, 0);
  const tower2 = new THREE.Vector3(-44, 0, -12);
  const subTie = new THREE.Vector3(-30, 3.0, 0);

  return (
    <>
      {/* Bright clear daytime — bright by request, realistic palette */}
      <color attach="background" args={['#cfe2f3']} />
      <fog attach="fog" args={['#cfe2f3', 60, 160]} />

      {/* Lighting: high sun + open-sky fill + opposite-side cool fill */}
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#eaf4ff', '#5e7d49', 0.95]} />
      <directionalLight position={[20, 28, 14]} intensity={1.55} color="#fff4dc" />
      <directionalLight position={[-15, 12, -8]} intensity={0.4} color="#aac8ff" />

      <Ground />

      {halls.map((h, i) => (
        <Hall key={i} position={h.position} size={h.size} reduced={reduced} />
      ))}

      {/* Cooling yards either side of the campus */}
      {chillers.map((p, i) => <Chiller key={i} position={p} reduced={reduced} />)}

      {/* Substation in the middle of the west side, between the two hall rows */}
      <Substation position={[-30, 0, 0]} reduced={reduced} />

      {/* Generator row along the south edge */}
      {generators.map((p, i) => <Generator key={i} position={p} />)}

      {/* Transmission feed coming in from off-site */}
      <TransmissionTower position={tower1.toArray()} />
      <TransmissionTower position={tower2.toArray()} />
      <ConductorWithPulse
        start={new THREE.Vector3(tower2.x, tower2.y + 5.3, tower2.z)}
        end={new THREE.Vector3(tower1.x, tower1.y + 5.3, tower1.z)}
        reduced={reduced}
      />
      <ConductorWithPulse
        start={new THREE.Vector3(tower1.x, tower1.y + 5.3, tower1.z)}
        end={subTie}
        reduced={reduced}
      />

      {/* Landscaping + perimeter fence */}
      {trees.map((t, i) => <Tree key={i} position={t.pos} scale={t.scale} />)}
      <Fence corners={fenceCorners} />

      <CameraOrbit reduced={reduced} />
    </>
  );
}

export function DatacenterCampusScene3D({
  className,
  eager = false,
  overlay,
}: {
  className?: string;
  eager?: boolean;
  overlay?: ReactNode;
}) {
  return (
    <Scene3DFrame
      className={className}
      eager={eager}
      camera={{ fov: 42, position: [34, 22, 28], near: 0.1, far: 200 }}
      fallback="linear-gradient(180deg, #cfe2f3 0%, #aac4dc 55%, #5e7d49 56%, #4d6b40 100%)"
      overlay={overlay}
    >
      {(reduced) => <Scene reduced={reduced} />}
    </Scene3DFrame>
  );
}
