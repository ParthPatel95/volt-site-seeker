import React from 'react';
import { Compass, Microscope, Ruler, Power } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const steps = [
  { icon: Compass,   week: 'Week 1–2',  title: 'Discovery',  desc: 'Define load profile, geography, timeline, capex envelope, and energy strategy.' },
  { icon: Microscope, week: 'Week 2–8',  title: 'Diligence',  desc: 'Source candidate sites, run interconnection + permitting + economics on each.' },
  { icon: Ruler,  week: 'Week 6–14', title: 'Design',     desc: 'Lock in site, finalize PPA/utility terms, engineer substation + MEP, secure permits.' },
  { icon: Power,     week: 'Month 4–18', title: 'Energize',   desc: 'Construction oversight, commissioning, and operations handoff to your team.' },
];

export const AdvisoryProcess: React.FC = () => (
  <section className="py-16 md:py-24 bg-secondary/30 border-y border-border">
    <div className="max-w-7xl mx-auto px-6">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">How we engage</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A four-phase process designed to compress the typical 36-month cycle into 12–18.</p>
        </div>
      </ScrollReveal>
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Connector line desktop */}
        <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-watt-bitcoin/40 to-transparent" />
        {steps.map((s, i) => (
          <ScrollReveal key={s.title} delay={i * 0.1}>
            <div className="relative bg-background border border-border rounded-xl p-6 text-center h-full">
              <div className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 flex items-center justify-center">
                <s.icon className="w-7 h-7 text-watt-bitcoin" />
              </div>
              <div className="text-xs font-mono text-watt-bitcoin uppercase tracking-wider mb-1">{s.week}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
