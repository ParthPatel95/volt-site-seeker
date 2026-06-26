import { type ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Search, Wrench, Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PinnedChapter } from '../scroll';
import { TOTAL_MW, UNDER_DEV_MW } from '@/data/advisory-pipeline';
import aesoGridHero from '@/assets/aeso-grid-hero.jpg';
import gridSubstation from '@/assets/grid-transmission-substation.jpg';
import albertaAerial from '@/assets/alberta-facility-aerial.jpg';
import datacenterNoc from '@/assets/datacenter-noc-interior.jpg';

// EnergyToCompute — the thesis chapter. A tall pinned runway scrubs through a
// three-beat sequence as you scroll: (1) stranded power sitting idle, (2)
// WattByte develops the asset, (3) that power comes online as AI / HPC / mining
// compute. Each beat owns a third of the scroll; the active media cross-fades,
// the headline + numbers swap, and a progress rail tracks the journey from
// STRANDED MW to PRODUCTIVE COMPUTE.

interface Beat {
  index: number;
  icon: typeof Search;
  kicker: string;
  title: string;
  accent: string;
  blurb: string;
  image: string;
  metricLabel: string;
  metricValue: string;
  metricUnit: string;
}

const BEATS: Beat[] = [
  {
    index: 0,
    icon: Search,
    kicker: 'Beat 01 — Stranded',
    title: 'The best megawatts are never listed for sale.',
    accent: '#10a5c7',
    blurb:
      'Idle industrial interconnections, curtailed generation, distressed plants — hidden power nobody is marketing. Our VoltScout platform and its Hidden Gems engine surface it first.',
    image: aesoGridHero,
    metricLabel: 'Pipeline sourced',
    metricValue: TOTAL_MW.toLocaleString(),
    metricUnit: 'MW under evaluation',
  },
  {
    index: 1,
    icon: Wrench,
    kicker: 'Beat 02 — Develop',
    title: 'We carry the asset from diligence to energization.',
    accent: '#F7931A',
    blurb:
      'Interconnection studies, energy procurement, permits and EPC. We move megawatts from where they are wasted to where they are worth the most — like our 135 MW Alberta flagship.',
    image: albertaAerial,
    metricLabel: 'Flagship in development',
    metricValue: UNDER_DEV_MW.toLocaleString(),
    metricUnit: 'MW Alberta build',
  },
  {
    index: 2,
    icon: Cpu,
    kicker: 'Beat 03 — Compute',
    title: 'Stranded power, online as AI · HPC · BTC.',
    accent: '#F7931A',
    blurb:
      'ASIC and HPC capacity with live telemetry, curtailment-aware economics, and hosting for partners who bring their own machines. Wasted power, turned into the compute behind modern AI.',
    image: datacenterNoc,
    metricLabel: 'Now productive',
    metricValue: 'AI · HPC · BTC',
    metricUnit: 'compute online',
  },
];

// Inner scene reads the pinned 0→1 progress and choreographs every layer.
function Scene({ progress }: { progress: MotionValue<number> }) {
  // The journey rail fills across the full scrub.
  const railFill = useTransform(progress, [0, 1], ['0%', '100%']);
  // A faint background image drifts vertically as the chapter scrubs.
  const bgY = useTransform(progress, [0, 1], ['-6%', '6%']);

  return (
    <div className="relative h-full w-full bg-[#060b16]">
      {/* faint, slow-drifting establishing image behind everything */}
      <motion.div
        className="absolute inset-0 scale-110 bg-cover bg-center opacity-[0.12]"
        style={{ backgroundImage: `url(${gridSubstation})`, y: bgY }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#060b16] via-[#060b16]/70 to-[#060b16]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-6 sm:px-10 lg:px-16">
        {/* Eyebrow — constant through the chapter */}
        <div className="pt-[clamp(4rem,12vh,8rem)]">
          <div className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            <span className="inline-block h-px w-7 bg-watt-bitcoin" />
            Our model
          </div>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/45 sm:text-base">
            <span className="text-white/80">Power is the scarce input of the compute economy.</span>{' '}
            Watch a stranded megawatt become productive compute.
          </p>
        </div>

        {/* Stage — the three beats stacked and cross-faded */}
        <div className="relative mt-8 flex-1 lg:mt-10">
          {BEATS.map((beat) => (
            <BeatLayer key={beat.index} beat={beat} progress={progress} />
          ))}
        </div>

        {/* Journey rail — STRANDED MW → PRODUCTIVE COMPUTE */}
        <div className="pb-[clamp(2.5rem,8vh,5rem)]">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 sm:text-xs">
            <span>Stranded MW</span>
            <span className="text-white/55">AI · HPC · BTC</span>
          </div>
          <div className="relative h-px w-full bg-white/12">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-watt-trust to-watt-bitcoin"
              style={{ width: railFill }}
            />
            {/* node markers for each beat */}
            <div className="absolute inset-0 flex items-center justify-between">
              {BEATS.map((beat) => (
                <RailNode key={beat.index} beat={beat} progress={progress} />
              ))}
            </div>
          </div>

          {/* step legend */}
          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6">
            {BEATS.map((beat) => (
              <StepLabel key={beat.index} beat={beat} progress={progress} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// One full beat: media panel + headline + supporting number, faded in for its
// third of the scroll and out again as the next beat arrives.
function BeatLayer({ beat, progress }: { beat: Beat; progress: MotionValue<number> }) {
  // Each beat owns a window centred on its third. Tuned so beat 0 is fully
  // present at the top of the pin and beat 2 holds at the bottom.
  const windows: Record<number, { o: number[]; t: number[] }> = {
    0: { o: [0, 0.06, 0.26, 0.34], t: [0, 0, 1, 0] },
    1: { o: [0.3, 0.4, 0.6, 0.7], t: [0, 1, 1, 0] },
    2: { o: [0.66, 0.76, 1, 1], t: [0, 1, 1, 1] },
  };
  const w = windows[beat.index];
  const opacity = useTransform(progress, w.o, w.t);
  const y = useTransform(progress, w.o, [40, 0, 0, -40]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14"
      style={{ opacity, y }}
    >
      {/* Text column */}
      <div className="order-2 flex-1 lg:order-1">
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur"
          style={{ color: beat.accent }}
        >
          <beat.icon className="h-3.5 w-3.5" />
          {beat.kicker}
        </div>

        <h2 className="max-w-xl text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.9rem]">
          {beat.title}
        </h2>

        <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65 lg:text-lg">
          {beat.blurb}
        </p>

        {/* supporting number */}
        <div className="mt-8 flex items-baseline gap-4">
          <span
            className="text-5xl font-bold tabular-nums tracking-tight sm:text-6xl lg:text-7xl"
            style={{ color: beat.accent }}
          >
            {beat.metricValue}
          </span>
          <span className="max-w-[8rem] text-xs leading-snug text-white/50 sm:text-sm">
            <span className="block uppercase tracking-[0.12em] text-white/40">
              {beat.metricLabel}
            </span>
            {beat.metricUnit}
          </span>
        </div>
      </div>

      {/* Media column */}
      <div className="order-1 lg:order-2 lg:w-[44%]">
        <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <img
            src={beat.image}
            alt=""
            className="h-full w-full scale-105 object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060b16] via-[#060b16]/20 to-transparent" />
          <div
            className="absolute inset-0 mix-blend-soft-light"
            style={{ backgroundColor: beat.accent, opacity: 0.18 }}
          />
          {/* corner index */}
          <div className="absolute right-5 top-5 font-mono text-xs tracking-widest text-white/60">
            0{beat.index + 1} / 03
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// A node on the journey rail that lights up when its beat is reached.
function RailNode({ beat, progress }: { beat: Beat; progress: MotionValue<number> }) {
  const threshold = beat.index / 2; // 0, 0.5, 1
  const lit = useTransform(progress, [threshold - 0.12, threshold], [0.25, 1]);
  const scale = useTransform(progress, [threshold - 0.12, threshold], [0.8, 1.15]);

  return (
    <motion.span
      className="block h-3 w-3 rounded-full ring-4 ring-[#060b16]"
      style={{ backgroundColor: beat.accent, opacity: lit, scale }}
    />
  );
}

// Compact label under the rail; dims when its beat is not active.
function StepLabel({ beat, progress }: { beat: Beat; progress: MotionValue<number> }) {
  const center = beat.index / 2;
  const opacity = useTransform(
    progress,
    [center - 0.28, center - 0.1, center, center + 0.1, center + 0.28],
    [0.35, 0.55, 1, 0.55, 0.35],
  );
  const labels = ['Source', 'Develop', 'Operate'] as const;

  return (
    <motion.div style={{ opacity }} className="flex items-center gap-2.5">
      <span
        className="hidden h-1.5 w-1.5 shrink-0 rounded-full sm:block"
        style={{ backgroundColor: beat.accent }}
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">{labels[beat.index]}</div>
        <div className="truncate text-[11px] uppercase tracking-[0.14em] text-white/40">
          {beat.kicker.split('—')[1]?.trim()}
        </div>
      </div>
    </motion.div>
  );
}

export function EnergyToCompute(): ReactNode {
  return (
    <section id="energy-to-compute" className="relative bg-[#060b16]">
      <PinnedChapter heightVh={300}>
        {(progress) => <Scene progress={progress} />}
      </PinnedChapter>

      {/* Resolution band after the pin releases — the thesis stated plainly,
          with a CTA. Lives outside the runway so it reads as the payoff. */}
      <div className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Hidden energy in.{' '}
                <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
                  Productive compute out.
                </span>
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 lg:text-lg">
                We built proprietary software and methods to find the best megawatts first,
                then develop and operate them as the datacenters behind modern AI. That is the
                whole model — source, develop, operate.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Link
                to="/advisory"
                className="inline-flex h-12 items-center rounded-full bg-white px-7 text-base font-semibold text-[#060b16] transition-colors hover:bg-watt-bitcoin"
              >
                Work with us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/app"
                className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-base font-medium text-white/90 transition-colors hover:bg-white/5"
              >
                See VoltScout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
