import { Link } from 'react-router-dom';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Reveal } from './motion';
import { TOTAL_MW, UNDER_DEV_MW, COUNTRIES } from '@/data/advisory-pipeline';

// Plain-language answers to the questions partners actually ask. Accordion is
// interactive + keyboard-accessible out of the box and naturally responsive.
// Answers stay consistent with the rest of the page (same sourced figures).

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What does WattByte actually do?',
    a: (
      <>
        We acquire stranded and underutilized energy assets and develop them into
        AI, high-performance-computing, and Bitcoin-mining datacenters. In practice
        that means three things: <strong>sourcing</strong> power nobody is marketing,{' '}
        <strong>developing</strong> it through interconnection and EPC, and{' '}
        <strong>operating</strong> dual-workload capacity once it’s energized.
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
        candidate is scored on a 100-point suitability model — grid, fiber, gas, water,
        climate, and hazard layers — so we evaluate power assets before they’re ever
        listed for sale.
      </>
    ),
  },
  {
    q: 'Is this real infrastructure or just a pipeline on paper?',
    a: (
      <>
        Both — and we’re explicit about which is which. {UNDER_DEV_MW} MW is under active
        development in Alberta (transmission-connected, dual-workload by design), inside a{' '}
        {TOTAL_MW.toLocaleString()} MW global pipeline across {COUNTRIES} countries. Every
        figure on this site traces to the same sourced registry behind our{' '}
        <Link to="/advisory" className="text-primary hover:underline">Advisory pipeline</Link>.
      </>
    ),
  },
  {
    q: 'Can I host my own machines with you?',
    a: (
      <>
        Yes. Our Alberta capacity offers transparent rates, live telemetry, and both
        air and immersion cooling. You can model the economics before committing with the{' '}
        <Link to="/hosting" className="text-primary hover:underline">hosting calculator</Link>,
        and curtailment-aware operations keep power costs honest in volatile markets.
      </>
    ),
  },
  {
    q: 'Do you work with developers and investors directly?',
    a: (
      <>
        We do. Through <Link to="/advisory" className="text-primary hover:underline">Infrastructure Advisory</Link>{' '}
        we run off-market site sourcing, interconnection diligence, energy procurement,
        and datacenter EPC guidance — backed by our own development track record. For
        capital, <Link to="/wattfund" className="text-primary hover:underline">WattFund</Link>{' '}
        offers staged access to the infrastructure we build.
      </>
    ),
  },
  {
    q: 'Where can I learn the technical side?',
    a: (
      <>
        <Link to="/academy" className="text-primary hover:underline">WattByte Academy</Link>{' '}
        is free — operator-grade modules on Bitcoin mining, datacenter engineering, AESO
        markets, and immersion cooling: the same material our own team trains on.
      </>
    ),
  },
];

export function FaqSection() {
  return (
    <section className="py-24 sm:py-32 px-6 sm:px-10 lg:px-20">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-watt-trust mb-3">
            Questions, answered
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-10 sm:mb-12">
            The short version
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
