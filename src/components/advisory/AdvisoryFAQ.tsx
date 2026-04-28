import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const faqs = [
  { q: 'What is the engagement minimum?', a: 'We typically engage on projects of 5 MW and above. For inference startups, we offer a fixed-scope discovery sprint starting at 1 MW.' },
  { q: 'How are fees structured?', a: 'A discovery retainer plus milestone fees through diligence and design. For build-to-suit engagements, we can fold advisory fees into the EPC contract.' },
  { q: 'Where do you operate?', a: 'North America (Alberta, Texas, Quebec, Newfoundland), East Africa (Uganda, Ethiopia), South Asia (Nepal, Bhutan, India), and selectively LATAM. Site sourcing is global.' },
  { q: 'Is the engagement exclusive?', a: 'For active site searches, yes — we ask for a 90-day exclusive on the defined geography to align incentives and protect our off-market network.' },
  { q: 'How do you handle confidentiality?', a: 'Mutual NDA before any project specifics are shared. All client data, load profiles, and economics are walled off from our own development pipeline.' },
  { q: 'How fast can you energize?', a: '1–20 MW pods: 9–14 months. 50–200 MW campuses: 14–24 months. Hyperscale (200+ MW): typically 24–36 months depending on interconnection.' },
];

export const AdvisoryFAQ: React.FC = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="max-w-3xl mx-auto px-6">
      <ScrollReveal>
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">FAQ</h2>
        </div>
      </ScrollReveal>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-lg px-5">
            <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
