import { motion } from 'framer-motion';
import { TrendingDown, Zap, Clock, DollarSign, Wind, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { 
  AESOSectionWrapper, 
  AESOSectionHeader, 
  AESOContentCard, 
  AESOKeyInsight 
} from './shared';

const negativeHoursData = [
  { year: '2020', hours: 89, avgPrice: -12 },
  { year: '2021', hours: 156, avgPrice: -18 },
  { year: '2022', hours: 203, avgPrice: -22 },
  { year: '2023', hours: 312, avgPrice: -25 },
  { year: '2024', hours: 387, avgPrice: -28 },
];

const typicalConditions = [
  { condition: 'High Wind Generation', icon: Wind, description: 'Wind output > 3,500 MW combined with low demand' },
  { condition: 'Overnight Hours (1-5 AM)', icon: Clock, description: 'Lowest demand period when base load exceeds needs' },
  { condition: 'Spring/Fall Mild Weather', icon: Zap, description: 'No heating or cooling load, minimal demand' },
  { condition: 'Weekend/Holiday', icon: BarChart3, description: 'Industrial load reduction amplifies oversupply' },
];

const strategies = [
  {
    title: 'Maximize Consumption',
    description: 'Run all available hashrate during negative price periods - you get paid to consume',
    savings: '+$2,800/MW',
    implementation: 'Easy',
    automation: 'Price trigger at $0, ramp to full load'
  },
  {
    title: 'Shift Maintenance Windows',
    description: 'Schedule maintenance during positive price periods, never during negative windows',
    savings: '+$1,500/MW',
    implementation: 'Medium',
    automation: 'Sync maintenance scheduler with price forecasts'
  },
  {
    title: 'Add Flexible Load',
    description: 'Deploy additional equipment (development miners, cooling) only during negative prices',
    savings: '+$4,200/MW',
    implementation: 'Complex',
    automation: 'Secondary load bank with automated dispatch'
  }
];

export const NegativePricePlaybook = () => {
  const [negativeMW, setNegativeMW] = useState(25);
  const [hoursCapture, setHoursCapture] = useState(300);

  // Calculate annual opportunity
  const avgNegativePrice = -25; // $/MWh (you receive this)
  const annualRevenue = Math.abs(avgNegativePrice) * negativeMW * hoursCapture;

  return (
    <AESOSectionWrapper theme="accent" className="py-12 md:py-16">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-t-2xl bg-gradient-to-r from-[hsl(var(--watt-success))] to-emerald-600 text-white mb-0"
      >
        <div className="flex items-center gap-3 mb-2">
          <TrendingDown className="w-6 h-6" />
          <h3 className="text-xl font-bold">Negative Price Playbook</h3>
        </div>
        <p className="text-white/90">
          When pool prices go negative, you get PAID to consume electricity. Here's how to maximize this opportunity.
        </p>
      </motion.div>

      <div className="p-6 rounded-b-2xl bg-card border border-t-0 border-border">
        {/* Trend Data */}
        <AESOContentCard className="mb-8 p-0 border-0 shadow-none">
          <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
            Negative Price Hours Are Increasing
          </h4>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {negativeHoursData.map((year, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div 
                  className="bg-[hsl(var(--watt-success))] rounded-t mx-auto mb-2"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(year.hours / 400) * 100}px` }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  style={{ width: '40px' }}
                />
                <p className="text-xs font-medium text-foreground">{year.year}</p>
                <p className="text-xs text-muted-foreground">{year.hours} hrs</p>
                <p className="text-xs text-[hsl(var(--watt-success))]">${year.avgPrice}/MWh</p>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            As Alberta adds more wind capacity, negative price hours continue to grow. 2024 saw 387+ hours of negative prices — 
            that's over <span className="font-bold text-[hsl(var(--watt-success))]">16 days</span> of being paid to run.
          </p>
        </AESOContentCard>

        {/* When to Expect Negative Prices */}
        <div className="mb-8">
          <h4 className="font-bold text-foreground mb-4">When to Expect Negative Prices</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {typicalConditions.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border hover:border-[hsl(var(--watt-success)/0.5)] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--watt-success)/0.1)] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-[hsl(var(--watt-success))]" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{item.condition}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Optimization Strategies */}
        <div className="mb-8">
          <h4 className="font-bold text-foreground mb-4">Optimization Strategies</h4>
          <div className="space-y-3">
            {strategies.map((strategy, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-background border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-foreground">{strategy.title}</h5>
                  <span className="px-2 py-1 rounded-full bg-[hsl(var(--watt-success)/0.1)] text-[hsl(var(--watt-success))] text-xs font-bold">
                    {strategy.savings}/year
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    Implementation: <span className={`font-medium ${
                      strategy.implementation === 'Easy' ? 'text-[hsl(var(--watt-success))]' :
                      strategy.implementation === 'Medium' ? 'text-amber-600' : 'text-red-600'
                    }`}>{strategy.implementation}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Automation: <span className="text-[hsl(var(--watt-bitcoin))]">{strategy.automation}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Revenue Calculator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-5 rounded-xl bg-gradient-to-br from-[hsl(var(--watt-success)/0.1)] to-emerald-50 dark:from-[hsl(var(--watt-success)/0.15)] dark:to-emerald-900/20 border border-[hsl(var(--watt-success)/0.3)]"
        >
          <h4 className="font-bold text-[hsl(var(--watt-success))] mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Annual Negative Price Opportunity
          </h4>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-foreground/80 mb-2 block">
                  Flexible Capacity: <span className="font-bold text-[hsl(var(--watt-success))]">{negativeMW} MW</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={negativeMW}
                  onChange={(e) => setNegativeMW(Number(e.target.value))}
                  className="w-full h-2 bg-[hsl(var(--watt-success)/0.2)] rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-success))]"
                />
              </div>

              <div>
                <label className="text-sm text-foreground/80 mb-2 block">
                  Hours Captured: <span className="font-bold text-[hsl(var(--watt-success))]">{hoursCapture} hrs/year</span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={400}
                  step={25}
                  value={hoursCapture}
                  onChange={(e) => setHoursCapture(Number(e.target.value))}
                  className="w-full h-2 bg-[hsl(var(--watt-success)/0.2)] rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-success))]"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Conservative</span>
                  <span>Maximum</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-sm text-foreground/70 mb-1">Annual Revenue from Negative Prices</p>
              <p className="text-4xl font-bold text-[hsl(var(--watt-success))]">${annualRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Based on avg -$25/MWh × {negativeMW} MW × {hoursCapture} hours
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pro Tips */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <AESOKeyInsight variant="info" title="Forecast Integration" theme="light">
            WattByte's VoltScout predicts negative price windows 4-12 hours ahead, 
            allowing you to prepare equipment and maximize consumption.
          </AESOKeyInsight>
          
          <AESOKeyInsight variant="warning" title="Watch Your PPA Terms" theme="light">
            Some PPAs don't pass through negative prices. Ensure your contract 
            allows you to benefit from negative pool prices.
          </AESOKeyInsight>
        </div>
      </div>
    </AESOSectionWrapper>
  );
};
