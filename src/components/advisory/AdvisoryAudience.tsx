import React from 'react';
import { Cpu, Bitcoin, Zap } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const audiences = [
  {
    icon: Cpu,
    title: 'AI / HPC Hyperscalers & Neoclouds',
    range: '50 – 500 MW campuses',
    pain: 'Multi-year interconnection queues are missing your 2026–2028 training schedule.',
    answer: 'We route you to queue-cleared, contiguous land with utility load letters already in motion.',
    bullets: [
      'Validated 50–500 MW parcels surfaced in 30 days',
      'Direct ISO/RTO + utility engagement, not warm intros',
      'Liquid-cooling, water, fiber & substation diligence done in-house',
    ],
  },
  {
    icon: Bitcoin,
    title: 'Bitcoin Miners',
    range: 'Sub-7¢/kWh hosting-grade',
    pain: 'Hashprice volatility punishes anyone paying retail energy without ancillary stacking.',
    answer: 'We engineer all-in delivered power below 7¢/kWh with curtailment and demand-response baked in.',
    bullets: [
      'PPA structuring + ERCOT/AESO ancillary revenue modeling',
      'S21 / M60 / M70 fleet integration and retrofit guidance',
      'Behind-the-meter, on-grid, and flare-gas pathways',
    ],
  },
  {
    icon: Zap,
    title: 'Inference & Training Startups',
    range: '1 – 20 MW modular pods',
    pain: 'Hyperscale colos won\'t talk to you under 50 MW, and 24-month build cycles kill your runway.',
    answer: 'Pre-engineered modular pods on pre-validated sites, energized in 9–14 months at fixed fees.',
    bullets: [
      'Off-market 5–20 MW Tier II sites with cleared interconnection',
      'Pre-engineered modular MEP and rack-ready white space',
      'Capex-light colo, lease, or build-to-suit structures',
    ],
  },
];

export const AdvisoryAudience: React.FC = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="max-w-7xl mx-auto px-6">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Who we serve</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three buyer profiles. One bottleneck: power delivered on a timeline that actually matches their compute roadmap.
          </p>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {audiences.map((a, i) => (
          <ScrollReveal key={a.title} delay={i * 0.1}>
            <div className="group h-full bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-watt-bitcoin/50 hover:shadow-elegant transition-all">
              <div className="w-12 h-12 rounded-xl bg-watt-bitcoin/10 border border-watt-bitcoin/20 flex items-center justify-center mb-5 group-hover:bg-watt-bitcoin/20 transition-colors">
                <a.icon className="w-6 h-6 text-watt-bitcoin" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">{a.title}</h3>
              <div className="text-xs font-mono text-watt-bitcoin uppercase tracking-wider mb-3">{a.range}</div>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-foreground/70 leading-relaxed">
                  <span className="font-semibold text-foreground/90">The pain:</span> {a.pain}
                </p>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  <span className="font-semibold text-watt-bitcoin">Our answer:</span> {a.answer}
                </p>
              </div>
              <ul className="space-y-1.5">
                {a.bullets.map(b => (
                  <li key={b} className="text-sm text-foreground/80 flex items-start gap-2">
                    <span className="text-watt-bitcoin mt-1">·</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
