import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene3DFrame } from './Scene3DFrame';

// Procedural 3D server hall interior: two facing rows of racks down a cold
// aisle, each rack face carrying a column of status LEDs that pulse. The
// camera glides down the aisle, so the rows stream past in perspective — a
// data-center interior built entirely from geometry.

const AISLE_LEN = 26;
const RACK = '#1b2533';
const RACK_EDGE = '#2f3d52';

// A rack with an emissive LED strip. The strip's emissive intensity is driven
// per-frame to give a "live equipment" shimmer without per-LED meshes.
function Rack({
  position,
  rotationY,
  hue,
  seed,
  reduced,
}: {
  position: [number, number, number];
  rotationY: number;
  hue: THREE.Color;
  seed: number;
  reduced: boolean;
}) {
  const led = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (!led.current) return;
    const base = reduced ? 1.4 : 1.4 + Math.sin(state.clock.elapsedTime * 3 + seed) * 0.6;
    led.current.emissiveIntensity = base;
  });
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* cabinet */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[1.0, 2.0, 1.1]} />
        <meshStandardMaterial color={RACK} roughness={0.6} metalness={0.35} />
      </mesh>
      {/* front bezel frame */}
      <mesh position={[0, 1.0, 0.56]}>
        <boxGeometry args={[0.92, 1.92, 0.02]} />
        <meshStandardMaterial color={RACK_EDGE} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* LED strip on the front face */}
      <mesh position={[0.28, 1.0, 0.58]}>
        <planeGeometry args={[0.08, 1.7]} />
        <meshStandardMaterial
          ref={led}
          color="#06121e"
          emissive={hue}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      {/* vent slats hint */}
      <mesh position={[-0.12, 1.0, 0.58]}>
        <planeGeometry args={[0.5, 1.7]} />
        <meshStandardMaterial color="#0c1622" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Hall() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, AISLE_LEN + 8]} />
        <meshStandardMaterial color="#0a1018" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
        <planeGeometry args={[14, AISLE_LEN + 8]} />
        <meshStandardMaterial color="#0c1420" roughness={0.9} />
      </mesh>
      {/* recessed ceiling light bars running down the aisle */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 3.96, AISLE_LEN / 2 - 2 - i * 3]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.4, 0.2]} />
          <meshStandardMaterial color="#0c1420" emissive="#bfe0ff" emissiveIntensity={1.1} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function CameraDolly({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  useFrame((state) => {
    if (reduced) {
      camera.position.set(0, 1.7, AISLE_LEN / 2 - 2);
      camera.lookAt(0, 1.5, -AISLE_LEN);
      return;
    }
    // Smooth ping-pong glide down the aisle with a slight lateral sway; always
    // look deeper into the hall (-z) so the rows stream past in perspective.
    const t = state.clock.elapsedTime * 0.12;
    const z = Math.cos(t) * (AISLE_LEN / 2 - 3);
    const sway = Math.sin(t * 0.7) * 0.7;
    camera.position.set(sway, 1.7 + Math.sin(t * 0.5) * 0.2, z);
    camera.lookAt(sway * 0.5, 1.45, z - 8);
  });
  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  const racks = useMemo(() => {
    const items: {
      position: [number, number, number];
      rotationY: number;
      hue: THREE.Color;
      seed: number;
    }[] = [];
    const cold = new THREE.Color('#39b6ff');
    const warm = new THREE.Color('#f7931a');
    const count = 9;
    for (let i = 0; i < count; i++) {
      const z = AISLE_LEN / 2 - 2 - i * 2.6;
      // left row faces +x (toward aisle), right row faces -x
      items.push({ position: [-1.7, 0, z], rotationY: Math.PI / 2, hue: cold, seed: i });
      items.push({ position: [1.7, 0, z], rotationY: -Math.PI / 2, hue: i % 3 === 0 ? warm : cold, seed: i + 0.5 });
    }
    return items;
  }, []);

  return (
    <>
      <fog attach="fog" args={['#060d16', 6, 30]} />
      <color attach="background" args={['#060d16']} />

      <ambientLight intensity={0.35} />
      {/* cold aisle wash from the ceiling */}
      <directionalLight position={[0, 6, 2]} intensity={0.9} color="#bfe0ff" />
      <pointLight position={[0, 3.4, 4]} intensity={18} distance={20} color="#9ed4ff" />
      <pointLight position={[0, 3.4, -6]} intensity={18} distance={20} color="#9ed4ff" />

      <Hall />
      {racks.map((r, i) => (
        <Rack
          key={i}
          position={r.position}
          rotationY={r.rotationY}
          hue={r.hue}
          seed={r.seed}
          reduced={reduced}
        />
      ))}
      <CameraDolly reduced={reduced} />
    </>
  );
}

export function ServerHallScene3D({
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
      camera={{ fov: 60, position: [0, 1.7, AISLE_LEN / 2 - 2], near: 0.1, far: 60 }}
      fallback="linear-gradient(180deg, #0c1622 0%, #060d16 100%)"
      overlay={overlay}
    >
      {(reduced) => <Scene reduced={reduced} />}
    </Scene3DFrame>
  );
}
