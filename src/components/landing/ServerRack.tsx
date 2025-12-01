import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ServerRackProps {
  position: [number, number, number];
  rackType: 'bitcoin' | 'ai' | 'hpc';
}

export const ServerRack = ({ position, rackType }: ServerRackProps) => {
  const rackRef = useRef<THREE.Group>(null);
  const ledsRef = useRef<THREE.Mesh[]>([]);
  
  // LED colors based on rack type
  const ledColor = useMemo(() => {
    switch (rackType) {
      case 'bitcoin': return '#F7931A'; // Bitcoin orange
      case 'ai': return '#0052FF'; // Coinbase blue
      case 'hpc': return '#22c55e'; // Green
    }
  }, [rackType]);

  // Animate LEDs with pulsing effect
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    ledsRef.current.forEach((led, i) => {
      if (led) {
        const offset = i * 0.3;
        const intensity = 0.5 + Math.sin(time * 2 + offset) * 0.5;
        (led.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      }
    });
  });

  return (
    <group ref={rackRef} position={position}>
      {/* Main rack frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 3, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Server units (stacked) */}
      {[0, 1, 2, 3, 4, 5].map((unit) => (
        <group key={unit} position={[0, -1.2 + unit * 0.45, 0.35]}>
          {/* Server unit panel */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.1, 0.35, 0.05]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
          </mesh>
          
          {/* LED indicators */}
          {[0, 1, 2].map((led) => (
            <mesh
              key={led}
              ref={(el) => {
                if (el) ledsRef.current[unit * 3 + led] = el;
              }}
              position={[-0.4 + led * 0.15, 0, 0.03]}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial
                color={ledColor}
                emissive={ledColor}
                emissiveIntensity={1}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Cooling fans at top */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.06, 4]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
};
