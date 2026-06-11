import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D datacenter hall: two parallel rows of server racks under a slim
// raised-floor + ceiling cable tray, blinking status LEDs, fans, and
// glowing fiber/coolant lines. Real cuboid geometry — no sprites, no fake
// "depth" hacks. Sized once at module load via instances/groups so the
// frame loop stays cheap (~200 draw calls, mostly instanced).

const RACKS_PER_ROW = 8;
const RACK_W = 0.55;
const RACK_H = 2.2;
const RACK_D = 0.9;
const ROW_GAP = 1.6;       // aisle width
const RACK_GAP = 0.12;     // gap between racks in a row
const BLADES_PER_RACK = 14;
const ROW_LENGTH = RACKS_PER_ROW * (RACK_W + RACK_GAP) - RACK_GAP;

function rackPosition(rowIdx: number, idx: number): [number, number, number] {
  const x = -ROW_LENGTH / 2 + idx * (RACK_W + RACK_GAP) + RACK_W / 2;
  const z = (rowIdx === 0 ? -1 : 1) * (ROW_GAP / 2);
  return [x, 0, z];
}

// One server rack: cabinet shell + blade bays + fan ring + status LED.
function Rack({ position, ledOffset }: { position: [number, number, number]; ledOffset: number }) {
  const ledRef = useRef<THREE.MeshBasicMaterial>(null);
  const fansRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ledRef.current) {
      // Independent blink rhythm per rack so the hall feels alive.
      const blink = (Math.sin(t * 2.6 + ledOffset) + 1) / 2;
      ledRef.current.opacity = 0.55 + blink * 0.45;
    }
    if (fansRef.current) {
      fansRef.current.rotation.z = t * 6 + ledOffset;
    }
  });

  // Blade bays — generated once.
  const blades = useMemo(() => {
    const arr: { y: number; mat: 'cool' | 'warm' | 'idle' }[] = [];
    const bayH = (RACK_H - 0.35) / BLADES_PER_RACK;
    for (let i = 0; i < BLADES_PER_RACK; i++) {
      const y = -RACK_H / 2 + 0.25 + i * bayH + bayH / 2;
      // Deterministic mat assignment via ledOffset so the racks look varied
      // but stable across re-renders.
      const r = (Math.sin(ledOffset * 13.7 + i * 2.1) + 1) / 2;
      const mat = r > 0.6 ? 'warm' : r > 0.15 ? 'cool' : 'idle';
      arr.push({ y, mat });
    }
    return arr;
  }, [ledOffset]);

  return (
    <group position={position}>
      {/* Cabinet shell */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[RACK_W, RACK_H, RACK_D]} />
        <meshStandardMaterial color="#11182a" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Subtle front bezel */}
      <mesh position={[0, 0, RACK_D / 2 + 0.001]}>
        <planeGeometry args={[RACK_W - 0.04, RACK_H - 0.06]} />
        <meshStandardMaterial color="#0b1224" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Blade bays */}
      {blades.map((b, i) => {
        const color = b.mat === 'warm' ? '#f59e0b' : b.mat === 'cool' ? '#3b82f6' : '#1f2a44';
        const emissive = b.mat === 'idle' ? '#000000' : color;
        return (
          <mesh key={i} position={[0, b.y, RACK_D / 2 + 0.012]}>
            <planeGeometry args={[RACK_W - 0.1, 0.07]} />
            <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={b.mat === 'idle' ? 0 : 0.7} />
          </mesh>
        );
      })}
      {/* Fan ring near the top */}
      <group ref={fansRef} position={[0, RACK_H / 2 - 0.18, RACK_D / 2 + 0.014]}>
        <mesh>
          <ringGeometry args={[0.06, 0.13, 24]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[0.22, 0.02]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[0, 0, 0]}>
          <planeGeometry args={[0.22, 0.02]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
        </mesh>
      </group>
      {/* Power-state LED */}
      <mesh position={[RACK_W / 2 - 0.05, RACK_H / 2 - 0.05, RACK_D / 2 + 0.013]}>
        <circleGeometry args={[0.018, 12]} />
        <meshBasicMaterial ref={ledRef} color="#22c55e" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// Cold-aisle floor strip — subtle, glowing along the centerline.
function FloorStrip() {
  return (
    <>
      {/* polished concrete floor — light enough to sit on a white page */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -RACK_H / 2, 0]} receiveShadow>
        <planeGeometry args={[ROW_LENGTH + 6, 10]} />
        <meshStandardMaterial color="#dfe6f0" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* raised-floor grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -RACK_H / 2 + 0.002, 0]}>
        <planeGeometry args={[ROW_LENGTH + 6, 10]} />
        <meshBasicMaterial color="#16a5c7" wireframe transparent opacity={0.12} />
      </mesh>
      {/* cool aisle accent */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -RACK_H / 2 + 0.003, 0]}>
        <planeGeometry args={[ROW_LENGTH + 0.4, ROW_GAP - 0.4]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.18} />
      </mesh>
    </>
  );
}

// Overhead trays (power + fiber).
function CableTrays() {
  const trays = [
    { z: -ROW_GAP / 2 - RACK_D / 2 - 0.2, color: '#f7931a' },
    { z: 0, color: '#22d3ee' },
    { z: ROW_GAP / 2 + RACK_D / 2 + 0.2, color: '#22c55e' },
  ];
  return (
    <group position={[0, RACK_H / 2 + 0.25, 0]}>
      {trays.map((t, i) => (
        <group key={i} position={[0, 0, t.z]}>
          {/* tray */}
          <mesh>
            <boxGeometry args={[ROW_LENGTH + 2, 0.04, 0.18]} />
            <meshStandardMaterial color="#0b1224" roughness={0.6} metalness={0.4} />
          </mesh>
          {/* fiber line */}
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[ROW_LENGTH + 2, 0.012, 0.12]} />
            <meshBasicMaterial color={t.color} transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Animated data packets that travel down the center tray.
function DataPackets() {
  const group = useRef<THREE.Group>(null);
  const count = 14;

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const phase = (t * 0.6 + i / count) % 1;
      child.position.x = -ROW_LENGTH / 2 - 1 + phase * (ROW_LENGTH + 2);
      (child as THREE.Mesh).visible = phase > 0.02 && phase < 0.98;
    });
  });

  return (
    <group ref={group} position={[0, RACK_H / 2 + 0.28, 0]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

// Top-of-rack fans collectively (instanced glow ring) — purely decorative.
function AccentLight() {
  // Built imperatively (THREE.InstancedMesh) instead of drei's <Instances>/<Instance>
  // because the JSX tagger forwards data-* props into three objects and crashes.
  const mesh = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.03, 6, 6);
    const material = new THREE.MeshBasicMaterial({
      color: '#22d3ee',
      transparent: true,
      opacity: 0.7,
    });
    const instanced = new THREE.InstancedMesh(geometry, material, 32);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 32; i++) {
      dummy.position.set(
        -ROW_LENGTH / 2 + (i / 32) * (ROW_LENGTH + 1) - 0.5,
        RACK_H / 2 + 0.08,
        (i % 2 === 0 ? -1 : 1) * (ROW_GAP / 2 + RACK_D / 2 + 0.08),
      );
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
    return instanced;
  }, []);

  return <primitive object={mesh} />;
}

export function DatacenterHall() {
  // Pre-compute rack placements + per-rack phase offsets once.
  const placements = useMemo(() => {
    const arr: { pos: [number, number, number]; offset: number }[] = [];
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < RACKS_PER_ROW; i++) {
        const pos = rackPosition(r, i);
        // Mirror the back row so blade fronts face the cool aisle.
        const rot = r === 0 ? 1 : -1;
        arr.push({ pos: [pos[0], pos[1], pos[2] * rot * 0], offset: r * 4 + i * 0.7 + r * 1.3 });
        arr[arr.length - 1].pos = pos;
      }
    }
    return arr;
  }, []);

  return (
    <group>
      <FloorStrip />
      <CableTrays />
      <DataPackets />
      <AccentLight />
      {placements.map((p, i) => {
        const isBackRow = p.pos[2] > 0;
        return (
          <group key={i} rotation={[0, isBackRow ? Math.PI : 0, 0]} position={p.pos}>
            <Rack position={[0, 0, 0]} ledOffset={p.offset} />
          </group>
        );
      })}
    </group>
  );
}
