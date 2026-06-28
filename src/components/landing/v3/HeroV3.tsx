import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SplitWords, CountUp, Magnetic } from './scroll';
import { HeroScene } from './HeroScene';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES, PIPELINE_PROJECTS } from '@/data/advisory-pipeline';

// Living hero: a seamless, continuously-looping canvas animation (HeroScene)
// fills the whole first viewport — a slow glide down a datacenter aisle with
// twinkling racks, energy streaks flowing along the rails, and a neural
// constellation pulsing overhead. The copy sits over it on a soft light wash,
// and on scroll the copy lifts + the scene parallaxes gently. GPU-cheap (2D
// canvas, no WebGL) and reduced-motion safe.

const STATS = [
  { value: TOTAL_MW, suffix: ' MW', label: 'Global pipeline' },
  { value: UNDER_DEV_MW, suffix: ' MW', label: 'Under development' },
  { value: COUNTRIES, suffix: '', label: 'Countries' },
  { value: PIPELINE_PROJECTS.length, suffix: '', label: 'Active sites' },
];

export function HeroV3() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Scroll-linked hero choreography (smoothed with a spring so it never jitters).
  const springCfg = { stiffness: 90, damping: 30, mass: 0.4 };
  const sceneY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -60]), springCfg);
  const sceneScale = useSpring(useTransform(scrollYProgress, [0, 1], [1.02, 1.12]), springCfg);
  const copyY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 60]), springCfg);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.35]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#f8fafc] text-slate-900"
    >
      {/* Full-bleed living scene — the animated datacenter aisle. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={reduced ? undefined : { y: sceneY, scale: sceneScale }}
      >
        <HeroScene className="h-full w-full" />
      </motion.div>

      {/* Readability washes: brighten the left where the copy sits and fade the
          scene into the page at every edge so it blends with the light theme. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/70 to-transparent lg:via-[#f8fafc]/40" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8fafc] to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f8fafc] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pt-28 sm:px-10 lg:px-16 lg:pt-32">
        <div className="flex flex-1 items-center">
          {/* Copy */}
          <motion.div className="max-w-2xl" style={reduced ? undefined : { y: copyY, opacity: copyOpacity }}>
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-600 ring-1 ring-slate-900/5 backdrop-blur-sm"
            >
              <span className="inline-block h-px w-7 bg-watt-bitcoin" />
              WattByte Infrastructure
            </motion.div>

            <h1 className="text-[2rem] font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.04] lg:text-[4.25rem]">
              <SplitWords text="We turn stranded power" className="block" />
              <SplitWords text="into the compute" className="block" delay={0.22} />
              <span className="block">
                <SplitWords text="behind" delay={0.44} />{' '}
                <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
                  <SplitWords text="modern AI." delay={0.54} />
                </span>
              </span>
            </h1>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
            >
              We acquire underutilized energy assets and develop them into AI, high-performance
              computing, and Bitcoin-mining datacenters — sourced with software no one else has.
            </motion.p>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.92 }}
              className="mt-8 flex flex-wrap items-center gap-3"
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
                className="inline-flex h-12 items-center rounded-full border border-slate-300 bg-white/70 px-6 text-base font-medium text-slate-700 backdrop-blur-sm transition-colors hover:border-slate-400 hover:bg-white"
              >
                Explore hosting
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stat band — in normal flow so it never overlaps on short screens. */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05 }}
          className="mt-10 grid grid-cols-2 border-t border-slate-200/80 lg:mt-14 lg:grid-cols-4"
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`py-5 lg:py-6 lg:px-8 ${i > 0 ? 'lg:border-l border-slate-200' : ''} ${i < 2 ? 'border-b lg:border-b-0 border-slate-200' : ''} ${i === 1 ? 'pl-6 lg:pl-8' : ''}`}
            >
              <div className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                <CountUp value={s.value} />{s.suffix}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default HeroV3;
