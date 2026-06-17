import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene3DFrame } from './Scene3DFrame';

// The hero centrepiece — a luminous "compute core" that tells the WattByte
// story in one image: stranded ENERGY (pulses streaming in along conduits)
// becomes COMPUTE (a rotating AI core with orbiting data rings) hosted in
// DATACENTERS (a ring of server racks). Bright, modern, and unmistakably 3D:
// the racks parallax, the core and its rings rotate on independent axes, and
// energy continuously flows inward as the camera orbits.

const ORANGE = '#f7931a';
const CYAN = '#22b8e6';
const RACK_BODY = '#e7edf5';
const RACK_DARK = '#aab6c7';
const PLATFORM = '#cdd9e8';

const RING_RADIUS = 3.5;
const RACK_COUNT = 8;

// ── Server rack on the ring ───────────────────────────────────────────────────
function Rack({
  angle,
  hue,
  seed,
  reduced,
}: {
  angle: number;
  hue: string;
  seed: number;
  reduced: boolean;
}) {
  const led = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (!led.current) return;
    led.current.emissiveIntensity = reduced
      ? 1.6
      : 1.6 + Math.sin(state.clock.elapsedTime * 2.5 + seed) * 0.7;
  });
  const x = Math.cos(angle) * RING_RADIUS;
  const z = Math.sin(angle) * RING_RADIUS;
  // face the core
  const rotY = -Math.atan2(z, x) + Math.PI / 2;
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[1.1, 1.9, 0.8]} />
        <meshStandardMaterial color={RACK_BODY} roughness={0.45} metalness={0.25} />
      </mesh>
      {/* dark vented front */}
      <mesh position={[0, 0.95, 0.41]}>
        <planeGeometry args={[0.92, 1.7]} />
        <meshStandardMaterial color={RACK_DARK} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* glowing status column */}
      <mesh position={[0.34, 0.95, 0.42]}>
        <planeGeometry args={[0.1, 1.6]} />
        <meshStandardMaterial
          ref={led}
          color="#0a141f"
          emissive={hue}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// ── Energy conduit + flowing pulses (rack → core) ─────────────────────────────
function Conduit({ angle, reduced }: { angle: number; reduced: boolean }) {
  const curve = useMemo(() => {
    const x = Math.cos(angle) * RING_RADIUS;
    const z = Math.sin(angle) * RING_RADIUS;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(x * 0.92, 0.12, z * 0.92),
      new THREE.Vector3(x * 0.55, 0.35, z * 0.55),
      new THREE.Vector3(x * 0.22, 0.55, z * 0.22),
      new THREE.Vector3(0, 0.8, 0),
    ]);
  }, [angle]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 32, 0.02, 6, false), [curve]);

  const pulses = [0, 0.5];
  return (
    <group>
      <mesh geometry={tube}>
        <meshStandardMaterial color="#9fb2c9" emissive={CYAN} emissiveIntensity={0.25} roughness={0.5} />
      </mesh>
      {pulses.map((off, i) => (
        <PulseDot key={i} curve={curve} offset={off + angle * 0.05} reduced={reduced} />
      ))}
    </group>
  );
}

function PulseDot({
  curve,
  offset,
  reduced,
}: {
  curve: THREE.CatmullRomCurve3;
  offset: number;
  reduced: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    if (!ref.current) return;
    // travel inward (t: 1 → 0) to read as energy feeding the core
    const t = reduced ? offset % 1 : 1 - ((state.clock.elapsedTime * 0.28 + offset) % 1);
    curve.getPoint(t, tmp);
    ref.current.position.copy(tmp);
    const s = 0.6 + (1 - t) * 0.9; // grow as it nears the core
    ref.current.scale.setScalar(s);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshBasicMaterial color="#ffd28a" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── Central compute core ──────────────────────────────────────────────────────
function ComputeCore({ reduced }: { reduced: boolean }) {
  const cube = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    if (cube.current) {
      cube.current.rotation.y += dt * 0.5;
      cube.current.position.y = 1.85 + Math.sin(t * 0.9) * 0.08;
    }
    if (ringA.current) ringA.current.rotation.z = t * 0.6;
    if (ringB.current) { ringB.current.rotation.x = t * 0.5; ringB.current.rotation.y = t * 0.3; }
    if (ringC.current) ringC.current.rotation.x = -t * 0.45;
  });

  return (
    <group>
      {/* chip die / pedestal */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.72, 0.18, 1.72]} />
        <meshStandardMaterial color="#33425a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* emissive circuit cross on the die */}
      {[0, Math.PI / 2].map((r, i) => (
        <mesh key={i} position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, r]}>
          <planeGeometry args={[1.5, 0.08]} />
          <meshStandardMaterial color="#0a141f" emissive={CYAN} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}

      {/* floating compute cube */}
      <group ref={cube} position={[0, 1.85, 0]}>
        <mesh>
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          <meshStandardMaterial
            color="#0f2236"
            emissive={ORANGE}
            emissiveIntensity={0.9}
            metalness={0.4}
            roughness={0.25}
            transparent
            opacity={0.92}
          />
        </mesh>
        {/* glowing wireframe edges */}
        <mesh scale={1.02}>
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          <meshBasicMaterial color={ORANGE} wireframe toneMapped={false} />
        </mesh>
      </group>

      {/* orbiting data rings */}
      <mesh ref={ringA} position={[0, 1.85, 0]}>
        <torusGeometry args={[0.95, 0.025, 12, 64]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} position={[0, 1.85, 0]}>
        <torusGeometry args={[1.2, 0.02, 12, 64]} />
        <meshBasicMaterial color={ORANGE} toneMapped={false} />
      </mesh>
      <mesh ref={ringC} position={[0, 1.85, 0]}>
        <torusGeometry args={[1.42, 0.015, 12, 64]} />
        <meshBasicMaterial color="#7fd2f0" toneMapped={false} />
      </mesh>

      {/* upward light beam */}
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[0.06, 0.2, 3.4, 16, 1, true]} />
        <meshBasicMaterial color={ORANGE} transparent opacity={0.18} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Platform() {
  return (
    <group>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[5.6, 5.8, 0.3, 64]} />
        <meshStandardMaterial color={PLATFORM} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* inlaid glowing ring on the platform */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RING_RADIUS - 0.08, RING_RADIUS + 0.08, 64]} />
        <meshStandardMaterial color="#0a141f" emissive={CYAN} emissiveIntensity={0.5} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CameraOrbit({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);
  useFrame((state) => {
    if (reduced) {
      camera.position.set(6.5, 4.6, 7);
      camera.lookAt(target.x, target.y, target.z);
      return;
    }
    const t = state.clock.elapsedTime * 0.12;
    const radius = 8.6;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = 4.4 + Math.sin(t * 1.2) * 0.7;
    camera.lookAt(target.x, target.y, target.z);
  });
  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  const racks = useMemo(
    () =>
      Array.from({ length: RACK_COUNT }).map((_, i) => ({
        angle: (i / RACK_COUNT) * Math.PI * 2,
        hue: i % 3 === 0 ? ORANGE : CYAN,
        seed: i * 1.7,
      })),
    [],
  );

  return (
    <>
      {/* bright, airy environment */}
      <fog attach="fog" args={['#dfeaf6', 14, 38]} />
      <color attach="background" args={['#e9f1fa']} />

      <ambientLight intensity={0.95} />
      <hemisphereLight args={['#ffffff', '#c4d4e6', 1.0]} />
      <directionalLight position={[6, 10, 5]} intensity={1.3} color="#fff4e2" />
      <directionalLight position={[-7, 5, -4]} intensity={0.55} color="#bcd6ff" />

      <Platform />
      <ComputeCore reduced={reduced} />
      {racks.map((r, i) => (
        <Rack key={i} angle={r.angle} hue={r.hue} seed={r.seed} reduced={reduced} />
      ))}
      {racks.map((r, i) => (
        <Conduit key={`c-${i}`} angle={r.angle} reduced={reduced} />
      ))}
      <CameraOrbit reduced={reduced} />
    </>
  );
}

export function DatacenterHeroScene3D({
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
      camera={{ fov: 45, position: [6.5, 4.6, 7], near: 0.1, far: 80 }}
      fallback="radial-gradient(70% 60% at 50% 40%, #eef4fb 0%, #d4e2f0 70%, #c2d3e6 100%)"
      overlay={overlay}
    >
      {(reduced) => <Scene reduced={reduced} />}
    </Scene3DFrame>
  );
}
