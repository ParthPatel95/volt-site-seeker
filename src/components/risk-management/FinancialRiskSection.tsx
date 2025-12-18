import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { DollarSign, PiggyBank, CreditCard, TrendingUp } from "lucide-react";

export const FinancialRiskSection = () => {
  const financialRisks = [
    {
      icon: PiggyBank,
      risk: "Liquidity Risk",
      description: "Inability to meet short-term obligations during market downturns",
      indicators: ["Current ratio < 1.5", "Cash runway < 6 months", "High fixed costs"],
      strategies: [
        "Maintain 6-12 months operating reserves",
        "Establish credit facilities",
        "Structure flexible cost arrangements",
        "Monitor cash flow weekly"
      ]
    },
    {
      icon: CreditCard,
      risk: "Leverage Risk",
      description: "Excessive debt amplifies losses during downturns",
      indicators: ["Debt-to-equity > 2:1", "Interest coverage < 3x", "Covenant constraints"],
      strategies: [
        "Limit debt to 40-50% of capital",
        "Match debt maturity to asset life",
        "Negotiate flexible covenants",
        "Avoid equipment financing at peak prices"
      ]
    },
    {
      icon: TrendingUp,
      risk: "Counterparty Risk",
      description: "Exposure to failure of business partners",
      indicators: ["Single large customer", "Concentrated suppliers", "Weak counterparties"],
      strategies: [
        "Diversify power suppliers",
        "Vet hosting customers",
        "Use multiple mining pools",
        "Maintain equipment vendor relationships"
      ]
    },
    {
      icon: DollarSign,
      risk: "Currency Risk",
      description: "Mismatch between BTC revenue and fiat expenses",
      indicators: ["100% BTC revenue", "All costs in USD", "No hedging"],
      strategies: [
        "Convert BTC to fiat for near-term expenses",
        "Use futures/options for hedging",
        "Match some costs to BTC",
        "Maintain BTC reserves strategically"
      ]
    }
  ];

  const capitalStructure = [
    { component: "Equity", range: "50-70%", notes: "Primary funding, no fixed obligations" },
    { component: "Term Debt", range: "20-40%", notes: "Equipment financing, 3-5 year terms" },
    { component: "Revolving Credit", range: "10-20%", notes: "Working capital flexibility" },
    { component: "Equipment Leases", range: "0-20%", notes: "Preserve capital, higher cost" }
  ];

  return (
    <section id="financial-risk" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-watt-success/10 text-watt-success rounded-full text-sm font-medium mb-4">
              Lesson 5
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Financial Risk Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Structure your capital and manage financial exposures for long-term survival
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {financialRisks.map((item, index) => (
            <ScrollReveal key={item.risk} delay={100 + index * 50}>
              <div className="bg-card border border-border rounded-xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-watt-success/10 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-watt-success" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.risk}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Warning Indicators:</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.indicators.map(ind => (
                      <span key={ind} className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Mitigation Strategies:</h4>
                  <ul className="space-y-1">
                    {item.strategies.map(strategy => (
                      <li key={strategy} className="text-xs text-foreground flex items-start gap-2">
                        <span className="text-watt-success">✓</span>
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Recommended Capital Structure</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Component</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Target Range</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {capitalStructure.map(item => (
                    <tr key={item.component} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-foreground">{item.component}</td>
                      <td className="py-3 px-4">
                        <span className="bg-watt-success/10 text-watt-success px-3 py-1 rounded text-sm font-mono">
                          {item.range}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
