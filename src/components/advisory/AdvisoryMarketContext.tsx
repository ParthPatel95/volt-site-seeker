import React from 'react';
import { TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const stats = [
  {
    icon: TrendingUp,
    value: '~945 TWh',
    label: 'Projected global datacenter electricity demand by 2030, more than double 2024',
    source: 'IEA, Energy and AI (2025)',
  },
  {
    icon: Clock,
    value: '~5 yrs',
    label: 'Median time from interconnection request to commercial operation in U.S. ISOs',
    source: 'Berkeley Lab, Queued Up (2024)',
  },
  {
    icon: AlertTriangle,
    value: '~2.6 TW',
    label: 'Generation and storage capacity stuck in active U.S. interconnection queues',
    source: 'Berkeley Lab, Queued Up (2024)',
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
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            AI training clusters, inference farms, and Bitcoin operations are bidding for the same scarce resource: large-block, dispatchable, near-term electrons. Grid queues run years deep, major utilities have paused new large-load studies, and incumbents are quietly locking in the remaining headroom.
          </p>
          <p className="text-base text-foreground/70 leading-relaxed">
            <span className="font-semibold text-foreground">Why now:</span> the AI capex cycle is front-loaded into 2026–2028. Whoever controls energized sites in that window controls the model-training calendar — and the unit economics that follow.
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
