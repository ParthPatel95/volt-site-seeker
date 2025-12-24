import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Shield, Umbrella, FileCheck, Building } from "lucide-react";
import { RiskLearningObjectives } from "./RiskLearningObjectives";
import { RiskSectionSummary } from "./RiskSectionSummary";
import { InsuranceCoverageEstimator } from "./InsuranceCoverageEstimator";

export const InsuranceSection = () => {
  const insuranceTypes = [
    {
      icon: Building,
      type: "Property Insurance",
      coverage: "Physical assets, equipment, structures",
      considerations: [
        "Replacement cost vs actual cash value",
        "Coverage for mining-specific equipment",
        "Business interruption coverage",
        "Flood and natural disaster riders"
      ],
      typical: "$5-15M coverage for 50MW facility"
    },
    {
      icon: Shield,
      type: "Cyber Insurance",
      coverage: "Data breaches, ransomware, system failures",
      considerations: [
        "Cryptocurrency custody coverage",
        "Business interruption from cyber events",
        "Regulatory defense costs",
        "Incident response services"
      ],
      typical: "$1-5M coverage, rapidly evolving market"
    },
    {
      icon: FileCheck,
      type: "Directors & Officers",
      coverage: "Management liability, shareholder claims",
      considerations: [
        "Securities claims coverage",
        "Regulatory investigation defense",
        "Employment practices liability",
        "Fiduciary liability"
      ],
      typical: "$2-10M depending on company structure"
    },
    {
      icon: Umbrella,
      type: "General Liability",
      coverage: "Third-party bodily injury, property damage",
      considerations: [
        "Premises liability",
        "Products/completed operations",
        "Personal injury coverage",
        "Contractual liability"
      ],
      typical: "$1-5M per occurrence"
    }
  ];

  const riskTransferOptions = [
    {
      method: "Hedging",
      description: "Use derivatives to lock in future BTC prices",
      pros: ["Price certainty", "Revenue predictability", "Debt covenant compliance"],
      cons: ["Opportunity cost if BTC rises", "Counterparty risk", "Complexity"]
    },
    {
      method: "Power Purchase Agreements",
      description: "Long-term fixed-price energy contracts",
      pros: ["Cost certainty", "Bankable for financing", "Utility relationship"],
      cons: ["Inflexibility", "Above-market risk", "Contract length"]
    },
    {
      method: "Hosting Contracts",
      description: "Transfer operational risk to hosting providers",
      pros: ["Reduced capex", "Operational simplicity", "Flexibility"],
      cons: ["Lower margins", "Less control", "Provider dependency"]
    }
  ];

  const learningObjectives = [
    "Determine appropriate coverage levels based on your facility size and risk profile",
    "Evaluate insurance vs self-insurance trade-offs for different risk categories",
    "Understand risk transfer mechanisms beyond insurance (hedging, PPAs, hosting)"
  ];

  const keyTakeaways = [
    "Property insurance should cover 125% of equipment value for replacement cost coverage",
    "Cyber insurance is increasingly important as mining operations become more connected",
    "Hedging provides revenue certainty but caps upside - use strategically, not universally",
    "Hosting contracts transfer operational risk but reduce profit margins"
  ];

  return (
    <section id="insurance" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-blue/10 text-watt-blue rounded-full text-sm font-medium mb-4">
              Lesson 7
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Insurance & Risk Transfer
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Protect your operation through appropriate insurance and risk transfer mechanisms
            </p>
          </div>
        </ScrollReveal>

        <RiskLearningObjectives objectives={learningObjectives} sectionTitle="Insurance & Risk Transfer" />

        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {insuranceTypes.map((insurance) => (
              <div key={insurance.type} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-watt-blue/10 rounded-lg flex items-center justify-center">
                    <insurance.icon className="w-5 h-5 text-watt-blue" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{insurance.type}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{insurance.coverage}</p>
                
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Key Considerations:</h4>
                <ul className="space-y-1 mb-4">
                  {insurance.considerations.map(item => (
                    <li key={item} className="text-xs text-foreground flex items-start gap-2">
                      <span className="text-watt-blue">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs bg-watt-blue/10 text-watt-blue px-3 py-2 rounded">
                  Typical: {insurance.typical}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Insurance Coverage Estimator */}
        <InsuranceCoverageEstimator />

        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Risk Transfer Mechanisms</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {riskTransferOptions.map((option) => (
                <div key={option.method} className="bg-background border border-border rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-foreground mb-2">{option.method}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                  
                  <div className="mb-3">
                    <span className="text-xs font-medium text-watt-success">Pros:</span>
                    <ul className="mt-1 space-y-1">
                      {option.pros.map(pro => (
                        <li key={pro} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="text-watt-success">+</span> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-red-500">Cons:</span>
                    <ul className="mt-1 space-y-1">
                      {option.cons.map(con => (
                        <li key={con} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="text-red-500">-</span> {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <RiskSectionSummary 
          title="Insurance & Risk Transfer"
          keyTakeaways={keyTakeaways}
          nextSection={{ name: "Crisis Management", href: "#crisis" }}
        />
      </div>
    </section>
  );
};
