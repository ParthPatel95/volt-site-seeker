import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { ShieldAlert, TrendingDown, Zap, Scale } from "lucide-react";

export const RiskIntroSection = () => {
  const riskCategories = [
    {
      icon: TrendingDown,
      title: "Market Risk",
      description: "Bitcoin price volatility, hashrate competition, and difficulty adjustments"
    },
    {
      icon: Zap,
      title: "Operational Risk",
      description: "Equipment failures, power outages, and facility incidents"
    },
    {
      icon: Scale,
      title: "Regulatory Risk",
      description: "Policy changes, permitting issues, and compliance requirements"
    },
    {
      icon: ShieldAlert,
      title: "Financial Risk",
      description: "Capital allocation, liquidity management, and counterparty exposure"
    }
  ];

  return (
    <section id="intro" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-red-500/10 text-red-500 rounded-full text-sm font-medium mb-4">
              Module 11: Risk Management
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Risk Management 101
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Identify, assess, and mitigate the key risks that threaten mining profitability. 
              Learn frameworks for building resilient operations.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Risk Management Matters</h2>
            <p className="text-muted-foreground mb-6">
              Bitcoin mining is inherently high-risk due to volatile revenues, significant capital requirements, 
              and operational complexity. Operators who fail to manage risk often experience catastrophic losses 
              during market downturns. A robust risk framework can mean the difference between 
              <span className="text-watt-success font-semibold"> surviving bear markets</span> and 
              <span className="text-red-500 font-semibold"> bankruptcy</span>.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-background rounded-xl p-4">
                <div className="text-3xl font-bold text-red-500">70%+</div>
                <div className="text-sm text-muted-foreground">Miners Failed 2022</div>
              </div>
              <div className="bg-background rounded-xl p-4">
                <div className="text-3xl font-bold text-watt-bitcoin">-77%</div>
                <div className="text-sm text-muted-foreground">BTC Price Drop</div>
              </div>
              <div className="bg-background rounded-xl p-4">
                <div className="text-3xl font-bold text-watt-blue">4x</div>
                <div className="text-sm text-muted-foreground">Hashrate Growth</div>
              </div>
              <div className="bg-background rounded-xl p-4">
                <div className="text-3xl font-bold text-watt-success">Top 10%</div>
                <div className="text-sm text-muted-foreground">Survived & Thrived</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {riskCategories.map((category, index) => (
            <ScrollReveal key={category.title} delay={150 + index * 50}>
              <div className="bg-card border border-border rounded-xl p-6 h-full hover:border-red-500/50 transition-colors">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                  <category.icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{category.title}</h3>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
