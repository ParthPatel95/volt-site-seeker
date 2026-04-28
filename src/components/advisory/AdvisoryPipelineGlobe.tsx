import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { PIPELINE_PROJECTS, HQ, ENERGY_TYPE_COLORS, type PipelineProject } from '@/data/advisory-pipeline';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, MapPin } from 'lucide-react';

const RADIUS = 2;

// Convert lat/lng to a position on a textured sphere using the canonical
// three.js mapping for an equirectangular Earth texture (mrdoob earth_atmos_2048).
// With this mapping, lng=0 (Greenwich) sits on -X, lng=+90 (Asia) on +Z,
// lng=-90 (Americas) on -Z, and lng=180 (Pacific) on +X.
// Convert lat/lng to a sphere position aligned with the mrdoob earth_atmos
// equirectangular texture as wrapped by three.js SphereGeometry default UVs:
//   lng = -180  -> +X        lng = 0  -> -X (Greenwich / Africa-Europe)
//   lng =  -90  -> -Z (Americas)   lng = +90 -> +Z (Asia)
const latLngToVec3 = (lat: number, lng: number, r: number) => {
  const latRad = lat * (Math.PI / 180);
  const lngRad = lng * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.cos(latRad) * Math.cos(lngRad),
     r * Math.sin(latRad),
     r * Math.cos(latRad) * Math.sin(lngRad),
  );
};

// Atmosphere shader: fresnel rim glow, additive blended on a back-side sphere
const atmosphereVertex = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmosphereFragment = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 1.9);
    gl_FragColor = vec4(0.23, 0.56, 1.0, 1.0) * intensity;
  }
`;

const Earth: React.FC<{ paused: boolean }> = ({ paused }) => {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Real photographic Earth textures (served from /public, same origin)
  const [dayMap, bumpMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth/earth-day-2k.jpg',
    '/textures/earth/earth-bump-1k.jpg',
    '/textures/earth/earth-clouds-2k.png',
  ]);

  useMemo(() => {
    [dayMap, cloudsMap].forEach(t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; });
    bumpMap.anisotropy = 4;
  }, [dayMap, bumpMap, cloudsMap]);

  // Tour through HQ + each pipeline site. We rotate the globe group so OrbitControls still works.
  const tourStops = useMemo(() => {
    const stops = [
      { lat: HQ.lat, lng: HQ.lng },
      ...PIPELINE_PROJECTS.map(p => ({ lat: p.lat, lng: p.lng })),
    ];
    return stops.map(s => {
      // Direction from globe center to the site (in local sphere space, unit length)
      const v = latLngToVec3(s.lat, s.lng, 1).normalize();
      // Quaternion that rotates `v` to face +Z (toward camera). With a slight downward
      // tilt so northern sites don't sit at the very top of the globe.
      const target = new THREE.Vector3(0, -0.18, 1).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(v, target);
      return q;
    });
  }, []);

  const tourState = useRef({ index: 0, holdUntil: 0 });

  useFrame(({ clock }) => {
    if (cloudsRef.current && !paused) cloudsRef.current.rotation.y += 0.00035;
    if (!groupRef.current || paused) return;
    const t = clock.getElapsedTime();
    const target = tourStops[tourState.current.index];
    // Slerp toward current target stop
    groupRef.current.quaternion.slerp(target, 0.025);
    // Once close enough, hold for 2.5s then advance
    const angle = groupRef.current.quaternion.angleTo(target);
    if (angle < 0.02) {
      if (tourState.current.holdUntil === 0) tourState.current.holdUntil = t + 2.5;
      if (t >= tourState.current.holdUntil) {
        tourState.current.index = (tourState.current.index + 1) % tourStops.length;
        tourState.current.holdUntil = 0;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Earth surface — photorealistic */}
      <mesh>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshPhongMaterial
          map={dayMap}
          bumpMap={bumpMap}
          bumpScale={0.04}
          specular={new THREE.Color('#1a3a5c')}
          shininess={12}
        />
      </mesh>
      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[RADIUS * 1.012, 64, 64]} />
        <meshLambertMaterial map={cloudsMap} transparent opacity={0.4} depthWrite={false} />
      </mesh>
      {/* Atmospheric fresnel glow */}
      <mesh scale={1.08}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <shaderMaterial
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
      {/* HQ marker */}
      <HQMarker />
      {/* Project markers + arcs */}
      {PIPELINE_PROJECTS.map((p) => (
        <ProjectMarker key={p.id} project={p} />
      ))}
      {PIPELINE_PROJECTS.map((p) => (
        <Arc key={`arc-${p.id}`} project={p} />
      ))}
    </group>
  );
};

const HQMarker: React.FC = () => {
  const pos = latLngToVec3(HQ.lat, HQ.lng, RADIUS * 1.025);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#F7931A" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#F7931A" transparent opacity={0.18} />
      </mesh>
    </group>
  );
};

const ProjectMarker: React.FC<{ project: PipelineProject }> = ({ project }) => {
  const pos = latLngToVec3(project.lat, project.lng, RADIUS * 1.025);
  const ringRef = useRef<THREE.Mesh>(null);
  const color = ENERGY_TYPE_COLORS[project.energyType].hex;
  const size = 0.035 + Math.min(project.capacityMw / 1000, 0.04);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 2 + project.lat) * 0.2;
      ringRef.current.scale.set(s, s, s);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('advisory-globe-select', { detail: project.id }));
  };

  return (
    <group position={pos}>
      <mesh onClick={handleClick} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = 'auto'; }}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ringRef}>
        <sphereGeometry args={[size * 1.8, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>
    </group>
  );
};

const Arc: React.FC<{ project: PipelineProject }> = ({ project }) => {
  const start = latLngToVec3(HQ.lat, HQ.lng, RADIUS * 1.025);
  const end = latLngToVec3(project.lat, project.lng, RADIUS * 1.025);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  mid.normalize().multiplyScalar(RADIUS + dist * 0.4);
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(start, mid, end), [project.id]);
  const points = useMemo(() => curve.getPoints(40), [curve]);
  const color = ENERGY_TYPE_COLORS[project.energyType].hex;
  const lineObject = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });
    return new THREE.Line(geometry, material);
  }, [points, color]);

  return <primitive object={lineObject} />;
};

const Scene: React.FC<{ paused: boolean }> = ({ paused }) => (
  <>
    <ambientLight intensity={0.45} color="#2a3550" />
    <directionalLight position={[5, 3, 5]} intensity={1.7} color="#fff5e6" />
    <directionalLight position={[-5, 1, -3]} intensity={0.25} color="#6aa9ff" />
    <directionalLight position={[-6, -2, -4]} intensity={0.12} color="#F7931A" />
    <Stars radius={60} depth={25} count={600} factor={3} saturation={0} fade speed={0.3} />
    <Earth paused={paused} />
    <OrbitControls enablePan={false} enableZoom autoRotate={false} minDistance={3.5} maxDistance={8} />
  </>
);

export const AdvisoryPipelineGlobe: React.FC = () => {
  const [paused, setPaused] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setSelectedId(id);
    };
    window.addEventListener('advisory-globe-select', handler);
    return () => window.removeEventListener('advisory-globe-select', handler);
  }, []);

  const selected = PIPELINE_PROJECTS.find(p => p.id === selectedId) ?? null;

  return (
    <div className="relative w-full h-[520px] md:h-[620px] rounded-xl overflow-hidden border border-border bg-[hsl(var(--watt-navy))]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <Scene paused={paused} />
        </Suspense>
      </Canvas>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur border border-border rounded-lg p-3 text-xs space-y-1.5 max-w-[180px]">
        <div className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> Energy mix
        </div>
        {Object.entries(ENERGY_TYPE_COLORS).map(([type, c]) => (
          <div key={type} className="flex items-center gap-2 text-muted-foreground">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
            {type}
          </div>
        ))}
        <div className="pt-1.5 mt-1.5 border-t border-border text-[10px] text-muted-foreground">
          Drag to rotate · scroll to zoom
        </div>
      </div>

      {/* Selected project panel */}
      {selected && (
        <Card className="absolute bottom-4 right-4 left-4 md:left-auto md:w-80 p-4 bg-background/95 backdrop-blur border-border shadow-xl">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span>{selected.flagEmoji}</span> {selected.country}
              </div>
              <h4 className="font-bold text-foreground leading-tight">{selected.location}</h4>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setSelectedId(null)} aria-label="Close">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="font-mono">{selected.capacityMw} MW</Badge>
            <Badge style={{ backgroundColor: ENERGY_TYPE_COLORS[selected.energyType].hex, color: '#fff' }} className="border-0">
              {selected.energyType}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{selected.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{selected.description}</p>
        </Card>
      )}
    </div>
  );
};
