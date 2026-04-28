import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PIPELINE_PROJECTS, HQ, ENERGY_TYPE_COLORS, type PipelineProject } from '@/data/advisory-pipeline';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, MapPin } from 'lucide-react';

const RADIUS = 2;

const latLngToVec3 = (lat: number, lng: number, r: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
};

const Earth: React.FC<{ paused: boolean }> = ({ paused }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current && !paused) ref.current.rotation.y += 0.0008;
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshPhongMaterial color="#0A1628" emissive="#0A1628" emissiveIntensity={0.3} shininess={8} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[RADIUS + 0.005, 32, 32]} />
        <meshBasicMaterial color="#1e3a5f" wireframe transparent opacity={0.3} />
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
  const pos = latLngToVec3(HQ.lat, HQ.lng, RADIUS + 0.02);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#F7931A" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#F7931A" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};

const ProjectMarker: React.FC<{ project: PipelineProject }> = ({ project }) => {
  const pos = latLngToVec3(project.lat, project.lng, RADIUS + 0.02);
  const ringRef = useRef<THREE.Mesh>(null);
  const color = ENERGY_TYPE_COLORS[project.energyType].hex;
  const size = 0.04 + Math.min(project.capacityMw / 600, 0.08);

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
  const start = latLngToVec3(HQ.lat, HQ.lng, RADIUS + 0.02);
  const end = latLngToVec3(project.lat, project.lng, RADIUS + 0.02);
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
    <ambientLight intensity={0.6} />
    <pointLight position={[10, 10, 10]} intensity={1.2} />
    <pointLight position={[-10, -5, -5]} intensity={0.4} color="#F7931A" />
    <Stars radius={50} depth={30} count={2000} factor={3} saturation={0} fade speed={0.5} />
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
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 2]}>
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
