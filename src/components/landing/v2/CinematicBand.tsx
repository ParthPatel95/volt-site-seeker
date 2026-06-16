import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './motion';
import { CinematicScene3D } from './CinematicScene3D';
import { TOTAL_MW, COUNTRIES } from '@/data/advisory-pipeline';
import bandImage from '@/assets/aeso-wind-farm.jpg';

// Full-bleed cinematic moment bridging the flagship ("one site in steel") and
// the global pipeline. A hyper-real 3D scene with a single landscape energy
// shot under a strong navy grade, with one line of copy — a deliberate breath
// in the scroll.
export function CinematicBand() {
  return (
    <section aria-label="From one site to a global pipeline" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <CinematicScene3D
          src={bandImage}
          alt="Wind generation across the Alberta grid"
          grade="navy"
          accent="#10a5c7"
          className="h-[56vh] min-h-[22rem] rounded-3xl ring-1 ring-white/10 shadow-2xl"
        >
          <div className="absolute inset-0 flex items-end">
            <div className="p-8 sm:p-12 lg:p-16 max-w-2xl">
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
        </CinematicScene3D>
      </div>
    </section>
  );
}
