import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Grid3X3, AlertTriangle, ArrowRight } from "lucide-react";

export const RiskMatrixSection = () => {
  const risks = [
    { name: "BTC Price Crash", impact: 5, likelihood: 4, category: "Market" },
    { name: "Difficulty Spike", impact: 3, likelihood: 5, category: "Market" },
    { name: "Power Outage", impact: 4, likelihood: 3, category: "Operational" },
    { name: "Equipment Failure", impact: 2, likelihood: 4, category: "Operational" },
    { name: "Cooling Failure", impact: 4, likelihood: 2, category: "Operational" },
    { name: "Regulatory Ban", impact: 5, likelihood: 2, category: "Regulatory" },
    { name: "Rate Increase", impact: 3, likelihood: 3, category: "Regulatory" },
    { name: "Liquidity Crisis", impact: 5, likelihood: 2, category: "Financial" },
    { name: "Cyber Attack", impact: 3, likelihood: 2, category: "Security" },
    { name: "Fire Incident", impact: 5, likelihood: 1, category: "Safety" }
  ];

  const getRiskLevel = (impact: number, likelihood: number) => {
    const score = impact * likelihood;
    if (score >= 15) return { level: "Critical", color: "bg-red-500" };
    if (score >= 10) return { level: "High", color: "bg-orange-500" };
    if (score >= 5) return { level: "Medium", color: "bg-yellow-500" };
    return { level: "Low", color: "bg-green-500" };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Market": return "text-watt-bitcoin";
      case "Operational": return "text-watt-blue";
      case "Regulatory": return "text-watt-purple";
      case "Financial": return "text-watt-success";
      case "Security": return "text-cyan-500";
      case "Safety": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  return (
    <section id="risk-matrix" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-4">
              Lesson 6
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Risk Assessment Matrix
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Prioritize risks based on impact and likelihood for focused mitigation
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Grid3X3 className="w-6 h-6 text-watt-bitcoin" />
              <h3 className="text-2xl font-bold text-foreground">Risk Register</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Risk</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Impact (1-5)</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Likelihood (1-5)</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Score</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {risks.sort((a, b) => (b.impact * b.likelihood) - (a.impact * a.likelihood)).map(risk => {
                    const riskLevel = getRiskLevel(risk.impact, risk.likelihood);
                    return (
                      <tr key={risk.name} className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium text-foreground">{risk.name}</td>
                        <td className={`py-3 px-4 ${getCategoryColor(risk.category)} font-medium text-sm`}>
                          {risk.category}
                        </td>
                        <td className="py-3 px-4 text-center text-foreground">{risk.impact}</td>
                        <td className="py-3 px-4 text-center text-foreground">{risk.likelihood}</td>
                        <td className="py-3 px-4 text-center font-bold text-foreground">
                          {risk.impact * risk.likelihood}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-medium ${riskLevel.color}`}>
                            {riskLevel.level}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Impact Scale</h4>
              <div className="space-y-2">
                {[
                  { score: 5, label: "Catastrophic", desc: "Business failure, major loss" },
                  { score: 4, label: "Major", desc: "Significant financial impact" },
                  { score: 3, label: "Moderate", desc: "Notable disruption" },
                  { score: 2, label: "Minor", desc: "Limited impact" },
                  { score: 1, label: "Negligible", desc: "Minimal effect" }
                ].map(item => (
                  <div key={item.score} className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center font-bold text-foreground">
                      {item.score}
                    </span>
                    <div>
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-muted-foreground text-sm ml-2">- {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Likelihood Scale</h4>
              <div className="space-y-2">
                {[
                  { score: 5, label: "Almost Certain", desc: ">80% probability" },
                  { score: 4, label: "Likely", desc: "60-80% probability" },
                  { score: 3, label: "Possible", desc: "40-60% probability" },
                  { score: 2, label: "Unlikely", desc: "20-40% probability" },
                  { score: 1, label: "Rare", desc: "<20% probability" }
                ].map(item => (
                  <div key={item.score} className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center font-bold text-foreground">
                      {item.score}
                    </span>
                    <div>
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-muted-foreground text-sm ml-2">- {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
