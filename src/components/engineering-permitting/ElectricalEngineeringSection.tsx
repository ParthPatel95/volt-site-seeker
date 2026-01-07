import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { CircuitBoard } from 'lucide-react';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight } from './shared';

const ElectricalEngineeringSection = () => {
  return (
    <EPSectionWrapper id="electrical" theme="dark">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 7 • Electrical Engineering"
          badgeIcon={CircuitBoard}
          title="Electrical Infrastructure Design"
          description="45MW facilities require substantial electrical infrastructure including substations, transformers, and distribution systems."
          theme="dark"
        />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { title: "Substation Design", items: ["Main power transformer (typically 69kV to 25kV)", "Switchgear and protection systems", "Metering equipment per AESO requirements"] },
            { title: "Distribution", items: ["Medium voltage distribution (15-25kV)", "Step-down transformers to 480V", "Power distribution units (PDUs)"] },
          ].map((section, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--watt-purple))]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <EPKeyInsight title="45MW Electrical Budget" type="insight" theme="dark">
          <p>Electrical infrastructure for a 45MW facility typically represents 15-25% of total CapEx, including substation, transformers, and distribution equipment.</p>
        </EPKeyInsight>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default ElectricalEngineeringSection;
