import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal, SplitWords, CountUp, Magnetic } from '../scroll';
import { TOTAL_MW, COUNTRIES, UNDER_DEV_MW } from '@/data/advisory-pipeline';

// Closing CTA — the page's final ask, before the footer. Adapted from the v2
// FinalCTASection: same intent and copy ("we're serious", start the
// conversation), re-presented as a tall, centered, full-bleed dark panel.
// Background is pure CSS — a bitcoin/teal radial bloom layered over #060b16 with
// a faint grid — so it carries no image weight and stays razor-crisp on every
// display. One headline, one supporting line, two CTAs, a thin sourced trust row.

// A single trust figure in the bottom rail. Numbers animate on enter via CountUp.
function Stat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-2xl font-bold tracking-tight text-white tabular-nums sm:text-3xl">
        <CountUp value={value} />
        {suffix ? <span className="text-white/70">{suffix}</span> : null}
      </div>
      <div className="mt-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/45">
        {label}
      </div>
    </div>
  );
}

export function ClosingCta() {
  return (
    <section
      id="get-in-touch"
      className="relative isolate overflow-hidden bg-[#060b16] py-32 lg:py-40"
    >
      {/* ── CSS radial bloom background — bitcoin + teal over near-black navy ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* warm bitcoin core, slightly above center */}
        <div
          className="absolute left-1/2 top-[38%] h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.55] blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, rgba(247,147,26,0.42), rgba(247,147,26,0.10) 55%, transparent 78%)',
          }}
        />
        {/* cool teal counter-glow, lower and offset for depth */}
        <div
          className="absolute left-[58%] top-[64%] h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.40] blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, rgba(16,165,199,0.40), rgba(16,165,199,0.08) 55%, transparent 80%)',
          }}
        />
        {/* faint engineering grid for texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage:
              'radial-gradient(ellipse 70% 55% at 50% 45%, black, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 55% at 50% 45%, black, transparent 80%)',
          }}
        />
        {/* settle the bloom back into the page base at the edges */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#060b16] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#060b16] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal y={20}>
            <div className="mb-6 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              <span className="inline-block h-px w-7 bg-watt-bitcoin" />
              Start the conversation
            </div>
          </Reveal>

          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            <SplitWords text={`${TOTAL_MW.toLocaleString()} MW says`} />
            <span className="mt-1 block">
              <span className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent">
                <SplitWords text="we're serious." delay={0.18} />
              </span>
            </span>
          </h2>

          <Reveal delay={0.25} y={18}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/65 lg:text-lg">
              Whether you&rsquo;re siting a datacenter, deploying miners, or backing
              the build-out of the infrastructure behind AI&nbsp;&mdash; this is where
              it starts.
            </p>
          </Reveal>

          <Reveal delay={0.4} y={16}>
            <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Magnetic>
                <Link
                  to="/advisory"
                  className="inline-flex h-12 items-center rounded-full bg-white px-7 text-base font-semibold text-[#060b16] transition-colors hover:bg-watt-bitcoin"
                >
                  Work with us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.2}>
                <Link
                  to="/hosting"
                  className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-base font-medium text-white/90 transition-colors hover:bg-white/5"
                >
                  Explore hosting
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>

        {/* ── Thin sourced trust rail ── */}
        <Reveal delay={0.55} y={16}>
          <div className="mx-auto mt-16 flex max-w-2xl items-center justify-center gap-8 border-t border-white/10 pt-10 sm:gap-16">
            <Stat value={TOTAL_MW} suffix=" MW" label="Pipeline" />
            <span className="h-10 w-px bg-white/10" aria-hidden="true" />
            <Stat value={UNDER_DEV_MW} suffix=" MW" label="Under development" />
            <span className="h-10 w-px bg-white/10" aria-hidden="true" />
            <Stat value={COUNTRIES} label="Countries" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
