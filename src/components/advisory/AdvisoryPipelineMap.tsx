import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { PIPELINE_PROJECTS, HQ, ENERGY_TYPE_COLORS, type PipelineProject } from '@/data/advisory-pipeline';
import { WORLD_LAND_PATH } from './world-land-path';
import { PipelineProjectCard } from './PipelineProjectCard';

const VB_W = 1000;
const VB_H = 500;

const project = (lng: number, lat: number) => ({
  x: ((lng + 180) / 360) * VB_W,
  y: ((90 - lat) / 180) * VB_H,
});

interface HoverState {
  id: string;
  x: number;
  y: number;
}

export const AdvisoryPipelineMap: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();

  const hq = useMemo(() => project(HQ.lng, HQ.lat), []);
  const sites = useMemo(
    () => PIPELINE_PROJECTS.map(p => ({ p, ...project(p.lng, p.lat) })),
    [],
  );

  // Quadratic Bézier from HQ to each site, lifted perpendicular to the chord.
  const arcs = useMemo(() => sites.map(({ p, x, y }) => {
    const mx = (hq.x + x) / 2;
    const my = (hq.y + y) / 2;
    const dx = x - hq.x;
    const dy = y - hq.y;
    const len = Math.hypot(dx, dy) || 1;
    // perpendicular, lift toward top of map
    const lift = Math.min(160, len * 0.28);
    const nx = -dy / len;
    const ny = dx / len;
    // Always lift "up" (negative y) for visual consistency
    const sign = ny < 0 ? 1 : -1;
    const cx = mx + nx * lift * sign;
    const cy = my + ny * lift * sign;
    return { id: p.id, d: `M${hq.x} ${hq.y} Q${cx} ${cy} ${x} ${y}` };
  }), [hq, sites]);

  // External select event (kept compatible with PipelineFlowStrip if it dispatches)
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (typeof id === 'string') setSelectedId(id);
    };
    window.addEventListener('advisory-globe-select', handler);
    return () => window.removeEventListener('advisory-globe-select', handler);
  }, []);

  // Esc to close detail
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (e.clientX - rect.left) / rect.width - 0.5;
    const dy = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: dx * 8, y: dy * 6 });
  };

  const selected = PIPELINE_PROJECTS.find(p => p.id === selectedId) ?? null;
  const hoverSite = hover ? sites.find(s => s.p.id === hover.id) : null;

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { setHover(null); setParallax({ x: 0, y: 0 }); }}
      className="relative w-full h-[420px] sm:h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-border bg-[hsl(var(--watt-navy))]"
    >
      {/* Soft radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <motion.svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)` }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
      >
        <defs>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F7931A" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F7931A" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="hqGlow">
            <stop offset="0%" stopColor="#F7931A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F7931A" stopOpacity="0" />
          </radialGradient>
          <pattern id="dotGrid" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="#ffffff" fillOpacity="0.05" />
          </pattern>
        </defs>

        {/* Background dot grid */}
        <rect width={VB_W} height={VB_H} fill="url(#dotGrid)" />

        {/* Continents */}
        <path
          d={WORLD_LAND_PATH}
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={0.4}
          vectorEffect="non-scaling-stroke"
        />

        {/* Arcs */}
        <g fill="none" stroke="url(#arcGrad)" strokeWidth={1.4} strokeLinecap="round" vectorEffect="non-scaling-stroke">
          {arcs.map((a, i) => (
            <motion.path
              key={a.id}
              d={a.d}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{
                duration: reduceMotion ? 0 : 1.4,
                delay: reduceMotion ? 0 : 0.4 + i * 0.12,
                ease: 'easeInOut',
              }}
            />
          ))}
        </g>

        {/* HQ glow + node */}
        <circle cx={hq.x} cy={hq.y} r={26} fill="url(#hqGlow)" />
        {!reduceMotion && (
          <motion.circle
            cx={hq.x}
            cy={hq.y}
            r={6}
            fill="none"
            stroke="#F7931A"
            strokeWidth={1.2}
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            style={{ transformOrigin: `${hq.x}px ${hq.y}px` }}
          />
        )}
        <circle cx={hq.x} cy={hq.y} r={5} fill="#F7931A" stroke="#fff" strokeWidth={1.2} />

        {/* Site markers */}
        {sites.map(({ p, x, y }, i) => {
          const color = ENERGY_TYPE_COLORS[p.energyType].hex;
          const isHover = hover?.id === p.id;
          const isSelected = selectedId === p.id;
          return (
            <motion.g
              key={p.id}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: reduceMotion ? 0 : 0.4,
                delay: reduceMotion ? 0 : 0.5 + i * 0.12,
              }}
              style={{ cursor: 'pointer', transformOrigin: `${x}px ${y}px` }}
              onMouseEnter={() => setHover({ id: p.id, x, y })}
              onMouseLeave={() => setHover(h => (h?.id === p.id ? null : h))}
              onClick={() => setSelectedId(p.id)}
              tabIndex={0}
              role="button"
              aria-label={`${p.location}, ${p.country}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(p.id); } }}
            >
              {(isHover || isSelected) && (
                <circle cx={x} cy={y} r={10} fill={color} fillOpacity={0.18} />
              )}
              <circle cx={x} cy={y} r={5.5} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={1.2} />
              <circle cx={x} cy={y} r={2.4} fill="#fff" />
            </motion.g>
          );
        })}
      </motion.svg>

      {/* HTML overlay: tooltip + legend (positioned relative to wrapper) */}
      <AnimatePresence>
        {hoverSite && (
          <motion.div
            key={hoverSite.p.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoverSite.x / VB_W) * 100}%`,
              top: `calc(${(hoverSite.y / VB_H) * 100}% - 12px)`,
            }}
          >
            <div className="bg-background/95 backdrop-blur border border-border rounded-md px-2.5 py-1.5 shadow-xl text-xs whitespace-nowrap">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span>{hoverSite.p.flagEmoji}</span>
                {hoverSite.p.location}
              </div>
              <div className="text-muted-foreground text-[10px] flex items-center gap-1.5 mt-0.5">
                <span className="font-mono">{hoverSite.p.capacityMw} MW</span>
                <span>·</span>
                <span style={{ color: ENERGY_TYPE_COLORS[hoverSite.p.energyType].hex }}>
                  {hoverSite.p.energyType}
                </span>
                <span>·</span>
                <span>{hoverSite.p.status}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HQ label */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 text-[10px] font-semibold tracking-wide text-watt-bitcoin"
        style={{
          left: `${(hq.x / VB_W) * 100}%`,
          top: `calc(${(hq.y / VB_H) * 100}% + 10px)`,
        }}
      >
        CALGARY HQ
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-background/85 backdrop-blur border border-border rounded-lg p-3 text-xs space-y-1.5 max-w-[180px]">
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
          Hover a site · click for details
        </div>
      </div>

      {/* Stats badge */}
      <div className="absolute top-4 right-4 bg-background/85 backdrop-blur border border-border rounded-lg px-3 py-2 text-xs">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pipeline</div>
        <div className="font-bold text-foreground font-mono">
          {PIPELINE_PROJECTS.reduce((s, p) => s + p.capacityMw, 0).toLocaleString()} MW
        </div>
        <div className="text-[10px] text-muted-foreground">{PIPELINE_PROJECTS.length} sites</div>
      </div>

      {/* Detail card */}
      {selected && (
        <PipelineProjectCard project={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
};