import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ASIC mining rig: an array of miners on shelves with spinning fan rings, a
// rising hashrate counter on the rig's front display, and a steady stream of
// "blocks" emerging on a conveyor. Single scene, ~120 draw calls.

const MINER_W = 1.1;
const MINER_H = 0.36;
const MINER_D = 0.4;
const COLS = 4;
const ROWS = 3;

function Miner({ position, phase }: { position: [number, number, number]; phase: number }) {
  const leftFan = useRef<THREE.Group>(null);
  const rightFan = useRef<THREE.Group>(null);
  const led = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = 9 + Math.sin(t * 0.4 + phase) * 1.5;
    if (leftFan.current) leftFan.current.rotation.z = -t * speed;
    if (rightFan.current) rightFan.current.rotation.z = t * speed;
    if (led.current) led.current.opacity = 0.6 + ((Math.sin(t * 3 + phase) + 1) / 2) * 0.4;
  });

  return (
    <group position={position}>
      {/* chassis */}
      <mesh>
        <boxGeometry args={[MINER_W, MINER_H, MINER_D]} />
        <meshStandardMaterial color="#1a2438" roughness={0.7} metalness={0.35} />
      </mesh>
      {/* top accent vent */}
      <mesh position={[0, MINER_H / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[MINER_W - 0.1, MINER_D - 0.08]} />
        <meshStandardMaterial color="#0b1224" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* dual fans on the front */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (MINER_W / 2 - MINER_H / 2 - 0.02), 0, MINER_D / 2 + 0.002]}>
          <mesh>
            <ringGeometry args={[MINER_H / 2 - 0.06, MINER_H / 2 - 0.01, 24]} />
            <meshBasicMaterial color="#0b1224" side={THREE.DoubleSide} />
          </mesh>
          <group ref={side === -1 ? leftFan : rightFan}>
            {[0, 1, 2, 3, 4].map((b) => (
              <mesh key={b} rotation={[0, 0, (b * Math.PI * 2) / 5]}>
                <planeGeometry args={[MINER_H - 0.12, 0.025]} />
                <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
              </mesh>
            ))}
            <mesh>
              <circleGeometry args={[0.025, 8]} />
              <meshStandardMaterial color="#070c1a" />
            </mesh>
          </group>
        </group>
      ))}
      {/* status LED on the front center */}
      <mesh position={[0, -MINER_H / 2 + 0.05, MINER_D / 2 + 0.005]}>
        <circleGeometry args={[0.018, 10]} />
        <meshBasicMaterial ref={led} color="#f7931a" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function HashRateDisplay() {
  const ref = useRef<THREE.Group>(null);
  const [text, setText] = useState('0.00 EH/s');

  useFrame(({ clock }) => {
    // Smooth, low-rate text update so it reads like real telemetry.
    const t = clock.elapsedTime;
    const v = 4.2 + Math.sin(t * 0.6) * 0.4 + ((t * 0.05) % 1) * 0.08;
    if (Math.floor(t * 4) !== Math.floor((t - 0.016) * 4)) {
      setText(`${v.toFixed(2)} EH/s`);
    }
  });

  return (
    <group ref={ref} position={[0, 1.9, 0]}>
      {/* display bezel */}
      <mesh>
        <boxGeometry args={[2.2, 0.55, 0.08]} />
        <meshStandardMaterial color="#0b1224" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* glow screen */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[2.05, 0.42]} />
        <meshBasicMaterial color="#02101a" />
      </mesh>
      {/* readout — built with HTML for crisp text via foreignObject equivalent */}
      <Html3DText text={text} />
    </group>
  );
}

// Use drei <Text> via dynamic load to avoid pulling its font when not in
// view; inline import is fine because three.js is already a vendor chunk.
import { Text } from '@react-three/drei';

function Html3DText({ text }: { text: string }) {
  return (
    <Text
      position={[0, 0, 0.06]}
      fontSize={0.22}
      color="#22d3ee"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0}
      letterSpacing={0.05}
    >
      {text}
    </Text>
  );
}

function BlockStream() {
  const group = useRef<THREE.Group>(null);
  const count = 8;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      const phase = ((t * 0.35) + i / count) % 1;
      c.position.x = -3 + phase * 6;
      c.position.y = -1.3 + Math.sin(phase * Math.PI) * 0.15;
      const mesh = c as THREE.Mesh;
      mesh.rotation.y = phase * Math.PI * 1.2;
      mesh.visible = phase > 0.03 && phase < 0.97;
      // tint shift to suggest mined / accepted
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = phase > 0.7 ? 0.9 : 0.3;
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial
            color="#f7931a"
            emissive="#f7931a"
            emissiveIntensity={0.4}
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function Rig() {
  const positions = useMemo(() => {
    const arr: { p: [number, number, number]; phase: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        arr.push({
          p: [
            -((COLS - 1) / 2) * (MINER_W + 0.1) + c * (MINER_W + 0.1),
            -0.4 + r * (MINER_H + 0.18),
            0,
          ],
          phase: r * 1.3 + c * 0.7,
        });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {/* rig frame */}
      <mesh position={[0, -0.4 + ((ROWS - 1) * (MINER_H + 0.18)) / 2, -MINER_D / 2 - 0.05]}>
        <boxGeometry args={[COLS * (MINER_W + 0.1) + 0.2, ROWS * (MINER_H + 0.18) + 0.4, 0.05]} />
        <meshStandardMaterial color="#0b1224" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* feet */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (COLS * (MINER_W + 0.1)) / 2 - side * 0.05, -1.05, 0]}>
          <boxGeometry args={[0.08, 0.6, MINER_D + 0.3]} />
          <meshStandardMaterial color="#0b1224" roughness={0.6} metalness={0.5} />
        </mesh>
      ))}
      {positions.map(({ p, phase }, i) => (
        <Miner key={i} position={p} phase={phase} />
      ))}
      <HashRateDisplay />
      <BlockStream />
    </group>
  );
}

export default function MiningRigScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabOn, setTabOn] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    const onVis = () => setTabOn(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  const active = inView && tabOn;
  const camRef = useRef<THREE.PerspectiveCamera>();

  return (
    <div ref={wrap} className="w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [3.5, 1.4, 5.2], fov: 38 }}
        dpr={[1, 1.75]}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ camera }) => { camRef.current = camera as THREE.PerspectiveCamera; }}
      >
        {/* Lighting tuned for the light-page surround: brighter ambient, soft
            sky-tone fog so the canvas blends into its rounded card. */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 5]} intensity={1.1} color="#ffffff" />
        <pointLight position={[0, 2.2, 1]} intensity={0.6} color="#f7931a" distance={10} decay={1.5} />
        <pointLight position={[-3, -0.5, 2]} intensity={0.4} color="#22d3ee" distance={10} decay={1.5} />
        <fog attach="fog" args={['#eef2f8', 7, 14]} />
        <Rig />
        <Drift />
      </Canvas>
    </div>
  );
}

function Drift() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime * 0.18;
    camera.position.x = 3.5 + Math.sin(t) * 0.6;
    camera.position.y = 1.4 + Math.sin(t * 0.7) * 0.15;
    camera.position.z = 5.2 + Math.cos(t) * 0.3;
    camera.lookAt(0, 0.4, 0);
  });
  return null;
}
