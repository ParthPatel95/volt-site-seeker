import React from 'react';
import { Cpu, Bitcoin, Zap } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const audiences = [
  {
    icon: Cpu,
    title: 'AI / HPC Hyperscalers & Neoclouds',
    range: '50 – 500 MW campuses',
    desc: 'Liquid-cooled, high-density GPU clusters with 2026–2028 energization. We unlock contiguous powered land at sub-queue timelines.',
    bullets: ['Tier III+ topology guidance', 'Direct utility & ISO/RTO engagement', 'Water + fiber + substation diligence'],
  },
  {
    icon: Bitcoin,
    title: 'Bitcoin Miners',
    range: 'Sub-7¢/kWh hosting-grade',
    desc: 'ASIC-ready power topology, PPA structuring, demand-response stacking. Built by an operator that runs miners at scale.',
    bullets: ['Curtailment & ancillary revenue modeling', 'S21 / M60 / M70 fleet integration', 'Behind-the-meter & on-grid options'],
  },
  {
    icon: Zap,
    title: 'Inference & Training Startups',
    range: '1 – 20 MW modular pods',
    desc: 'Fast-track sub-12-month energization for emerging GPU clouds. Modular skids, pre-validated sites, fixed-fee delivery.',
    bullets: ['Pre-engineered modular MEP', 'Off-market 5–20 MW Tier II sites', 'Capex-light colo + lease structures'],
  },
];

export const AdvisoryAudience: React.FC = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="max-w-7xl mx-auto px-6">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Who we serve</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three client segments, one common need: powered land delivered on a timeline that matches their compute roadmap.
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
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{a.desc}</p>
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
