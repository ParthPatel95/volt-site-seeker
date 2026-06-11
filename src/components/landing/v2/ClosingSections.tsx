import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Reveal, Magnetic } from './motion';
import { TOTAL_MW } from '@/data/advisory-pipeline';

// Academy band — slim gradient strip pointing at the free course catalog.
export function AcademyBand() {
  return (
    <section className="px-6 sm:px-10 lg:px-20 py-6">
      <Reveal>
        <div className="max-w-7xl mx-auto relative overflow-hidden rounded-3xl border border-watt-purple/30 bg-gradient-to-r from-watt-purple/15 via-card/60 to-watt-trust/10 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 sm:p-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-watt-purple/15 text-watt-purple flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1">Learn the stack — free</h3>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Operator-grade modules on Bitcoin mining, datacenter engineering, AESO markets,
                  immersion cooling, and more. The same material our own team trains on.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/academy">
                Browse Academy <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// Default export composes the closing run for the page's single lazy import.
export default function ClosingSections() {
  return (
    <>
      <section aria-label="WattByte Academy"><AcademyBand /></section>
      <section aria-label="Get in touch"><FinalCTASection /></section>
    </>
  );
}

// Final CTA — the close.
export function FinalCTASection() {
  return (
    <section className="py-28 sm:py-36 px-6 sm:px-10 lg:px-20 relative overflow-hidden">
      {/* glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[26rem] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, hsl(var(--watt-bitcoin) / 0.7), hsl(var(--watt-trust) / 0.4) 60%, transparent 80%)' }}
        aria-hidden="true"
      />
      <div className="relative max-w-3xl mx-auto text-center">
        <Reveal>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {TOTAL_MW.toLocaleString()} MW says <span className="text-gradient-watt">we're serious.</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Whether you're siting a datacenter, deploying miners, or backing the build-out —
            start the conversation.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <Button asChild size="lg" className="h-13 px-8 text-base shadow-watt-glow">
                <Link to="/advisory">
                  Talk to the team <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic strength={0.2}>
              <Button asChild size="lg" variant="outline" className="h-13 px-8 text-base">
                <Link to="/app">Explore VoltScout</Link>
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
