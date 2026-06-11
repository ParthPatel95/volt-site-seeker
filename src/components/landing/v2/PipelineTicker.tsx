// Slim marquee band of real pipeline facts — every item comes from
// src/data/advisory-pipeline.ts. CSS-only animation, paused on hover and
// removed under prefers-reduced-motion (falls back to a static row).

import { PIPELINE_PROJECTS, TOTAL_MW, ENERGY_TYPE_COLORS } from '@/data/advisory-pipeline';

export function PipelineTicker() {
  const items = [
    { text: `${TOTAL_MW.toLocaleString()} MW global pipeline`, color: 'hsl(var(--primary))' },
    ...PIPELINE_PROJECTS.map((p) => ({
      text: `${p.flagEmoji} ${p.location} · ${p.capacityMw} MW ${p.energyType}`,
      color: ENERGY_TYPE_COLORS[p.energyType]?.hex ?? 'hsl(var(--foreground))',
    })),
  ];
  // Duplicate the row so the -50% translate loops seamlessly.
  const row = [...items, ...items];

  return (
    <div className="relative border-y border-border/60 bg-card/40 backdrop-blur-sm py-3 overflow-hidden group">
      <div className="flex w-max gap-10 motion-safe:animate-marquee motion-reduce:animate-none group-hover:[animation-play-state:paused]">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.text}
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
