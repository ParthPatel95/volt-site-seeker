// Cinematic hero centerpiece — an ABSTRACT energy→compute field, not a literal
// datacenter model. A glowing power grid recedes to a dark horizon with pulses
// of current racing across it toward a luminous compute core; energy embers
// drift through the air and thin data-beams rise from the grid. The camera
// drifts slowly and parallaxes to the cursor. Designed to sit behind bold
// overlaid type as the first thing a visitor sees.
//
// Pure @react-three/fiber + drei + three (no postprocessing dep). Glow is
// achieved with additive materials plus a CSS bloom overlay in the hero
// section. Degrades to a static gradient under reduced motion / no WebGL.

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Billboard } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

// Brand colors as THREE colors (matches --watt-bitcoin / --watt-trust / blue).
const C_TEAL = new THREE.Color('#10a5c7');
const C_ORANGE = new THREE.Color('#f7931a');
const C_BLUE = new THREE.Color('#3b82f6');

// ── Grid floor shader ────────────────────────────────────────────────────────

const gridVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gridFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uLine;
  uniform vec3 uPulse;

  // Anti-aliased grid lines using screen-space derivatives.
  float gridLine(vec2 uv, float density) {
    vec2 g = abs(fract(uv * density - 0.5) - 0.5) / fwidth(uv * density);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }

  void main() {
    vec2 uv = vUv;
    // Fade toward the horizon (uv.y -> 1.0 is far away) and the side edges.
    float horizon = smoothstep(1.0, 0.15, uv.y);
    float edges = smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x);

    float fine = gridLine(uv, 60.0) * 0.5;
    float coarse = gridLine(uv, 15.0);
    float line = max(coarse, fine);

    // Current pulses racing toward the viewer along the depth axis.
    float p = fract(uv.y * 2.5 - uTime * 0.18);
    float pulse = smoothstep(0.5, 0.0, abs(p - 0.5)) ;
    pulse = pow(pulse, 3.0);

    // A second, faster sparse pulse for life.
    float p2 = fract(uv.y * 6.0 - uTime * 0.42 + 0.33);
    float pulse2 = pow(smoothstep(0.5, 0.0, abs(p2 - 0.5)), 6.0);

    vec3 col = uLine;
    col = mix(col, uPulse, clamp(pulse + pulse2, 0.0, 1.0));

    float alpha = line * horizon * edges;
    alpha += (pulse * 0.5 + pulse2 * 0.8) * line * horizon * edges;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`;

function GridFloor() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLine: { value: C_TEAL.clone().multiplyScalar(0.9) },
      uPulse: { value: C_ORANGE.clone() },
    }),
    [],
  );
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, -2]}>
      <planeGeometry args={[60, 60, 1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={gridVertex}
        fragmentShader={gridFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ── Luminous compute core ────────────────────────────────────────────────────

function CoreGlow() {
  const halo = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = 1 + Math.sin(t * 1.3) * 0.06;
    if (core.current) core.current.scale.setScalar(s);
    if (halo.current) halo.current.scale.setScalar(1 + Math.sin(t * 0.9) * 0.1);
  });
  return (
    <group position={[0, 0.35, -1.5]}>
      {/* soft additive halo, always facing camera */}
      <Billboard>
        <mesh ref={halo}>
          <circleGeometry args={[2.6, 64]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            uniforms={useMemo(() => ({ uColor: { value: C_ORANGE.clone() } }), [])}
            vertexShader={/* glsl */ `
              varying vec2 vUv;
              void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
            `}
            fragmentShader={/* glsl */ `
              precision highp float; varying vec2 vUv; uniform vec3 uColor;
              void main(){
                float d = distance(vUv, vec2(0.5));
                float a = smoothstep(0.5, 0.0, d);
                gl_FragColor = vec4(uColor, a * 0.55);
              }
            `}
          />
        </mesh>
      </Billboard>
      {/* bright inner core */}
      <mesh ref={core}>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshBasicMaterial color={C_ORANGE} toneMapped={false} />
      </mesh>
      <pointLight color={C_ORANGE} intensity={6} distance={14} />
    </group>
  );
}

// ── Rising data-beams from the grid ──────────────────────────────────────────

function DataBeams() {
  const group = useRef<THREE.Group>(null);
  const beams = useMemo(() => {
    const arr: { x: number; z: number; h: number; phase: number; color: THREE.Color }[] = [];
    for (let i = 0; i < 14; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 16,
        z: -Math.random() * 14 - 1,
        h: 1.4 + Math.random() * 2.6,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? C_TEAL : C_BLUE,
      });
    }
    return arr;
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    group.current?.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.25 + (Math.sin(t * 1.5 + beams[i].phase) * 0.5 + 0.5) * 0.55;
    });
  });
  return (
    <group ref={group}>
      {beams.map((b, i) => (
        <mesh key={i} position={[b.x, -1.4 + b.h / 2, b.z]}>
          <planeGeometry args={[0.035, b.h]} />
          <meshBasicMaterial
            color={b.color}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Camera rig: slow drift + cursor parallax ─────────────────────────────────

function Rig({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0.2, -1.5), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const px = pointer.current.x;
    const py = pointer.current.y;
    // base slow orbital drift + parallax offset toward the cursor
    const tx = Math.sin(t * 0.12) * 1.3 + px * 1.4;
    const ty = 1.1 + Math.cos(t * 0.16) * 0.25 - py * 0.7;
    camera.position.x += (tx - camera.position.x) * 0.03;
    camera.position.y += (ty - camera.position.y) * 0.03;
    camera.position.z = 6.5;
    camera.lookAt(target);
  });
  return null;
}

// ── Public component ─────────────────────────────────────────────────────────

export function HeroScene3D({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const pointer = useRef({ x: 0, y: 0 });

  // Static, dependency-free fallback (reduced motion or SSR safety).
  if (reduced) {
    return <div className={className} aria-hidden style={{ background: 'radial-gradient(120% 80% at 50% 20%, rgba(247,147,26,0.18), transparent 55%), radial-gradient(100% 70% at 70% 90%, rgba(16,165,199,0.16), transparent 60%)' }} />;
  }

  return (
    <div
      className={className}
      aria-hidden
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        pointer.current.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        pointer.current.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      }}
      onPointerLeave={() => { pointer.current.x = 0; pointer.current.y = 0; }}
    >
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.1, 6.5], fov: 50 }}
        dpr={[1, 1.8]}
      >
        <Suspense fallback={null}>
          <fog attach="fog" args={['#060b16', 8, 22]} />
          <ambientLight intensity={0.3} />
          <GridFloor />
          <CoreGlow />
          <DataBeams />
          <Sparkles count={120} scale={[18, 8, 12]} size={3} speed={0.3} opacity={0.5} color={C_ORANGE} />
          <Sparkles count={160} scale={[20, 9, 14]} size={2} speed={0.2} opacity={0.4} color={C_TEAL} />
          <Rig pointer={pointer} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default HeroScene3D;
