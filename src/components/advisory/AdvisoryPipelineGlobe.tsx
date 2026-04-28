import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
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

// Procedural Earth texture: deep ocean blue with stylized continents, drawn once on a 2D canvas
// then mapped to the sphere. Avoids external image fetches and guarantees the globe never reads as black.
const useEarthTexture = () => {
  return useMemo(() => {
    const w = 2048;
    const h = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // Ocean gradient
    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, '#0c2742');
    ocean.addColorStop(0.5, '#11365c');
    ocean.addColorStop(1, '#0c2742');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);

    // Subtle latitude bands
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    for (let y = 0; y < h; y += 24) ctx.fillRect(0, y, w, 1);

    // Stylized continent silhouettes (lon/lat polygon points -> equirectangular pixels)
    const project = (lng: number, lat: number): [number, number] => [
      ((lng + 180) / 360) * w,
      ((90 - lat) / 180) * h,
    ];
    const drawShape = (pts: [number, number][], fill: string) => {
      ctx.beginPath();
      pts.forEach(([lng, lat], i) => {
        const [x, y] = project(lng, lat);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };

    const land = '#1f4d2b';
    const landHighlight = '#2a6b3c';

    // North America
    drawShape([
      [-168,66],[-140,70],[-95,70],[-78,62],[-55,52],[-65,45],[-78,40],[-82,28],[-97,25],[-105,30],[-117,32],[-125,40],[-135,55],[-155,60],[-168,66]
    ], land);
    // Central America
    drawShape([[-105,18],[-90,18],[-77,8],[-83,8],[-95,15],[-105,18]], land);
    // South America
    drawShape([
      [-80,12],[-60,10],[-50,0],[-35,-8],[-38,-22],[-55,-35],[-70,-55],[-72,-40],[-78,-15],[-80,12]
    ], land);
    // Europe
    drawShape([
      [-10,58],[5,60],[30,60],[40,55],[40,45],[20,40],[5,42],[-10,45],[-10,58]
    ], land);
    // Africa
    drawShape([
      [-17,32],[10,35],[32,32],[42,12],[50,10],[40,-10],[35,-32],[18,-35],[10,-5],[-10,5],[-17,15],[-17,32]
    ], land);
    // Asia
    drawShape([
      [40,68],[80,75],[140,72],[155,60],[140,45],[125,30],[110,18],[95,8],[78,8],[68,22],[55,28],[45,40],[40,55],[40,68]
    ], land);
    // India subcontinent (highlight)
    drawShape([[68,30],[88,30],[88,18],[78,8],[72,18],[68,30]], landHighlight);
    // Southeast Asia islands
    drawShape([[95,5],[120,5],[140,-5],[120,-10],[100,-5],[95,5]], land);
    // Australia
    drawShape([[113,-12],[145,-12],[153,-25],[140,-38],[120,-35],[113,-25],[113,-12]], land);
    // Greenland
    drawShape([[-55,82],[-25,82],[-20,70],[-50,60],[-55,82]], land);
    // Antarctica band
    ctx.fillStyle = 'rgba(220,230,240,0.55)';
    ctx.fillRect(0, h - 70, w, 70);

    // Soft noise for organic feel
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);
};

const Earth: React.FC<{ paused: boolean }> = ({ paused }) => {
  const ref = useRef<THREE.Group>(null);
  const earthTexture = useEarthTexture();
  useFrame(() => {
    if (ref.current && !paused) ref.current.rotation.y += 0.0008;
  });
  return (
    <group ref={ref}>
      {/* Earth surface */}
      <mesh>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshPhongMaterial map={earthTexture} shininess={14} specular={new THREE.Color('#1e3a5f')} />
      </mesh>
      {/* Subtle wireframe overlay */}
      <mesh>
        <sphereGeometry args={[RADIUS + 0.004, 24, 24]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.12} />
      </mesh>
      {/* Atmospheric glow */}
      <mesh>
        <sphereGeometry args={[RADIUS + 0.06, 32, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.07} side={THREE.BackSide} />
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
    <ambientLight intensity={0.85} />
    <directionalLight position={[5, 3, 5]} intensity={1.1} />
    <directionalLight position={[-6, -2, -4]} intensity={0.35} color="#F7931A" />
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
