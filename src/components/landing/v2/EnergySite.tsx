import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Marks every mesh under it as a shadow caster (one traverse on mount) —
// keeps the per-mesh JSX clean while letting the sun ground every structure.
function ShadowCaster({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    ref.current?.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
  }, []);
  return <group ref={ref}>{children}</group>;
}

// Realistic outdoor energy site: a row of lattice-steel transmission
// towers approaching a substation (three power transformers in concrete
// bunds, switchgear, bus bars), with a datacenter building behind. Every
// element is real industrial-equipment geometry (lattice trusses, ribbed
// transformer radiators, ceramic insulator stacks, busbar tubing) — no
// sprites, no fake-depth, just composition + materials.
//
// All geometry is built imperatively (THREE.* meshes) instead of via drei
// helpers like <Instances>/<Text>/<Sky> because Lovable's JSX tagger
// injects `data-lov-*` props that crash drei's prop-spread into three.js.
// We render meshes directly so r3f's normal `applyProps` skips dashed
// attributes cleanly.

// ────────────────────────────────────────────────────────────────────────────
// Materials — shared so we keep draw-call uniform-uploads cheap
// ────────────────────────────────────────────────────────────────────────────

const MAT = {
  steel: new THREE.MeshStandardMaterial({ color: '#6b727f', metalness: 0.85, roughness: 0.42 }),
  steelDark: new THREE.MeshStandardMaterial({ color: '#3a4150', metalness: 0.8, roughness: 0.5 }),
  porcelain: new THREE.MeshStandardMaterial({ color: '#dcdce0', roughness: 0.35, metalness: 0.05 }),
  conductor: new THREE.MeshStandardMaterial({ color: '#1f242c', roughness: 0.55, metalness: 0.6 }),
  concrete: new THREE.MeshStandardMaterial({ color: '#9da3ad', roughness: 0.92, metalness: 0.02 }),
  concreteDark: new THREE.MeshStandardMaterial({ color: '#71757d', roughness: 0.92, metalness: 0.02 }),
  transformerTank: new THREE.MeshStandardMaterial({ color: '#4f5663', metalness: 0.55, roughness: 0.45 }),
  transformerRad: new THREE.MeshStandardMaterial({ color: '#42495a', metalness: 0.55, roughness: 0.5 }),
  dcWall: new THREE.MeshStandardMaterial({ color: '#dde2e8', roughness: 0.65, metalness: 0.1 }),
  dcRoof: new THREE.MeshStandardMaterial({ color: '#5a626e', roughness: 0.78, metalness: 0.15 }),
  chiller: new THREE.MeshStandardMaterial({ color: '#cdd3da', roughness: 0.55, metalness: 0.25 }),
  ground: new THREE.MeshStandardMaterial({ color: '#8a8775', roughness: 0.96, metalness: 0 }),
  grass: new THREE.MeshStandardMaterial({ color: '#5c6f4a', roughness: 0.95, metalness: 0 }),
  bushing: new THREE.MeshStandardMaterial({ color: '#e8e6dc', roughness: 0.4, metalness: 0.05 }),
};

// Reusable geometries so adding more towers/transformers stays cheap.
const GEO = {
  legCyl: new THREE.CylinderGeometry(0.05, 0.08, 1, 6),
  braceBox: new THREE.BoxGeometry(0.03, 0.03, 1),
  crossArm: new THREE.BoxGeometry(0.08, 0.08, 1),
  insulatorDisc: new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12),
  conductorTube: new THREE.CylinderGeometry(0.025, 0.025, 1, 6),
  bushing: new THREE.CylinderGeometry(0.15, 0.18, 1, 14),
  radiatorFin: new THREE.BoxGeometry(0.04, 0.85, 0.32),
  fencePost: new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6),
};

// ────────────────────────────────────────────────────────────────────────────
// Sky dome (no drei dependency — gradient mesh on the inside of a sphere)
// ────────────────────────────────────────────────────────────────────────────

function SkyDome() {
  const skyMat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor:    { value: new THREE.Color('#7eb0d8') },
      midColor:    { value: new THREE.Color('#cfd9d6') },
      // Matches scene fog + background so the horizon is seamless.
      bottomColor: { value: new THREE.Color('#e9ddc8') },
      sunDir:      { value: new THREE.Vector3(-0.6, 0.45, -0.28).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vWorld = normalize((modelMatrix * vec4(position, 1.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vWorld;
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 bottomColor;
      uniform vec3 sunDir;
      void main() {
        float h = clamp(vWorld.y * 1.05 + 0.05, 0.0, 1.0);
        // Two-band gradient with a warm horizon glow.
        vec3 col = mix(bottomColor, midColor, smoothstep(0.0, 0.35, h));
        col = mix(col, topColor, smoothstep(0.3, 1.0, h));
        // Soft sun bloom along the directional light vector.
        float sun = pow(max(dot(normalize(vWorld), sunDir), 0.0), 64.0);
        col += vec3(1.0, 0.95, 0.85) * sun * 0.55;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  }), []);

  return (
    <mesh material={skyMat}>
      <sphereGeometry args={[280, 32, 16]} />
    </mesh>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Ground + simple perimeter fence
// ────────────────────────────────────────────────────────────────────────────

function GroundPlane() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={MAT.grass}>
        <planeGeometry args={[400, 400]} />
      </mesh>
      {/* gravel pad under the substation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, 0.005, 0]} receiveShadow material={MAT.ground}>
        <planeGeometry args={[16, 14]} />
      </mesh>
      {/* access road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, 0.008, 8]} receiveShadow material={MAT.concreteDark}>
        <planeGeometry args={[3, 22]} />
      </mesh>
    </group>
  );
}

function PerimeterFence() {
  // Posts only — keeps the visual clean. Run them around the substation pad.
  const posts: [number, number][] = [];
  const x0 = -2, x1 = 14, z0 = -7, z1 = 7;
  for (let x = x0; x <= x1; x += 1.6) { posts.push([x, z0]); posts.push([x, z1]); }
  for (let z = z0 + 1.6; z < z1; z += 1.6) { posts.push([x0, z]); posts.push([x1, z]); }
  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.8, z]} geometry={GEO.fencePost} material={MAT.steelDark} />
      ))}
    </group>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Lattice-steel transmission tower (procedural)
// ────────────────────────────────────────────────────────────────────────────

function TransmissionTower({ position, height = 13 }: {
  position: [number, number, number];
  height?: number;
}) {
  // Geometry generated once per (height) — captured into a group of meshes.
  const group = useMemo(() => {
    const g = new THREE.Group();

    const sections = 6; // tapered lattice sections
    const baseW = 2.6;
    const topW = 0.6;

    // 4 legs, each made of cylindrical segments running between section levels.
    const widthAt = (lvl: number) => baseW + (topW - baseW) * (lvl / sections);
    const yAt = (lvl: number) => (lvl / sections) * height;

    const corners = (lvl: number) => {
      const w = widthAt(lvl) / 2;
      return [
        [-w, yAt(lvl), -w], [w, yAt(lvl), -w], [w, yAt(lvl), w], [-w, yAt(lvl), w],
      ] as [number, number, number][];
    };

    // Legs
    for (let lvl = 0; lvl < sections; lvl++) {
      const lo = corners(lvl), hi = corners(lvl + 1);
      for (let i = 0; i < 4; i++) {
        const mid = new THREE.Vector3(
          (lo[i][0] + hi[i][0]) / 2,
          (lo[i][1] + hi[i][1]) / 2,
          (lo[i][2] + hi[i][2]) / 2,
        );
        const dir = new THREE.Vector3(hi[i][0] - lo[i][0], hi[i][1] - lo[i][1], hi[i][2] - lo[i][2]);
        const len = dir.length();
        const m = new THREE.Mesh(GEO.legCyl, MAT.steel);
        m.scale.set(1, len, 1);
        m.position.copy(mid);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        g.add(m);
      }
    }

    // X-bracing on each face per section
    for (let lvl = 0; lvl < sections; lvl++) {
      const lo = corners(lvl), hi = corners(lvl + 1);
      for (let face = 0; face < 4; face++) {
        const a = lo[face], b = lo[(face + 1) % 4];
        const c = hi[face], d = hi[(face + 1) % 4];
        for (const [p1, p2] of [[a, d], [b, c]] as const) {
          const mid = new THREE.Vector3((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, (p1[2] + p2[2]) / 2);
          const dir = new THREE.Vector3(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]);
          const len = dir.length();
          const m = new THREE.Mesh(GEO.braceBox, MAT.steel);
          m.scale.set(1, 1, len);
          m.position.copy(mid);
          m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
          g.add(m);
        }
        // Horizontal connector
        const mh1 = new THREE.Vector3((c[0] + d[0]) / 2, (c[1] + d[1]) / 2, (c[2] + d[2]) / 2);
        const dh = new THREE.Vector3(d[0] - c[0], d[1] - c[1], d[2] - c[2]);
        const lenH = dh.length();
        const h = new THREE.Mesh(GEO.braceBox, MAT.steel);
        h.scale.set(1, 1, lenH);
        h.position.copy(mh1);
        h.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dh.clone().normalize());
        g.add(h);
      }
    }

    // Crossarms at the top — three arms carrying three phase conductors.
    const armLevels = [height - 0.6, height - 2.0, height - 3.4];
    const armLength = 5;
    for (const ay of armLevels) {
      const arm = new THREE.Mesh(GEO.crossArm, MAT.steel);
      arm.scale.set(1, 1, armLength);
      arm.position.set(0, ay, 0);
      g.add(arm);

      // Insulator strings hanging from each end (stack of porcelain discs).
      for (const side of [-1, 1]) {
        for (let d = 0; d < 6; d++) {
          const disc = new THREE.Mesh(GEO.insulatorDisc, MAT.porcelain);
          disc.position.set(0, ay - 0.18 - d * 0.07, side * armLength / 2);
          g.add(disc);
        }
      }
    }

    return g;
  }, [height]);

  return <primitive object={group} position={position} />;
}

// ────────────────────────────────────────────────────────────────────────────
// Catenary conductor with animated flow pulse
// ────────────────────────────────────────────────────────────────────────────

function ConductorLine({ from, to, sag = 1.0 }: {
  from: [number, number, number];
  to: [number, number, number];
  sag?: number;
}) {
  const { curve, tubeGeom } = useMemo(() => {
    const N = 24;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = from[0] + (to[0] - from[0]) * t;
      const z = from[2] + (to[2] - from[2]) * t;
      const yBase = from[1] + (to[1] - from[1]) * t;
      // Catenary-ish dip: 0 at endpoints, max at midpoint.
      const dip = sag * (1 - Math.cosh(2 * t - 1) / Math.cosh(1));
      pts.push(new THREE.Vector3(x, yBase - dip, z));
    }
    const c = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
    return { curve: c, tubeGeom: new THREE.TubeGeometry(c, 28, 0.025, 6, false) };
  }, [from, to, sag]);

  // Pulse riding the curve.
  const pulseRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!pulseRef.current) return;
    const t = (clock.elapsedTime * 0.15) % 1;
    const p = curve.getPointAt(t);
    pulseRef.current.position.copy(p);
  });

  return (
    <group>
      <mesh geometry={tubeGeom} material={MAT.conductor} />
      <group ref={pulseRef}>
        <mesh>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshBasicMaterial color="#ffe6b3" transparent opacity={0.95} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshBasicMaterial
            color="#ffd27a" transparent opacity={0.32}
            blending={THREE.AdditiveBlending} depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Power transformer (tank + radiators + bushings + concrete bund)
// ────────────────────────────────────────────────────────────────────────────

function Transformer({ position }: { position: [number, number, number] }) {
  // Containment bund
  return (
    <group position={position}>
      {/* Concrete bund */}
      <mesh material={MAT.concrete}>
        <boxGeometry args={[3.2, 0.25, 2.4]} />
      </mesh>
      <mesh position={[0, 0.13, 0]} material={MAT.concreteDark}>
        <boxGeometry args={[3.0, 0.02, 2.2]} />
      </mesh>
      {/* Main tank */}
      <mesh position={[0, 1.0, 0]} material={MAT.transformerTank}>
        <boxGeometry args={[2.2, 1.5, 1.4]} />
      </mesh>
      {/* Conservator tank on top */}
      <mesh position={[0.0, 1.95, 0.0]} rotation={[0, 0, Math.PI / 2]} material={MAT.transformerTank}>
        <cylinderGeometry args={[0.22, 0.22, 1.6, 14]} />
      </mesh>
      {/* Radiator fins on both long sides */}
      {[-1, 1].map((side) =>
        Array.from({ length: 9 }).map((_, i) => (
          <mesh key={`r${side}${i}`}
                position={[-0.9 + i * 0.225, 1.0, side * 0.78]}
                material={MAT.transformerRad}
                geometry={GEO.radiatorFin} />
        )),
      )}
      {/* Bushings (HV side, 3 phases) */}
      {[-0.7, 0, 0.7].map((bx) => (
        <group key={bx} position={[bx, 1.75, 0.45]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[0, i * 0.12, 0]} material={MAT.bushing}>
              <cylinderGeometry args={[0.07 - i * 0.005, 0.075 - i * 0.005, 0.12, 12]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* LV bushings on opposite side */}
      {[-0.5, 0, 0.5].map((bx) => (
        <group key={`lv${bx}`} position={[bx, 1.75, -0.45]}>
          {Array.from({ length: 3 }).map((_, i) => (
            <mesh key={i} position={[0, i * 0.1, 0]} material={MAT.bushing}>
              <cylinderGeometry args={[0.06, 0.065, 0.1, 12]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Substation cluster: dead-end portal, 3 transformers, switchgear, bus bars
// ────────────────────────────────────────────────────────────────────────────

function DeadEndPortal({ position }: { position: [number, number, number] }) {
  // Two A-frame steel structures with a crossbeam — where the incoming
  // transmission line terminates at the substation.
  return (
    <group position={position}>
      {[-3, 3].map((dx) => (
        <group key={dx} position={[dx, 0, 0]}>
          <mesh position={[0, 4, 0]} material={MAT.steel}>
            <boxGeometry args={[0.18, 8, 0.18]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 8, 0]} rotation={[0, 0, Math.PI / 2]} material={MAT.steel}>
        <boxGeometry args={[0.16, 6.2, 0.16]} />
      </mesh>
      {/* Insulator strings dropping from the crossbeam */}
      {[-2, 0, 2].map((dx) => (
        <group key={dx} position={[dx, 7.8, 0]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[0, -i * 0.08 - 0.08, 0]} material={MAT.porcelain}>
              <cylinderGeometry args={[0.07, 0.07, 0.05, 12]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function SwitchgearCabinet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.8, 0]} material={MAT.dcWall}>
        <boxGeometry args={[2.0, 1.6, 1.0]} />
      </mesh>
      {/* Door panel lines */}
      <mesh position={[0, 0.8, 0.51]} material={MAT.steelDark}>
        <boxGeometry args={[1.8, 1.4, 0.02]} />
      </mesh>
      {/* Roof overhang */}
      <mesh position={[0, 1.62, 0]} material={MAT.dcRoof}>
        <boxGeometry args={[2.2, 0.06, 1.2]} />
      </mesh>
    </group>
  );
}

function Substation() {
  return (
    <group position={[6, 0, 0]}>
      <DeadEndPortal position={[-4, 0, 0]} />
      <Transformer position={[0, 0, -2.0]} />
      <Transformer position={[0, 0, 0]} />
      <Transformer position={[0, 0, 2.0]} />
      <SwitchgearCabinet position={[4.5, 0, -2.0]} />
      <SwitchgearCabinet position={[4.5, 0, 0]} />
      <SwitchgearCabinet position={[4.5, 0, 2.0]} />
    </group>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Datacenter building — modular box with rooftop chillers + service yard
// ────────────────────────────────────────────────────────────────────────────

function Datacenter() {
  return (
    <group position={[18, 0, -3]}>
      {/* Main building */}
      <mesh position={[0, 3.0, 0]} material={MAT.dcWall}>
        <boxGeometry args={[14, 6.0, 9]} />
      </mesh>
      {/* Roof slab */}
      <mesh position={[0, 6.05, 0]} material={MAT.dcRoof}>
        <boxGeometry args={[14.4, 0.18, 9.4]} />
      </mesh>
      {/* Wall paneling lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-6.5 + i * 2.6, 3, 4.51]} material={MAT.steelDark}>
          <boxGeometry args={[0.04, 5.6, 0.02]} />
        </mesh>
      ))}
      {/* Service entry door + canopy */}
      <mesh position={[-6.4, 1.5, 4.6]} material={MAT.steelDark}>
        <boxGeometry args={[1.8, 3.0, 0.08]} />
      </mesh>
      <mesh position={[-6.4, 3.2, 5.0]} material={MAT.dcRoof}>
        <boxGeometry args={[2.4, 0.08, 1.0]} />
      </mesh>
      {/* Rooftop chillers */}
      {[-4, 0, 4].map((cx) => (
        <group key={cx} position={[cx, 6.6, 0]}>
          <mesh material={MAT.chiller}>
            <boxGeometry args={[3.2, 1.0, 2.4]} />
          </mesh>
          {/* Fan grilles */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.9, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} material={MAT.steelDark}>
              <ringGeometry args={[0.35, 0.6, 16]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Branded accent strip */}
      <mesh position={[0, 5.2, 4.52]} material={new THREE.MeshBasicMaterial({ color: '#22d3ee' })}>
        <boxGeometry args={[10, 0.12, 0.02]} />
      </mesh>
    </group>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Treeline — instanced low-poly spruce stands framing the site
// ────────────────────────────────────────────────────────────────────────────

function Treeline() {
  const group = useMemo(() => {
    const g = new THREE.Group();
    const canopyGeo = new THREE.ConeGeometry(1.1, 3.2, 7);
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#3f5a38', roughness: 0.95 });
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 1.0, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#5a4632', roughness: 0.9 });

    const count = 70;
    const canopies = new THREE.InstancedMesh(canopyGeo, canopyMat, count);
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
    canopies.castShadow = true;

    const dummy = new THREE.Object3D();
    // Deterministic pseudo-random placement (no Math.random — stable scene).
    const rand = (i: number, salt: number) =>
      (Math.sin(i * 127.1 + salt * 311.7) * 43758.5453) % 1;

    for (let i = 0; i < count; i++) {
      const band = i % 2; // two stands: behind the line, and far south
      const x = -55 + Math.abs(rand(i, 1)) * 95;
      const z = band === 0
        ? -16 - Math.abs(rand(i, 2)) * 14   // north treeline
        : 18 + Math.abs(rand(i, 3)) * 16;   // south treeline
      const s = 0.8 + Math.abs(rand(i, 4)) * 0.9;

      dummy.position.set(x, 1.0 * s + 0.5, z);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      canopies.setMatrixAt(i, dummy.matrix);

      dummy.position.set(x, 0.5 * s, z);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);
    }
    canopies.instanceMatrix.needsUpdate = true;
    trunks.instanceMatrix.needsUpdate = true;
    g.add(canopies, trunks);
    return g;
  }, []);

  return <primitive object={group} />;
}

// ────────────────────────────────────────────────────────────────────────────
// Drifting clouds — soft billboard sprites from a generated radial texture
// ────────────────────────────────────────────────────────────────────────────

function Clouds() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const ctx = c.getContext('2d')!;
    // Three overlapping soft blobs make a believable cumulus silhouette.
    for (const [cx, cy, r] of [[80, 70, 50], [130, 60, 60], [185, 72, 45]] as const) {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(255,255,255,0.85)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, c.width, c.height);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    map: tex, transparent: true, depthWrite: false, opacity: 0.9,
  }), [tex]);

  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () => [
      { x: -70, y: 38, z: -60, s: 26, v: 0.5 },
      { x: -10, y: 46, z: -85, s: 34, v: 0.35 },
      { x: 50, y: 42, z: -70, s: 28, v: 0.42 },
      { x: 90, y: 36, z: -40, s: 22, v: 0.55 },
      { x: -40, y: 44, z: 70, s: 30, v: 0.4 },
    ],
    [],
  );

  useFrame(({ clock, camera }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((c, i) => {
      const seed = seeds[i];
      // Slow eastward drift, wrapping across the world bounds.
      c.position.x = ((seed.x + t * seed.v + 150) % 300) - 150;
      c.lookAt(camera.position); // billboard
    });
  });

  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} material={mat}>
          <planeGeometry args={[s.s, s.s / 2]} />
        </mesh>
      ))}
    </group>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Powered-land parcel — the pitch made physical: a graded, fenced expansion
// pad beside the energized substation, staked and signed, ready to build.
// ────────────────────────────────────────────────────────────────────────────

function PoweredLandParcel() {
  const dirtMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#b09a74', roughness: 0.95 }),
    [],
  );

  const signTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#f5f1e8';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#1f2a3a';
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 496, 240);
    ctx.fillStyle = '#1f2a3a';
    ctx.textAlign = 'center';
    ctx.font = '700 56px Inter, system-ui, sans-serif';
    ctx.fillText('POWERED LAND', 256, 96);
    ctx.font = '600 40px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#f7931a';
    ctx.fillText('READY TO BUILD', 256, 165);
    ctx.font = '500 26px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('wattbyte.com', 256, 218);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  // Stake positions around the 22 × 14 graded pad.
  const stakes: [number, number][] = [];
  for (const sx of [-10, -5, 0, 5, 10]) { stakes.push([sx, -6.5]); stakes.push([sx, 6.5]); }
  for (const sz of [-3.25, 0, 3.25]) { stakes.push([-10, sz]); stakes.push([10, sz]); }

  return (
    <group position={[20, 0, 12]}>
      {/* Graded pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow material={dirtMat}>
        <planeGeometry args={[22, 14]} />
      </mesh>
      {/* Grading stripes — subtle dozer passes */}
      {[-4.5, -1.5, 1.5, 4.5].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, z]} material={MAT.concreteDark}>
          <planeGeometry args={[21, 0.12]} />
        </mesh>
      ))}
      {/* Survey stakes with high-vis tips */}
      {stakes.map(([sx, sz], i) => (
        <group key={i} position={[sx, 0, sz]}>
          <mesh position={[0, 0.45, 0]} material={MAT.steelDark}>
            <cylinderGeometry args={[0.025, 0.025, 0.9, 5]} />
          </mesh>
          <mesh position={[0, 0.92, 0]} material={new THREE.MeshBasicMaterial({ color: '#f7931a' })}>
            <boxGeometry args={[0.09, 0.14, 0.02]} />
          </mesh>
        </group>
      ))}
      {/* Site sign on two posts, facing the access road */}
      <group position={[-11.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {[-1.1, 1.1].map((sx) => (
          <mesh key={sx} position={[sx, 1.0, 0]} material={MAT.steelDark}>
            <cylinderGeometry args={[0.06, 0.06, 2.0, 8]} />
          </mesh>
        ))}
        <mesh position={[0, 1.7, 0.04]}>
          <planeGeometry args={[2.6, 1.3]} />
          <meshStandardMaterial map={signTex} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Top-level scene composition
// ────────────────────────────────────────────────────────────────────────────

export function EnergySite() {
  // Transmission line — towers running west toward the substation.
  const towerXs = [-46, -34, -22, -10];
  const towerY = 0;
  const towerZ = 0;
  const towerHeight = 13;
  const armYs = [towerHeight - 0.6, towerHeight - 2.0, towerHeight - 3.4];

  return (
    <group>
      <SkyDome />
      <GroundPlane />
      <Clouds />
      <Treeline />

      <ShadowCaster>
        <PerimeterFence />

        {/* Transmission towers + 3-phase conductors approaching the substation */}
        {towerXs.map((x, i) => (
          <TransmissionTower key={i} position={[x, towerY, towerZ]} height={towerHeight} />
        ))}

        <Substation />
        <Datacenter />
        <PoweredLandParcel />
      </ShadowCaster>

      {/* Phase conductors between consecutive towers + final span into the
          dead-end portal at x = 2 (substation entrance). Outside the shadow
          caster — thin tubes just add shadow-map noise. */}
      {[...towerXs, 2].map((x, i, arr) => {
        if (i === 0) return null;
        const xa = arr[i - 1], xb = x;
        return armYs.map((ay, phase) => {
          const zOff = (phase - 1) * 2.5;
          return (
            <ConductorLine
              key={`${i}-${phase}`}
              from={[xa, ay - 0.6, zOff]}
              to={[xb, ay - 0.6, zOff]}
              sag={0.9}
            />
          );
        });
      })}
    </group>
  );
}
