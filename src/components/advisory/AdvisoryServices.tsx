import React from 'react';
import { Search, Plug, FileCheck, FileText, Calculator, Building2 } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const services = [
  {
    num: '01', icon: Search,
    title: 'Site sourcing → validated shortlist in 30 days',
    desc: 'A proprietary network of utilities, landowners, and brokers across North America, LATAM, East Africa, and South Asia surfaces 5–500 MW parcels before they hit any broker channel.',
    deliverables: ['3–7 ranked off-market sites', 'Utility headroom & queue snapshot per site', 'Capex-to-energization estimate'],
  },
  {
    num: '02', icon: Plug,
    title: 'Interconnection diligence → go/no-go in 6 weeks',
    desc: 'Utility load letters, ISO/RTO queue position analysis, transformer capacity validation, and a defensible energization calendar — not a rosy slideware estimate.',
    deliverables: ['Load letter or feasibility study', 'Queue position & study cost forecast', 'Substation upgrade scope & responsibility matrix'],
  },
  {
    num: '03', icon: FileCheck,
    title: 'Permitting, zoning & community → de-risked AHJ path',
    desc: 'EIA, conditional use, noise studies, water rights, and stakeholder strategy designed around real lessons from operating sites — including ours.',
    deliverables: ['Permit gantt & critical-path map', 'Noise/visual mitigation plan', 'Community & First Nations engagement playbook'],
  },
  {
    num: '04', icon: FileText,
    title: 'Energy procurement → contracted price + ancillary upside',
    desc: 'PPA structuring, behind-the-meter generation, demand-response stacking, retail vs wholesale strategy, and curtailment economics modeled against live AESO/ERCOT data.',
    deliverables: ['Hedged PPA term sheet', 'Curtailment / DR revenue model', 'Indifference-price calculator for your load'],
  },
  {
    num: '05', icon: Calculator,
    title: 'Capex / opex modeling → board-ready unit economics',
    desc: 'Bottom-up build models, rate optimization (FortisAlberta Rate 65, ERCOT zonal), TAC/DTS exposure, and IRR sensitivity — auditable, not back-of-envelope.',
    deliverables: ['Per-MW capex stack', '10-year opex & energy cost model', 'IRR / NPV sensitivity dashboard'],
  },
  {
    num: '06', icon: Building2,
    title: 'Build-to-suit & turnkey energization → keys to compute',
    desc: 'Optional WattByte EPC handoff: substation, MEP, white-space delivery, and operations transition. One contract, one accountable team — the same team running our 135 MW Alberta build.',
    deliverables: ['Fixed-price EPC proposal', 'Substation + MEP design package', 'Commissioning & operations handoff plan'],
  },
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
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
              <div className="pt-3 border-t border-border">
                <div className="text-[10px] font-mono uppercase tracking-wider text-watt-bitcoin mb-2">Deliverables</div>
                <ul className="space-y-1">
                  {s.deliverables.map(d => (
                    <li key={d} className="text-xs text-foreground/75 flex items-start gap-2">
                      <span className="text-watt-bitcoin mt-0.5">✓</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
