import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Zap, ExternalLink } from 'lucide-react';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight, EPStepByStep } from './shared';

const AESOConnectionSection = () => {
  const connectionSteps = [
    { title: "Submit SASR", description: "System Access Service Request via Adobe Workfront. Contact customer.connections@aeso.ca for access." },
    { title: "Assessment Phase", description: "Independent Assessment for loads (45MW qualifies). Cluster Assessment for generation ≥5MW." },
    { title: "System Studies", description: "AESO conducts system impact studies and engineering assessments." },
    { title: "Execution Phase", description: "Connection, Behind-the-Fence, or Contract project type determined." },
    { title: "Construction & Energization", description: "Build facilities, complete inspections, and energize upon approval." },
  ];

  return (
    <EPSectionWrapper id="aeso" theme="light">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 5 • Grid Connection"
          badgeIcon={Zap}
          title="AESO Connection Process"
          description="The Alberta Electric System Operator manages all grid connections. For a 45MW load, the Independent Assessment Process applies."
        />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <EPStepByStep steps={connectionSteps} theme="light" />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <EPKeyInsight title="Data Centre Connection Updates (2025)" type="insight">
          <p>AESO has implemented new requirements for data centre connections. Large load projects undergo additional review. Contact AESO Customer Connections at 403-539-2793.</p>
        </EPKeyInsight>
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <div className="mt-8 p-4 bg-muted rounded-lg flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground">AESO Connecting to the Grid</h4>
            <p className="text-sm text-muted-foreground">Official process documentation and guides</p>
          </div>
          <a href="https://www.aeso.ca/grid/connecting-to-the-grid/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Visit <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default AESOConnectionSection;
