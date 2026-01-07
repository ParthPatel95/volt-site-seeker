import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Building2, FileCheck, Zap, HardHat, ExternalLink, Calendar } from 'lucide-react';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight, EPStepByStep } from './shared';

const SafetyCodesSection = () => {
  const permitTypes = [
    { title: "Building Permit", description: "Required for all structures. National Building Code - 2023 Alberta Edition applies." },
    { title: "Electrical Permit", description: "Canadian Electrical Code 2024 (effective April 1, 2025). All electrical work requires permit." },
    { title: "Plumbing Permit", description: "Required if facility includes any plumbing fixtures or water systems." },
    { title: "Gas Permit", description: "Required for any natural gas installations for heating systems." },
  ];

  return (
    <EPSectionWrapper id="safety-codes" theme="dark">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 4 • Safety Codes"
          badgeIcon={Building2}
          title="Alberta Safety Codes Permits"
          description="Under the Safety Codes Act, all construction requires permits. For Lamont County, The Inspections Group Inc. administers safety code permits."
          theme="dark"
        />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {permitTypes.map((permit, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <FileCheck className="w-4 h-4" style={{ color: 'hsl(var(--watt-purple))' }} />
                {permit.title}
              </h4>
              <p className="text-white/70 text-sm">{permit.description}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <EPKeyInsight title="Key Codes in Force" type="insight" theme="dark">
          <ul className="space-y-1 text-sm">
            <li>• <strong>National Building Code – 2023 Alberta Edition</strong></li>
            <li>• <strong>Canadian Electrical Code 2024</strong> (effective April 1, 2025)</li>
            <li>• Contact: The Inspections Group Inc. at 780-454-5048</li>
          </ul>
        </EPKeyInsight>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default SafetyCodesSection;
