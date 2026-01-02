import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Zap, Activity, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import SiteSelectionLearningObjectives from './SiteSelectionLearningObjectives';
import SiteSelectionSectionSummary from './SiteSelectionSectionSummary';
import InterconnectionCostCalculator from './InterconnectionCostCalculator';

const PowerInfrastructureSection = () => {
  const [selectedVoltage, setSelectedVoltage] = useState<string>('138kV');

  const voltageClasses = [
    {
      voltage: "500kV",
      type: "Extra High Voltage (EHV)",
      capacity: "500+ MW",
      typical: "Bulk transmission, interconnections",
      suitability: "Too large for most mining",
      color: "text-red-400"
    },
    {
      voltage: "230kV",
      type: "High Voltage",
      capacity: "100-500 MW",
      typical: "Major substations, industrial parks",
      suitability: "Large-scale operations (100+ MW)",
      color: "text-watt-bitcoin"
    },
    {
      voltage: "138kV",
      type: "Sub-Transmission",
      capacity: "25-150 MW",
      typical: "Regional distribution, large customers",
      suitability: "Ideal for 25-100 MW facilities",
      color: "text-watt-success"
    },
    {
      voltage: "69kV",
      type: "Distribution",
      capacity: "10-50 MW",
      typical: "Local substations, medium industry",
      suitability: "Good for 10-50 MW operations",
      color: "text-watt-success"
    },
    {
      voltage: "25kV",
      type: "Primary Distribution",
      capacity: "2-15 MW",
      typical: "Commercial/small industrial",
      suitability: "Small operations, containers",
      color: "text-blue-400"
    }
  ];

  const substationChecklist = [
    { item: "Available capacity (MVA)", critical: true, notes: "Request from utility, verify load studies" },
    { item: "Voltage levels available", critical: true, notes: "Match to your transformer requirements" },
    { item: "Distance to substation", critical: true, notes: "Affects interconnection cost ($1-3M/mile)" },
    { item: "Existing customer load", critical: false, notes: "Affects upgrade requirements" },
    { item: "Planned upgrades", critical: false, notes: "Utility capital improvement plans" },
    { item: "Interconnection queue position", critical: true, notes: "Determines timeline (6-36 months)" },
    { item: "Fault current available", critical: false, notes: "Affects protection equipment sizing" },
    { item: "Redundancy (N-1 capability)", critical: false, notes: "Single vs dual feed reliability" }
  ];

  return (
    <section id="power-infrastructure" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Power Infrastructure
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Evaluating Electrical Infrastructure
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Understanding transmission systems, substation capacity, and interconnection 
              requirements is fundamental to site selection.
            </p>
          </div>
        </ScrollReveal>

        {/* Learning Objectives */}
        <ScrollReveal delay={50}>
          <SiteSelectionLearningObjectives
            variant="light"
            objectives={[
              "Differentiate transmission voltage classes (25kV-500kV) and their mining suitability",
              "Evaluate substation capacity and critical interconnection requirements",
              "Estimate interconnection costs ranging from $3M to $30M+",
              "Understand the 13-32 month interconnection timeline and critical milestones"
            ]}
            estimatedTime="12 min"
            prerequisites={[
              { title: "Site Selection Fundamentals", href: "#intro" }
            ]}
          />
        </ScrollReveal>

        {/* Voltage Classes */}
        <ScrollReveal delay={100}>
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-8">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-watt-purple" />
              Transmission Voltage Classes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Voltage</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Classification</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Typical Capacity</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold hidden md:table-cell">Typical Use</th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Mining Suitability</th>
                  </tr>
                </thead>
                <tbody>
                  {voltageClasses.map((vc, idx) => (
                    <tr 
                      key={idx}
                      className={`border-b border-border/50 cursor-pointer transition-colors ${selectedVoltage === vc.voltage ? 'bg-watt-purple/5' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedVoltage(vc.voltage)}
                    >
                      <td className={`py-3 px-4 font-bold ${vc.color}`}>{vc.voltage}</td>
                      <td className="py-3 px-4 text-foreground">{vc.type}</td>
                      <td className="py-3 px-4 text-foreground">{vc.capacity}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{vc.typical}</td>
                      <td className="py-3 px-4 text-muted-foreground">{vc.suitability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-watt-success/10 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-watt-success flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-watt-success">Sweet Spot:</strong> 69kV-138kV substations offer the best 
                balance of capacity, interconnection cost, and availability for most Bitcoin mining operations.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Substation Evaluation Checklist */}
        <ScrollReveal delay={200}>
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 mb-8">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-watt-purple" />
              Substation Evaluation Checklist
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {substationChecklist.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  {item.critical ? (
                    <AlertTriangle className="w-5 h-5 text-watt-bitcoin flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-watt-success flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {item.item}
                      {item.critical && (
                        <span className="text-xs bg-watt-bitcoin/20 text-watt-bitcoin px-2 py-0.5 rounded">
                          Critical
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{item.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Interactive Interconnection Cost Calculator */}
        <ScrollReveal delay={250}>
          <InterconnectionCostCalculator />
        </ScrollReveal>

        {/* Timeline */}
        <ScrollReveal delay={300}>
          <div className="bg-gradient-to-r from-watt-purple/10 to-watt-bitcoin/10 rounded-2xl p-8 mt-8">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">
              Typical Interconnection Timeline
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {[
                { phase: "Application", duration: "1-2 months", desc: "Submit request, initial screening" },
                { phase: "System Studies", duration: "3-6 months", desc: "Impact analysis, cost estimates" },
                { phase: "Facilities Study", duration: "2-4 months", desc: "Detailed engineering design" },
                { phase: "Agreement", duration: "1-2 months", desc: "Negotiate terms, execute contract" },
                { phase: "Construction", duration: "6-18 months", desc: "Build infrastructure, test, energize" }
              ].map((phase, idx) => (
                <div key={idx} className="flex flex-col items-center text-center flex-1">
                  <div className="text-2xl font-bold text-watt-purple mb-1">{phase.duration}</div>
                  <div className="font-medium text-foreground">{phase.phase}</div>
                  <div className="text-xs text-muted-foreground max-w-[140px]">{phase.desc}</div>
                  {idx < 4 && (
                    <div className="hidden md:block absolute right-0 top-1/2 w-4 h-0.5 bg-watt-purple/30" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-6 text-muted-foreground text-sm">
              Total: <span className="font-bold text-foreground">13-32 months</span> from application to energization
            </div>
          </div>
        </ScrollReveal>

        {/* Section Summary */}
        <ScrollReveal delay={350}>
          <SiteSelectionSectionSummary
            keyTakeaways={[
              "69kV-138kV substations are the sweet spot for most mining operations (10-100 MW)",
              "Total interconnection costs range from $3-30M+ depending on distance and upgrades",
              "The interconnection timeline (13-32 months) is often the critical path for project development",
              "Always get written capacity confirmation from the utility before proceeding"
            ]}
            proTip="Order long-lead equipment (transformers, switchgear) as early as possible - even before final permits. Lead times of 6-12 months can delay your entire project."
            nextSection={{
              title: "Energy Markets",
              id: "energy-markets"
            }}
          />
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PowerInfrastructureSection;
