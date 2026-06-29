import { type ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Search, Wrench, Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PinnedChapter } from '../scroll';
import { JourneyScene } from '../JourneyScene';
import { TOTAL_MW, UNDER_DEV_MW } from '@/data/advisory-pipeline';
import gridSubstation from '@/assets/grid-transmission-substation.jpg';

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
  intensity: number; // how "online" the compute scene reads (0 idle → 1 full)
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
    intensity: 0.32,
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
    intensity: 0.62,
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
    intensity: 1,
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
    <div className="relative h-full w-full bg-[#f8fafc]">
      {/* faint, slow-drifting establishing image behind everything */}
      <motion.div
        className="absolute inset-0 scale-110 bg-cover bg-center opacity-[0.06]"
        style={{ backgroundImage: `url(${gridSubstation})`, y: bgY }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] via-[#f8fafc]/70 to-[#f8fafc]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-6 sm:px-10 lg:px-16">
        {/* Eyebrow — constant through the chapter */}
        <div className="pt-[clamp(4rem,12vh,8rem)]">
          <div className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            <span className="inline-block h-px w-7 bg-watt-bitcoin" />
            Our model
          </div>
          <p className="mt-4 hidden max-w-xl text-sm leading-relaxed text-slate-500 sm:block sm:text-base">
            <span className="text-slate-700">Power is the scarce input of the compute economy.</span>{' '}
            Watch a stranded megawatt become productive compute.
          </p>
        </div>

        {/* Stage — the three beats stacked and cross-faded. min-h-0 + overflow
            -hidden lets it take the leftover column height and clip, so a tall
            beat can never bleed up into the eyebrow above it. */}
        <div className="relative mt-6 flex min-h-0 flex-1 items-center overflow-hidden lg:mt-8">
          {BEATS.map((beat) => (
            <BeatLayer key={beat.index} beat={beat} progress={progress} />
          ))}
        </div>

        {/* Journey rail — STRANDED MW → PRODUCTIVE COMPUTE */}
        <div className="pb-[clamp(2.5rem,8vh,5rem)]">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
            <span>Stranded MW</span>
            <span className="text-slate-600">AI · HPC · BTC</span>
          </div>
          <div className="relative h-px w-full bg-slate-200">
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
  // Windows overlap so the cross-fades hand off directly — there is never a
  // scroll position where the stage is empty. Beat 0 is fully present at the
  // very top of the pin; beat 2 holds to the end.
  const windows: Record<number, { o: number[]; t: number[] }> = {
    0: { o: [0, 0.28, 0.36], t: [1, 1, 0] },
    1: { o: [0.28, 0.36, 0.62, 0.7], t: [0, 1, 1, 0] },
    2: { o: [0.62, 0.7, 1], t: [0, 1, 1] },
  };
  const w = windows[beat.index];
  const opacity = useTransform(progress, w.o, w.t);
  const y = useTransform(progress, w.o, w.o.map((_, i, a) => (i === 0 ? 40 : i === a.length - 1 ? -40 : 0)));

  return (
    <motion.div
      className="absolute inset-0 flex flex-col gap-4 sm:gap-8 lg:flex-row lg:items-center lg:gap-14"
      style={{ opacity, y }}
    >
      {/* Text column */}
      <div className="order-2 flex-1 lg:order-1">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] shadow-sm sm:mb-5 sm:text-[11px]"
          style={{ color: beat.accent }}
        >
          <beat.icon className="h-3.5 w-3.5" />
          {beat.kicker}
        </div>

        <h2 className="max-w-xl text-[1.6rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.9rem]">
          {beat.title}
        </h2>

        <p className="mt-3 line-clamp-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base lg:text-lg">
          {beat.blurb}
        </p>

        {/* supporting number */}
        <div className="mt-4 flex items-baseline gap-3 sm:mt-6 sm:gap-4">
          <span
            className="whitespace-nowrap text-3xl font-bold tabular-nums tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: beat.accent }}
          >
            {beat.metricValue}
          </span>
          <span className="max-w-[8rem] text-xs leading-snug text-slate-500 sm:text-sm">
            <span className="block uppercase tracking-[0.12em] text-slate-400">
              {beat.metricLabel}
            </span>
            {beat.metricUnit}
          </span>
        </div>
      </div>

      {/* Media column — a live, animated compute scene (no static photo). The
          panel height is bounded directly so the centred stage stays compact. */}
      <div className="order-1 lg:order-2 lg:w-[44%]">
        <div className="relative h-[16vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:h-[34vh] sm:rounded-3xl lg:h-[clamp(15rem,40vh,28rem)]">
          <JourneyScene
            accent={beat.accent}
            intensity={beat.intensity}
            className="absolute inset-0 h-full w-full"
          />
          {/* inner hairline for crispness on the light theme */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-900/5 sm:rounded-3xl" />
          {/* corner index */}
          <div className="absolute right-5 top-4 font-mono text-xs tracking-widest text-slate-400">
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
      className="block h-3 w-3 rounded-full ring-4 ring-[#f8fafc]"
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
        <div className="text-sm font-semibold text-slate-900">{labels[beat.index]}</div>
        <div className="truncate text-[11px] uppercase tracking-[0.14em] text-slate-500">
          {beat.kicker.split('—')[1]?.trim()}
        </div>
      </div>
    </motion.div>
  );
}

export function EnergyToCompute(): ReactNode {
  return (
    <section id="energy-to-compute" className="relative bg-transparent">
      <PinnedChapter heightVh={260}>
        {(progress) => <Scene progress={progress} />}
      </PinnedChapter>

      {/* Resolution band after the pin releases — the thesis stated plainly,
          with a CTA. Lives outside the runway so it reads as the payoff. */}
      <div className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Hidden energy in.{' '}
              <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
                Productive compute out.
              </span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 lg:text-lg">
              We built proprietary software and methods to find the best megawatts first,
              then develop and operate them as the datacenters behind modern AI. That is the
              whole model — source, develop, operate.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/advisory"
                className="inline-flex h-12 items-center rounded-full bg-slate-900 px-7 text-base font-semibold text-white transition-colors hover:bg-watt-bitcoin"
              >
                Work with us <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/app"
                className="inline-flex h-12 items-center rounded-full border border-slate-300 px-6 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100"
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
