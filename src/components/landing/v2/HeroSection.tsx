import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Reveal, CountUp } from './motion';
import { DatacenterCampusScene3D } from './DatacenterCampusScene3D';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES, PIPELINE_PROJECTS } from '@/data/advisory-pipeline';

// Institutional hero: editorial copy on a clean light field with one
// procedural 3D scene — a realistic hyperscale datacenter campus seen from
// the air. Six long halls in two rows with rooftop HVAC arrays (fans
// spinning), a substation yard with three transformers + a gantry, six
// backup diesel generators, perimeter fence, landscaping, and a transmission
// feed coming in with an animated current pulse. The orbiting camera shows
// the layout from every angle.

const STATS = [
  { value: TOTAL_MW, suffix: ' MW', label: 'Global pipeline' },
  { value: UNDER_DEV_MW, suffix: ' MW', label: 'Under development' },
  { value: COUNTRIES, suffix: '', label: 'Countries' },
  { value: PIPELINE_PROJECTS.length, suffix: '', label: 'Active sites' },
];

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          {/* Editorial copy */}
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground mb-8">
                <span className="inline-block w-6 h-px bg-watt-bitcoin" />
                WATTBYTE INFRASTRUCTURE
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="font-bold tracking-tight text-foreground leading-[1.05] text-[2.6rem] sm:text-6xl lg:text-[4.25rem]">
                Power-first
                <br />
                infrastructure for the
                <br />
                <span className="text-gradient-watt">compute economy.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-7 text-lg text-muted-foreground leading-relaxed max-w-xl">
                We acquire stranded and underutilized energy assets and develop them into
                AI, high-performance computing, and Bitcoin-mining datacenters — sourced with
                proprietary software others don't have.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-12 px-7 text-base">
                  <Link to="/advisory">
                    Work with us <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="h-12 px-5 text-base text-foreground hover:bg-muted">
                  <Link to="/hosting">
                    Explore hosting <ArrowUpRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Realistic hyperscale datacenter campus, aerial */}
          <Reveal delay={0.1}>
            <DatacenterCampusScene3D
              eager
              className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-3xl ring-1 ring-black/5 shadow-2xl"
              overlay={
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-foreground/65 bg-background/60 backdrop-blur-sm px-2 py-1 rounded">
                    Hyperscale campus · transmission-connected
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-watt-bitcoin bg-background/60 backdrop-blur-sm px-2 py-1 rounded">
                    {COUNTRIES} countries
                  </span>
                </div>
              }
            />
          </Reveal>
        </div>

        {/* Stat band */}
        <Reveal delay={0.2}>
          <div className="mt-16 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 border-t border-border">
            {STATS.map((s) => (
              <div key={s.label} className="py-6 lg:py-8 lg:px-8 first:lg:pl-0 border-b lg:border-b-0 lg:border-l border-border first:border-l-0">
                <div className="text-3xl lg:text-4xl font-bold text-foreground">
                  <CountUp value={s.value} />{s.suffix}
                </div>
                <div className="mt-1.5 text-xs text-muted-foreground uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
