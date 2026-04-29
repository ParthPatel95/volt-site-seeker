import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const faqs = [
  {
    q: 'What is the engagement minimum?',
    a: 'We typically engage on projects of 5 MW and above. For inference startups, we run a fixed-scope discovery sprint starting at 1 MW so smaller teams can still get a defensible site shortlist.',
  },
  {
    q: 'How are fees structured — retainer or success?',
    a: 'Most engagements are a discovery retainer plus milestone fees through diligence and design. For build-to-suit engagements, we can fold advisory fees into the EPC contract or move to a success-weighted structure on closed PPAs / land deals. We do not take broker commissions from sellers.',
  },
  {
    q: 'Do you compete with us — you have your own pipeline?',
    a: 'Yes, we operate our own sites, and yes, that is exactly why our advice is useful. Client engagements are walled off: load profiles, economics, and target geographies are firewalled from our own development team. If a conflict ever arises on a specific parcel, we disclose and step back.',
  },
  {
    q: 'Is the engagement exclusive?',
    a: 'For active site searches, yes — we ask for a 90-day exclusive on the defined geography. It aligns incentives, protects our off-market network, and means you get our A-team rather than a watered-down parallel effort.',
  },
  {
    q: 'Where do you operate?',
    a: 'Active delivery in North America (Alberta, Texas, Quebec, Newfoundland), East Africa (Uganda), and South Asia (Nepal, Bhutan, India). Site sourcing is global; engagements outside our active regions get scoped on a project-by-project basis.',
  },
  {
    q: 'How fast can you energize?',
    a: '1–20 MW modular pods: 9–14 months on pre-validated sites. 50–200 MW campuses: 14–24 months. Hyperscale (200+ MW): typically 24–36 months depending on interconnection. We will tell you within the first two weeks if your stated timeline is not realistic.',
  },
  {
    q: 'How do you handle confidentiality?',
    a: 'Mutual NDA before any project specifics are shared. Client data, load profiles, and economics are stored in our secure environment and never used to inform our own development pipeline.',
  },
];

export const AdvisoryFAQ: React.FC = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="max-w-3xl mx-auto px-6">
      <ScrollReveal>
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-widest text-watt-bitcoin font-semibold mb-3">Frequently asked</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">The questions buyers actually ask</h2>
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
