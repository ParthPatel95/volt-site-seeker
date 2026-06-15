import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, Wrench, Cpu } from 'lucide-react';
import { Reveal } from './motion';

// "What we do" as an animated circuit: stranded energy flows through the
// three things WattByte actually does (source → develop → operate) and comes
// out the other side as compute. SVG paths + framer-motion pathLength reveal,
// with CSS dash-offset pulses riding the wires. Hovering a step lights its
// segment.

const STEPS = [
  {
    icon: Search,
    title: 'Source',
    color: 'hsl(var(--watt-trust))',
    blurb:
      'We find hidden power assets nobody is marketing — idle industrial interconnections, curtailed generation, distressed plants — surfaced by our proprietary VoltScout platform and its Hidden Gems discovery engine.',
  },
  {
    icon: Wrench,
    title: 'Develop',
    color: 'hsl(var(--primary))',
    blurb:
      'Interconnection studies, energy procurement, permits, and EPC — we carry sites from diligence to energization, like our 135 MW Alberta flagship.',
  },
  {
    icon: Cpu,
    title: 'Operate',
    color: 'hsl(var(--watt-bitcoin))',
    blurb:
      'ASIC and HPC capacity with live telemetry, curtailment-aware economics, and hosting for partners who bring their own machines.',
  },
];

export function EnergyFlowSection() {
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-watt-trust mb-3">
            Our model
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mb-4">
            Hidden energy in. <span className="text-gradient-watt">Productive compute out.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-14">
            Power is the scarce input of the compute economy — and the best megawatts are
            rarely listed for sale. We built proprietary software and methods to find them
            first, then we move them from where they're wasted to where they're worth the most.
          </p>
        </Reveal>

        {/* Circuit diagram */}
        <Reveal delay={0.1}>
          <div className="relative mb-12 hidden md:block" aria-hidden="true">
            <svg viewBox="0 0 1200 120" className="w-full h-auto" fill="none">
              {/* base wire */}
              <motion.path
                d="M 0 60 H 1200"
                stroke="hsl(var(--border))"
                strokeWidth="2"
                initial={reduced ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />
              {/* energized overlay per segment, lit by hover */}
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M ${i * 400} 60 H ${(i + 1) * 400}`}
                  stroke={STEPS[i].color}
                  strokeWidth="2.5"
                  strokeDasharray="8 10"
                  className={`transition-opacity duration-300 ${active === i ? 'opacity-90' : 'opacity-25'} ${reduced ? '' : 'animate-dash-flow'}`}
                />
              ))}
              {/* node terminals */}
              {[200, 600, 1000].map((x, i) => (
                <g key={x}>
                  <circle cx={x} cy={60} r="22" fill="hsl(var(--background))" stroke={STEPS[i].color} strokeWidth="2" />
                  <circle cx={x} cy={60} r="7" fill={STEPS[i].color}>
                    {!reduced && (
                      <animate attributeName="r" values="6;9;6" dur="2.4s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                    )}
                  </circle>
                </g>
              ))}
              {/* labels at the ends */}
              <text x="8" y="40" className="fill-current text-muted-foreground" fontSize="13" fontFamily="JetBrains Mono, monospace">
                STRANDED&nbsp;MW
              </text>
              <text x="1192" y="40" textAnchor="end" className="fill-current text-muted-foreground" fontSize="13" fontFamily="JetBrains Mono, monospace">
                AI&nbsp;·&nbsp;HPC&nbsp;·&nbsp;BTC
              </text>
            </svg>
          </div>
        </Reveal>

        {/* Step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={0.12 * i}>
              <motion.div
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                whileHover={reduced ? undefined : { y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="relative h-full p-7 rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
                style={{ boxShadow: active === i ? `0 0 36px -12px ${s.color}` : undefined }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `color-mix(in srgb, ${s.color} 14%, transparent)`, color: s.color }}
                >
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-1">0{i + 1}</div>
                <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.blurb}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
