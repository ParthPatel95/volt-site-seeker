import React from 'react';
import { Search, Plug, FileCheck, FileText, Calculator, Building2 } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const services = [
  { num: '01', icon: Search,   title: 'Site sourcing & off-market deal flow', desc: 'Proprietary network of utilities, landowners, and brokers across NA, LATAM, Africa, and South Asia. We surface 5–500 MW sites before they hit the market.' },
  { num: '02', icon: Plug,     title: 'Power & interconnection diligence',   desc: 'Utility load letters, ISO/RTO queue position analysis, transformer capacity validation, and capex-to-energization timelines.' },
  { num: '03', icon: FileCheck, title: 'Permitting, zoning & community',     desc: 'EIA, conditional use, noise studies, water rights, and stakeholder strategies. Built around real lessons from operating sites.' },
  { num: '04', icon: FileText, title: 'Energy procurement',                   desc: 'PPA structuring, behind-the-meter generation, demand response stacking, retail vs wholesale strategy, and curtailment economics.' },
  { num: '05', icon: Calculator, title: 'Capex/opex modeling',                desc: 'Bottom-up build models, rate optimization (e.g. Rate 65 transmission-connected), TAC/DTS exposure, and IRR sensitivity.' },
  { num: '06', icon: Building2, title: 'Build-to-suit & turnkey energization', desc: 'Optional WattByte EPC partnership: substation, MEP, white-space delivery, and operations handoff. One throat to choke.' },
];

export const AdvisoryServices: React.FC = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="max-w-7xl mx-auto px-6">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">What we do</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Six integrated workstreams. Engage one or all — we scale to your stage.
          </p>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s, i) => (
          <ScrollReveal key={s.num} delay={i * 0.05}>
            <div className="group h-full bg-card border border-border rounded-xl p-6 hover:border-watt-bitcoin/40 hover:bg-secondary/40 transition-all">
              <div className="flex items-start justify-between mb-4">
                <s.icon className="w-7 h-7 text-watt-bitcoin" />
                <span className="font-mono text-sm text-muted-foreground/60">{s.num}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
