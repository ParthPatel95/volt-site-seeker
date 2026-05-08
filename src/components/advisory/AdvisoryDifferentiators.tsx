import React from 'react';
import { Wrench, BarChart3, Database, HardHat, Award } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const items = [
  {
    icon: Wrench,
    title: 'Operator-led, not slideware',
    desc: 'We are mid-build on our own 135 MW Alberta Heartland site. Our advice survives contact with the utility, the GC, and the AHJ — because it has to.',
  },
  {
    icon: Award,
    title: 'Institutional discipline',
    desc: 'Chaired by Jay Hao (former CEO, OKX; semiconductor & infra capital lineage). We underwrite to the standards capital partners actually fund — not founder optimism.',
  },
  {
    icon: BarChart3,
    title: 'VoltScout intelligence stack',
    desc: 'In-house platform tracking AESO, ERCOT, MISO, PJM, and global interconnection queues in real time. Every recommendation has a data trail.',
  },
  {
    icon: Database,
    title: 'Live energy economics',
    desc: 'AESO pool prices, ERCOT LMPs, weather correlations, 12CP analytics, and PPA hedging models — the same engine we use on our own portfolio.',
  },
  {
    icon: HardHat,
    title: 'Engineering & EPC under one roof',
    desc: 'Substation, MEP, and ASIC/HPC integration in-house. Take the diligence package to your EPC, or let us deliver it turnkey. Your call.',
  },
];

export const AdvisoryDifferentiators: React.FC = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="max-w-7xl mx-auto px-6">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Why WattByte Advisory</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Most advisors haven't built a megawatt. We've built — and operated — over a thousand.</p>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {items.map((it, i) => (
          <ScrollReveal key={it.title} delay={i * 0.05}>
            <div className="h-full bg-card border border-border rounded-xl p-5 hover:border-watt-bitcoin/40 transition-colors">
              <it.icon className="w-6 h-6 text-watt-bitcoin mb-3" />
              <h3 className="text-base font-bold text-foreground mb-2 leading-tight">{it.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
