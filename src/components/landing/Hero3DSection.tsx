import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe2 } from 'lucide-react';
import { ScrollReveal } from './ScrollAnimations';
import { FacilityShowcase } from './FacilityShowcase';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES, PIPELINE_PROJECTS } from '@/data/advisory-pipeline';
import './landing-animations.css';

// three.js loads only when this chunk resolves; until then (and for
// reduced-motion / no-WebGL users) the previous photo hero stands in, so
// first paint never waits on the 3D scene.
const HeroGlobe3D = lazy(() => import('./HeroGlobe3D'));

function useCanRender3D(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      if (gl) setOk(true);
    } catch {
      /* no WebGL — photo fallback */
    }
  }, []);
  return ok;
}

const STATS: { value: string; label: string; colorClass: string }[] = [
  { value: `${TOTAL_MW.toLocaleString()} MW`, label: 'Global pipeline', colorClass: 'text-primary' },
  { value: `${UNDER_DEV_MW} MW`, label: 'Under development', colorClass: 'text-watt-success' },
  { value: String(COUNTRIES), label: 'Countries', colorClass: 'text-watt-trust' },
  { value: String(PIPELINE_PROJECTS.length), label: 'Active sites', colorClass: 'text-watt-bitcoin' },
];

export const Hero3DSection = () => {
  const canRender3D = useCanRender3D();

  return (
    <section className="relative z-10 w-full min-h-[88vh] overflow-hidden">
      {/* Background layer: 3D pipeline globe, or the photo hero as fallback */}
      <div className="absolute inset-0 w-full h-full">
        {canRender3D ? (
          <Suspense fallback={<FacilityShowcase />}>
            <div className="absolute inset-0 lg:left-[30%]">
              <HeroGlobe3D />
            </div>
          </Suspense>
        ) : (
          <FacilityShowcase />
        )}
      </div>

      {/* Legibility gradient — heavier on the text side, clear over the globe */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, hsl(var(--background) / 0.99) 0%, hsl(var(--background) / 0.92) 30%, hsl(var(--background) / 0.55) 55%, hsl(var(--background) / 0.12) 75%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center min-h-[88vh] pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20">
        <div className="w-full px-6 sm:px-8 lg:px-16 max-w-3xl">
          <ScrollReveal delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-watt-trust/30 bg-watt-trust/10 text-watt-trust text-xs font-medium mb-6">
              <Globe2 className="w-3.5 h-3.5" />
              {TOTAL_MW.toLocaleString()} MW pipeline across {COUNTRIES} countries
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.05] tracking-tight">
              <span className="text-foreground">Powering the</span><br />
              <span className="text-gradient-watt">Compute Economy</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mb-10">
              WattByte acquires and develops strategic power infrastructure for AI,
              high-performance computing, and Bitcoin mining — turning stranded
              energy into productive digital capacity.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="flex flex-wrap items-center gap-3 mb-12">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link to="/advisory">
                  Work with us <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/hosting">Mining hosting</Link>
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 max-w-xl">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className={`text-2xl sm:text-3xl font-bold tabular-nums ${s.colorClass}`}>
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
