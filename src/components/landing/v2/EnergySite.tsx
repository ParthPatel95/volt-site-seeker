import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
      bottomColor: { value: new THREE.Color('#f4d9b3') },
      sunDir:      { value: new THREE.Vector3(-0.6, 0.35, -0.2).normalize() },
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
      <PerimeterFence />

      {/* Transmission towers + 3-phase conductors approaching the substation */}
      {towerXs.map((x, i) => (
        <TransmissionTower key={i} position={[x, towerY, towerZ]} height={towerHeight} />
      ))}

      {/* Phase conductors between consecutive towers + final span into the
          dead-end portal at x = 2 (substation entrance). */}
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

      <Substation />
      <Datacenter />
    </group>
  );
}
