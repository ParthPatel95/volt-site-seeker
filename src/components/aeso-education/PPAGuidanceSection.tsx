import { useEffect, useState, useRef } from 'react';
import { FileText, Shield, TrendingUp, Scale, AlertTriangle, CheckCircle, DollarSign, Calculator, Info } from 'lucide-react';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import DecisionCard from '@/components/academy/DecisionCard';

const ppaTypes = [
  {
    name: 'Fixed Price PPA',
    description: 'Lock in a fixed $/MWh rate for the entire contract term. Zero pool exposure.',
    icon: Shield,
    pros: ['Predictable costs for budgeting', 'Zero pool price risk', 'Ideal for debt financing', 'Simple to manage'],
    cons: ['Miss out on low price periods', 'Locked in if market drops', 'Premium over average pool', 'Early termination costly'],
    bestFor: 'Risk-averse operators, debt-financed projects',
    typicalTerm: '5-15 years',
    typicalPrice: '$55-75/MWh',
    riskLevel: 'Low'
  },
  {
    name: 'Indexed/Floating PPA',
    description: 'Price tied to a market index (e.g., pool price + margin). Partial pool exposure.',
    icon: TrendingUp,
    pros: ['Benefit from low prices', 'More competitive rates', 'Flexible with market', 'Lower commitment'],
    cons: ['Price volatility remains', 'Budgeting uncertainty', 'Counterparty risk', 'Complex settlement'],
    bestFor: 'Sophisticated operators with curtailment capability',
    typicalTerm: '1-5 years',
    typicalPrice: 'Pool + $5-15/MWh',
    riskLevel: 'Medium'
  },
  {
    name: 'Block + Index Hybrid',
    description: 'Fixed price for base load, pool exposure for flex capacity. Best of both worlds.',
    icon: Scale,
    pros: ['Hedged base load', 'Upside on flex load', 'Balanced risk profile', 'Optimization potential'],
    cons: ['More complex management', 'Requires load flexibility', 'Multiple contracts', 'Higher admin burden'],
    bestFor: 'Large operations with controllable load',
    typicalTerm: '3-10 years',
    typicalPrice: 'Base: $60/MWh + Flex: Pool',
    riskLevel: 'Medium'
  },
  {
    name: 'Shaped PPA',
    description: 'Different prices for different time blocks (peak, off-peak, shoulder). Match load profile.',
    icon: Calculator,
    pros: ['Optimized for load shape', 'Lower off-peak rates', 'Flexible structure', 'Cost optimization'],
    cons: ['Complex to negotiate', 'Requires detailed analysis', 'Less common', 'Harder to compare'],
    bestFor: 'Operations with consistent load patterns',
    typicalTerm: '3-10 years',
    typicalPrice: 'Varies by block',
    riskLevel: 'Medium'
  }
];

const negotiationChecklist = [
  { item: 'Volume flexibility (min/max take)', critical: true },
  { item: 'Force majeure clauses', critical: true },
  { item: 'Early termination provisions', critical: true },
  { item: 'Credit/collateral requirements', critical: true },
  { item: 'Delivery point and losses', critical: false },
  { item: 'Scheduling and nomination requirements', critical: false },
  { item: 'Price adjustment mechanisms', critical: false },
  { item: 'Renewable energy certificates (RECs)', critical: false },
  { item: 'Settlement and payment terms', critical: false },
  { item: 'Dispute resolution process', critical: false }
];

export const PPAGuidanceSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(0);
  const [poolPrice, setPoolPrice] = useState(65);
  const [ppaPrice, setPpaPrice] = useState(65);
  const [loadMW, setLoadMW] = useState(25);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  // Simple comparison calculator
  const monthlyHours = 730;
  const poolCost = poolPrice * loadMW * monthlyHours;
  const ppaCost = ppaPrice * loadMW * monthlyHours;
  const difference = ppaCost - poolCost;
  const differencePercent = ((ppaCost - poolCost) / poolCost * 100).toFixed(1);

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <LearningObjectives
          objectives={[
            "Understand the four main PPA structures available in Alberta",
            "Learn how to evaluate fixed vs. pool exposure trade-offs",
            "Know the critical clauses to negotiate in any PPA",
            "Compare costs under different market scenarios"
          ]}
          estimatedTime="15 min"
          prerequisites={[
            { title: "Pool Pricing", href: "/aeso-101#pool-pricing" }
          ]}
        />

        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Risk Management</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Power Purchase Agreements <span className="text-primary">(PPAs)</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A PPA is a contract to buy electricity at agreed terms. Understanding your options 
            is critical for managing energy costs and risk in Alberta's volatile market.
          </p>
        </div>

        {/* PPA Types Grid */}
        <div className={`mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-xl font-bold text-foreground mb-6">PPA Structures</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {ppaTypes.map((ppa, index) => (
              <div
                key={index}
                onClick={() => setSelectedType(index)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedType === index
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ppa.icon className={`w-5 h-5 ${selectedType === index ? 'text-primary' : 'text-muted-foreground'}`} />
                  <h4 className="font-medium text-foreground text-sm">{ppa.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{ppa.description}</p>
                <div className={`mt-2 px-2 py-1 rounded text-xs font-medium inline-block ${
                  ppa.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                  ppa.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {ppa.riskLevel} Risk
                </div>
              </div>
            ))}
          </div>

          {/* Selected Type Details */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-background border border-border">
              <h4 className="text-lg font-bold text-foreground mb-4">{ppaTypes[selectedType].name}</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-lg bg-card">
                  <p className="text-xs text-muted-foreground">Typical Term</p>
                  <p className="font-bold text-foreground">{ppaTypes[selectedType].typicalTerm}</p>
                </div>
                <div className="p-3 rounded-lg bg-card">
                  <p className="text-xs text-muted-foreground">Typical Price</p>
                  <p className="font-bold text-foreground">{ppaTypes[selectedType].typicalPrice}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">Advantages</p>
                  <ul className="space-y-1">
                    {ppaTypes[selectedType].pros.map((pro, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2">Disadvantages</p>
                  <ul className="space-y-1">
                    {ppaTypes[selectedType].cons.map((con, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-primary">Best For:</p>
                <p className="text-sm text-muted-foreground">{ppaTypes[selectedType].bestFor}</p>
              </div>
            </div>

            {/* Cost Comparison Calculator */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-watt-navy to-watt-navy/90 text-white">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-watt-bitcoin" />
                PPA vs Pool Cost Comparison
              </h4>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Expected Pool Price: ${poolPrice}/MWh
                  </label>
                  <input
                    type="range"
                    min={30}
                    max={150}
                    step={5}
                    value={poolPrice}
                    onChange={(e) => setPoolPrice(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-watt-bitcoin"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    PPA Price: ${ppaPrice}/MWh
                  </label>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    step={1}
                    value={ppaPrice}
                    onChange={(e) => setPpaPrice(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-watt-bitcoin"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Load: {loadMW} MW
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={loadMW}
                    onChange={(e) => setLoadMW(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-watt-bitcoin"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/20">
                <div className="flex justify-between">
                  <span className="text-white/70">Pool Cost (Monthly)</span>
                  <span className="font-medium">${(poolCost / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">PPA Cost (Monthly)</span>
                  <span className="font-medium">${(ppaCost / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/20">
                  <span className="font-medium">Difference</span>
                  <span className={`font-bold ${difference > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {difference > 0 ? '+' : ''}{differencePercent}% ({difference > 0 ? '+' : ''}${(Math.abs(difference) / 1000000).toFixed(2)}M)
                  </span>
                </div>
              </div>

              <p className="text-xs text-white/50 mt-4">
                * Simplified calculation. Actual costs include transmission, 12CP, and other charges.
              </p>
            </div>
          </div>
        </div>

        {/* Negotiation Checklist */}
        <div className={`mb-12 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="p-6 rounded-2xl bg-background border border-border">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              PPA Negotiation Checklist
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-red-600 mb-3 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Critical Items (Must Address)
                </p>
                <ul className="space-y-2">
                  {negotiationChecklist.filter(c => c.critical).map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-5 h-5 rounded border-2 border-red-400 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-red-500" />
                      </div>
                      {item.item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 mb-3 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  Important Items
                </p>
                <ul className="space-y-2">
                  {negotiationChecklist.filter(c => !c.critical).map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-5 h-5 rounded border-2 border-blue-400 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                      </div>
                      {item.item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-700">Volume Flexibility is Critical</p>
                  <p className="text-xs text-yellow-600/80 mt-1">
                    For Bitcoin mining, ensure your PPA allows reduced consumption during low BTC prices or high electricity prices. 
                    "Take-or-pay" clauses with no flexibility can be devastating if you need to curtail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decision Framework */}
        <div className={`mb-12 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <DecisionCard
            title="PPA Strategy Selection"
            question="What's the right PPA structure for your operation?"
            criteria={['Price Certainty', 'Upside Potential', 'Flexibility', 'Bankability']}
            options={[
              {
                id: 'fixed',
                name: 'Fixed PPA',
                icon: Shield,
                description: 'Lock in rates for 5+ years. Best for financed projects.',
                bestFor: 'Debt financing, risk-averse, predictable margins',
                scores: { 'Price Certainty': 5, 'Upside Potential': 1, 'Flexibility': 2, 'Bankability': 5 }
              },
              {
                id: 'hybrid',
                name: 'Block + Index',
                icon: Scale,
                description: 'Fixed base + pool flex. Balanced approach.',
                bestFor: 'Established operators with automation',
                scores: { 'Price Certainty': 3, 'Upside Potential': 3, 'Flexibility': 4, 'Bankability': 3 },
                recommended: true
              },
              {
                id: 'pool',
                name: 'Full Pool',
                icon: TrendingUp,
                description: 'Maximum upside but full price exposure.',
                bestFor: 'Sophisticated operators with capital reserves',
                scores: { 'Price Certainty': 1, 'Upside Potential': 5, 'Flexibility': 5, 'Bankability': 1 }
              }
            ]}
          />
        </div>

        {/* Market Scenarios */}
        <div className={`p-6 rounded-2xl bg-card border border-border mb-12 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            When Each Strategy Wins
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <p className="font-semibold text-green-800 mb-2">Pool Wins When...</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Mild weather keeps demand low</li>
                <li>• Wind/solar oversupply</li>
                <li>• Gas prices drop</li>
                <li>• New generation comes online</li>
              </ul>
              <p className="text-xs text-green-600 mt-2">Avg Pool: $40-55/MWh</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="font-semibold text-blue-800 mb-2">Breakeven Zone...</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Normal weather patterns</li>
                <li>• Stable gas prices</li>
                <li>• Balanced supply/demand</li>
                <li>• Typical generation mix</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">Avg Pool: $55-75/MWh</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="font-semibold text-red-800 mb-2">PPA Wins When...</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Extreme cold/heat events</li>
                <li>• Gas price spikes</li>
                <li>• Generation outages</li>
                <li>• Transmission constraints</li>
              </ul>
              <p className="text-xs text-red-600 mt-2">Avg Pool: $80-200+/MWh</p>
            </div>
          </div>
        </div>

        <SectionSummary
          takeaways={[
            "Four main PPA types: Fixed (low risk), Indexed (medium risk), Block+Index (balanced), Shaped (optimized)",
            "Volume flexibility clause is critical for Bitcoin mining - avoid strict take-or-pay commitments",
            "Fixed PPAs typically price at 10-20% premium over expected pool price in exchange for certainty",
            "Hybrid strategies (Block+Index) often optimal for mining - hedged base load + upside capture on flex"
          ]}
          proTip="When negotiating a PPA, the counterparty (seller) is betting pool prices will be higher than your contract price. Use VoltScout's price forecasts to inform your negotiation - if you have better data, you get better terms."
          nextSteps={[
            { title: "Ancillary Services", href: "/aeso-101#ancillary-services" },
            { title: "12CP Optimization", href: "/aeso-101#twelve-cp" }
          ]}
        />
      </div>
    </section>
  );
};
