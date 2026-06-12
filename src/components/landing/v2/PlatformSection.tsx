import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Activity, Map as MapIcon, Gem, BarChart3 } from 'lucide-react';
import { Reveal, GlassPanel } from './motion';

// VoltScout showcase. The "terminal" is an abstract, clearly stylized
// console — typed-out lines reference real platform features, not faked
// screenshots or invented numbers.

const FEATURES = [
  { icon: Gem, title: 'Hidden Gems discovery engine', text: 'Deterministic identification of idle, distressed, and underutilized power-intensive industrial sites across AB + TX — registry, listing-signal scraping, and geocode-verified grid checks.' },
  { icon: MapIcon, title: 'Site Intelligence', text: 'Fiber, transmission, gas, water, climate, and hazard layers for any Alberta location, scored into a 100-point suitability report.' },
  { icon: BarChart3, title: 'AESO / ERCOT market hub', text: 'Live pricing, curtailment analytics, and an invoice-grade power cost model.' },
  { icon: Activity, title: 'Live telemetry', text: 'Facility dashboards, alerts, and automation rules for operating sites.' },
];

const CONSOLE_LINES = [
  { prompt: 'voltscout', cmd: 'site-intel --lat 53.63 --lng -113.10' },
  { out: '▸ fiber score 78/100 · nearest 240 kV line 2.1 km' },
  { prompt: 'voltscout', cmd: 'hidden-gems --min-mw 45 --status idle' },
  { out: '▸ ranked candidates with per-factor evidence' },
  { prompt: 'voltscout', cmd: 'power-model --load 45MW --uptime 95%' },
  { out: '▸ 12CP-aware annual cost, invoice-safe' },
];

export function PlatformSection() {
  const reduced = useReducedMotion();

  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20">
      <GlassPanel className="max-w-7xl mx-auto p-8 sm:p-12 lg:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="order-2 lg:order-1">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                <span className="font-mono mr-2 opacity-60">06 /</span> Our proprietary edge
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
                VoltScout — the software that <span className="text-gradient-watt">finds hidden sites</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-9">
                Built in-house, VoltScout fuses grid topology, industrial registries,
                market data, and listing signals to surface power assets nobody is
                marketing. Every site in our portfolio was found, scored, and modelled
                on it — and the same platform is available to partners.
              </p>
            </Reveal>

            <div className="space-y-5 mb-10">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={0.07 * i}>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <f.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{f.title}</div>
                      <div className="text-sm text-muted-foreground">{f.text}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <Button asChild size="lg" variant="outline">
                <Link to="/app">
                  Open VoltScout <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Reveal>
          </div>

          {/* Stylized console */}
          <Reveal className="order-1 lg:order-2">
            <div className="relative rounded-2xl border border-border bg-[hsl(var(--watt-navy))] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-white/40 font-mono">voltscout — illustrative session</span>
              </div>
              <div className="p-5 font-mono text-[13px] leading-7">
                {CONSOLE_LINES.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={reduced ? false : { opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 * i, duration: 0.4 }}
                  >
                    {'cmd' in line ? (
                      <span>
                        <span className="text-watt-trust">{line.prompt}</span>
                        <span className="text-white/40"> $ </span>
                        <span className="text-white/90">{line.cmd}</span>
                      </span>
                    ) : (
                      <span className="text-watt-bitcoin/90">{line.out}</span>
                    )}
                  </motion.div>
                ))}
                {!reduced && (
                  <motion.span
                    className="inline-block w-2.5 h-[18px] bg-white/70 align-middle"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </GlassPanel>
    </section>
  );
}
