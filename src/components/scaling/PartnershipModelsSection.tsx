import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Handshake, Building, Zap, Server, Users, ArrowRightLeft, CheckCircle, XCircle } from "lucide-react";

export const PartnershipModelsSection = () => {
  const partnershipTypes = [
    {
      icon: Building,
      type: "Joint Venture",
      description: "Shared ownership entity with aligned interests and combined resources",
      structure: "50/50 or negotiated split",
      useCase: "Large projects requiring combined expertise and capital",
      pros: ["Shared risk", "Combined expertise", "Aligned incentives"],
      cons: ["Complex governance", "Profit sharing", "Decision delays"]
    },
    {
      icon: Zap,
      type: "Power Partnership",
      description: "Agreement with utility or power generator for dedicated capacity",
      structure: "PPA or behind-the-meter",
      useCase: "Securing long-term, low-cost power supply",
      pros: ["Fixed power costs", "Priority access", "Long-term security"],
      cons: ["Volume commitments", "Geographic lock-in", "Take-or-pay risk"]
    },
    {
      icon: Server,
      type: "Hosting Agreement",
      description: "Third-party hosts your equipment in their facility",
      structure: "Per-kWh or per-unit fee",
      useCase: "Rapid deployment without facility development",
      pros: ["Quick start", "No capex", "Operational expertise"],
      cons: ["Less control", "Higher costs", "Capacity limits"]
    },
    {
      icon: ArrowRightLeft,
      type: "Hashrate Partnership",
      description: "Share mining rewards with infrastructure or capital partners",
      structure: "Revenue or hashrate split",
      useCase: "Monetizing excess capacity or accessing capital",
      pros: ["Capital efficiency", "Risk sharing", "Flexibility"],
      cons: ["Revenue dilution", "Complex accounting", "Partner dependency"]
    }
  ];

  const partnerEvaluation = [
    {
      category: "Financial Strength",
      factors: ["Balance sheet quality", "Funding commitments", "Track record", "Credit rating"],
      weight: "30%"
    },
    {
      category: "Operational Capability",
      factors: ["Technical expertise", "Existing infrastructure", "Team quality", "Geographic presence"],
      weight: "25%"
    },
    {
      category: "Strategic Fit",
      factors: ["Vision alignment", "Complementary assets", "Market access", "Cultural fit"],
      weight: "25%"
    },
    {
      category: "Terms & Structure",
      factors: ["Economic split", "Governance rights", "Exit provisions", "Dispute resolution"],
      weight: "20%"
    }
  ];

  const keyTerms = [
    { term: "Economic Split", description: "How profits, costs, and capital calls are shared between partners" },
    { term: "Governance", description: "Decision-making authority, board composition, and voting rights" },
    { term: "Capital Contributions", description: "Initial and ongoing funding obligations for each partner" },
    { term: "Operating Rights", description: "Who manages day-to-day operations and key personnel decisions" },
    { term: "Exit Provisions", description: "Buy-sell agreements, tag-along/drag-along, and termination rights" },
    { term: "Non-Compete", description: "Restrictions on partners competing in the same market or geography" }
  ];

  return (
    <section id="partnerships" className="py-20 bg-watt-gray/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Partnership Models
            </h2>
            <p className="text-xl text-watt-navy/70 max-w-3xl mx-auto">
              Strategic partnerships can accelerate growth, reduce risk, and provide access to resources.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {partnershipTypes.map((partnership, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-watt-navy/10 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-watt-success/10 rounded-xl flex items-center justify-center">
                    <partnership.icon className="w-6 h-6 text-watt-success" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-watt-navy">{partnership.type}</h3>
                    <p className="text-sm text-watt-success">{partnership.structure}</p>
                  </div>
                </div>
                
                <p className="text-watt-navy/70 text-sm mb-3">{partnership.description}</p>
                <p className="text-sm text-watt-navy mb-4">
                  <span className="font-medium">Best for:</span> {partnership.useCase}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h5 className="text-xs font-semibold text-watt-navy mb-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Advantages
                    </h5>
                    <ul className="space-y-1">
                      {partnership.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-watt-navy/70">• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-watt-navy mb-2 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-amber-500" />
                      Considerations
                    </h5>
                    <ul className="space-y-1">
                      {partnership.cons.map((con, i) => (
                        <li key={i} className="text-xs text-watt-navy/70">• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-watt-navy/10">
              <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-watt-success" />
                Partner Evaluation Framework
              </h3>
              <div className="space-y-4">
                {partnerEvaluation.map((criteria, index) => (
                  <div key={index} className="bg-watt-gray/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-watt-navy">{criteria.category}</h4>
                      <span className="text-sm font-medium text-watt-success">{criteria.weight}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {criteria.factors.map((factor, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white rounded text-xs text-watt-navy/70"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-watt-navy/10">
              <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-watt-success" />
                Key Partnership Terms
              </h3>
              <div className="space-y-4">
                {keyTerms.map((item, index) => (
                  <div key={index} className="border-b border-watt-navy/10 pb-3 last:border-0">
                    <h4 className="font-semibold text-watt-navy text-sm">{item.term}</h4>
                    <p className="text-sm text-watt-navy/70">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="mt-12 bg-gradient-to-r from-watt-success/10 to-watt-blue/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-watt-navy mb-4">Partnership Success Factors</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-watt-success rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold text-watt-navy mb-1">Clear Objectives</h4>
                <p className="text-sm text-watt-navy/70">Aligned goals and expectations from day one</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-watt-success rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold text-watt-navy mb-1">Fair Economics</h4>
                <p className="text-sm text-watt-navy/70">Value sharing that reflects contributions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-watt-success rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold text-watt-navy mb-1">Strong Governance</h4>
                <p className="text-sm text-watt-navy/70">Clear decision rights and dispute resolution</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-watt-success rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h4 className="font-semibold text-watt-navy mb-1">Exit Flexibility</h4>
                <p className="text-sm text-watt-navy/70">Well-defined paths for changing circumstances</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
