import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Hero accent visual — a refined ABSTRACT energy network (not a map/globe).
// A slowly-rotating spherical lattice of glowing nodes connected by curved
// "power flow" arcs, rendered on the dark navy hero panel where additive glow
// reads as premium. Deliberately abstract so it evokes "intelligent power
// network" without the uncanny-valley of literal substation geometry or the
// "globe with no country outlines" problem.
//
// Built with imperative THREE objects (not drei helpers) because Lovable's
// JSX tagger injects data-* props that crash drei's prop spread.

const NODE_COUNT = 60;
const ARC_COUNT = 26;
const RADIUS = 2.3;
const ACCENT = new THREE.Color('#f7931a');   // bitcoin orange
const TEAL = new THREE.Color('#10a5c7');      // trust teal
const NODE_COLOR = new THREE.Color('#7fb4e6');

// Fibonacci sphere — even point distribution, no clustering at poles.
function fibonacciSphere(n: number, radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius));
  }
  return pts;
}

function Network() {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(() => fibonacciSphere(NODE_COUNT, RADIUS), []);

  // Pick arc endpoint pairs that are reasonably far apart (look like routes).
  const arcs = useMemo(() => {
    const pairs: { a: THREE.Vector3; b: THREE.Vector3; curve: THREE.QuadraticBezierCurve3; speed: number; phase: number; color: THREE.Color }[] = [];
    for (let i = 0; i < ARC_COUNT; i++) {
      const a = nodes[Math.floor((Math.sin(i * 12.9) * 0.5 + 0.5) * nodes.length) % nodes.length];
      const b = nodes[Math.floor((Math.sin(i * 78.2 + 1.3) * 0.5 + 0.5) * nodes.length) % nodes.length];
      if (a.distanceTo(b) < RADIUS) continue;
      // Lift the control point off the sphere for an arc that bows outward.
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS * (1.25 + (i % 3) * 0.12));
      pairs.push({
        a, b,
        curve: new THREE.QuadraticBezierCurve3(a, mid, b),
        speed: 0.25 + (i % 5) * 0.06,
        phase: (i / ARC_COUNT) * Math.PI * 2,
        color: i % 3 === 0 ? ACCENT : TEAL,
      });
    }
    return pairs;
  }, [nodes]);

  // Static arc tubes (faint) — built once.
  const arcLines = useMemo(() => arcs.map((arc) => {
    const geo = new THREE.TubeGeometry(arc.curve, 28, 0.006, 5, false);
    const mat = new THREE.MeshBasicMaterial({
      color: arc.color, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    return new THREE.Mesh(geo, mat);
  }), [arcs]);

  // Node instanced mesh
  const nodeMesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.028, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: NODE_COLOR, transparent: true, opacity: 0.9 });
    const inst = new THREE.InstancedMesh(geo, mat, NODE_COUNT);
    const d = new THREE.Object3D();
    nodes.forEach((p, i) => { d.position.copy(p); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); });
    inst.instanceMatrix.needsUpdate = true;
    return inst;
  }, [nodes]);

  // Wire sphere shell (very subtle) for depth
  const shell = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(RADIUS, 3);
    const mat = new THREE.MeshBasicMaterial({
      color: TEAL, wireframe: true, transparent: true, opacity: 0.05,
    });
    return new THREE.Mesh(geo, mat);
  }, []);

  // Flowing pulses along arcs
  const pulseMesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.04, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: '#ffffff', transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    return new THREE.InstancedMesh(geo, mat, arcs.length);
  }, [arcs.length]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.12;
      group.current.rotation.x = Math.sin(t * 0.18) * 0.12;
    }
    // Move pulses along their arcs
    const d = new THREE.Object3D();
    arcs.forEach((arc, i) => {
      const u = (t * arc.speed + arc.phase / (Math.PI * 2)) % 1;
      const p = arc.curve.getPointAt(u);
      d.position.copy(p);
      const s = 0.6 + Math.sin(u * Math.PI) * 0.8; // fade in/out along the arc
      d.scale.setScalar(s);
      d.updateMatrix();
      pulseMesh.setMatrixAt(i, d.matrix);
    });
    pulseMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <primitive object={shell} />
      <primitive object={nodeMesh} />
      {arcLines.map((m, i) => <primitive key={i} object={m} />)}
      <primitive object={pulseMesh} />
    </group>
  );
}

export default function GridField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.8} />
      <Network />
    </Canvas>
  );
}
