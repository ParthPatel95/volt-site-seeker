import { useEffect, useState, useRef } from 'react';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Zap, Info, AlertTriangle, Shield, Percent, Scale } from 'lucide-react';
import { useAESOMarketData } from '@/hooks/useAESOMarketData';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import DecisionCard from '@/components/academy/DecisionCard';
import CaseStudy from '@/components/academy/CaseStudy';

const meritOrderStack = [
  { type: 'Wind', cost: 0, capacity: 4500, color: 'bg-emerald-500' },
  { type: 'Solar', cost: 0, capacity: 1500, color: 'bg-yellow-500' },
  { type: 'Hydro', cost: 15, capacity: 900, color: 'bg-blue-500' },
  { type: 'Coal', cost: 35, capacity: 2500, color: 'bg-gray-600' },
  { type: 'Gas Combined Cycle', cost: 45, capacity: 5000, color: 'bg-orange-400' },
  { type: 'Gas Simple Cycle', cost: 80, capacity: 3000, color: 'bg-red-400' },
  { type: 'Peakers', cost: 150, capacity: 1500, color: 'bg-red-600' },
];

export const PoolPricingSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [demandLevel, setDemandLevel] = useState(10000);
  const [animatedDemand, setAnimatedDemand] = useState(10000);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { systemMarginalPrice, loading } = useAESOMarketData();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Animate demand changes
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
    <section ref={sectionRef} className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
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
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-4">
            <DollarSign className="w-4 h-4 text-watt-bitcoin" />
            <span className="text-sm font-medium text-watt-bitcoin">Market Mechanics</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
            How <span className="text-watt-bitcoin">Pool Pricing</span> Works
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
            Alberta uses a single clearing price mechanism — all generators receive the same price, 
            determined by the marginal (last) generator needed to meet demand.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Live Price Widget */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
            {/* Live Pool Price Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-watt-navy to-watt-navy/90 text-white mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
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
                <div className={`flex items-center gap-1 text-sm ${priceChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {priceChange > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  ${Math.abs(priceChange).toFixed(2)} vs forecast
                </div>
              )}
            </div>

            {/* Price Bounds Explanation */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
                <p className="text-2xl font-bold text-green-700">-$60</p>
                <p className="text-xs text-green-600">Floor (Negative)</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <p className="text-2xl font-bold text-blue-700">$0</p>
                <p className="text-xs text-blue-600">Free Power</p>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
                <p className="text-2xl font-bold text-red-700">$999.99</p>
                <p className="text-xs text-red-600">Price Cap</p>
              </div>
            </div>

            {/* Price Formation Explanation */}
            <div className="p-5 rounded-xl bg-watt-light border border-watt-navy/10">
              <h4 className="font-semibold text-watt-navy mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-watt-bitcoin" />
                Why Single Clearing Price?
              </h4>
              <ul className="space-y-2 text-sm text-watt-navy/70">
                <li className="flex items-start gap-2">
                  <span className="text-watt-bitcoin">•</span>
                  All generators bid their marginal cost to produce
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-watt-bitcoin">•</span>
                  AESO stacks bids lowest to highest (merit order)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-watt-bitcoin">•</span>
                  Price set by the LAST generator needed to meet demand
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-watt-bitcoin">•</span>
                  All dispatched generators receive this single price
                </li>
              </ul>
            </div>
          </div>

          {/* Right - Interactive Merit Order */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            <h3 className="text-xl font-bold text-watt-navy mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-watt-bitcoin" />
              Interactive Merit Order Stack
            </h3>
            
            {/* Demand Slider */}
            <div className="mb-6">
              <label className="text-sm font-medium text-watt-navy/70 mb-2 block">
                Simulate Demand: {animatedDemand.toFixed(0).toLocaleString()} MW
              </label>
              <input
                type="range"
                min={5000}
                max={16000}
                step={100}
                value={demandLevel}
                onChange={(e) => setDemandLevel(Number(e.target.value))}
                className="w-full h-2 bg-watt-navy/10 rounded-lg appearance-none cursor-pointer accent-watt-bitcoin"
              />
              <div className="flex justify-between text-xs text-watt-navy/50 mt-1">
                <span>Low (5 GW)</span>
                <span>Peak (16 GW)</span>
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
                  <div 
                    key={i}
                    className={`relative flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      isMarginal 
                        ? 'bg-watt-bitcoin/20 border-2 border-watt-bitcoin ring-2 ring-watt-bitcoin/30' 
                        : isDispatched 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50 border border-gray-200 opacity-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded ${gen.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-watt-navy text-sm">{gen.type}</span>
                        <span className="text-sm text-watt-navy/70">${gen.cost}/MWh</span>
                      </div>
                      <div className="w-full bg-watt-navy/10 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-full rounded-full ${gen.color}`}
                          style={{ width: `${(gen.capacity / 5000) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-watt-navy/50">{gen.capacity.toLocaleString()} MW</span>
                    </div>
                    {isMarginal && (
                      <div className="absolute -right-2 -top-2 px-2 py-1 bg-watt-bitcoin text-white text-xs font-bold rounded-full">
                        MARGINAL
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Clearing Price Result */}
            <div className="p-4 rounded-xl bg-watt-navy text-white text-center">
              <p className="text-sm text-white/70 mb-1">Simulated Clearing Price</p>
              <p className="text-3xl font-bold">${getClearingPrice()}<span className="text-lg text-white/70">/MWh</span></p>
            </div>
          </div>
        </div>

        {/* Extreme Price Events */}
        <div className={`mt-12 p-6 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-lg font-bold text-watt-navy mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            When Prices Spike: Extreme Events
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-red-200">
              <p className="font-semibold text-watt-navy mb-1">February 2021 Cold Snap</p>
              <p className="text-2xl font-bold text-red-600">$999.99/MWh</p>
              <p className="text-sm text-watt-navy/70">Prices hit cap for 16+ hours as temps dropped to -40°C</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-red-200">
              <p className="font-semibold text-watt-navy mb-1">Summer Heat Waves</p>
              <p className="text-2xl font-bold text-orange-600">$400-800/MWh</p>
              <p className="text-sm text-watt-navy/70">AC demand + low wind = afternoon price spikes</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-green-200">
              <p className="font-semibold text-watt-navy mb-1">Windy Spring Nights</p>
              <p className="text-2xl font-bold text-green-600">-$60/MWh</p>
              <p className="text-sm text-watt-navy/70">Oversupply = negative prices (you get paid to consume!)</p>
            </div>
          </div>
        </div>

        {/* Power Purchasing Decision Card */}
        <div className={`mt-12 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
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
        <div className={`mt-12 transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
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
            proTip="VoltScout\'s automated curtailment pays for itself in a single major price event. The $48K saved here covered 2+ years of the system cost."
          />
        </div>
        
        <SectionSummary
          takeaways={[
            "Merit order: Wind/solar bid $0, then hydro, coal, gas, peakers — last generator needed sets price for all",
            "Price range: -$60/MWh (oversupply) to $999/MWh (scarcity) — massive profit opportunities for flexible loads",
            "Hot summer afternoons = $400-800/MWh spikes; windy spring nights = negative prices",
            "Strategic curtailment during peaks + running during negative prices = major cost savings"
          ]}
          proTip="Negative prices mean you get PAID to consume electricity. WattByte's VoltScout forecasts these events so you can maximize mining during negative price windows."
          nextSteps={[
            { title: "12CP Optimization", href: "/aeso-101#twelve-cp" },
            { title: "Rate 65", href: "/aeso-101#rate-65" }
          ]}
        />
      </div>
    </section>
  );
};
