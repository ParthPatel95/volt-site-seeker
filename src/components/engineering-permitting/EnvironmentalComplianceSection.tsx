import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Volume2, ExternalLink } from 'lucide-react';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight } from './shared';

const EnvironmentalComplianceSection = () => {
  return (
    <EPSectionWrapper id="environmental" theme="gradient">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 7 • Environmental Compliance"
          badgeIcon={Volume2}
          title="AER Directive 038: Noise Control"
          description="The Alberta Energy Regulator's Directive 038 (April 2024 edition) sets comprehensive noise control requirements for industrial facilities."
        />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 text-foreground">Permissible Sound Levels (PSL)</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Key Requirements</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong className="text-foreground">Baseline PSL:</strong> 40 dBA Leq (nighttime) at 1.5 km from facility fence line</li>
                <li>• <strong className="text-foreground">Receptor-based:</strong> Noise measured at dwelling, not property line</li>
                <li>• <strong className="text-foreground">Cumulative impact:</strong> Your contribution must be ≤ PSL minus existing ambient</li>
                <li>• <strong className="text-foreground">Low frequency:</strong> Separate limits for frequencies ≤250 Hz</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Assessment Requirements</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Baseline ambient noise measurements</li>
                <li>• Predictive modeling of operational noise</li>
                <li>• Receptor location identification</li>
                <li>• Mitigation measures if PSL exceeded</li>
              </ul>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <blockquote className="border-l-4 border-primary pl-6 py-4 mb-8 bg-card rounded-r-xl">
          <p className="text-muted-foreground italic mb-2">
            "The directive sets permissible sound levels (PSLs) for outdoor noise, taking into consideration that the attenuation of noise through the walls of a dwelling should decrease the indoor sound levels to where normal sleep patterns are not disturbed."
          </p>
          <cite className="text-sm text-primary">— AER Directive 038, Section 1.2</cite>
        </blockquote>
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <EPKeyInsight title="Noise Impact Assessment (NIA)" type="warning">
          <p>A Noise Impact Assessment may be required before development permit approval if:</p>
          <ul className="mt-2 space-y-1">
            <li>• Your facility is within 1.5 km of any dwelling</li>
            <li>• Multiple industrial sources exist in the area (cumulative impact)</li>
            <li>• Municipality or regulator requires it as a condition</li>
          </ul>
          <p className="mt-3">Budget <strong>$15,000 - $40,000</strong> for a comprehensive NIA with baseline measurements and predictive modeling.</p>
        </EPKeyInsight>
      </ScrollReveal>

      <ScrollReveal delay={400}>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-foreground">AER Directive 038</h4>
            <p className="text-sm text-muted-foreground mb-3">Noise Control - April 2024 Edition</p>
            <a 
              href="https://www.aer.ca/regulations-and-compliance-enforcement/rules-and-regulations/directives/directive-038" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View Directive <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-foreground">Directive 038 PDF</h4>
            <p className="text-sm text-muted-foreground mb-3">Full technical document with appendices</p>
            <a 
              href="https://static.aer.ca/prd/documents/directives/Directive038.pdf" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Download PDF <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default EnvironmentalComplianceSection;
