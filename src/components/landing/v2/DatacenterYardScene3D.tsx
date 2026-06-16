import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene3DFrame } from './Scene3DFrame';

// Procedural 3D data-center yard, viewed from a slow aerial orbit: rows of
// modular halls with lit roof vents, a substation (transformers + bushings),
// and a transmission feed tower. Pure geometry; the orbit reveals the depth
// and layout of the site.

function Hall({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  const [w, h, d] = size;
  return (
    <group position={position}>
      {/* building shell */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#3a4456" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* lit roof strip — cool data-center glow */}
      <mesh position={[0, h + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.86, d * 0.7]} />
        <meshStandardMaterial
          color="#0e1a2c"
          emissive="#2fa8e0"
          emissiveIntensity={0.7}
          roughness={0.5}
        />
      </mesh>
      {/* roof-top cooling units */}
      {[-w * 0.28, 0, w * 0.28].map((x, i) => (
        <mesh key={i} position={[x, h + 0.18, 0]}>
          <boxGeometry args={[0.5, 0.32, 0.5]} />
          <meshStandardMaterial color="#8893a6" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Substation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* concrete pad */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[4, 0.1, 3]} />
        <meshStandardMaterial color="#232b38" roughness={0.95} />
      </mesh>
      {/* three transformers: body + bushings */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.8, 0.9, 0.9]} />
            <meshStandardMaterial color="#5a6376" roughness={0.5} metalness={0.4} />
          </mesh>
          {[-0.22, 0, 0.22].map((bx, j) => (
            <mesh key={j} position={[bx, 1.1, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 0.4, 8]} />
              <meshStandardMaterial color="#cbd0d8" roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      {/* gantry uprights */}
      {[-1.8, 1.8].map((x, i) => (
        <mesh key={i} position={[x, 1.2, -1.2]}>
          <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} />
          <meshStandardMaterial color="#74809a" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 2.35, -1.2]}>
        <boxGeometry args={[3.9, 0.1, 0.1]} />
        <meshStandardMaterial color="#74809a" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0b1422" roughness={1} />
      </mesh>
      <gridHelper args={[120, 60, '#1d2a44', '#13202f']} position={[0, 0.01, 0]} />
    </group>
  );
}

function CameraOrbit({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  useFrame((state) => {
    if (reduced) {
      camera.position.set(10, 9, 12);
      camera.lookAt(target.x, target.y, target.z);
      return;
    }
    const t = state.clock.elapsedTime * 0.1;
    const radius = 15;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = 8.5 + Math.sin(t * 1.3) * 1.2; // aerial vantage
    camera.lookAt(target.x, target.y, target.z);
  });
  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  const halls = useMemo<{ position: [number, number, number]; size: [number, number, number] }[]>(
    () => [
      { position: [-4, 0, -3], size: [3.2, 1.4, 6] },
      { position: [0, 0, -3], size: [3.2, 1.4, 6] },
      { position: [4, 0, -3], size: [3.2, 1.4, 6] },
      { position: [-4, 0, 4], size: [3.2, 1.2, 5] },
      { position: [0, 0, 4], size: [3.2, 1.2, 5] },
    ],
    [],
  );

  return (
    <>
      <fog attach="fog" args={['#0b1422', 20, 55]} />
      <color attach="background" args={['#0b1422']} />

      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#b6d2ff', '#0c1830', 0.7]} />
      <directionalLight position={[8, 12, 6]} intensity={1.3} color="#ffe2b8" />
      <directionalLight position={[-6, 7, -4]} intensity={0.45} color="#9ec3ff" />

      <Ground />
      {halls.map((h, i) => (
        <Hall key={i} position={h.position} size={h.size} />
      ))}
      <Substation position={[8, 0, 4]} />
      <CameraOrbit reduced={reduced} />
    </>
  );
}

export function DatacenterYardScene3D({
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
      camera={{ fov: 45, position: [10, 9, 12], near: 0.1, far: 120 }}
      overlay={overlay}
    >
      {(reduced) => <Scene reduced={reduced} />}
    </Scene3DFrame>
  );
}
