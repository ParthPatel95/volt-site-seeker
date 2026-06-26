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
    <section className="relative h-screen min-h-[680px] w-full overflow-hidden bg-[#060b16] text-white">
      {/* dark cinematic base behind the canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#0c1830_0%,#060b16_55%,#04070f_100%)]" />

      {/* WebGL energy field */}
      <Suspense fallback={null}>
        <HeroScene3D className="absolute inset-0" />
      </Suspense>

      {/* CSS bloom + vignette to lift the glow and seat the type */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_42%,rgba(247,147,26,0.10),transparent_60%)] mix-blend-screen" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#060b16]/40 via-transparent to-[#060b16]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#060b16] to-transparent" />

      {/* Overlaid editorial content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 sm:px-10 lg:px-16">
        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-7 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white/55"
        >
          <span className="inline-block h-px w-7 bg-watt-bitcoin" />
          WattByte Infrastructure
        </motion.div>

        <h1 className="max-w-4xl text-[2.7rem] font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-[5rem]">
          <SplitWords text="We turn stranded power" className="block" />
          <SplitWords text="into the compute" className="block" delay={0.25} />
          <span className="block">
            <SplitWords text="behind" className="text-white" delay={0.5} />{' '}
            <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
              <SplitWords text="modern AI." delay={0.62} />
            </span>
          </span>
        </h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-white/70"
        >
          We acquire underutilized energy assets and develop them into AI, high-performance
          computing, and Bitcoin-mining datacenters — sourced with software no one else has.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.98 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Magnetic>
            <Link
              to="/advisory"
              className="group inline-flex h-12 items-center rounded-full bg-white px-7 text-base font-semibold text-[#060b16] transition-colors hover:bg-watt-bitcoin"
            >
              Work with us
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Magnetic>
          <Link
            to="/hosting"
            className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-base font-medium text-white/90 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Explore hosting
            <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      {/* Stat band pinned to the bottom of the hero */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.15 }}
        className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-[#060b16]/40 backdrop-blur-md"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 sm:px-10 lg:grid-cols-4 lg:px-16">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`py-5 lg:py-6 lg:px-8 ${i > 0 ? 'lg:border-l border-white/10' : ''} ${i < 2 ? 'border-b lg:border-b-0 border-white/10' : ''}`}
            >
              <div className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                <CountUp value={s.value} />{s.suffix}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/45">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* scroll cue */}
      {!reduced && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, 6, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: 1.5 }}
          className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/40 lg:bottom-28"
        >
          Scroll
        </motion.div>
      )}
    </section>
  );
}

export default HeroV3;
