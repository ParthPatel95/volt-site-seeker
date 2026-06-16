import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './motion';
import { WindFarmScene3D } from './WindFarmScene3D';
import { TOTAL_MW, COUNTRIES } from '@/data/advisory-pipeline';

// Full-bleed cinematic moment bridging the flagship ("one site in steel") and
// the global pipeline. A procedural 3D wind farm — spinning turbines receding
// into haze under a tracking camera — with one line of copy over it.
export function CinematicBand() {
  return (
    <section aria-label="From one site to a global pipeline" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <WindFarmScene3D
          className="h-[56vh] min-h-[22rem] rounded-3xl ring-1 ring-white/10 shadow-2xl"
          overlay={
            <div className="absolute inset-0 flex items-end">
              {/* legibility scrim under the copy */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, hsl(var(--watt-navy) / 0.85) 0%, hsl(var(--watt-navy) / 0.35) 45%, transparent 75%)',
                }}
              />
              <div className="relative p-8 sm:p-12 lg:p-16 max-w-2xl">
                <Reveal>
                  <p className="text-xs font-mono uppercase tracking-widest text-watt-bitcoin mb-4">
                    From one site to a portfolio
                  </p>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                    One flagship in steel.<br />
                    A {TOTAL_MW.toLocaleString()} MW pipeline across {COUNTRIES} countries.
                  </h2>
                  <Link
                    to="/advisory"
                    className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
                  >
                    See the pipeline <ArrowRight className="w-4 h-4" />
                  </Link>
                </Reveal>
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}
