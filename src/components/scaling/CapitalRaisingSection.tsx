import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { DollarSign, Building2, Users, Landmark, TrendingUp, FileText, CheckCircle } from "lucide-react";

export const CapitalRaisingSection = () => {
  const fundingSources = [
    {
      icon: Building2,
      source: "Equipment Financing",
      description: "Lease or finance ASIC miners directly from manufacturers or equipment lenders",
      terms: "12-36 months",
      rate: "8-15% APR",
      pros: ["Preserves cash", "Quick deployment", "Equipment as collateral"],
      cons: ["Higher total cost", "Ownership restrictions", "Resale limitations"]
    },
    {
      icon: Landmark,
      source: "Project Debt",
      description: "Traditional project finance secured by infrastructure and power contracts",
      terms: "5-10 years",
      rate: "6-12% APR",
      pros: ["Lower cost", "Non-dilutive", "Longer terms"],
      cons: ["Requires track record", "Collateral requirements", "Covenants"]
    },
    {
      icon: Users,
      source: "Equity Investment",
      description: "Venture capital, private equity, or strategic investors",
      terms: "3-7 year hold",
      rate: "25-40% IRR target",
      pros: ["No repayment", "Strategic support", "Flexible terms"],
      cons: ["Dilutive", "Governance rights", "Exit pressure"]
    },
    {
      icon: TrendingUp,
      source: "Public Markets",
      description: "IPO, SPAC merger, or reverse takeover to access public capital",
      terms: "Ongoing",
      rate: "Market dependent",
      pros: ["Large capital access", "Liquidity", "Visibility"],
      cons: ["Expensive process", "Reporting requirements", "Volatility exposure"]
    }
  ];

  const capitalStack = [
    { type: "Senior Debt", percentage: 40, color: "bg-watt-blue", cost: "6-10%", priority: 1 },
    { type: "Mezzanine/Equipment", percentage: 25, color: "bg-watt-success", cost: "12-18%", priority: 2 },
    { type: "Preferred Equity", percentage: 15, color: "bg-watt-bitcoin", cost: "15-25%", priority: 3 },
    { type: "Common Equity", percentage: 20, color: "bg-watt-navy", cost: "25-40%", priority: 4 }
  ];

  const investorCriteria = [
    {
      category: "Track Record",
      items: ["Operational history", "Team experience", "Past returns", "Industry relationships"]
    },
    {
      category: "Economics",
      items: ["Power costs", "Equipment efficiency", "Operating margins", "Break-even analysis"]
    },
    {
      category: "Risk Management",
      items: ["Hedging strategy", "Geographic diversity", "Insurance coverage", "Contingency plans"]
    },
    {
      category: "Growth Plan",
      items: ["Pipeline visibility", "Expansion timeline", "Capital efficiency", "Exit opportunities"]
    }
  ];

  return (
    <section id="capital-raising" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Capital Raising Strategies
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Understanding funding options and structuring capital for mining operations.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {fundingSources.map((source, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-watt-success/10 rounded-xl flex items-center justify-center">
                    <source.icon className="w-6 h-6 text-watt-success" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{source.source}</h3>
                    <p className="text-sm text-muted-foreground">{source.terms} | {source.rate}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{source.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-green-700 mb-2">Advantages</h5>
                    <ul className="space-y-1">
                      {source.pros.map((pro, i) => (
                        <li key={i} className="text-xs text-green-600 flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <h5 className="text-xs font-semibold text-amber-700 mb-2">Considerations</h5>
                    <ul className="space-y-1">
                      {source.cons.map((con, i) => (
                        <li key={i} className="text-xs text-amber-600 flex items-center gap-1">
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
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-watt-success" />
                Typical Capital Stack
              </h3>
              <div className="space-y-4">
                {capitalStack.map((layer, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-foreground">{layer.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {layer.percentage}% | {layer.cost} cost
                      </span>
                    </div>
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${layer.color} flex items-center justify-center text-white text-sm font-medium`}
                        style={{ width: `${layer.percentage * 2.5}%` }}
                      >
                        {layer.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                * Optimal structure varies based on project stage, scale, and market conditions
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-watt-success" />
                What Investors Look For
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {investorCriteria.map((criteria, index) => (
                  <div key={index} className="bg-muted rounded-xl p-4">
                    <h4 className="font-semibold text-foreground mb-3">{criteria.category}</h4>
                    <ul className="space-y-2">
                      {criteria.items.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-watt-success" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Capital Raising Process Timeline</h3>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { phase: "Preparation", duration: "4-8 weeks", tasks: "Materials, data room, team" },
                { phase: "Marketing", duration: "4-6 weeks", tasks: "Outreach, meetings, NDAs" },
                { phase: "Due Diligence", duration: "6-10 weeks", tasks: "Q&A, site visits, analysis" },
                { phase: "Negotiation", duration: "4-6 weeks", tasks: "Terms, structure, legal" },
                { phase: "Closing", duration: "2-4 weeks", tasks: "Documentation, funding" }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 bg-watt-success rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    {index + 1}
                  </div>
                  <h4 className="font-semibold mb-1">{step.phase}</h4>
                  <p className="text-sm text-white/70 mb-1">{step.duration}</p>
                  <p className="text-xs text-white/50">{step.tasks}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-white/60 text-center">
              Total timeline: 5-8 months from preparation to closing
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
