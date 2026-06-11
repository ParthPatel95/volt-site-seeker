import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileSearch, X } from 'lucide-react';
import type { ScoredGem } from '@/lib/hidden-gems';
import type { GemContext } from '@/lib/hidden-gems';
import { REGIONS, projectToScene, mwToBarHeight, statusColor, type RegionSpec } from '@/lib/gem-scene';

// Interactive 3D overview of the Hidden Gems registry.
//
// Visual contract ("nothing made up"):
//   * Bar height = MW estimate. No estimate → flat disc, never a guessed bar.
//   * Color = registry operating status.
//   * Substations (curated, real rows) = small cyan cones; transmission
//     segments (Alberta curated set) = thin lines on the ground plane.
//   * Click any bar for the same provenance card as the list view.

interface Props {
  gems: ScoredGem[];
  ctxByState: Record<string, GemContext>;
  onAnalyze: (loc: { lat: number; lng: number; label?: string }) => void;
}

export default function HiddenGems3D({ gems, ctxByState, onAnalyze }: Props) {
  const [region, setRegion] = useState<'AB' | 'TX'>('AB');
  const [selected, setSelected] = useState<ScoredGem | null>(null);
  const spec = REGIONS[region];

  const regionGems = useMemo(
    () => gems.filter((g) => (g.facility.state ?? 'AB') === region),
    [gems, region],
  );
  const ctx = ctxByState[region];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {(['AB', 'TX'] as const).map((r) => (
          <Button key={r} size="sm" variant={region === r ? 'default' : 'outline'}
            className="h-7 text-xs" onClick={() => { setRegion(r); setSelected(null); }}>
            {REGIONS[r].label}
          </Button>
        ))}
        <span className="text-[11px] text-muted-foreground ml-2">
          Bar height = MW estimate (flat disc = no published/modelled figure — by design) ·
          color = status · cyan cones = curated substations
          {region === 'AB' && ' · ground lines = curated transmission segments'}
        </span>
      </div>

      <div className="relative h-[520px] rounded-lg overflow-hidden border border-border bg-[#0b1020]">
        <Canvas camera={{ position: [0, 55, 65], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[40, 80, 20]} intensity={1.1} />
          <OrbitControls maxPolarAngle={Math.PI / 2.05} minDistance={15} maxDistance={200} />

          {/* Ground plane + grid */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[150, 150]} />
            <meshStandardMaterial color="#101830" />
          </mesh>
          <gridHelper args={[140, 28, '#1e2a4a', '#16203a']} />

          {/* Curated transmission segments (Alberta layer only, real rows) */}
          {ctx?.transmissionLines.map((l, i) => {
            const a = projectToScene(l.start_lat, l.start_lng, spec);
            const b = projectToScene(l.end_lat, l.end_lng, spec);
            if (!a || !b) return null;
            return (
              <Line key={`tl-${i}`} points={[[a.x, 0.02, a.z], [b.x, 0.02, b.z]]}
                color="#10B981" lineWidth={1} transparent opacity={0.55} />
            );
          })}

          {/* Curated substations (real seeded rows) */}
          {ctx?.substations.map((s, i) => {
            if (s.latitude == null || s.longitude == null) return null;
            const p = projectToScene(s.latitude, s.longitude, spec);
            if (!p) return null;
            return (
              <mesh key={`sub-${i}`} position={[p.x, 0.5, p.z]}>
                <coneGeometry args={[0.35, 1, 6]} />
                <meshStandardMaterial color="#06B6D4" />
              </mesh>
            );
          })}

          {/* Facilities */}
          {regionGems.map((g) => {
            const p = projectToScene(g.facility.lat, g.facility.lng, spec);
            if (!p) return null;
            const h = mwToBarHeight(g.derivedMw);
            const color = statusColor(g.facility.status);
            const isSel = selected?.facility.id === g.facility.id;
            return (
              <group key={g.facility.id} position={[p.x, 0, p.z]}>
                {h > 0 ? (
                  <mesh position={[0, h / 2, 0]}
                    onClick={(e) => { e.stopPropagation(); setSelected(g); }}>
                    <boxGeometry args={[0.9, h, 0.9]} />
                    <meshStandardMaterial color={color} emissive={isSel ? color : '#000000'}
                      emissiveIntensity={isSel ? 0.5 : 0} />
                  </mesh>
                ) : (
                  <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}
                    onClick={(e) => { e.stopPropagation(); setSelected(g); }}>
                    <circleGeometry args={[0.7, 24]} />
                    <meshStandardMaterial color={color} emissive={isSel ? color : '#000000'}
                      emissiveIntensity={isSel ? 0.5 : 0} />
                  </mesh>
                )}
                {(isSel || h >= 3) && (
                  <Text position={[0, h + 1.2, 0]} fontSize={0.8} color="#e2e8f0"
                    anchorX="center" anchorY="bottom" outlineWidth={0.04} outlineColor="#0b1020">
                    {g.facility.name.length > 28 ? g.facility.name.slice(0, 26) + '…' : g.facility.name}
                  </Text>
                )}
              </group>
            );
          })}
        </Canvas>

        {/* Detail card — same provenance as the list view */}
        {selected && (
          <Card className="absolute top-3 right-3 w-80 max-h-[480px] overflow-auto shadow-xl">
            <CardContent className="py-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-sm">{selected.facility.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selected.facility.operator ?? '—'} · {selected.facility.facility_type.replace(/_/g, ' ')}
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0"
                  onClick={() => setSelected(null)}><X className="w-3.5 h-3.5" /></Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs font-bold">{selected.total} · {selected.grade}</Badge>
                <Badge variant="outline" className="text-[10px]">{selected.facility.status.replace(/_/g, ' ')}</Badge>
                <span className="text-xs font-semibold tabular-nums">
                  {selected.derivedMw != null ? `≈${selected.derivedMw} MW` : 'MW n/a (no figure published)'}
                </span>
              </div>
              <div className="space-y-1">
                {selected.factors.map((f) => (
                  <div key={f.key} className="text-[11px] flex items-start gap-2">
                    <span className="font-mono tabular-nums w-12 shrink-0 text-right">{f.score}/{f.max}</span>
                    <span className="text-muted-foreground">{f.detail}</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-muted-foreground space-y-0.5">
                <div>Coords: {selected.facility.lat.toFixed(3)}, {selected.facility.lng.toFixed(3)} ({selected.facility.coordinates_precision})</div>
                {selected.facility.source_url && (
                  <a href={selected.facility.source_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline">
                    {selected.facility.source_publisher ?? 'Source'} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {!selected.facility.last_verified && (
                  <div className="text-amber-600 dark:text-amber-400">Seeded — not yet re-verified</div>
                )}
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs w-full"
                onClick={() => onAnalyze({
                  lat: selected.facility.lat, lng: selected.facility.lng, label: selected.facility.name,
                })}>
                <FileSearch className="w-3 h-3 mr-1" /> Full site report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Legend />
    </div>
  );
}

function Legend() {
  const items: { color: string; label: string }[] = [
    { color: statusColor('closed'), label: 'closed' },
    { color: statusColor('announced_closure'), label: 'announced closure' },
    { color: statusColor('for_sale'), label: 'for sale' },
    { color: statusColor('idle'), label: 'idle' },
    { color: statusColor('curtailed'), label: 'curtailed' },
    { color: statusColor('operating'), label: 'operating' },
    { color: statusColor('unknown'), label: 'unknown' },
  ];
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

// Re-export the region spec type for the panel.
export type { RegionSpec };
