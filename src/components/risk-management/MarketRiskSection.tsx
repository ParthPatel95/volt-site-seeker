import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { TrendingDown, Bitcoin } from "lucide-react";
import { RiskLearningObjectives } from "./RiskLearningObjectives";
import { RiskSectionSummary } from "./RiskSectionSummary";
import { BreakEvenCalculator } from "./BreakEvenCalculator";

export const MarketRiskSection = () => {
  const marketRisks = [
    {
      risk: "Bitcoin Price Volatility",
      description: "BTC can drop 50%+ in weeks, instantly cutting revenue while costs remain fixed",
      mitigation: [
        "Maintain 6-12 months operating reserves",
        "Use hedging strategies (futures, options)",
        "Diversify revenue streams (hosting, demand response)",
        "Target low break-even prices (<$20k)"
      ],
      severity: "Critical"
    },
    {
      risk: "Network Difficulty",
      description: "Global hashrate growth reduces individual mining rewards over time",
      mitigation: [
        "Model aggressive difficulty assumptions",
        "Focus on efficiency (J/TH) over raw hashrate",
        "Plan for fleet refreshes every 3-4 years",
        "Secure long-term low-cost power"
      ],
      severity: "High"
    },
    {
      risk: "Halving Events",
      description: "Block rewards cut 50% every ~4 years, requiring efficiency improvements",
      mitigation: [
        "Build halving events into financial models",
        "Upgrade to efficient hardware before halvings",
        "Reduce operating costs pre-halving",
        "Build cash reserves during bull markets"
      ],
      severity: "High"
    },
    {
      risk: "Competition",
      description: "New entrants with better capital access can drive down margins",
      mitigation: [
        "Secure unique power advantages",
        "Build operational excellence moat",
        "Lock in long-term power contracts",
        "Achieve scale economies"
      ],
      severity: "Medium"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-500";
      case "High": return "bg-orange-500";
      case "Medium": return "bg-yellow-500";
      default: return "bg-blue-500";
    }
  };

  const learningObjectives = [
    "Quantify BTC price volatility impact on your specific operation",
    "Apply break-even analysis framework to assess profitability thresholds",
    "Develop hedging strategies for revenue stability across market cycles"
  ];

  const keyTakeaways = [
    "Market risk is the #1 threat to mining operations - price drops and difficulty increases are inevitable",
    "Know your break-even BTC price and ensure it's competitive (<$35k for average operators)",
    "Build 6-12 months operating reserves to survive extended bear markets",
    "Halving events require proactive efficiency upgrades - plan ahead, not after"
  ];

  return (
    <section id="market-risk" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Lesson 2
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Market Risk Analysis
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Understand and mitigate the market forces that impact mining profitability
            </p>
          </div>
        </ScrollReveal>

        <RiskLearningObjectives objectives={learningObjectives} sectionTitle="Market Risk" />

        <div className="space-y-6 mb-12">
          {marketRisks.map((item, index) => (
            <ScrollReveal key={item.risk} delay={100 + index * 50}>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="bg-watt-bitcoin/5 border-b border-border px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-5 h-5 text-watt-bitcoin" />
                    <h3 className="text-lg font-semibold text-foreground">{item.risk}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getSeverityColor(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Mitigation Strategies:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {item.mitigation.map(strategy => (
                        <div key={strategy} className="flex items-start gap-2 text-sm text-muted-foreground bg-background rounded-lg p-3">
                          <span className="text-watt-success">✓</span>
                          {strategy}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Break-Even Calculator */}
        <BreakEvenCalculator />

        <ScrollReveal delay={300}>
          <div className="bg-gradient-to-r from-watt-bitcoin/10 to-orange-500/10 border border-watt-bitcoin/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Bitcoin className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-xl font-bold text-foreground">Break-Even Benchmarks</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-watt-success mb-2">$15-20k</div>
                <div className="text-sm text-muted-foreground">Efficient Operator</div>
                <div className="text-xs text-muted-foreground mt-1">20 J/TH, $0.03/kWh</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-watt-bitcoin mb-2">$25-35k</div>
                <div className="text-sm text-muted-foreground">Average Operator</div>
                <div className="text-xs text-muted-foreground mt-1">25 J/TH, $0.05/kWh</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">$45k+</div>
                <div className="text-sm text-muted-foreground">High-Cost Operator</div>
                <div className="text-xs text-muted-foreground mt-1">30 J/TH, $0.08/kWh</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <RiskSectionSummary 
          title="Market Risk"
          keyTakeaways={keyTakeaways}
          nextSection={{ name: "Operational Risk", href: "#operational-risk" }}
        />
      </div>
    </section>
  );
};
