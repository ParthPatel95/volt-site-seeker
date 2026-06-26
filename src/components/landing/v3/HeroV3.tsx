import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SplitWords, CountUp, Magnetic } from './scroll';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES, PIPELINE_PROJECTS } from '@/data/advisory-pipeline';

const HeroScene3D = lazy(() => import('./HeroScene3D'));

const STATS = [
  { value: TOTAL_MW, suffix: ' MW', label: 'Global pipeline' },
  { value: UNDER_DEV_MW, suffix: ' MW', label: 'Under development' },
  { value: COUNTRIES, suffix: '', label: 'Countries' },
  { value: PIPELINE_PROJECTS.length, suffix: '', label: 'Active sites' },
];

export function HeroV3() {
  const reduced = useReducedMotion();
  return (
    <section className="relative flex h-screen min-h-[600px] w-full flex-col overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* light, airy base with a faint brand wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#ffffff_0%,#f1f5f9_55%,#e9eef5_100%)]" />

      {/* WebGL energy field (light-tuned) */}
      <Suspense fallback={null}>
        <HeroScene3D className="absolute inset-0" />
      </Suspense>

      {/* gentle warm glow + edge fades to seat the type */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_42%,rgba(247,147,26,0.07),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-[#f8fafc]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#f8fafc] to-transparent" />

      {/* Overlaid editorial content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-24 sm:px-10 lg:px-16 lg:pt-28">
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-7 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-500"
        >
          <span className="inline-block h-px w-7 bg-watt-bitcoin" />
          WattByte Infrastructure
        </motion.div>

        <h1 className="max-w-4xl text-[2rem] font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.04] lg:text-[5rem]">
          <SplitWords text="We turn stranded power" className="block" />
          <SplitWords text="into the compute" className="block" delay={0.25} />
          <span className="block">
            <SplitWords text="behind" className="text-slate-900" delay={0.5} />{' '}
            <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
              <SplitWords text="modern AI." delay={0.62} />
            </span>
          </span>
        </h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:mt-7 sm:text-lg"
        >
          We acquire underutilized energy assets and develop them into AI, high-performance
          computing, and Bitcoin-mining datacenters — sourced with software no one else has.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.98 }}
          className="mt-6 flex flex-wrap items-center gap-3 sm:mt-9"
        >
          <Magnetic>
            <Link
              to="/advisory"
              className="group inline-flex h-12 items-center rounded-full bg-slate-900 px-7 text-base font-semibold text-white transition-colors hover:bg-watt-bitcoin"
            >
              Work with us
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Magnetic>
          <Link
            to="/hosting"
            className="inline-flex h-12 items-center rounded-full border border-slate-300 bg-white/60 px-6 text-base font-medium text-slate-700 backdrop-blur-sm transition-colors hover:border-slate-400 hover:bg-white"
          >
            Explore hosting
            <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      {/* Stat band — in normal flow at the bottom of the hero so it can never
          overlap the content on short screens. */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.15 }}
        className="relative z-10 border-t border-slate-200 bg-white/70 backdrop-blur-md"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 sm:px-10 lg:grid-cols-4 lg:px-16">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`py-4 sm:py-5 lg:py-6 lg:px-8 ${i > 0 ? 'lg:border-l border-slate-200' : ''} ${i < 2 ? 'border-b lg:border-b-0 border-slate-200' : ''}`}
            >
              <div className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                <CountUp value={s.value} />{s.suffix}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

    </section>
  );
}

export default HeroV3;
