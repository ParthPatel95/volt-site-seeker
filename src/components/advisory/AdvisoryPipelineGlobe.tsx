import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { PIPELINE_PROJECTS, HQ, ENERGY_TYPE_COLORS, type PipelineProject } from '@/data/advisory-pipeline';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, MapPin, Play, Pause, Bug, Crosshair } from 'lucide-react';
import {
  GLOBE_RADIUS,
  latLngToVec3,
  tourQuaternionFor,
  getLngOffset,
  setLngOffset,
  vec3ToLatLng,
} from './globeProjection';

const RADIUS = GLOBE_RADIUS;

// ---- Texture calibration -------------------------------------------------
// Sample the day-map texture at known land/ocean reference points and pick
// the longitude offset (in degrees) that best matches expected land/ocean
// brightness. Land in NASA Blue Marble is bright/warm, deep ocean is dark blue.
type RefPoint = { name: string; lat: number; lng: number; isLand: boolean };
const CALIBRATION_REFS: RefPoint[] = [
  { name: 'London',         lat:  51.5,  lng:   -0.1, isLand: true  },
  { name: 'New York',       lat:  40.7,  lng:  -74.0, isLand: true  },
  { name: 'Sahara',         lat:  23.0,  lng:   13.0, isLand: true  },
  { name: 'Tokyo',          lat:  35.7,  lng:  139.7, isLand: true  },
  { name: 'Sydney',         lat: -33.9,  lng:  151.2, isLand: true  },
  { name: 'Mid-Atlantic',   lat:   0.0,  lng:  -30.0, isLand: false },
  { name: 'Mid-Pacific',    lat:   0.0,  lng: -150.0, isLand: false },
  { name: 'South Indian',   lat: -40.0,  lng:   80.0, isLand: false },
];

// Score a "land-likeness" of an RGB pixel from NASA Blue Marble.
// Land is bright with R/G dominance; deep ocean is dark with strong B.
const landScore = (r: number, g: number, b: number) => {
  const lum = (r + g + b) / 3;
  const blueDominance = b - (r + g) / 2;
  // Higher = more land-like
  return lum / 255 - Math.max(0, blueDominance) / 128;
};

const calibrateLongitudeOffset = (tex: THREE.Texture): number => {
  const img = tex.image as HTMLImageElement | HTMLCanvasElement | ImageBitmap;
  if (!img) return 0;
  const w = (img as HTMLImageElement).naturalWidth || (img as HTMLCanvasElement).width || 1024;
  const h = (img as HTMLImageElement).naturalHeight || (img as HTMLCanvasElement).height || 512;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0;
  try {
    ctx.drawImage(img as CanvasImageSource, 0, 0, w, h);
  } catch {
    return 0; // CORS-tainted; bail
  }

  // Sample helper: given lat/lng + candidate offset, return land score.
  const sampleAt = (lat: number, lng: number, offsetDeg: number) => {
    // Three.js default sphere UV: u = 0 at lng=+180, u=0.5 at lng=0, u=1 at lng=-180.
    // We want a mapping such that latLngToVec3 lands on the correct UV.
    // The on-screen position of (lat,lng) is determined by (lng + offset);
    // so to read the texture pixel that WILL appear there, use the same shift.
    let shifted = ((lng + offsetDeg + 540) % 360) - 180; // wrap to [-180,180]
    const u = (180 - shifted) / 360;       // matches three.js default mapping
    const v = (90 - lat) / 180;
    const x = Math.max(0, Math.min(w - 1, Math.floor(u * w)));
    const y = Math.max(0, Math.min(h - 1, Math.floor(v * h)));
    // Average a small 3x3 patch to reduce coastline noise
    let r = 0, g = 0, b = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const px = ctx.getImageData(
          Math.max(0, Math.min(w - 1, x + dx)),
          Math.max(0, Math.min(h - 1, y + dy)),
          1, 1,
        ).data;
        r += px[0]; g += px[1]; b += px[2]; n++;
      }
    }
    return landScore(r / n, g / n, b / n);
  };

  // Try offsets in 5° steps; pick the one that maximizes correctness.
  let best = { offset: 0, score: -Infinity };
  for (let off = -180; off < 180; off += 5) {
    let score = 0;
    for (const ref of CALIBRATION_REFS) {
      const s = sampleAt(ref.lat, ref.lng, off);
      score += ref.isLand ? s : -s;
    }
    if (score > best.score) best = { offset: off, score };
  }
  // Refine with 1° steps around the winner
  const coarse = best.offset;
  for (let off = coarse - 5; off <= coarse + 5; off += 1) {
    let score = 0;
    for (const ref of CALIBRATION_REFS) {
      const s = sampleAt(ref.lat, ref.lng, off);
      score += ref.isLand ? s : -s;
    }
    if (score > best.score) best = { offset: off, score };
  }
  // Normalize to [-180, 180]
  const norm = ((best.offset + 540) % 360) - 180;
  // eslint-disable-next-line no-console
  console.info(`[Globe] Auto-calibrated longitude offset: ${norm}° (score=${best.score.toFixed(2)})`);
  return norm;
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

type FlyTarget = { lat: number; lng: number; id: string } | null;

type EarthProps = {
  paused: boolean;
  flyTo: FlyTarget;
  pickMode: boolean;
  onPickPoint?: (localUnit: THREE.Vector3) => void;
};

const Earth: React.FC<EarthProps> = ({ paused, flyTo, pickMode, onPickPoint }) => {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [calVersion, setCalVersion] = useState(0);

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

  // Auto-calibrate the longitude offset from the loaded day-map texture.
  useEffect(() => {
    if (!dayMap?.image) return;
    const offset = calibrateLongitudeOffset(dayMap);
    if (offset !== getLngOffset()) {
      setLngOffset(offset);
      setCalVersion(v => v + 1); // force markers/arcs/tour to recompute
    }
  }, [dayMap]);

  // Tour through HQ + each pipeline site. We rotate the globe group so OrbitControls still works.
  const tourStops = useMemo(() => {
    const stops = [
      { lat: HQ.lat, lng: HQ.lng },
      ...PIPELINE_PROJECTS.map(p => ({ lat: p.lat, lng: p.lng })),
    ];
    return stops.map(s => tourQuaternionFor(s.lat, s.lng));
  }, [calVersion]);

  const tourState = useRef({ index: 0, holdUntil: 0, lastAdvance: 0 });

  // Fly-to animation state. When `flyTo` is set we ease the group to the
  // site's quaternion with a cubic ease-out and dolly the camera slightly
  // closer; on release we ease back. Lighting lives at the scene level so
  // it never moves with the globe.
  const FLY_DURATION = 1.4; // seconds
  const CAMERA_HOME = 5.5;
  const CAMERA_FOCUSED = 4.2;
  const flyState = useRef<{
    activeId: string | null;
    fromQ: THREE.Quaternion;
    toQ: THREE.Quaternion;
    fromCamZ: number;
    toCamZ: number;
    startedAt: number;
    holding: boolean;
  }>({
    activeId: null,
    fromQ: new THREE.Quaternion(),
    toQ: new THREE.Quaternion(),
    fromCamZ: CAMERA_HOME,
    toCamZ: CAMERA_HOME,
    startedAt: 0,
    holding: false,
  });

  const { camera } = useThree();

  // Kick off / cancel a fly-to whenever the selected site changes.
  useEffect(() => {
    if (!groupRef.current) return;
    const fs = flyState.current;
    if (flyTo) {
      fs.activeId = flyTo.id;
      fs.fromQ = groupRef.current.quaternion.clone();
      fs.toQ = tourQuaternionFor(flyTo.lat, flyTo.lng);
      fs.fromCamZ = camera.position.z;
      fs.toCamZ = CAMERA_FOCUSED;
      fs.startedAt = performance.now() / 1000;
      fs.holding = false;
    } else if (fs.activeId) {
      // Released: ease camera back to home, leave rotation where it is so
      // the tour can resume from the current orientation without a jump.
      fs.activeId = null;
      fs.fromQ = groupRef.current.quaternion.clone();
      fs.toQ = groupRef.current.quaternion.clone();
      fs.fromCamZ = camera.position.z;
      fs.toCamZ = CAMERA_HOME;
      fs.startedAt = performance.now() / 1000;
      fs.holding = false;
    }
  }, [flyTo, camera]);

  // Cubic ease-out for a smooth, decelerating fly-in.
  const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

  useFrame(({ clock }) => {
    if (cloudsRef.current && !paused) cloudsRef.current.rotation.y += 0.00035;
    if (!groupRef.current) return;

    const fs = flyState.current;
    const now = performance.now() / 1000;

    // Fly-to mode (selected site) — overrides the tour entirely.
    if (fs.activeId || fs.toCamZ !== camera.position.z) {
      const elapsed = now - fs.startedAt;
      const k = Math.min(1, elapsed / FLY_DURATION);
      const eased = easeOutCubic(k);
      const q = fs.fromQ.clone().slerp(fs.toQ, eased);
      groupRef.current.quaternion.copy(q);
      camera.position.z = fs.fromCamZ + (fs.toCamZ - fs.fromCamZ) * eased;
      if (k >= 1) fs.holding = true;
      return; // freeze the tour while flying / focused
    }

    if (paused) return;

    const t = clock.getElapsedTime();
    const target = tourStops[tourState.current.index];
    // Slerp toward current target stop (faster)
    groupRef.current.quaternion.slerp(target, 0.06);
    const angle = groupRef.current.quaternion.angleTo(target);
    // Advance when close enough, OR after a max-time fallback so we never get stuck
    const elapsedSinceAdvance = t - tourState.current.lastAdvance;
    const reached = angle < 0.05;
    if (reached && tourState.current.holdUntil === 0) {
      tourState.current.holdUntil = t + 2.2;
    }
    const shouldAdvance =
      (tourState.current.holdUntil > 0 && t >= tourState.current.holdUntil) ||
      elapsedSinceAdvance > 6.5; // hard fallback
    if (shouldAdvance) {
      tourState.current.index = (tourState.current.index + 1) % tourStops.length;
      tourState.current.holdUntil = 0;
      tourState.current.lastAdvance = t;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Earth surface — photorealistic */}
      <mesh
        onClick={(e) => {
          if (!pickMode || !onPickPoint || !groupRef.current) return;
          e.stopPropagation();
          // Convert the world-space hit point into the globe group's local
          // frame so the picked direction is independent of tour rotation.
          const local = groupRef.current.worldToLocal(e.point.clone()).normalize();
          onPickPoint(local);
        }}
      >
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
      <HQMarker key={`hq-${calVersion}`} />
      {/* Project markers + arcs */}
      {PIPELINE_PROJECTS.map((p) => (
        <ProjectMarker key={`${p.id}-${calVersion}`} project={p} />
      ))}
      {PIPELINE_PROJECTS.map((p) => (
        <Arc key={`arc-${p.id}-${calVersion}`} project={p} />
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

type SceneProps = EarthProps;
const Scene: React.FC<SceneProps> = ({ paused, flyTo, pickMode, onPickPoint }) => (
  <>
    <ambientLight intensity={0.45} color="#2a3550" />
    <directionalLight position={[5, 3, 5]} intensity={1.7} color="#fff5e6" />
    <directionalLight position={[-5, 1, -3]} intensity={0.25} color="#6aa9ff" />
    <directionalLight position={[-6, -2, -4]} intensity={0.12} color="#F7931A" />
    <Stars radius={60} depth={25} count={600} factor={3} saturation={0} fade speed={0.3} />
    <Earth paused={paused} flyTo={flyTo} pickMode={pickMode} onPickPoint={onPickPoint} />
    <OrbitControls
      enablePan={false}
      enableZoom={!flyTo}
      enableRotate={!flyTo}
      autoRotate={false}
      minDistance={3.5}
      maxDistance={8}
    />
  </>
);

export const AdvisoryPipelineGlobe: React.FC = () => {
  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const paused = hoverPaused || manualPaused;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [debug, setDebug] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [pick, setPick] = useState<{
    clickLat: number;
    clickLng: number;
    clickVec: THREE.Vector3;
    nearestId: string;
    nearestName: string;
    nearestLat: number;
    nearestLng: number;
    nearestVec: THREE.Vector3;
    greatCircleDeg: number;
  } | null>(null);

  // All known marker positions as unit vectors for nearest-neighbor search.
  const markerCatalog = useMemo(() => {
    return [
      { id: 'hq', name: HQ.name, lat: HQ.lat, lng: HQ.lng, unit: latLngToVec3(HQ.lat, HQ.lng, 1) },
      ...PIPELINE_PROJECTS.map(p => ({
        id: p.id, name: p.location, lat: p.lat, lng: p.lng,
        unit: latLngToVec3(p.lat, p.lng, 1),
      })),
    ];
  }, []);

  const handlePickPoint = (localUnit: THREE.Vector3) => {
    const { lat: clickLat, lng: clickLng } = vec3ToLatLng(localUnit);
    let best = markerCatalog[0];
    let bestDot = -Infinity;
    for (const m of markerCatalog) {
      const d = m.unit.dot(localUnit);
      if (d > bestDot) { bestDot = d; best = m; }
    }
    const greatCircleDeg = Math.acos(Math.max(-1, Math.min(1, bestDot))) * (180 / Math.PI);
    setPick({
      clickLat,
      clickLng,
      clickVec: localUnit.clone().multiplyScalar(RADIUS * 1.025),
      nearestId: best.id,
      nearestName: best.name,
      nearestLat: best.lat,
      nearestLng: best.lng,
      nearestVec: latLngToVec3(best.lat, best.lng, RADIUS * 1.025),
      greatCircleDeg,
    });
  };

  React.useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setSelectedId(id);
    };
    window.addEventListener('advisory-globe-select', handler);
    return () => window.removeEventListener('advisory-globe-select', handler);
  }, []);

  const selected = PIPELINE_PROJECTS.find(p => p.id === selectedId) ?? null;
  const flyTo: FlyTarget = selected
    ? { id: selected.id, lat: selected.lat, lng: selected.lng }
    : null;

  // Computed coordinates for the debug overlay (HQ + every pipeline site).
  // Re-derived from the same projection used by the markers themselves so
  // the readout always matches what's rendered.
  const debugRows = useMemo(() => {
    const fmt = (n: number) => n.toFixed(3);
    const rows = [
      { id: 'hq', name: HQ.name, lat: HQ.lat, lng: HQ.lng, vec: latLngToVec3(HQ.lat, HQ.lng, RADIUS * 1.025) },
      ...PIPELINE_PROJECTS.map(p => ({
        id: p.id,
        name: p.location,
        lat: p.lat,
        lng: p.lng,
        vec: latLngToVec3(p.lat, p.lng, RADIUS * 1.025),
      })),
    ];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      latStr: `${fmt(r.lat)}°, ${fmt(r.lng)}°`,
      vecStr: `(${fmt(r.vec.x)}, ${fmt(r.vec.y)}, ${fmt(r.vec.z)})`,
    }));
  }, [debug, selectedId]); // selectedId so it refreshes when calibration shifts on first load

  return (
    <div
      className="relative w-full h-[520px] md:h-[620px] rounded-xl overflow-hidden border border-border bg-[hsl(var(--watt-navy))]"
      style={pickMode ? { cursor: 'crosshair' } : undefined}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Scene
            paused={paused || !!flyTo}
            flyTo={flyTo}
            pickMode={pickMode}
            onPickPoint={handlePickPoint}
          />
        </Suspense>
      </Canvas>

      {/* Legend — hovering here pauses the tour so users can read */}
      <div
        className="absolute top-4 left-4 bg-background/90 backdrop-blur border border-border rounded-lg p-3 text-xs space-y-1.5 max-w-[180px]"
        onPointerEnter={() => setHoverPaused(true)}
        onPointerLeave={() => setHoverPaused(false)}
      >
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

      {/* Play / Pause control */}
      <div
        className="absolute top-4 right-4 flex gap-2"
        onPointerEnter={() => setHoverPaused(true)}
        onPointerLeave={() => setHoverPaused(false)}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setManualPaused(p => !p)}
          className="bg-background/90 backdrop-blur border border-border gap-1.5"
          aria-label={manualPaused ? 'Play tour' : 'Pause tour'}
        >
          {manualPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span className="text-xs">{manualPaused ? 'Play' : 'Pause'}</span>
        </Button>
        <Button
          variant={debug ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setDebug(d => !d)}
          className="bg-background/90 backdrop-blur border border-border gap-1.5"
          aria-label={debug ? 'Hide debug coordinates' : 'Show debug coordinates'}
          aria-pressed={debug}
        >
          <Bug className="w-3.5 h-3.5" />
          <span className="text-xs">Debug</span>
        </Button>
        <Button
          variant={pickMode ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setPickMode(p => !p)}
          className="bg-background/90 backdrop-blur border border-border gap-1.5"
          aria-label={pickMode ? 'Disable pick mode' : 'Enable pick mode'}
          aria-pressed={pickMode}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span className="text-xs">Pick</span>
        </Button>
      </div>

      {/* Pick-mode readout */}
      {pickMode && (
        <div
          className="absolute bottom-4 left-4 w-[280px] bg-background/95 backdrop-blur border border-border rounded-lg p-3 text-[10px] font-mono shadow-xl"
          style={debug ? { bottom: 'auto', top: '4.5rem' } : undefined}
          onPointerEnter={() => setHoverPaused(true)}
          onPointerLeave={() => setHoverPaused(false)}
        >
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border">
            <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
              <Crosshair className="w-3.5 h-3.5" /> Pick mode
            </div>
            {pick && (
              <button
                onClick={() => setPick(null)}
                className="text-muted-foreground hover:text-foreground text-[10px]"
              >
                Clear
              </button>
            )}
          </div>
          {!pick ? (
            <div className="text-muted-foreground">Click anywhere on the globe to find the nearest site.</div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-0.5">
                <div className="text-foreground font-semibold">Click point</div>
                <div className="text-muted-foreground">
                  lat/lng: {pick.clickLat.toFixed(3)}°, {pick.clickLng.toFixed(3)}°
                </div>
                <div className="text-muted-foreground">
                  xyz: ({pick.clickVec.x.toFixed(3)}, {pick.clickVec.y.toFixed(3)}, {pick.clickVec.z.toFixed(3)})
                </div>
              </div>
              <div className="space-y-0.5 pt-1.5 border-t border-border">
                <div className="text-foreground font-semibold">Nearest: {pick.nearestName}</div>
                <div className="text-muted-foreground">
                  lat/lng: {pick.nearestLat.toFixed(3)}°, {pick.nearestLng.toFixed(3)}°
                </div>
                <div className="text-muted-foreground">
                  xyz: ({pick.nearestVec.x.toFixed(3)}, {pick.nearestVec.y.toFixed(3)}, {pick.nearestVec.z.toFixed(3)})
                </div>
                <div className="text-muted-foreground">
                  arc distance: {pick.greatCircleDeg.toFixed(2)}°
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Debug overlay — lat/lng + computed 3D coordinates per site */}
      {debug && (
        <div
          className="absolute bottom-4 left-4 max-h-[60%] w-[280px] overflow-y-auto bg-background/95 backdrop-blur border border-border rounded-lg p-3 text-[10px] font-mono shadow-xl"
          onPointerEnter={() => setHoverPaused(true)}
          onPointerLeave={() => setHoverPaused(false)}
        >
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border">
            <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
              <Bug className="w-3.5 h-3.5" /> Globe debug
            </div>
            <span className="text-muted-foreground text-[10px]">{debugRows.length} sites</span>
          </div>
          <div className="space-y-1.5">
            {debugRows.map(r => (
              <div key={r.id} className="space-y-0.5">
                <div className="text-foreground font-semibold">{r.name}</div>
                <div className="text-muted-foreground">lat/lng: {r.latStr}</div>
                <div className="text-muted-foreground">xyz: {r.vecStr}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-1.5 border-t border-border text-muted-foreground text-[9px]">
            Radius {(RADIUS * 1.025).toFixed(3)} · lng offset {getLngOffset()}°
          </div>
        </div>
      )}

      {/* Selected project panel */}
      {selected && (
        <Card
          className="absolute bottom-4 right-4 left-4 md:left-auto md:w-80 p-4 bg-background/95 backdrop-blur border-border shadow-xl"
          onPointerEnter={() => setHoverPaused(true)}
          onPointerLeave={() => setHoverPaused(false)}
        >
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
