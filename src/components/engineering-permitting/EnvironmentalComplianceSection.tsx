import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Volume2, ExternalLink } from 'lucide-react';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight } from './shared';

const EnvironmentalComplianceSection = () => {
  return (
    <EPSectionWrapper id="environmental" theme="light">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 8 • Environmental Compliance"
          badgeIcon={Volume2}
          title="AER Directive 038: Noise Control"
          description="The Alberta Energy Regulator's Directive 038 (April 2024 edition) sets noise control requirements for industrial facilities."
        />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">Permissible Sound Levels</h3>
          <p className="text-muted-foreground mb-4">Directive 038 establishes comprehensive sound level limits based on:</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Distance to nearest residence (receptor)</li>
            <li>• Time of day (daytime vs nighttime)</li>
            <li>• Land use classification of surrounding area</li>
            <li>• Cumulative impact from all industrial sources</li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <EPKeyInsight title="Noise Impact Assessment" type="warning">
          <p>A Noise Impact Assessment (NIA) may be required before development permit approval. This includes baseline measurements and predictive modeling of operational noise levels at receptor locations.</p>
        </EPKeyInsight>
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <div className="mt-8 p-4 bg-muted rounded-lg flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground">AER Directive 038</h4>
            <p className="text-sm text-muted-foreground">Noise Control - April 2024 Edition</p>
          </div>
          <a href="https://www.aer.ca/regulations-and-compliance-enforcement/rules-and-regulations/directives/directive-038" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            View Directive <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default EnvironmentalComplianceSection;
