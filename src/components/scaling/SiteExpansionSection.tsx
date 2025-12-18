import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Building, ArrowRight, Clock, DollarSign, Zap, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const SiteExpansionSection = () => {
  const [selectedPhase, setSelectedPhase] = useState(0);

  const expansionPhases = [
    {
      phase: "Phase 1",
      title: "Planning & Permitting",
      duration: "3-6 months",
      activities: [
        "Site engineering and design",
        "Environmental impact assessment",
        "Building permit applications",
        "Utility interconnection agreements",
        "Zoning and land use approvals"
      ],
      milestones: ["Design complete", "Permits approved", "Utility agreement signed"],
      cost: "5-10%"
    },
    {
      phase: "Phase 2",
      title: "Infrastructure Build",
      duration: "4-8 months",
      activities: [
        "Site preparation and grading",
        "Foundation and structural work",
        "Electrical infrastructure installation",
        "Transformer and switchgear setup",
        "Cooling system construction"
      ],
      milestones: ["Site ready", "Power connected", "Cooling operational"],
      cost: "40-50%"
    },
    {
      phase: "Phase 3",
      title: "Equipment Deployment",
      duration: "2-4 months",
      activities: [
        "ASIC miner procurement and delivery",
        "Rack and PDU installation",
        "Network infrastructure setup",
        "Miner installation and configuration",
        "System integration testing"
      ],
      milestones: ["Equipment received", "Installation complete", "Systems tested"],
      cost: "35-45%"
    },
    {
      phase: "Phase 4",
      title: "Commissioning",
      duration: "2-4 weeks",
      activities: [
        "Staged power-up and testing",
        "Performance optimization",
        "Monitoring system calibration",
        "Staff training and handover",
        "Full production ramp-up"
      ],
      milestones: ["First hash", "Full capacity", "Operations handover"],
      cost: "5-10%"
    }
  ];

  const expansionTypes = [
    {
      type: "Brownfield",
      description: "Expanding within existing facility footprint",
      pros: ["Lower permitting burden", "Existing infrastructure", "Known site conditions", "Faster timeline"],
      cons: ["Limited by existing capacity", "May require upgrades", "Space constraints"],
      timeline: "6-12 months",
      costPerMW: "$400K-$600K"
    },
    {
      type: "Greenfield",
      description: "Building new facility on undeveloped land",
      pros: ["Optimal design", "No constraints", "Latest technology", "Full control"],
      cons: ["Higher upfront cost", "Longer timeline", "More permitting", "Utility buildout"],
      timeline: "12-24 months",
      costPerMW: "$600K-$900K"
    },
    {
      type: "Conversion",
      description: "Repurposing existing industrial facility",
      pros: ["Existing power", "Shorter timeline", "Lower cost", "Existing permits"],
      cons: ["Design compromises", "Renovation costs", "Legacy issues"],
      timeline: "4-9 months",
      costPerMW: "$350K-$550K"
    }
  ];

  return (
    <section id="site-expansion" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Site Expansion Strategies
            </h2>
            <p className="text-xl text-watt-navy/70 max-w-3xl mx-auto">
              Understanding the different approaches to expanding mining capacity and their trade-offs.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h3 className="text-2xl font-bold text-watt-navy mb-6">Expansion Types Comparison</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {expansionTypes.map((type, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-watt-navy/10 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-6 h-6 text-watt-success" />
                  <h4 className="text-xl font-bold text-watt-navy">{type.type}</h4>
                </div>
                <p className="text-watt-navy/70 text-sm mb-4">{type.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-watt-success/10 rounded-lg p-3">
                    <Clock className="w-4 h-4 text-watt-success mb-1" />
                    <div className="text-sm font-semibold text-watt-navy">{type.timeline}</div>
                    <div className="text-xs text-watt-navy/60">Timeline</div>
                  </div>
                  <div className="bg-watt-bitcoin/10 rounded-lg p-3">
                    <DollarSign className="w-4 h-4 text-watt-bitcoin mb-1" />
                    <div className="text-sm font-semibold text-watt-navy">{type.costPerMW}</div>
                    <div className="text-xs text-watt-navy/60">Cost/MW</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-semibold text-green-600 mb-1">Advantages</h5>
                    <ul className="text-xs text-watt-navy/70 space-y-1">
                      {type.pros.map((pro, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-amber-600 mb-1">Considerations</h5>
                    <ul className="text-xs text-watt-navy/70 space-y-1">
                      {type.cons.map((con, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <h3 className="text-2xl font-bold text-watt-navy mb-6">Expansion Project Phases</h3>
          <div className="bg-white rounded-2xl shadow-lg border border-watt-navy/10 overflow-hidden">
            <div className="flex flex-wrap border-b border-watt-navy/10">
              {expansionPhases.map((phase, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhase(index)}
                  className={`flex-1 min-w-[150px] px-6 py-4 text-center transition-all duration-300 ${
                    selectedPhase === index
                      ? "bg-watt-success text-white"
                      : "bg-white text-watt-navy hover:bg-watt-gray/50"
                  }`}
                >
                  <div className="font-semibold">{phase.phase}</div>
                  <div className="text-sm opacity-80">{phase.duration}</div>
                </button>
              ))}
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold text-watt-navy mb-4">
                    {expansionPhases[selectedPhase].title}
                  </h4>
                  <p className="text-watt-navy/70 mb-4">
                    Duration: <span className="font-semibold">{expansionPhases[selectedPhase].duration}</span>
                    <span className="mx-2">|</span>
                    Budget: <span className="font-semibold">{expansionPhases[selectedPhase].cost} of total</span>
                  </p>
                  <h5 className="font-semibold text-watt-navy mb-2">Key Activities</h5>
                  <ul className="space-y-2">
                    {expansionPhases[selectedPhase].activities.map((activity, i) => (
                      <li key={i} className="flex items-start gap-2 text-watt-navy/70">
                        <ArrowRight className="w-4 h-4 text-watt-success mt-0.5 shrink-0" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-watt-navy mb-4">Key Milestones</h5>
                  <div className="space-y-3">
                    {expansionPhases[selectedPhase].milestones.map((milestone, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-watt-success/10 rounded-lg p-4"
                      >
                        <CheckCircle2 className="w-5 h-5 text-watt-success" />
                        <span className="font-medium text-watt-navy">{milestone}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-watt-navy/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-watt-bitcoin" />
                      <span className="font-semibold text-watt-navy">Pro Tip</span>
                    </div>
                    <p className="text-sm text-watt-navy/70">
                      {selectedPhase === 0 && "Start utility discussions early - interconnection can be the longest lead time item."}
                      {selectedPhase === 1 && "Order transformers and switchgear immediately - lead times can exceed 12 months."}
                      {selectedPhase === 2 && "Stage equipment deliveries to match installation capacity and avoid storage costs."}
                      {selectedPhase === 3 && "Commission in batches of 20-30% to identify issues before full deployment."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
