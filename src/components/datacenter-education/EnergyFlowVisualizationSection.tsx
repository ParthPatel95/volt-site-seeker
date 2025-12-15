import React from 'react';
import { Zap, Server, Thermometer, Wind, Bitcoin, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const EnergyFlowVisualizationSection = () => {
  const energyBreakdown = [
    { label: 'Mining Computation', percentage: 95, color: 'bg-watt-bitcoin', icon: Server },
    { label: 'Cooling Overhead', percentage: 3, color: 'bg-cyan-500', icon: Wind },
    { label: 'Infrastructure', percentage: 1.5, color: 'bg-yellow-500', icon: Zap },
    { label: 'Network & Other', percentage: 0.5, color: 'bg-purple-500', icon: Zap },
  ];

  const efficiencyMetrics = [
    { label: 'Power Input', value: 100, unit: 'MW', description: 'Total facility power consumption' },
    { label: 'Heat Output', value: 95, unit: 'MW', description: 'Thermal energy to be dissipated' },
    { label: 'Hashrate', value: 3.2, unit: 'EH/s', description: 'Network contribution' },
    { label: 'BTC/Month', value: 75, unit: 'BTC', description: 'Estimated production' },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Energy Flow Visualization
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding how electricity transforms into Bitcoin through mining operations
            </p>
          </div>
        </ScrollReveal>

        {/* Sankey-style flow diagram */}
        <ScrollReveal delay={0.1}>
          <div className="relative max-w-4xl mx-auto mb-16">
            <div className="grid grid-cols-5 gap-2 md:gap-4 items-center">
              {/* Input */}
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-yellow-500 flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <Zap className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="text-sm md:text-base font-semibold text-foreground">Power In</div>
                <div className="text-xs text-muted-foreground">100 MW</div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="w-full h-4 md:h-6 bg-gradient-to-r from-yellow-500 to-watt-bitcoin rounded relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-flow" />
                </div>
              </div>

              {/* Mining */}
              <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-watt-bitcoin flex items-center justify-center mx-auto mb-2">
                  <Server className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="text-sm md:text-base font-semibold text-foreground">Mining</div>
                <div className="text-xs text-muted-foreground">Computation</div>
              </div>

              {/* Split arrows */}
              <div className="flex flex-col items-center gap-2">
                {/* Heat arrow */}
                <div className="flex items-center w-full">
                  <div className="flex-1 h-2 md:h-3 bg-gradient-to-r from-watt-bitcoin to-red-500 rounded" />
                  <ArrowRight className="w-4 h-4 text-red-500" />
                </div>
                {/* Bitcoin arrow */}
                <div className="flex items-center w-full">
                  <div className="flex-1 h-1 md:h-1.5 bg-gradient-to-r from-watt-bitcoin to-green-500 rounded" />
                  <ArrowRight className="w-3 h-3 text-green-500" />
                </div>
              </div>

              {/* Outputs */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-1">
                    <Thermometer className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="text-xs font-semibold text-foreground">Heat</div>
                  <div className="text-xs text-muted-foreground">95 MW</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-1">
                    <Bitcoin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="text-xs font-semibold text-foreground">BTC</div>
                  <div className="text-xs text-muted-foreground">~75/mo</div>
                </div>
              </div>
            </div>

            {/* Flow animation keyframe */}
            <style>{`
              @keyframes flow {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              .animate-flow {
                animation: flow 2s linear infinite;
              }
            `}</style>
          </div>
        </ScrollReveal>

        {/* Energy Breakdown Bars */}
        <ScrollReveal delay={0.2}>
          <div className="max-w-3xl mx-auto mb-12">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              Power Distribution Breakdown
            </h3>
            <div className="space-y-4">
              {energyBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-sm font-bold text-watt-bitcoin">
                        <AnimatedCounter end={item.percentage} decimals={item.percentage < 1 ? 1 : 0} suffix="%" />
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Efficiency Metrics */}
        <ScrollReveal delay={0.3}>
          <div className="grid md:grid-cols-4 gap-4">
            {efficiencyMetrics.map((metric, index) => (
              <div key={index} className="p-6 bg-card rounded-xl border border-border text-center">
                <div className="text-3xl font-bold text-watt-bitcoin mb-1">
                  <AnimatedCounter end={metric.value} decimals={metric.value < 10 ? 1 : 0} />
                  <span className="text-lg ml-1">{metric.unit}</span>
                </div>
                <div className="font-medium text-foreground mb-1">{metric.label}</div>
                <div className="text-xs text-muted-foreground">{metric.description}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Key insight */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 p-6 bg-gradient-to-r from-watt-bitcoin/10 to-yellow-500/10 rounded-2xl border border-watt-bitcoin/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-watt-bitcoin flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Why Efficiency Matters</h4>
                <p className="text-muted-foreground text-sm">
                  In Bitcoin mining, ~95% of electrical energy converts to heat. The remaining 5% powers 
                  computational circuits that secure the network. This is why cooling systems and power 
                  efficiency (J/TH) are the two most critical factors in mining profitability. 
                  A 10% improvement in efficiency can mean the difference between profit and loss.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default EnergyFlowVisualizationSection;
