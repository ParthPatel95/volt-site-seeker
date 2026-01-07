import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Zap, ExternalLink, AlertTriangle, Calendar } from 'lucide-react';
import { EPSectionWrapper, EPSectionHeader, EPKeyInsight, EPStepByStep } from './shared';

const AESOConnectionSection = () => {
  const connectionSteps = [
    { 
      title: "Submit SASR", 
      description: "System Access Service Request via Adobe Workfront. Contact customer.connections@aeso.ca for access." 
    },
    { 
      title: "Assessment Phase", 
      description: "Independent Assessment for loads (45MW qualifies). Cluster Assessment for generation ≥5MW." 
    },
    { 
      title: "System Studies", 
      description: "AESO conducts system impact studies and engineering assessments." 
    },
    { 
      title: "Execution Phase", 
      description: "Connection, Behind-the-Fence, or Contract project type determined." 
    },
    { 
      title: "Construction & Energization", 
      description: "Build facilities, complete inspections, and energize upon approval." 
    },
  ];

  const dataCentreTimeline = [
    { date: "April 2025", event: "Additional facility and operating details list published" },
    { date: "May 2025", event: "MW load allocation methodology published, Connection Process updates" },
    { date: "Mid Q2 2025", event: "Load Capability Map published, information session" },
    { date: "Q4 2025", event: "NERC Large Loads Task Force recommendations" },
  ];

  return (
    <EPSectionWrapper id="aeso" theme="light">
      <ScrollReveal>
        <EPSectionHeader
          badge="Section 4 • Grid Connection"
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
        <EPKeyInsight title="AESO Data Centre Updates (March 2025)" type="warning">
          <p className="mb-3">AESO has implemented significant new requirements for data centre and large load connections due to unprecedented demand:</p>
          <ul className="space-y-2">
            <li>• Cumulative data centre requested load approaching Alberta's peak demand</li>
            <li>• Projects clustering in Edmonton and Calgary regions causing grid stress</li>
            <li>• Additional technical requirements: voltage/frequency ride-through, load ramping controls, harmonics management</li>
            <li>• Most data centres must contribute sufficient on-site generation</li>
          </ul>
        </EPKeyInsight>
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <div className="mt-8 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">AESO Data Centre Timeline (2025)</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {dataCentreTimeline.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <span className="text-sm font-medium text-primary shrink-0 w-28">{item.date}</span>
                <span className="text-sm text-muted-foreground">{item.event}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Source: <a href="https://www.aeso.ca/assets/AESO-Data-Centre-Update-March2025.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AESO Data Centre Update March 2025</a>
            </p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={400}>
        <div className="mt-8 p-4 bg-muted rounded-lg flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-foreground">AESO Customer Connections</h4>
            <p className="text-sm text-muted-foreground">403-539-2793 • customer.connections@aeso.ca</p>
          </div>
          <a 
            href="https://www.aeso.ca/grid/connecting-to-the-grid/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
          >
            Connection Guide <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </ScrollReveal>
    </EPSectionWrapper>
  );
};

export default AESOConnectionSection;
