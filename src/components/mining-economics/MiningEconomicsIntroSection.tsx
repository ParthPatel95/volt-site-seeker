import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { TrendingUp, Bitcoin, Zap, Calculator, DollarSign, BarChart3 } from 'lucide-react';

const MiningEconomicsIntroSection = () => {
  const keyMetrics = [
    { icon: Bitcoin, title: "Hash Price", description: "Revenue per TH/s per day", value: "~$0.045" },
    { icon: Zap, title: "Energy Cost", description: "Primary operating expense", value: "60-80%" },
    { icon: Calculator, title: "Break-even", description: "$/kWh threshold", value: "$0.05-0.08" },
    { icon: TrendingUp, title: "Difficulty", description: "Network competition factor", value: "+3-5%/mo" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-watt-navy via-watt-navy/95 to-watt-navy">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-watt-success/20 text-watt-success rounded-full text-sm font-medium mb-4">
              Module 9 • Mining Economics
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Bitcoin Mining Economics
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Master the financial fundamentals of Bitcoin mining. Understand revenue drivers, 
              cost structures, profitability analysis, and strategic decision-making for 
              sustainable mining operations.
            </p>
          </div>
        </ScrollReveal>

        {/* Key Metrics */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {keyMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
                <metric.icon className="w-8 h-8 text-watt-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-watt-bitcoin mb-1">{metric.value}</div>
                <div className="text-white font-medium text-sm">{metric.title}</div>
                <div className="text-white/50 text-xs">{metric.description}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Profitability Equation */}
        <ScrollReveal delay={200}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              The Mining Profitability Equation
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
              <div className="bg-watt-success/20 rounded-xl p-4 min-w-[140px]">
                <DollarSign className="w-6 h-6 text-watt-success mx-auto mb-1" />
                <div className="text-lg font-bold text-white">Revenue</div>
                <div className="text-xs text-white/60">BTC Mined × Price</div>
              </div>
              <div className="text-3xl font-bold text-white">−</div>
              <div className="bg-red-500/20 rounded-xl p-4 min-w-[140px]">
                <Zap className="w-6 h-6 text-red-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">Energy</div>
                <div className="text-xs text-white/60">kWh × Rate</div>
              </div>
              <div className="text-3xl font-bold text-white">−</div>
              <div className="bg-watt-bitcoin/20 rounded-xl p-4 min-w-[140px]">
                <BarChart3 className="w-6 h-6 text-watt-bitcoin mx-auto mb-1" />
                <div className="text-lg font-bold text-white">OpEx</div>
                <div className="text-xs text-white/60">Staff, Maint, Other</div>
              </div>
              <div className="text-3xl font-bold text-white">=</div>
              <div className="bg-watt-purple/20 rounded-xl p-4 min-w-[140px]">
                <TrendingUp className="w-6 h-6 text-watt-purple mx-auto mb-1" />
                <div className="text-lg font-bold text-white">Profit</div>
                <div className="text-xs text-white/60">Margin %</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Key Concepts Overview */}
        <ScrollReveal delay={300}>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Revenue Drivers",
                items: ["Bitcoin price", "Network hashrate", "Block rewards", "Transaction fees", "Mining efficiency"],
                color: "border-watt-success"
              },
              {
                title: "Cost Structure",
                items: ["Electricity (60-80%)", "Hardware depreciation", "Hosting/rent", "Labor & maintenance", "Cooling overhead"],
                color: "border-watt-bitcoin"
              },
              {
                title: "Strategic Factors",
                items: ["Halving cycles", "Difficulty adjustments", "Hardware generations", "Energy contracts", "Market timing"],
                color: "border-watt-purple"
              }
            ].map((category, idx) => (
              <div key={idx} className={`bg-white/5 border-l-4 ${category.color} rounded-r-xl p-6`}>
                <h3 className="text-lg font-bold text-white mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, i) => (
                    <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default MiningEconomicsIntroSection;
