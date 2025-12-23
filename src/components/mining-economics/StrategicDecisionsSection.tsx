import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Lightbulb, Bitcoin, Zap, Clock, Shield } from 'lucide-react';

const StrategicDecisionsSection = () => {
  const strategies = [
    {
      title: "HODL vs. Sell",
      icon: Bitcoin,
      description: "Should you sell BTC immediately or hold for potential appreciation?",
      considerations: [
        "Operational costs require fiat, creating sell pressure",
        "Holding adds BTC price exposure on top of mining exposure",
        "Tax implications vary by jurisdiction",
        "Treasury management strategy depends on market outlook"
      ],
      recommendation: "Most operators sell enough to cover costs + margin, HODL remainder"
    },
    {
      title: "Hosting vs. Self-Mining",
      icon: Zap,
      description: "Should you host your machines or build/operate your own facility?",
      considerations: [
        "Hosting: Lower CAPEX, faster deployment, less operational risk",
        "Self-mining: Better margins, more control, higher CAPEX",
        "Scale matters: <5MW often better hosted, >25MW consider self-mining",
        "Energy contracts may require facility commitment"
      ],
      recommendation: "Start hosted, transition to self-mining as scale and expertise grow"
    },
    {
      title: "Hardware Timing",
      icon: Clock,
      description: "When should you buy new hardware vs. run existing equipment?",
      considerations: [
        "New gen hardware typically 20-30% more efficient",
        "Hardware prices volatile - can swing 50% in months",
        "Consider payback period not just efficiency",
        "End-of-life equipment may still profit at low energy rates"
      ],
      recommendation: "Buy during bear markets, prioritize efficiency at >$0.05/kWh"
    },
    {
      title: "Risk Management",
      icon: Shield,
      description: "How do you protect against price and operational risks?",
      considerations: [
        "Hedging: Futures, options, or hashrate derivatives",
        "Diversification: Multiple sites, hardware types",
        "Fixed-rate PPAs provide cost certainty",
        "Insurance for equipment and business interruption"
      ],
      recommendation: "Lock in energy costs, maintain cash reserves, consider hedging at scale"
    },
  ];

  const marketCycles = [
    { phase: "Bear Market", btcAction: "Accumulate machines at low prices", energyAction: "Lock in long-term PPAs", strategyNote: "Build capacity while others exit" },
    { phase: "Early Bull", btcAction: "Deploy maximum hashrate", energyAction: "Secure additional capacity", strategyNote: "Maximize revenue capture" },
    { phase: "Peak Bull", btcAction: "Consider selling excess machines", energyAction: "Avoid long commitments at high rates", strategyNote: "Lock in profits, prepare for cycle" },
    { phase: "Correction", btcAction: "Hold strong, cut weak positions", energyAction: "Renegotiate if possible", strategyNote: "Efficiency determines survival" },
  ];

  return (
    <section id="strategy" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Strategic Decisions
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Strategic Mining Decisions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Beyond the numbers, successful mining requires strategic thinking about 
              treasury management, timing, risk, and market cycles.
            </p>
          </div>
        </ScrollReveal>

        {/* Strategy Cards */}
        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {strategies.map((strategy, idx) => (
              <div key={idx} className="bg-background rounded-2xl shadow-lg border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-watt-purple/10 rounded-lg flex items-center justify-center">
                    <strategy.icon className="w-5 h-5 text-watt-purple" />
                  </div>
                  <h3 className="font-bold text-foreground">{strategy.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                
                <div className="space-y-2 mb-4">
                  {strategy.considerations.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-watt-purple rounded-full mt-2 flex-shrink-0" />
                      {point}
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-watt-success/10 rounded-lg">
                  <p className="text-sm text-watt-success">
                    <strong>💡 Recommendation:</strong> {strategy.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Market Cycle Strategy */}
        <ScrollReveal delay={200}>
          <div className="bg-watt-navy rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-watt-bitcoin" />
              Market Cycle Strategy Framework
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4">Phase</th>
                    <th className="text-left py-3 px-4">Hardware Strategy</th>
                    <th className="text-left py-3 px-4">Energy Strategy</th>
                    <th className="text-left py-3 px-4 hidden md:table-cell">Key Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {marketCycles.map((cycle, idx) => (
                    <tr key={idx} className="border-b border-white/10">
                      <td className="py-3 px-4 font-medium">{cycle.phase}</td>
                      <td className="py-3 px-4 text-white/70">{cycle.btcAction}</td>
                      <td className="py-3 px-4 text-white/70">{cycle.energyAction}</td>
                      <td className="py-3 px-4 text-watt-bitcoin hidden md:table-cell">{cycle.strategyNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Key Takeaways */}
        <ScrollReveal delay={300}>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              { title: "Efficiency is Survival", desc: "In downturns, only efficient operators remain profitable. Hardware efficiency determines longevity." },
              { title: "Energy is Everything", desc: "60-80% of costs are energy. A $0.01/kWh advantage compounds to millions over time." },
              { title: "Cycles are Certain", desc: "Bitcoin markets are cyclical. Plan for all phases, not just current conditions." },
            ].map((takeaway, idx) => (
              <div key={idx} className="bg-background rounded-xl p-6 border border-border">
                <h4 className="font-bold text-foreground mb-2">{takeaway.title}</h4>
                <p className="text-sm text-muted-foreground">{takeaway.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default StrategicDecisionsSection;
