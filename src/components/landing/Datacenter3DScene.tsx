import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles } from '@react-three/drei';
import { ServerRack } from './ServerRack';
import * as THREE from 'three';

const DataFlowParticles = () => {
  return (
    <>
      <Sparkles
        count={50}
        scale={[8, 6, 8]}
        size={2}
        speed={0.3}
        opacity={0.4}
        color="#F7931A"
      />
      <Sparkles
        count={30}
        scale={[8, 6, 8]}
        size={1.5}
        speed={0.4}
        opacity={0.3}
        color="#0052FF"
      />
    </>
  );
};

const Floor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#0f172a"
        metalness={0.9}
        roughness={0.1}
        envMapIntensity={1}
      />
    </mesh>
  );
};

const SceneContent = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#F7931A" />
      <pointLight position={[5, 5, -5]} intensity={0.5} color="#0052FF" />

      {/* Server Racks */}
      <ServerRack position={[-2.5, 0, 0]} rackType="bitcoin" />
      <ServerRack position={[0, 0, 0]} rackType="ai" />
      <ServerRack position={[2.5, 0, 0]} rackType="hpc" />

      {/* Floor */}
      <Floor />

      {/* Data Flow Particles */}
      <DataFlowParticles />

      {/* Environment & Fog */}
      <Environment preset="city" />
      <fog attach="fog" args={['#0a1628', 5, 20]} />

      {/* Auto-rotating camera controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
};

export const Datacenter3DScene = () => {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-institutional">
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
};
