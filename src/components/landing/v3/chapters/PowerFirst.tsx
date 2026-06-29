import { motion } from 'framer-motion';
import { Zap, Plug, Gauge, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Reveal,
  SplitWords,
  CountUp,
  staggerContainer,
  staggerItem,
} from '../scroll';
import { UNDER_DEV_MW } from '@/data/advisory-pipeline';
import { GridFlowScene } from '../GridFlowScene';

// Chapter: "Power-first." The differentiator thesis — securing power and
// interconnection first beats everyone chasing the same fixed sites. A
// parallaxed media column sits beside a column of staggered thesis points.
// Copy adapted from v2/WhyPowerFirstSection: same reasoning, same figures
// (144 kV transmission interconnect, 135 MW under development), re-presented.

type Thesis = {
  icon: typeof Zap;
  title: string;
  body: string;
};

const THESES: Thesis[] = [
  {
    icon: Zap,
    title: 'Energy is the scarce input',
    body: 'In the compute economy, megawatts — not square footage — are the bottleneck. We chase the grid, not the real estate. Anyone can option land near a substation; sourcing the power nobody is selling is the hard part, and the only part we do.',
  },
  {
    icon: Plug,
    title: 'Interconnection, not a queue ticket',
    body: 'Our flagship is transmission-connected at 144 kV — real, energized capacity rather than a land option waiting years in an interconnection queue. We secure the point of delivery first, then build the compute around it.',
  },
  {
    icon: Gauge,
    title: 'The same megawatts earn twice',
    body: 'Bitcoin miners run during low-price windows; HPC and AI tenants take over when the economics flip. Curtailment-aware operations turn power that would otherwise be wasted into paying compute.',
  },
  {
    icon: ShieldCheck,
    title: 'Steel in the ground',
    body: `${UNDER_DEV_MW} MW under active development in Alberta's industrial heartland — sited, interconnected, and engineered by the same team that advises partners on theirs. A track record, not a pitch deck.`,
  },
];

export function PowerFirst() {
  return (
    <section id="power-first" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 xl:gap-20">
          {/* ── Media column — parallaxed substation in a framed plate ─────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal y={28}>
              <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm">
                {/* Animated single-line diagram — energized interconnection,
                    in place of the static substation photo. */}
                <div className="relative aspect-[4/5] w-full sm:aspect-[5/6] lg:aspect-[4/5]">
                  <GridFlowScene accent="#10a5c7" className="absolute inset-0 h-full w-full" />
                </div>

                {/* Floating metric plate, anchored to the framed panel. */}
                <div className="absolute inset-x-5 bottom-5 z-10 sm:inset-x-6 sm:bottom-6">
                  <div className="rounded-2xl border border-slate-200 bg-white/85 px-5 py-4 shadow-sm backdrop-blur-md">
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">
                        144
                      </span>
                      <span className="pb-1 text-sm font-medium text-watt-trust">kV</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Transmission-connected at the flagship — energized
                      interconnection, not a queue position.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── Thesis column ──────────────────────────────────────────────── */}
          <div className="flex flex-col">
            <Reveal y={24}>
              <div className="mb-5 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                <span className="inline-block h-px w-7 bg-watt-bitcoin" />
                The WattByte edge
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                <SplitWords text="Power-first," />{' '}
                <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
                  not space-first.
                </span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 lg:text-lg">
                Everyone is racing to the same shovel-ready sites. We start one
                step upstream — securing the megawatts and the interconnection
                first, then developing the compute that turns them into yield.
              </p>
            </Reveal>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              className="mt-10 flex flex-col divide-y divide-slate-200 border-y border-slate-200 lg:mt-12"
            >
              {THESES.map((t) => (
                <motion.div
                  key={t.title}
                  variants={staggerItem}
                  className="group flex gap-5 py-6 sm:gap-6 sm:py-7"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-watt-bitcoin/10 text-watt-bitcoin transition-colors duration-300 group-hover:border-watt-bitcoin/40 group-hover:bg-watt-bitcoin/10">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                      {t.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <Reveal y={20} delay={0.1}>
              <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
                <Link
                  to="/advisory"
                  className="inline-flex h-12 items-center rounded-full bg-slate-900 px-7 text-base font-semibold text-white transition-colors hover:bg-watt-bitcoin"
                >
                  Source power with us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold tabular-nums text-slate-700">
                    <CountUp value={UNDER_DEV_MW} />
                    {' MW'}
                  </span>{' '}
                  under active development today.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
