import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Scale, ExternalLink } from 'lucide-react';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight } from './shared';

const AUCApprovalSection = () => {
  return (
    <EPSectionWrapper id="auc" theme="gradient">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 6 • AUC Approval"
          badgeIcon={Scale}
          title="AUC Rule 007 Compliance"
          description="The Alberta Utilities Commission regulates power plants and transmission facilities under Rule 007 (updated November 2025)."
        />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">When AUC Approval is Required</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Power plants with capability ≥1 MW require approval</li>
            <li>• Industrial System Designation (ISD) applications</li>
            <li>• New transmission lines and substations</li>
            <li>• Public interest assessments for large facilities</li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <EPKeyInsight title="Bitcoin Mining Classification" type="insight">
          <p>As a load (consumer) rather than generator, most Bitcoin mining facilities do not require direct AUC power plant approval. However, if you're self-generating or have on-site generation, Rule 007 applies.</p>
        </EPKeyInsight>
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <div className="mt-8 p-4 bg-muted rounded-lg flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground">AUC Rules & Regulations</h4>
            <p className="text-sm text-muted-foreground">Official Rule 007 documentation</p>
          </div>
          <a href="https://www.auc.ab.ca/rules/rules-home" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Visit <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default AUCApprovalSection;
