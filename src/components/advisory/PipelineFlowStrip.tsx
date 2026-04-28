import React from 'react';
import { PIPELINE_PROJECTS, ENERGY_TYPE_COLORS, TOTAL_MW, UNDER_DEV_MW, COUNTRIES } from '@/data/advisory-pipeline';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Zap, Wrench, Globe2, Flag } from 'lucide-react';

export const PipelineFlowStrip: React.FC = () => {
  const handleHover = (id: string | null) => {
    if (id) window.dispatchEvent(new CustomEvent('advisory-globe-select', { detail: id }));
  };

  return (
    <div className="space-y-6">
      {/* KPI counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Zap className="w-5 h-5 text-watt-bitcoin mx-auto mb-2" />
          <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
            <AnimatedCounter end={TOTAL_MW} suffix=" MW" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">Global pipeline</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Wrench className="w-5 h-5 text-watt-bitcoin mx-auto mb-2" />
          <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
            <AnimatedCounter end={UNDER_DEV_MW} suffix=" MW" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">Under development</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Globe2 className="w-5 h-5 text-watt-bitcoin mx-auto mb-2" />
          <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
            <AnimatedCounter end={COUNTRIES} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">Countries</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Flag className="w-5 h-5 text-watt-bitcoin mx-auto mb-2" />
          <div className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
            <AnimatedCounter end={PIPELINE_PROJECTS.length} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">Active sites</div>
        </div>
      </div>

      {/* Animated capacity flow strip */}
      <div>
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-sm font-semibold text-foreground">Capacity flow by site</div>
            <div className="text-xs text-muted-foreground">Hover to highlight on globe · width ∝ MW</div>
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">{TOTAL_MW.toLocaleString()} MW total</div>
        </div>
        <div className="flex w-full h-14 rounded-lg overflow-hidden border border-border bg-card">
          {PIPELINE_PROJECTS.map((p) => {
            const pct = (p.capacityMw / TOTAL_MW) * 100;
            const color = ENERGY_TYPE_COLORS[p.energyType].hex;
            return (
              <button
                key={p.id}
                onMouseEnter={() => handleHover(p.id)}
                onClick={() => handleHover(p.id)}
                className="relative group transition-all hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ width: `${pct}%`, backgroundColor: color }}
                aria-label={`${p.location} ${p.capacityMw} MW`}
              >
                {/* Animated energy particles */}
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-flow"
                    style={{ animationDelay: `${p.lat / 10}s` }}
                  />
                </div>
                <span className="relative z-10 text-[10px] md:text-xs font-bold text-white drop-shadow-md px-2 truncate block">
                  {pct > 6 ? p.capacityMw + ' MW' : ''}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                  {p.location} · {p.capacityMw} MW
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
