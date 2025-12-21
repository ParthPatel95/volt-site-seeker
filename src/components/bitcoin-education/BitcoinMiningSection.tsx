import React from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Pickaxe, Cpu, Zap, Thermometer, DollarSign, Clock, TrendingUp, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';

const BitcoinMiningSection: React.FC = () => {
  const hardwareEvolution = [
    { era: '2009-2010', type: 'CPU', hashrate: '~10 MH/s', efficiency: '~10,000 J/TH', icon: '💻' },
    { era: '2010-2013', type: 'GPU', hashrate: '~1 GH/s', efficiency: '~500 J/TH', icon: '🎮' },
    { era: '2013-2016', type: 'Early ASIC', hashrate: '~10 TH/s', efficiency: '~100 J/TH', icon: '🔧' },
    { era: '2016-2020', type: 'Modern ASIC', hashrate: '~100 TH/s', efficiency: '~30 J/TH', icon: '⚡' },
    { era: '2020-Now', type: 'Latest ASIC', hashrate: '~400+ TH/s', efficiency: '~15 J/TH', icon: '🚀' }
  ];

  const costFactors = [
    { factor: 'Electricity', percentage: 60, description: 'The largest ongoing cost, varying by location', icon: Zap },
    { factor: 'Hardware', percentage: 25, description: 'ASIC miners depreciate over time as newer models release', icon: Cpu },
    { factor: 'Cooling', percentage: 10, description: 'Managing heat from 24/7 operations', icon: Thermometer },
    { factor: 'Other', percentage: 5, description: 'Facilities, maintenance, internet, staff', icon: DollarSign }
  ];

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-bitcoin/20">
      <div className="max-w-6xl mx-auto">
        <LearningObjectives
          title="In this section, you'll learn:"
          objectives={[
            "How proof-of-work mining secures the Bitcoin network",
            "The evolution of mining hardware from CPUs to modern ASICs",
            "Mining cost breakdown — why electricity is 60% of operating costs",
            "Why location (electricity rates, climate) is critical for profitability"
          ]}
          estimatedTime="8 min"
          prerequisites={[
            { title: "What is Bitcoin", href: "/bitcoin#what-is-bitcoin" }
          ]}
          variant="dark"
        />
        
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/20 border border-watt-bitcoin/40 mb-4">
              <Pickaxe className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Mining Deep Dive</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Bitcoin Mining
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Mining secures the Bitcoin network and creates new coins. It's a competitive industry 
              where efficiency and energy costs determine profitability.
            </p>
          </div>
        </ScrollReveal>

        {/* What is Mining */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">What is Bitcoin Mining?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-watt-bitcoin/20 flex items-center justify-center mx-auto mb-3">
                  <Pickaxe className="w-8 h-8 text-watt-bitcoin" />
                </div>
                <h4 className="font-bold text-white mb-2">Proof of Work</h4>
                <p className="text-white/70 text-sm">
                  Miners compete to solve complex mathematical puzzles using computational power
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-watt-trust/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-watt-trust" />
                </div>
                <h4 className="font-bold text-white mb-2">Block Validation</h4>
                <p className="text-white/70 text-sm">
                  The winner validates transactions and adds a new block to the blockchain
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-watt-success/20 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-watt-success" />
                </div>
                <h4 className="font-bold text-white mb-2">Block Reward</h4>
                <p className="text-white/70 text-sm">
                  Winners receive newly minted Bitcoin plus transaction fees as reward
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Hardware Evolution */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-8">
            <h3 className="text-2xl font-bold text-watt-navy mb-6">Hardware Evolution</h3>
            <div className="space-y-4">
              {hardwareEvolution.map((era, index) => (
                <div key={era.era} className="flex items-center gap-4 p-4 bg-watt-light rounded-xl">
                  <div className="text-3xl">{era.icon}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-watt-navy">{era.type}</span>
                      <span className="text-xs text-watt-navy/60 bg-watt-navy/10 px-2 py-0.5 rounded">{era.era}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-watt-navy/70">
                      <span>Hashrate: {era.hashrate}</span>
                      <span>Efficiency: {era.efficiency}</span>
                    </div>
                  </div>
                  {index < hardwareEvolution.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-watt-navy/30 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Mining Economics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ScrollReveal direction="left" delay={0.3}>
            <div className="bg-white rounded-2xl p-6 h-full">
              <h3 className="text-xl font-bold text-watt-navy mb-4">Mining Cost Breakdown</h3>
              <div className="space-y-4">
                {costFactors.map((item) => (
                  <div key={item.factor} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-watt-bitcoin" />
                        <span className="font-medium text-watt-navy">{item.factor}</span>
                      </div>
                      <span className="font-bold text-watt-bitcoin">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-watt-navy/10 rounded-full h-2">
                      <div 
                        className="bg-watt-bitcoin rounded-full h-2 transition-all duration-1000"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-watt-navy/60">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.3}>
            <div className="bg-white rounded-2xl p-6 h-full">
              <h3 className="text-xl font-bold text-watt-navy mb-4">Key Mining Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-watt-light rounded-xl p-4">
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    <AnimatedCounter end={3.125} decimals={3} suffix=" BTC" />
                  </div>
                  <div className="text-sm text-watt-navy/70">Current Block Reward</div>
                </div>
                <div className="bg-watt-light rounded-xl p-4">
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    ~<AnimatedCounter end={10} suffix=" min" />
                  </div>
                  <div className="text-sm text-watt-navy/70">Avg Block Time</div>
                </div>
                <div className="bg-watt-light rounded-xl p-4">
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    <AnimatedCounter end={700} suffix=" EH/s" />
                  </div>
                  <div className="text-sm text-watt-navy/70">Network Hashrate</div>
                </div>
                <div className="bg-watt-light rounded-xl p-4">
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    <AnimatedCounter end={2016} suffix=" blocks" />
                  </div>
                  <div className="text-sm text-watt-navy/70">Difficulty Adjustment</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-watt-bitcoin/10 rounded-xl border border-watt-bitcoin/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-watt-bitcoin" />
                  <span className="font-bold text-watt-navy">Next Halving</span>
                </div>
                <p className="text-sm text-watt-navy/70">
                  Block reward will drop to 1.5625 BTC around April 2028
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Why Location Matters - WattByte Value Prop */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="bg-gradient-to-r from-watt-bitcoin to-watt-bitcoin/80 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-white" />
              <h3 className="text-2xl font-bold text-white">Why Location Matters</h3>
            </div>
            <p className="text-white/90 mb-6">
              Mining profitability is heavily dependent on electricity costs. Strategic location selection 
              can mean the difference between profit and loss.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">5-8¢</div>
                <div className="text-white/70 text-sm">Optimal electricity rate per kWh</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">Cold</div>
                <div className="text-white/70 text-sm">Climate reduces cooling costs</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">Stable</div>
                <div className="text-white/70 text-sm">Grid reliability is critical</div>
              </div>
            </div>
            <p className="text-white/80 text-sm mt-4">
              This is exactly why WattByte focuses on Alberta, Canada — competitive rates, cold climate, 
              and reliable AESO grid access.
            </p>
          </div>
        </ScrollReveal>
        
        <SectionSummary
          variant="dark"
          takeaways={[
            "Bitcoin mining uses proof-of-work to secure transactions and mint new coins",
            "Hardware has evolved from CPUs (10 MH/s) to ASICs (400+ TH/s) — a 40 million X improvement",
            "Electricity costs are ~60% of operating expenses, making location crucial",
            "Optimal mining requires 5-8¢/kWh electricity, cold climate, and stable grid"
          ]}
          proTip="The most successful mining operations focus on three things: cheap power, efficient cooling, and grid reliability. WattByte's Alberta location delivers all three."
          nextSteps={[
            { title: "Datacenter Infrastructure", href: "/datacenter-education" },
            { title: "AESO Energy Market", href: "/aeso-101" }
          ]}
        />
      </div>
    </section>
  );
};

export default BitcoinMiningSection;
