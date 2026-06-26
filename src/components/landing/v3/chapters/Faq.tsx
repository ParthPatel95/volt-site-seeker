import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircleQuestion } from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Reveal, SplitWords, Magnetic } from '../scroll';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES } from '@/data/advisory-pipeline';

// FAQ — "The short version." Plain-language answers to the questions partners
// actually ask, carried over verbatim from the v2 FaqSection and re-presented as
// a quiet, editorial two-column chapter: a sticky heading/intro rail on the left,
// a dark accordion on the right. Every figure traces to the same sourced registry
// the rest of the page uses. One accent (orange) only.

interface Faq {
  q: string;
  a: ReactNode;
}

// Inline link styling — keeps brand teal/orange restrained inside body copy.
const inlineLink = 'font-medium text-watt-trust underline-offset-4 transition-colors hover:text-watt-bitcoin hover:underline';

const FAQS: Faq[] = [
  {
    q: 'What does WattByte actually do?',
    a: (
      <>
        We acquire stranded and underutilized energy assets and develop them into
        AI, high-performance-computing, and Bitcoin-mining datacenters. In practice
        that means three things: <strong className="font-semibold text-white/90">sourcing</strong> power
        nobody is marketing, <strong className="font-semibold text-white/90">developing</strong> it
        through interconnection and EPC, and{' '}
        <strong className="font-semibold text-white/90">operating</strong> dual-workload capacity
        once it&rsquo;s energized.
      </>
    ),
  },
  {
    q: 'How do you find sites others don’t?',
    a: (
      <>
        Our VoltScout platform and its Hidden Gems engine continuously scan industrial
        registries, real-estate listings, grid topology, and even satellite imagery for
        idle interconnections, curtailed generation, and distressed plants. Every
        candidate is scored on a 100-point suitability model &mdash; grid, fiber, gas, water,
        climate, and hazard layers &mdash; so we evaluate power assets before they&rsquo;re ever
        listed for sale.
      </>
    ),
  },
  {
    q: 'Is this real infrastructure or just a pipeline on paper?',
    a: (
      <>
        Both &mdash; and we&rsquo;re explicit about which is which.{' '}
        <span className="font-semibold tabular-nums text-white/90">{UNDER_DEV_MW} MW</span> is
        under active development in Alberta (transmission-connected, dual-workload by
        design), inside a{' '}
        <span className="font-semibold tabular-nums text-white/90">{TOTAL_MW.toLocaleString()} MW</span>{' '}
        global pipeline across{' '}
        <span className="font-semibold tabular-nums text-white/90">{COUNTRIES} countries</span>.
        Every figure on this site traces to the same sourced registry behind our{' '}
        <Link to="/advisory" className={inlineLink}>Advisory pipeline</Link>.
      </>
    ),
  },
  {
    q: 'Can I host my own machines with you?',
    a: (
      <>
        Yes. Our Alberta capacity offers transparent rates, live telemetry, and both
        air and immersion cooling. You can model the economics before committing with the{' '}
        <Link to="/hosting" className={inlineLink}>hosting calculator</Link>, and
        curtailment-aware operations keep power costs honest in volatile markets.
      </>
    ),
  },
  {
    q: 'Do you work with developers and investors directly?',
    a: (
      <>
        We do. Through{' '}
        <Link to="/advisory" className={inlineLink}>Infrastructure Advisory</Link> we run
        off-market site sourcing, interconnection diligence, energy procurement, and
        datacenter EPC guidance &mdash; backed by our own development track record. For
        capital, <Link to="/wattfund" className={inlineLink}>WattFund</Link> offers staged
        access to the infrastructure we build.
      </>
    ),
  },
  {
    q: 'Where can I learn the technical side?',
    a: (
      <>
        <Link to="/academy" className={inlineLink}>WattByte Academy</Link> is free &mdash;
        operator-grade modules on Bitcoin mining, datacenter engineering, AESO markets,
        and immersion cooling: the same material our own team trains on.
      </>
    ),
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          {/* Left rail — sticks while the answers scroll past it on desktop. */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="mb-5 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                <span className="inline-block h-px w-7 bg-watt-bitcoin" />
                Questions, answered
              </div>
            </Reveal>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              <SplitWords text="The short" />{' '}
              <SplitWords
                text="version"
                delay={0.18}
                className="bg-gradient-to-r from-watt-bitcoin to-watt-trust bg-clip-text text-transparent"
              />
            </h2>

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/65 lg:text-lg">
                Plain-language answers to what partners actually ask &mdash; every figure
                consistent with the sourced registry behind the rest of this page.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <Magnetic>
                <Link
                  to="/advisory"
                  className="mt-9 inline-flex h-12 items-center rounded-full border border-white/20 px-6 text-base font-medium text-white/90 transition-colors hover:border-watt-bitcoin/50 hover:bg-white/5"
                >
                  <MessageCircleQuestion className="mr-2 h-4 w-4 text-watt-bitcoin" />
                  Still have a question?
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Magnetic>
            </Reveal>
          </div>

          {/* Right column — the dark accordion. */}
          <Reveal delay={0.12} y={32}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 backdrop-blur-sm sm:px-8">
              <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                {FAQS.map((f, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border-b border-white/10 last:border-b-0"
                  >
                    <AccordionTrigger className="py-6 text-left text-lg font-medium text-white transition-colors hover:no-underline hover:text-watt-bitcoin [&[data-state=open]]:text-watt-bitcoin [&>svg]:text-white/40">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-7 pr-6 text-base leading-relaxed text-white/65">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
