import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, Zap } from 'lucide-react';
import { SplitWords, CountUp, Magnetic, Reveal } from './motion';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES, PIPELINE_PROJECTS } from '@/data/advisory-pipeline';

// Hero now showcases an animated 3D datacenter hall (rack rows, fans,
// blade-bay LEDs, overhead trays, data packets) — the thing we actually
// build — instead of a globe.
const DatacenterScene = lazy(() => import('./DatacenterScene'));

function useCanRender3D(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      const canvas = document.createElement('canvas');
      if (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) setOk(true);
    } catch { /* gradient-only fallback */ }
  }, []);
  return ok;
}

const STATS = [
  { value: TOTAL_MW, suffix: ' MW', label: 'Global pipeline', color: 'text-primary' },
  { value: UNDER_DEV_MW, suffix: ' MW', label: 'Under development', color: 'text-watt-success' },
  { value: COUNTRIES, suffix: '', label: 'Countries', color: 'text-watt-trust' },
  { value: PIPELINE_PROJECTS.length, suffix: '', label: 'Active sites', color: 'text-watt-bitcoin' },
];

export function HeroSection() {
  const canRender3D = useCanRender3D();
  const reduced = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] flex flex-col overflow-hidden">
      {/* 3D datacenter layer. Under it: a soft branded glow that's painted
          immediately so the right half of the hero never reads as a blank
          rectangle while the WebGL chunk + scene first frame are loading. */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 lg:left-[30%] pointer-events-none"
          style={{
            background:
              'radial-gradient(60% 70% at 60% 50%, hsl(var(--watt-trust) / 0.16), transparent 70%),' +
              'radial-gradient(50% 60% at 40% 70%, hsl(var(--watt-bitcoin) / 0.12), transparent 70%)',
          }}
        />
        {canRender3D && (
          <Suspense fallback={null}>
            <div className="absolute inset-0 lg:left-[30%]">
              <DatacenterScene />
            </div>
          </Suspense>
        )}
      </div>

      {/* Legibility gradient — heavier white wash on the text side so the copy
          stays crisp against the busy datacenter scene without darkening it */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, hsl(var(--background)) 0%, hsl(var(--background) / 0.94) 30%, hsl(var(--background) / 0.55) 55%, hsl(var(--background) / 0.15) 78%, transparent 100%)',
        }}
      />

      {/* Copy */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full px-6 sm:px-10 lg:px-20 max-w-7xl mx-auto">
          <div className="max-w-2xl pt-28 pb-20">
            <Reveal delay={0}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-watt-trust/30 bg-watt-trust/10 text-watt-trust text-xs font-medium mb-7 backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5" />
                Power-first digital infrastructure
              </div>
            </Reveal>

            <h1 className="text-[2.75rem] leading-[1.04] sm:text-6xl lg:text-7xl font-bold tracking-tight mb-7">
              <SplitWords text="Powering the" className="text-foreground" delay={0.1} />
              <br />
              <SplitWords text="Compute Economy" className="text-gradient-watt" delay={0.35} />
            </h1>

            <Reveal delay={0.55}>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mb-10">
                We acquire stranded energy assets and develop them into AI, HPC, and
                Bitcoin-mining datacenters — {TOTAL_MW.toLocaleString()}&nbsp;MW in motion
                across {COUNTRIES} countries.
              </p>
            </Reveal>

            <Reveal delay={0.7}>
              <div className="flex flex-wrap items-center gap-4 mb-14">
                <Magnetic>
                  <Button asChild size="lg" className="h-13 px-7 text-base shadow-watt-glow">
                    <Link to="/advisory">
                      Work with us <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <Button asChild size="lg" variant="outline" className="h-13 px-7 text-base backdrop-blur-sm">
                    <Link to="/hosting">Mining hosting</Link>
                  </Button>
                </Magnetic>
              </div>
            </Reveal>

            <Reveal delay={0.85}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-6">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className={`text-2xl sm:text-3xl font-bold ${s.color}`}>
                      <CountUp value={s.value} />{s.suffix}
                    </div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      {!reduced && (
        <motion.div
          className="relative z-10 flex justify-center pb-7 text-muted-foreground"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      )}
    </section>
  );
}
