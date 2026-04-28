import React from 'react';
import { Wrench, BarChart3, Database, HardHat, Award } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const items = [
  { icon: Wrench,    title: 'Operator-led', desc: 'We run our own 135 MW Alberta build. Our advice survives contact with the utility, the GC, and the AHJ.' },
  { icon: BarChart3, title: 'VoltScout intelligence', desc: 'Proprietary platform tracking AESO, ERCOT, MISO, PJM, and global queues in real time. Decisions backed by data, not vibes.' },
  { icon: Database,  title: 'Live market data', desc: 'AESO pool prices, ERCOT LMPs, weather correlations, and 12CP analytics — the same tools we use on our own portfolio.' },
  { icon: HardHat,   title: 'In-house engineering', desc: 'Substation, MEP, and ASIC/HPC integration expertise. Optional EPC handoff after the advisory phase.' },
  { icon: Award,     title: 'GW-scale track record', desc: 'From 0 to 1.4 GW global pipeline in under three years across six countries. We know which deals close.' },
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
