import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene3DFrame } from './Scene3DFrame';

// Procedural 3D wind farm: a field of turbines with spinning rotors receding
// into atmospheric haze, under a slow tracking camera. Pure geometry — the
// rotor rotation and the parallax between near/far turbines as the camera
// dollies make it unambiguously 3D.

const TOWER = '#dfe6f0';
const TOWER_SHADE = '#aeb8c8';
const BLADE = '#eef2f8';
const NACELLE = '#c4ccd8';

// One turbine: tapered tower, nacelle, hub, three blades on a rotor group that
// spins around the hub's local axis.
function Turbine({
  position,
  scale = 1,
  spin,
  reduced,
}: {
  position: [number, number, number];
  scale?: number;
  spin: number;
  reduced: boolean;
}) {
  const rotor = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((state) => {
    if (rotor.current && !reduced) {
      rotor.current.rotation.z = phase + state.clock.elapsedTime * spin;
    } else if (rotor.current) {
      rotor.current.rotation.z = phase;
    }
  });

  const towerH = 4.2;
  return (
    <group position={position} scale={scale}>
      {/* tower */}
      <mesh position={[0, towerH / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.16, towerH, 12]} />
        <meshStandardMaterial color={TOWER} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* nacelle */}
      <mesh position={[0, towerH + 0.05, 0.05]}>
        <boxGeometry args={[0.32, 0.28, 0.7]} />
        <meshStandardMaterial color={NACELLE} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* rotor: hub + 3 blades, spins around z (faces +z) */}
      <group ref={rotor} position={[0, towerH + 0.05, 0.42]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.16, 12]} />
          <meshStandardMaterial color={TOWER_SHADE} roughness={0.5} metalness={0.3} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, 0, (i / 3) * Math.PI * 2]}>
            {/* blade: long tapered box, base at hub */}
            <mesh position={[0, 1.15, 0]}>
              <boxGeometry args={[0.16, 2.3, 0.05]} />
              <meshStandardMaterial color={BLADE} roughness={0.45} metalness={0.05} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#16324a" roughness={1} metalness={0} />
      </mesh>
      <gridHelper args={[200, 80, '#2a4f6e', '#1b3a54']} position={[0, 0.01, 0]} />
    </group>
  );
}

function CameraTrack({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 3, -6), []);
  useFrame((state) => {
    if (reduced) {
      camera.position.set(-6, 3.4, 12);
      camera.lookAt(target.x, target.y, target.z);
      return;
    }
    const t = state.clock.elapsedTime * 0.06;
    // gentle lateral track + slight arc so near turbines parallax against far
    camera.position.x = Math.sin(t) * 9;
    camera.position.z = 12 + Math.cos(t) * 2.5;
    camera.position.y = 3.2 + Math.sin(t * 0.8) * 0.5;
    camera.lookAt(target.x, target.y, target.z);
  });
  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  // Scatter turbines across the field at varied depth + scale. Hand-placed so
  // the composition stays balanced rather than random clumping.
  const turbines = useMemo<{ position: [number, number, number]; scale: number; spin: number }[]>(
    () => [
      { position: [-1.5, 0, -2], scale: 1.1, spin: 0.5 },
      { position: [3.5, 0, -4], scale: 1.0, spin: 0.42 },
      { position: [-6, 0, -6], scale: 0.85, spin: 0.6 },
      { position: [1, 0, -9], scale: 0.8, spin: 0.38 },
      { position: [7.5, 0, -10], scale: 0.7, spin: 0.5 },
      { position: [-9, 0, -13], scale: 0.6, spin: 0.46 },
      { position: [-2, 0, -16], scale: 0.5, spin: 0.55 },
      { position: [5, 0, -18], scale: 0.45, spin: 0.4 },
      { position: [-13, 0, -9], scale: 0.55, spin: 0.52 },
    ],
    [],
  );

  return (
    <>
      <fog attach="fog" args={['#1a3a57', 14, 50]} />
      <color attach="background" args={['#1d4368']} />

      {/* dusk lighting: warm low sun + cool sky fill */}
      <ambientLight intensity={0.6} />
      <hemisphereLight args={['#cfe4ff', '#16324a', 0.85]} />
      <directionalLight position={[-8, 6, 6]} intensity={1.5} color="#ffe2b8" />

      <Ground />
      {turbines.map((t, i) => (
        <Turbine key={i} position={t.position} scale={t.scale} spin={t.spin} reduced={reduced} />
      ))}
      <CameraTrack reduced={reduced} />
    </>
  );
}

export function WindFarmScene3D({
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
      camera={{ fov: 50, position: [-6, 3.4, 12], near: 0.1, far: 120 }}
      fallback="linear-gradient(180deg, #1d4368 0%, #16324a 100%)"
      overlay={overlay}
    >
      {(reduced) => <Scene reduced={reduced} />}
    </Scene3DFrame>
  );
}
