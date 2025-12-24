import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Building2, Target, Search, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { ScalingLearningObjectives } from "./ScalingLearningObjectives";
import { ScalingSectionSummary } from "./ScalingSectionSummary";
import { MAValuationEstimator } from "./MAValuationEstimator";

export const MergersAcquisitionsSection = () => {
  const [selectedStrategy, setSelectedStrategy] = useState(0);

  const maStrategies = [
    {
      strategy: "Horizontal",
      title: "Competitor Acquisition",
      description: "Acquiring other mining operations to increase scale and market share",
      targets: ["Operating miners", "Development projects", "Hashrate portfolios"],
      benefits: ["Immediate capacity", "Market consolidation", "Synergies"],
      risks: ["Integration complexity", "Overpaying", "Cultural clash"],
      valuation: "EV/Hash or EV/MW"
    },
    {
      strategy: "Vertical",
      title: "Supply Chain Integration",
      description: "Acquiring upstream (power) or downstream (ASIC manufacturing) capabilities",
      targets: ["Power plants", "Equipment manufacturers", "Repair facilities"],
      benefits: ["Cost reduction", "Supply security", "Margin capture"],
      risks: ["Capital intensive", "Operational complexity", "Diversification risk"],
      valuation: "DCF or Asset-based"
    },
    {
      strategy: "Distressed",
      title: "Opportunistic Purchases",
      description: "Acquiring assets from financially troubled operators at discounted prices",
      targets: ["Bankruptcy assets", "Forced liquidations", "Stranded projects"],
      benefits: ["Low entry price", "Quick capacity add", "Less competition"],
      risks: ["Hidden liabilities", "Equipment condition", "Seller motivation"],
      valuation: "Liquidation value"
    }
  ];

  const dueDiligenceAreas = [
    {
      area: "Technical",
      items: ["Equipment inventory & condition", "Hashrate verification", "Efficiency metrics", "Maintenance history", "Infrastructure quality"]
    },
    {
      area: "Financial",
      items: ["Historical financials", "Power contracts", "Revenue verification", "Liability review", "Working capital needs"]
    },
    {
      area: "Legal",
      items: ["Corporate structure", "Permits & licenses", "Litigation history", "Contract assignments", "Environmental compliance"]
    },
    {
      area: "Operational",
      items: ["Team assessment", "Processes & SOPs", "Vendor relationships", "Customer contracts", "Insurance coverage"]
    }
  ];

  const integrationPhases = [
    { phase: "Day 1", focus: "Control", activities: "Leadership, communication, critical operations" },
    { phase: "Days 2-30", focus: "Stabilization", activities: "Key staff retention, vendor continuity, basic integration" },
    { phase: "Days 31-90", focus: "Integration", activities: "Systems migration, process alignment, synergy capture" },
    { phase: "Days 91-180", focus: "Optimization", activities: "Performance improvement, culture integration, full synergies" }
  ];

  const learningObjectives = [
    "Choose between Horizontal (scale), Vertical (supply chain), and Distressed (opportunistic) M&A strategies",
    "Complete the 4-area due diligence checklist: Technical, Financial, Legal, Operational",
    "Execute 4-phase post-acquisition integration from Day 1 control to 180-day optimization"
  ];

  const keyTakeaways = [
    "Horizontal acquisitions provide immediate capacity but require careful integration planning",
    "Distressed acquisitions offer discounts of 30-50% but carry hidden liability risks",
    "Integration success metrics: >95% hashrate retention, >80% key staff retention, 80% synergy capture within 12 months"
  ];

  return (
    <section id="mergers-acquisitions" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mergers & Acquisitions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Inorganic growth through strategic acquisitions can rapidly scale operations.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <ScalingLearningObjectives objectives={learningObjectives} />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h3 className="text-2xl font-bold text-foreground mb-6">M&A Strategies</h3>
          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden mb-12">
            <div className="flex border-b border-border">
              {maStrategies.map((s, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedStrategy(index)}
                  className={`flex-1 px-6 py-4 text-center transition-all duration-300 ${
                    selectedStrategy === index
                      ? "bg-watt-success text-white"
                      : "bg-card text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="font-semibold">{s.strategy}</div>
                  <div className="text-sm opacity-80">{s.title}</div>
                </button>
              ))}
            </div>

            <div className="p-8">
              <p className="text-muted-foreground mb-6">{maStrategies[selectedStrategy].description}</p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-watt-success" />
                    Target Types
                  </h4>
                  <ul className="space-y-2">
                    {maStrategies[selectedStrategy].targets.map((target, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-watt-success rounded-full"></div>
                        {target}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-watt-success/5 border border-watt-success/20 rounded-xl p-4">
                  <h4 className="font-semibold text-watt-success mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Key Benefits
                  </h4>
                  <ul className="space-y-2">
                    {maStrategies[selectedStrategy].benefits.map((benefit, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-watt-success rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-500 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Key Risks
                  </h4>
                  <ul className="space-y-2">
                    {maStrategies[selectedStrategy].risks.map((risk, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-watt-success/10 rounded-xl">
                <span className="text-sm font-medium text-foreground">Typical Valuation Method: </span>
                <span className="text-sm text-muted-foreground">{maStrategies[selectedStrategy].valuation}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* M&A Valuation Estimator */}
        <ScrollReveal delay={150}>
          <div className="mb-12">
            <MAValuationEstimator />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h3 className="text-2xl font-bold text-foreground mb-6">Due Diligence Checklist</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {dueDiligenceAreas.map((area, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-md border border-border"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-5 h-5 text-watt-success" />
                  <h4 className="font-semibold text-foreground">{area.area}</h4>
                </div>
                <ul className="space-y-2">
                  {area.items.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-4 h-4 border border-border rounded mt-0.5 shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <h3 className="text-2xl font-bold text-foreground mb-6">Post-Acquisition Integration</h3>
          <div className="bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl p-8 text-white">
            <div className="grid md:grid-cols-4 gap-6">
              {integrationPhases.map((phase, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-watt-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold">{index + 1}</span>
                  </div>
                  <h4 className="font-bold mb-1">{phase.phase}</h4>
                  <p className="text-watt-success font-medium text-sm mb-2">{phase.focus}</p>
                  <p className="text-sm text-white/70">{phase.activities}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <h4 className="font-semibold mb-3">Integration Success Metrics</h4>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Hashrate Retention</div>
                  <div className="text-white/70">Target: &gt;95%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Staff Retention</div>
                  <div className="text-white/70">Target: &gt;80% key personnel</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Synergy Capture</div>
                  <div className="text-white/70">Target: 80% within 12 months</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-medium">Uptime</div>
                  <div className="text-white/70">Target: &gt;95% post-integration</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <ScalingSectionSummary 
            keyTakeaways={keyTakeaways}
            nextSectionId="scaling-cta"
            nextSectionTitle="Course Completion"
          />
        </ScrollReveal>
      </div>
    </section>
  );
};
