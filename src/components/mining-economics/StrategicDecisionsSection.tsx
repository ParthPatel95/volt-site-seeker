import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Bitcoin, 
  Zap, 
  Clock, 
  Shield, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Scale,
  Wallet,
  BarChart3
} from 'lucide-react';
import {
  MECSectionWrapper,
  MECSectionHeader,
  MECContentCard,
  MECKeyInsight,
  MECDeepDive,
  MECCallout,
} from './shared';

const StrategicDecisionsSection = () => {
  const strategies = [
    {
      title: "HODL vs. Sell Strategy",
      icon: Bitcoin,
      iconColor: 'bitcoin' as const,
      description: "The perpetual mining question: should you sell mined BTC immediately to cover costs, or hold for potential price appreciation?",
      considerations: [
        {
          point: "Operational costs require fiat currency",
          detail: "Electricity, rent, salaries, and maintenance must be paid in local currency, creating natural sell pressure on mined coins."
        },
        {
          point: "Holding adds BTC price exposure",
          detail: "You already have mining exposure to BTC price. HODLing adds a second layer of price risk on top."
        },
        {
          point: "Tax implications vary significantly",
          detail: "In some jurisdictions, mining creates immediate taxable income regardless of whether you sell."
        },
        {
          point: "Treasury management requires discipline",
          detail: "Successful miners separate operating capital from investment holdings with clear policies."
        }
      ],
      recommendation: "Sell enough to cover operating costs plus a safety margin (typically 110-120%), HODL the remainder as a strategic reserve.",
      advancedTip: "Consider dollar-cost averaging out rather than large lump-sum sales. This smooths revenue and reduces timing risk."
    },
    {
      title: "Hosting vs. Self-Mining",
      icon: Zap,
      iconColor: 'success' as const,
      description: "Should you colocate machines at a hosting facility, or invest in building and operating your own infrastructure?",
      considerations: [
        {
          point: "Hosting: Lower barrier to entry",
          detail: "Minimal CAPEX, faster deployment (weeks vs. months), operational expertise included, lower risk."
        },
        {
          point: "Self-mining: Superior long-term margins",
          detail: "Eliminate hosting fees (typically $0.01-0.03/kWh markup), full operational control, asset appreciation."
        },
        {
          point: "Scale is the deciding factor",
          detail: "Below 5MW, hosting usually wins. Above 25MW, self-mining economics become compelling. 5-25MW is the 'gray zone.'"
        },
        {
          point: "Energy contracts may dictate choice",
          detail: "Some attractive PPAs require facility ownership or long-term site commitment."
        }
      ],
      recommendation: "Start with hosting to learn operations and validate economics. Transition to self-mining as you exceed 10MW and develop operational expertise.",
      advancedTip: "Hybrid approach: Host machines while building your own facility. Migrate once operational."
    },
    {
      title: "Hardware Timing Strategy",
      icon: Clock,
      iconColor: 'purple' as const,
      description: "When should you purchase new-generation hardware versus running existing equipment until failure?",
      considerations: [
        {
          point: "New-gen efficiency gains: 20-30%",
          detail: "Each hardware generation typically offers 20-30% better J/TH efficiency, but at premium prices."
        },
        {
          point: "Hardware prices are extremely volatile",
          detail: "Miner prices can swing 50-70% within months, driven by BTC price and manufacturer production cycles."
        },
        {
          point: "Payback period > efficiency rating",
          detail: "A cheaper, less efficient miner with 12-month payback often beats an expensive efficient miner with 24-month payback."
        },
        {
          point: "End-of-life equipment has residual value",
          detail: "Older machines may still profit at sub-$0.03/kWh rates, or sell for secondary market/scrap value."
        }
      ],
      recommendation: "Buy hardware during bear markets when prices are 40-60% off peaks. At energy costs above $0.05/kWh, prioritize latest-gen efficiency.",
      advancedTip: "Track the $/TH market price. Historical bottom is ~$15-20/TH; peaks can exceed $80/TH."
    },
    {
      title: "Risk Management Framework",
      icon: Shield,
      iconColor: 'blue' as const,
      description: "How do you protect your mining operation against the many risks inherent in this volatile industry?",
      considerations: [
        {
          point: "Financial hedging instruments",
          detail: "Futures, options, and hashrate derivatives can lock in revenue or protect against downside."
        },
        {
          point: "Operational diversification",
          detail: "Multiple sites, hardware types, and energy sources reduce single points of failure."
        },
        {
          point: "Fixed-rate power agreements",
          detail: "Long-term PPAs provide cost certainty but may limit upside if spot prices fall."
        },
        {
          point: "Insurance and reserves",
          detail: "Equipment insurance, business interruption coverage, and 3-6 month cash reserves provide stability."
        }
      ],
      recommendation: "Lock in energy costs for 60-80% of capacity, maintain 3-6 months operating reserves, consider hedging at scale (>50MW).",
      advancedTip: "Hashrate forwards are emerging as a key hedging tool. They let you sell future production at fixed $/PH/day rates."
    },
  ];

  const marketCycles = [
    { 
      phase: "Bear Market", 
      icon: TrendingDown,
      color: 'hsl(var(--watt-purple))',
      btcAction: "Accumulate machines at distressed prices (40-60% discount)", 
      energyAction: "Lock in long-term PPAs while competition is low", 
      strategyNote: "Build capacity while overleveraged operators exit",
      keyMetric: "Focus on $/TH below $25"
    },
    { 
      phase: "Early Bull", 
      icon: TrendingUp,
      color: 'hsl(var(--watt-success))',
      btcAction: "Deploy maximum hashrate, all machines profitable", 
      energyAction: "Secure additional capacity before rates rise", 
      strategyNote: "Maximize revenue capture window",
      keyMetric: "Revenue per TH peaks"
    },
    { 
      phase: "Peak Bull", 
      icon: Target,
      color: 'hsl(var(--watt-bitcoin))',
      btcAction: "Consider selling excess/older machines at premium", 
      energyAction: "Avoid long commitments at peak rates", 
      strategyNote: "Lock in profits, reduce leverage, prepare for cycle",
      keyMetric: "Hardware prices at $/TH > $60"
    },
    { 
      phase: "Correction", 
      icon: AlertTriangle,
      color: '#ef4444',
      btcAction: "Hold strong positions, cut unprofitable machines", 
      energyAction: "Renegotiate or exit unfavorable contracts", 
      strategyNote: "Efficiency determines survival — weak hands exit",
      keyMetric: "Break-even becomes critical"
    },
  ];

  const iconColorMap = {
    success: 'hsl(var(--watt-success))',
    bitcoin: 'hsl(var(--watt-bitcoin))',
    purple: 'hsl(var(--watt-purple))',
    blue: '#3b82f6',
  };

  const iconBgMap = {
    success: 'hsl(var(--watt-success) / 0.1)',
    bitcoin: 'hsl(var(--watt-bitcoin) / 0.1)',
    purple: 'hsl(var(--watt-purple) / 0.1)',
    blue: 'rgba(59, 130, 246, 0.1)',
  };

  return (
    <MECSectionWrapper id="strategy" theme="gradient">
      <MECSectionHeader
        badge="Strategic Decisions"
        badgeIcon={Scale}
        title="Strategic Mining Decisions"
        description="Beyond the numbers, successful mining requires strategic thinking about treasury management, timing, risk, and market cycles. These frameworks separate professional operators from hobbyists."
        accentColor="purple"
      />

      {/* Learning Objective */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <MECCallout variant="definition" title="Learning Objective">
          Develop strategic frameworks for the key decisions every mining operator faces: treasury management, 
          infrastructure choices, hardware timing, and risk mitigation. Understand how to adapt strategy 
          across different market cycle phases.
        </MECCallout>
      </motion.div>

      {/* Strategy Cards */}
      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        {strategies.map((strategy, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <MECContentCard variant="elevated" className="h-full">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: iconBgMap[strategy.iconColor] }}
                >
                  <strategy.icon 
                    className="w-6 h-6"
                    style={{ color: iconColorMap[strategy.iconColor] }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{strategy.title}</h3>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {strategy.description}
              </p>
              
              <div className="space-y-4 mb-6">
                {strategy.considerations.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: iconColorMap[strategy.iconColor] }}
                    />
                    <div>
                      <span className="font-medium text-foreground">{item.point}</span>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Recommendation Box */}
              <div 
                className="p-4 rounded-xl mb-4"
                style={{ backgroundColor: 'hsl(var(--watt-success) / 0.1)' }}
              >
                <div className="flex items-start gap-2">
                  <Lightbulb 
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: 'hsl(var(--watt-success))' }}
                  />
                  <div>
                    <span 
                      className="font-semibold text-sm"
                      style={{ color: 'hsl(var(--watt-success))' }}
                    >
                      Recommendation
                    </span>
                    <p className="text-sm text-foreground mt-1">{strategy.recommendation}</p>
                  </div>
                </div>
              </div>

              {/* Advanced Tip */}
              <MECDeepDive title="Pro Tip" icon={Zap} defaultOpen={false}>
                <p className="text-sm text-muted-foreground">{strategy.advancedTip}</p>
              </MECDeepDive>
            </MECContentCard>
          </motion.div>
        ))}
      </div>

      {/* Key Insight */}
      <MECKeyInsight variant="insight" title="The Meta-Strategy">
        The best mining operators treat their operation as a <strong>business portfolio</strong>, not just 
        a collection of machines. They manage treasury like a CFO, time hardware purchases like a trader, 
        negotiate energy like a procurement specialist, and hedge risk like a fund manager. Specializing 
        in one area while outsourcing others (e.g., hosting) can be equally valid.
      </MECKeyInsight>

      {/* Market Cycle Strategy Framework */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-16"
      >
        <MECContentCard variant="dark">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-3 text-white">
            <BarChart3 
              className="w-6 h-6"
              style={{ color: 'hsl(var(--watt-bitcoin))' }}
            />
            Market Cycle Strategy Framework
          </h3>
          <p className="text-white/60 mb-8">
            Bitcoin markets are cyclical. Adapt your strategy to each phase for optimal long-term results.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {marketCycles.map((cycle, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 rounded-xl p-5 border border-white/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <cycle.icon 
                    className="w-5 h-5"
                    style={{ color: cycle.color }}
                  />
                  <span 
                    className="font-bold"
                    style={{ color: cycle.color }}
                  >
                    {cycle.phase}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Hardware</div>
                    <p className="text-sm text-white/80">{cycle.btcAction}</p>
                  </div>
                  <div>
                    <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Energy</div>
                    <p className="text-sm text-white/80">{cycle.energyAction}</p>
                  </div>
                  <div 
                    className="pt-3 border-t border-white/10"
                    style={{ borderColor: `${cycle.color}30` }}
                  >
                    <div className="text-xs text-white/40 uppercase tracking-wide mb-1">Key Focus</div>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: cycle.color }}
                    >
                      {cycle.strategyNote}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cycle Navigation Insight */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <Wallet className="w-5 h-5" style={{ color: 'hsl(var(--watt-success))' }} />
              Surviving the Full Cycle
            </h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Most mining operations fail not because of poor decisions in one phase, but because they're 
              optimized for only one market condition. <strong className="text-white">The operators who thrive 
              long-term are those who maintain flexibility:</strong> avoiding over-leverage in bull markets, 
              keeping cash reserves for bear market opportunities, and always having an exit strategy for 
              their least efficient positions. Remember: the goal isn't to maximize returns in any single 
              phase—it's to still be operating in the next cycle.
            </p>
          </div>
        </MECContentCard>
      </motion.div>

      {/* Key Takeaways */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-12"
      >
        <h3 className="text-xl font-bold text-foreground mb-6 text-center">Key Strategic Takeaways</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { 
              icon: Zap,
              title: "Efficiency is Survival", 
              desc: "In downturns, only efficient operators remain profitable. Your J/TH efficiency and energy cost determine whether you're accumulating or liquidating.",
              color: 'success' as const
            },
            { 
              icon: Bitcoin,
              title: "Energy is Everything", 
              desc: "60-80% of costs are energy. A $0.01/kWh advantage compounds to millions over a facility's lifetime. Never stop optimizing energy.",
              color: 'bitcoin' as const
            },
            { 
              icon: TrendingUp,
              title: "Cycles are Certain", 
              desc: "Bitcoin markets are cyclical with ~4-year patterns around halvings. Plan for all phases. The best bear market positions are built in bull markets.",
              color: 'purple' as const
            },
          ].map((takeaway, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <MECContentCard variant="bordered" className="h-full text-center">
                <div 
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: iconBgMap[takeaway.color] }}
                >
                  <takeaway.icon 
                    className="w-6 h-6"
                    style={{ color: iconColorMap[takeaway.color] }}
                  />
                </div>
                <h4 className="font-bold text-foreground mb-2">{takeaway.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{takeaway.desc}</p>
              </MECContentCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </MECSectionWrapper>
  );
};

export default StrategicDecisionsSection;
