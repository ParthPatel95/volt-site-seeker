import React from 'react';
import { TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const stats = [
  {
    icon: TrendingUp,
    value: '2.3×',
    label: 'AI datacenter electricity demand by 2030',
    source: 'IEA, Energy & AI 2025',
  },
  {
    icon: Clock,
    value: '4–7 yrs',
    label: 'Average interconnection queue (PJM, ERCOT, MISO)',
    source: 'LBNL, Queued Up 2024',
  },
  {
    icon: AlertTriangle,
    value: '> 2.6 TW',
    label: 'Generation projects stuck in U.S. queues',
    source: 'Berkeley Lab, 2024',
  },
];

export const AdvisoryMarketContext: React.FC = () => (
  <section className="py-16 md:py-24 bg-secondary/30 border-y border-border">
    <div className="max-w-7xl mx-auto px-6">
      <ScrollReveal>
        <div className="max-w-3xl mb-10">
          <div className="text-xs uppercase tracking-widest text-watt-bitcoin font-semibold mb-3">Market context</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            The bottleneck isn't compute. It's <span className="text-watt-bitcoin">power</span>.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            AI training clusters, inference farms, and Bitcoin operations are bidding for the same scarce resource: large-block, dispatchable, near-term electrons. Grid queues are years long, utilities are pausing new large-load applications, and the winners will be those with off-market site networks and operator credibility.
          </p>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <ScrollReveal key={s.label} delay={i * 0.1}>
            <div className="bg-background border border-border rounded-xl p-6 h-full">
              <s.icon className="w-7 h-7 text-watt-bitcoin mb-3" />
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 tabular-nums">{s.value}</div>
              <div className="text-sm text-foreground/80 mb-3 leading-snug">{s.label}</div>
              <div className="text-xs text-muted-foreground italic">Source: {s.source}</div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
