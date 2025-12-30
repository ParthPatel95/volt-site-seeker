import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Zap, AlertTriangle, Shield, Percent, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAESOMarketData } from '@/hooks/useAESOMarketData';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import DecisionCard from '@/components/academy/DecisionCard';
import CaseStudy from '@/components/academy/CaseStudy';
import { NegativePricePlaybook } from './NegativePricePlaybook';
import {
  AESOSectionWrapper,
  AESOSectionHeader,
  AESOContentCard,
  AESOKeyInsight,
  AESOStepByStep,
} from './shared';

const meritOrderStack = [
  { type: 'Wind', cost: 0, capacity: 4500, color: 'bg-emerald-500', description: 'Zero marginal cost — always dispatched first when available' },
  { type: 'Solar', cost: 0, capacity: 1500, color: 'bg-yellow-500', description: 'Zero marginal cost — dispatched during daylight hours' },
  { type: 'Hydro', cost: 15, capacity: 900, color: 'bg-blue-500', description: 'Low cost baseload — limited by water availability' },
  { type: 'Coal', cost: 35, capacity: 2500, color: 'bg-gray-600', description: 'Being phased out — higher emissions costs' },
  { type: 'Gas Combined Cycle', cost: 45, capacity: 5000, color: 'bg-orange-400', description: 'Efficient gas plants — workhorse of the grid' },
  { type: 'Gas Simple Cycle', cost: 80, capacity: 3000, color: 'bg-red-400', description: 'Less efficient but fast-ramping gas plants' },
  { type: 'Peakers', cost: 150, capacity: 1500, color: 'bg-red-600', description: 'Only run during extreme demand — sets highest prices' },
];

const priceFormationSteps = [
  {
    title: 'Generators Submit Offers',
    description: 'Every hour, generators submit price/quantity pairs to AESO indicating how much power they can supply at what price.',
  },
  {
    title: 'AESO Builds the Merit Order',
    description: 'Offers are stacked from lowest to highest price, creating the "merit order" — a supply curve for electricity.',
  },
  {
    title: 'Demand Intersects Supply',
    description: 'AESO determines total system demand. The price offered by the LAST generator needed to meet demand sets the clearing price.',
  },
  {
    title: 'All Generators Paid Same Price',
    description: 'Every dispatched generator receives the single clearing price — even if they offered lower. This rewards efficiency.',
  },
];

export const PoolPricingSection = () => {
  const [demandLevel, setDemandLevel] = useState(10000);
  const [animatedDemand, setAnimatedDemand] = useState(10000);
  
  const { systemMarginalPrice, loading } = useAESOMarketData();

  useEffect(() => {
    const duration = 500;
    const steps = 30;
    const increment = (demandLevel - animatedDemand) / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setAnimatedDemand(prev => prev + increment);
      if (step >= steps) {
        setAnimatedDemand(demandLevel);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [demandLevel]);

  const getClearingPrice = () => {
    let cumulative = 0;
    for (const gen of meritOrderStack) {
      cumulative += gen.capacity;
      if (cumulative >= animatedDemand) {
        return gen.cost;
      }
    }
    return 999.99;
  };

  const currentPrice = systemMarginalPrice?.price || getClearingPrice();
  const priceChange = systemMarginalPrice ? (systemMarginalPrice.price - systemMarginalPrice.forecast_pool_price) : 0;

  return (
    <AESOSectionWrapper theme="light" id="pool-pricing">
      <LearningObjectives
        objectives={[
          "Understand how the merit order stacks generators from lowest to highest cost",
          "Learn why the marginal generator sets the price for ALL generators",
          "See real-time pool price data and what drives price volatility",
          "Know when to expect low prices (windy nights) vs high prices (summer peaks)"
        ]}
        estimatedTime="10 min"
        prerequisites={[
          { title: "What is AESO", href: "/aeso-101#what-is-aeso" }
        ]}
      />
      
      {/* Header */}
      <AESOSectionHeader
        badge="Market Mechanics"
        badgeIcon={DollarSign}
        title="How Pool Pricing Works"
        description="Alberta uses a single clearing price mechanism — all generators receive the same price, determined by the marginal (last) generator needed to meet demand. This creates transparent, competitive pricing that rewards efficiency."
      />

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Left - Live Price Widget */}
        <div>
          {/* Live Pool Price Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] text-white mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[hsl(var(--watt-success))] rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white/70">Live Pool Price</span>
              </div>
              <span className="text-xs text-white/50">
                {loading ? 'Loading...' : 'Real-time from AESO'}
              </span>
            </div>
            <div className="text-5xl font-bold mb-2">
              ${currentPrice.toFixed(2)}
              <span className="text-xl text-white/70 ml-2">CAD/MWh</span>
            </div>
            {priceChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${priceChange > 0 ? 'text-red-400' : 'text-[hsl(var(--watt-success))]'}`}>
                {priceChange > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                ${Math.abs(priceChange).toFixed(2)} vs forecast
              </div>
            )}
          </motion.div>

          {/* Price Bounds Explanation */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <AESOContentCard hover={false} className="text-center p-4">
              <p className="text-2xl font-bold text-[hsl(var(--watt-success))]">-$60</p>
              <p className="text-xs text-muted-foreground">Floor (Negative)</p>
              <p className="text-xs text-muted-foreground/60 mt-1">You get paid!</p>
            </AESOContentCard>
            <AESOContentCard hover={false} className="text-center p-4">
              <p className="text-2xl font-bold text-[hsl(var(--watt-trust))]">$0</p>
              <p className="text-xs text-muted-foreground">Free Power</p>
              <p className="text-xs text-muted-foreground/60 mt-1">High wind days</p>
            </AESOContentCard>
            <AESOContentCard hover={false} className="text-center p-4">
              <p className="text-2xl font-bold text-red-600">$999.99</p>
              <p className="text-xs text-muted-foreground">Price Cap</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Extreme scarcity</p>
            </AESOContentCard>
          </div>

          {/* How Price Formation Works */}
          <AESOStepByStep
            title="How the Pool Price is Set Each Hour"
            steps={priceFormationSteps}
          />
        </div>

        {/* Right - Interactive Merit Order */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            Interactive Merit Order Stack
          </h3>
          
          {/* Demand Slider */}
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Simulate Demand: <span className="text-[hsl(var(--watt-bitcoin))]">{animatedDemand.toFixed(0).toLocaleString()} MW</span>
            </label>
            <input
              type="range"
              min={5000}
              max={16000}
              step={100}
              value={demandLevel}
              onChange={(e) => setDemandLevel(Number(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-bitcoin))]"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low Demand (5 GW)</span>
              <span>Peak Demand (16 GW)</span>
            </div>
          </div>

          {/* Merit Order Visualization */}
          <div className="space-y-2 mb-6">
            {meritOrderStack.map((gen, i) => {
              let cumulativeBefore = 0;
              for (let j = 0; j < i; j++) {
                cumulativeBefore += meritOrderStack[j].capacity;
              }
              const cumulativeAfter = cumulativeBefore + gen.capacity;
              const isDispatched = cumulativeBefore < animatedDemand;
              const isMarginal = cumulativeBefore < animatedDemand && cumulativeAfter >= animatedDemand;
              
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    isMarginal 
                      ? 'bg-[hsl(var(--watt-bitcoin)/0.15)] border-2 border-[hsl(var(--watt-bitcoin))] ring-2 ring-[hsl(var(--watt-bitcoin)/0.3)]' 
                      : isDispatched 
                        ? 'bg-[hsl(var(--watt-success)/0.1)] border border-[hsl(var(--watt-success)/0.3)]' 
                        : 'bg-muted/50 border border-border opacity-50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded ${gen.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground text-sm">{gen.type}</span>
                      <span className="text-sm text-muted-foreground">${gen.cost}/MWh</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-full rounded-full ${gen.color}`}
                        style={{ width: `${(gen.capacity / 5000) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{gen.capacity.toLocaleString()} MW</span>
                  </div>
                  {isMarginal && (
                    <div className="absolute -right-2 -top-2 px-2 py-1 bg-[hsl(var(--watt-bitcoin))] text-white text-xs font-bold rounded-full">
                      MARGINAL
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Clearing Price Result */}
          <motion.div 
            className="p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] text-white text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-white/70 mb-1">Simulated Clearing Price</p>
            <p className="text-3xl font-bold">${getClearingPrice()}<span className="text-lg text-white/70">/MWh</span></p>
          </motion.div>
        </div>
      </div>

      {/* Key Insight */}
      <AESOKeyInsight variant="pro-tip" className="mb-12">
        <strong>Why This Matters for Bitcoin Mining:</strong> When wind is blowing hard at night (low demand + high renewable output), 
        prices can drop to $0 or even negative. During cold snaps or summer heat waves with low wind, prices can spike to $999/MWh. 
        A flexible load that can curtail during spikes and maximize during cheap hours captures massive value.
      </AESOKeyInsight>

      {/* Extreme Price Events */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800"
      >
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          When Prices Spike: Understanding Extreme Events
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card border border-red-200 dark:border-red-800">
            <p className="font-semibold text-foreground mb-1">February 2021 Cold Snap</p>
            <p className="text-2xl font-bold text-red-600">$999.99/MWh</p>
            <p className="text-sm text-muted-foreground mt-2">
              Prices hit cap for 16+ hours as temperatures dropped to -40°C. Heating demand surged while some generation went offline.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-orange-200 dark:border-orange-800">
            <p className="font-semibold text-foreground mb-1">Summer Heat Waves</p>
            <p className="text-2xl font-bold text-orange-600">$400-800/MWh</p>
            <p className="text-sm text-muted-foreground mt-2">
              AC demand + low wind = afternoon price spikes. These are more predictable but still costly for inflexible loads.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-[hsl(var(--watt-success)/0.3)]">
            <p className="font-semibold text-foreground mb-1">Windy Spring Nights</p>
            <p className="text-2xl font-bold text-[hsl(var(--watt-success))]">-$60/MWh</p>
            <p className="text-sm text-muted-foreground mt-2">
              High wind + low demand = oversupply. You literally get PAID to consume electricity during these windows.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Power Purchasing Decision Card */}
      <div className="mb-12">
        <DecisionCard
          title="Power Purchasing Strategy"
          question="How should you manage exposure to Alberta's volatile pool prices?"
          criteria={['Risk Tolerance', 'Cash Flow', 'Upside Potential', 'Simplicity']}
          options={[
            {
              id: 'fixed-ppa',
              name: 'Fixed PPA',
              icon: Shield,
              description: 'Lock in a fixed $/MWh rate for 3-10 years. Zero pool exposure.',
              bestFor: 'Risk-averse operators, debt-financed projects, stable margins',
              scores: { 'Risk Tolerance': 5, 'Cash Flow': 5, 'Upside Potential': 1, 'Simplicity': 5 }
            },
            {
              id: 'pool-exposure',
              name: 'Full Pool Exposure',
              icon: Percent,
              description: 'Buy all power at real-time pool prices. Maximum upside and risk.',
              bestFor: 'Flexible loads that can curtail, aggressive operators',
              scores: { 'Risk Tolerance': 1, 'Cash Flow': 2, 'Upside Potential': 5, 'Simplicity': 4 },
              recommended: true
            },
            {
              id: 'hybrid',
              name: 'Hybrid Strategy',
              icon: Scale,
              description: 'Base load on PPA, flex load on pool. Balanced approach.',
              bestFor: 'Most mining operations - hedged base with upside capture',
              scores: { 'Risk Tolerance': 3, 'Cash Flow': 4, 'Upside Potential': 3, 'Simplicity': 2 }
            }
          ]}
        />
      </div>

      {/* Case Study */}
      <div className="mb-12">
        <CaseStudy
          title="Navigating the January 2024 Price Spike"
          location="Alberta, Canada"
          date="January 13-14, 2024"
          capacity="25 MW Mining Operation"
          metrics={[
            { label: 'Peak Price', value: '$999/MWh' },
            { label: 'Spike Duration', value: '6 hours' },
            { label: 'Curtailment Savings', value: '$48,000' },
            { label: 'Response Time', value: '<2 min' }
          ]}
          whatWorked={[
            'Automated curtailment triggered at $150/MWh threshold',
            'Full shutdown achieved in under 2 minutes via SCADA integration',
            'Pre-negotiated restart protocol avoided grid penalties',
            'Team used downtime for scheduled maintenance'
          ]}
          lessonsLearned={[
            'Manual curtailment is too slow - prices can spike in minutes',
            'Need 4-hour price forecast to anticipate events, not just react',
            'Restart sequencing matters - staggered startup avoids inrush issues',
            'Track curtailment savings separately to prove ROI of automation'
          ]}
          proTip="VoltScout's automated curtailment pays for itself in a single major price event. The $48K saved here covered 2+ years of the system cost."
        />
      </div>
      
      {/* Negative Price Playbook */}
      <NegativePricePlaybook />
      
      <SectionSummary
        takeaways={[
          "Merit order: Wind/solar bid $0, then hydro, coal, gas, peakers — the last generator needed sets the price for ALL generators",
          "Price range: -$60/MWh (oversupply) to $999/MWh (scarcity) — massive profit opportunities for flexible loads",
          "Hot summer afternoons = $400-800/MWh spikes; windy spring nights = negative prices where you get paid to consume",
          "Strategic curtailment during peaks + running during negative prices = major cost savings and potential revenue"
        ]}
        proTip="Negative prices mean you get PAID to consume electricity. VoltScout forecasts these events so you can maximize mining during negative price windows while your competitors sit idle."
        nextSteps={[
          { title: "12CP Optimization", href: "/aeso-101#twelve-cp" },
          { title: "Rate 65", href: "/aeso-101#rate-65" }
        ]}
      />
    </AESOSectionWrapper>
  );
};
