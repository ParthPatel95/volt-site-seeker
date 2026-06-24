import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Radar, Zap, Layers, Activity } from 'lucide-react';
import { Reveal, CountUp } from './motion';
import { UNDER_DEV_MW } from '@/data/advisory-pipeline';

// "The WattByte edge" — four differentiators, each an interactive card that
// lifts and reveals its supporting detail on hover/focus. Distinct from the
// "what we do" circuit (process) and the services grid (offerings): this is
// the *why us*. Every figure traces to the pipeline registry.

type Edge = {
  icon: typeof Radar;
  color: string;
  stat: { value: number; suffix: string; prefix?: string } | { text: string };
  title: string;
  blurb: string;
  detail: string;
};

const EDGES: Edge[] = [
  {
    icon: Radar,
    color: 'hsl(var(--watt-trust))',
    stat: { text: 'Off-market' },
    title: 'Proprietary discovery',
    blurb: 'We find megawatts others can’t see.',
    detail:
      'VoltScout’s Hidden Gems engine surfaces idle interconnections, curtailed generation, and distressed industrial plants — scored on grid, fiber, gas, water, and hazard layers — before they ever reach a broker.',
  },
  {
    icon: Zap,
    color: 'hsl(var(--watt-bitcoin))',
    stat: { value: 144, suffix: ' kV' },
    title: 'Power-first, not space-first',
    blurb: 'We chase the grid, not the real estate.',
    detail:
      'Energy is the scarce input of the compute economy. Our flagship is transmission-connected at 144 kV — real interconnection capacity, not a land option waiting years in a queue.',
  },
  {
    icon: Layers,
    color: 'hsl(var(--watt-purple))',
    stat: { text: 'ASIC + HPC' },
    title: 'Dual-workload by design',
    blurb: 'The same megawatts earn two ways.',
    detail:
      'Bitcoin miners run during low-price windows; HPC and AI tenants take over when the economics flip. Curtailment-aware operations turn power that would otherwise be wasted into paying compute.',
  },
  {
    icon: Activity,
    color: 'hsl(var(--watt-success))',
    stat: { value: UNDER_DEV_MW, suffix: ' MW' },
    title: 'Steel in the ground',
    blurb: 'A track record, not a pitch deck.',
    detail:
      `${UNDER_DEV_MW} MW under active development in Alberta’s industrial heartland — sited, interconnected, and engineered by the same team that advises partners on theirs.`,
  },
];

export function WhyPowerFirstSection() {
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-watt-bitcoin mb-3">
            The WattByte edge
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mb-4">
            Why developers and capital <span className="text-gradient-watt">start with us</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12 sm:mb-14">
            Anyone can buy land near a substation. Sourcing the megawatts nobody is
            selling — and turning them into resilient, dual-workload compute — is the
            hard part. It’s the only part we do.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {EDGES.map((e, i) => (
            <Reveal key={e.title} delay={0.08 * i}>
              <motion.div
                tabIndex={0}
                role="group"
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                whileHover={reduced ? undefined : { y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="relative h-full p-6 sm:p-7 rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                style={{ boxShadow: active === i ? `0 0 36px -12px ${e.color}` : undefined }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `color-mix(in srgb, ${e.color} 14%, transparent)`, color: e.color }}
                >
                  <e.icon className="w-6 h-6" />
                </div>

                <div className="text-2xl sm:text-[1.7rem] font-bold tabular-nums mb-1" style={{ color: e.color }}>
                  {'text' in e.stat
                    ? e.stat.text
                    : <>{e.stat.prefix}<CountUp value={e.stat.value} />{e.stat.suffix}</>}
                </div>
                <h3 className="text-base font-semibold mb-2">{e.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{e.blurb}</p>

                {/* Detail reveal — expands on hover/focus (desktop), always
                    visible stacked on small screens for accessibility. */}
                <div
                  className="grid transition-[grid-template-rows,opacity] duration-300 ease-out sm:[grid-template-rows:0fr] sm:opacity-0"
                  style={
                    active === i
                      ? ({ gridTemplateRows: '1fr', opacity: 1 } as React.CSSProperties)
                      : undefined
                  }
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-border/70">
                      {e.detail}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
