import { useState } from 'react';
import { FileText, Shield, TrendingUp, Scale, AlertTriangle, CheckCircle, Calculator, Info, Lightbulb, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AESOSectionWrapper, 
  AESOSectionHeader, 
  AESOContentCard, 
  AESOKeyInsight,
  AESODeepDive,
  AESOStepByStep
} from './shared';

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
  { item: 'Volume flexibility (min/max take)', critical: true, detail: 'Ensure you can reduce consumption during low BTC prices or high electricity prices without penalties' },
  { item: 'Force majeure clauses', critical: true, detail: 'Cover events like grid emergencies, regulatory changes, or extreme weather' },
  { item: 'Early termination provisions', critical: true, detail: 'Understand exit costs and conditions if your project needs to relocate or shut down' },
  { item: 'Credit/collateral requirements', critical: true, detail: 'Know upfront deposits and ongoing credit requirements' },
  { item: 'Delivery point and losses', critical: false, detail: 'Specify where power is delivered and who bears transmission losses' },
  { item: 'Scheduling and nomination requirements', critical: false, detail: 'Understand how far in advance you need to commit to consumption levels' },
  { item: 'Price adjustment mechanisms', critical: false, detail: 'Clarify how prices adjust for inflation, fuel costs, or regulatory changes' },
  { item: 'Renewable energy certificates (RECs)', critical: false, detail: 'Determine if RECs are included or sold separately' },
  { item: 'Settlement and payment terms', critical: false, detail: 'Establish billing cycles, payment terms, and dispute resolution' },
  { item: 'Dispute resolution process', critical: false, detail: 'Agree on arbitration vs litigation and governing law' }
];

const marketScenarios = [
  {
    scenario: 'High Gas Prices',
    poolImpact: 'Pool rises to $100-150/MWh',
    fixedPPA: 'Protected at contract rate',
    floatingPPA: 'Exposed to higher costs',
    hybrid: 'Base protected, flex exposed',
    winner: 'Fixed PPA',
    color: 'hsl(var(--watt-bitcoin))'
  },
  {
    scenario: 'Renewable Surplus',
    poolImpact: 'Pool drops to $0-30/MWh',
    fixedPPA: 'Overpaying vs pool',
    floatingPPA: 'Capture low prices',
    hybrid: 'Flex captures savings',
    winner: 'Floating/Hybrid',
    color: 'hsl(var(--watt-success))'
  },
  {
    scenario: 'Grid Emergency',
    poolImpact: 'Pool spikes to $999/MWh',
    fixedPPA: 'Fully protected',
    floatingPPA: 'Massive exposure',
    hybrid: 'Partial protection',
    winner: 'Fixed PPA',
    color: 'hsl(var(--watt-bitcoin))'
  },
  {
    scenario: 'Mild Weather Year',
    poolImpact: 'Pool averages $40-50/MWh',
    fixedPPA: 'Likely overpaying',
    floatingPPA: 'Capture the savings',
    hybrid: 'Balanced outcome',
    winner: 'Floating/Hybrid',
    color: 'hsl(var(--watt-success))'
  }
];

export const PPAGuidanceSection = () => {
  const [selectedType, setSelectedType] = useState(0);
  const [poolPrice, setPoolPrice] = useState(65);
  const [ppaPrice, setPpaPrice] = useState(65);
  const [loadMW, setLoadMW] = useState(25);

  const monthlyHours = 730;
  const poolCost = poolPrice * loadMW * monthlyHours;
  const ppaCost = ppaPrice * loadMW * monthlyHours;
  const difference = ppaCost - poolCost;
  const differencePercent = ((ppaCost - poolCost) / poolCost * 100).toFixed(1);

  return (
    <AESOSectionWrapper theme="light" id="ppa-guidance">
      <AESOSectionHeader
        badge="Risk Management"
        badgeIcon={FileText}
        title="Power Purchase Agreements (PPAs)"
        description="A PPA is a contract to buy electricity at agreed terms. Understanding your options is critical for managing energy costs and risk in Alberta's volatile market."
        theme="light"
        align="center"
      />

      {/* What is a PPA Deep Dive */}
      <div className="mb-12">
        <AESODeepDive title="What Exactly is a Power Purchase Agreement?" defaultOpen>
          <div className="space-y-4 text-muted-foreground">
            <p>
              A <strong className="text-foreground">Power Purchase Agreement (PPA)</strong> is a long-term contract 
              between an electricity buyer (you) and a seller (generator or retailer) that establishes the terms 
              for purchasing electricity over a specified period.
            </p>
            <p>
              In Alberta's deregulated market, PPAs serve as a <strong className="text-foreground">risk management tool</strong> that 
              allows buyers to hedge against the volatility of pool prices while providing sellers with predictable revenue streams.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-[hsl(var(--watt-bitcoin)/0.05)] border border-[hsl(var(--watt-bitcoin)/0.2)]">
                <h4 className="font-semibold text-foreground mb-2">Why Consider a PPA?</h4>
                <ul className="text-sm space-y-1">
                  <li>• Pool prices can swing from -$50 to $999/MWh</li>
                  <li>• Budget certainty for long-term planning</li>
                  <li>• Required for debt financing in many cases</li>
                  <li>• Potential access to renewable energy credits</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-muted border border-border">
                <h4 className="font-semibold text-foreground mb-2">Key Considerations</h4>
                <ul className="text-sm space-y-1">
                  <li>• Your risk tolerance and cash flow requirements</li>
                  <li>• Operational flexibility needs</li>
                  <li>• Contract length and exit provisions</li>
                  <li>• Counterparty creditworthiness</li>
                </ul>
              </div>
            </div>
          </div>
        </AESODeepDive>
      </div>

      {/* PPA Types Grid */}
      <div className="mb-12">
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">PPA Structures</h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {ppaTypes.map((ppa, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => setSelectedType(index)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedType === index
                  ? 'border-[hsl(var(--watt-bitcoin))] bg-[hsl(var(--watt-bitcoin)/0.05)]'
                  : 'border-border bg-card hover:border-[hsl(var(--watt-bitcoin)/0.5)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <ppa.icon className={`w-5 h-5 ${selectedType === index ? 'text-[hsl(var(--watt-bitcoin))]' : 'text-muted-foreground'}`} />
                <h4 className="font-medium text-foreground text-sm">{ppa.name}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{ppa.description}</p>
              <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                ppa.riskLevel === 'Low' ? 'bg-[hsl(var(--watt-success)/0.1)] text-[hsl(var(--watt-success))]' :
                'bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))]'
              }`}>
                {ppa.riskLevel} Risk
              </span>
            </motion.div>
          ))}
        </div>

        {/* Selected Type Details */}
        <div className="grid lg:grid-cols-2 gap-6">
          <AESOContentCard theme="light" hover={false}>
            <h4 className="text-lg font-bold text-foreground mb-4">{ppaTypes[selectedType].name}</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Typical Term</p>
                <p className="font-bold text-foreground">{ppaTypes[selectedType].typicalTerm}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Typical Price</p>
                <p className="font-bold text-foreground">{ppaTypes[selectedType].typicalPrice}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--watt-success))] mb-2">Advantages</p>
                <ul className="space-y-1">
                  {ppaTypes[selectedType].pros.map((pro, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-[hsl(var(--watt-success))] flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-destructive mb-2">Disadvantages</p>
                <ul className="space-y-1">
                  {ppaTypes[selectedType].cons.map((con, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[hsl(var(--watt-bitcoin)/0.05)] border border-[hsl(var(--watt-bitcoin)/0.2)]">
              <p className="text-sm font-medium text-[hsl(var(--watt-bitcoin))]">Best For:</p>
              <p className="text-sm text-muted-foreground">{ppaTypes[selectedType].bestFor}</p>
            </div>
          </AESOContentCard>

          {/* Cost Comparison Calculator */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] text-white">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
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
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-bitcoin))]"
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
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-bitcoin))]"
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
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[hsl(var(--watt-bitcoin))]"
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
                <span className={`font-bold ${difference > 0 ? 'text-red-400' : 'text-[hsl(var(--watt-success))]'}`}>
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
      <div className="mb-12">
        <AESOContentCard theme="light" hover={false}>
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            PPA Negotiation Checklist
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-destructive mb-3 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Critical Items (Must Address)
              </p>
              <ul className="space-y-3">
                {negotiationChecklist.filter(c => c.critical).map((item, i) => (
                  <li key={i} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.item}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(var(--watt-trust))] mb-3 flex items-center gap-1">
                <Info className="w-4 h-4" />
                Important Items
              </p>
              <ul className="space-y-3">
                {negotiationChecklist.filter(c => !c.critical).map((item, i) => (
                  <li key={i} className="p-3 rounded-lg bg-[hsl(var(--watt-trust)/0.05)] border border-[hsl(var(--watt-trust)/0.2)]">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[hsl(var(--watt-trust))] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.item}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AESOContentCard>
      </div>

      {/* Volume Flexibility Warning */}
      <AESOKeyInsight variant="warning" title="Volume Flexibility is Critical for Bitcoin Mining" theme="light" className="mb-12">
        <p>
          For Bitcoin mining operations, ensure your PPA allows reduced consumption during low BTC prices 
          or high electricity prices. <strong>"Take-or-pay" clauses with no flexibility can be devastating</strong> if 
          you need to curtail operations. Negotiate for:
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>• Minimum take levels of 70-80% rather than 90-100%</li>
          <li>• Monthly rather than hourly minimum commitments</li>
          <li>• Force majeure clauses that include market conditions</li>
          <li>• Right to reduce load during EEA 2/3 grid emergencies</li>
        </ul>
      </AESOKeyInsight>

      {/* Market Scenarios */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-foreground mb-6 text-center">How PPAs Perform in Different Market Scenarios</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[hsl(var(--watt-navy))] text-white">
                <th className="p-4 text-left rounded-tl-lg">Scenario</th>
                <th className="p-4 text-left">Pool Impact</th>
                <th className="p-4 text-left">Fixed PPA</th>
                <th className="p-4 text-left">Floating PPA</th>
                <th className="p-4 text-left rounded-tr-lg">Winner</th>
              </tr>
            </thead>
            <tbody>
              {marketScenarios.map((scenario, idx) => (
                <tr 
                  key={idx}
                  className={`border-b border-border ${idx % 2 === 0 ? 'bg-card' : 'bg-muted/50'}`}
                >
                  <td className="p-4 font-medium text-foreground">{scenario.scenario}</td>
                  <td className="p-4 text-muted-foreground">{scenario.poolImpact}</td>
                  <td className="p-4 text-muted-foreground">{scenario.fixedPPA}</td>
                  <td className="p-4 text-muted-foreground">{scenario.floatingPPA}</td>
                  <td className="p-4">
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: scenario.color }}
                    >
                      {scenario.winner}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PPA Selection Process */}
      <AESOStepByStep
        title="How to Select the Right PPA Structure"
        theme="light"
        steps={[
          {
            title: 'Assess Your Risk Tolerance',
            description: 'Determine how much price volatility your operation can absorb. Debt-financed projects typically need more certainty than equity-backed operations.'
          },
          {
            title: 'Analyze Your Load Profile',
            description: 'Understand when you consume power and your flexibility. 24/7 operations with curtailment capability have more PPA options than must-run facilities.'
          },
          {
            title: 'Model Multiple Scenarios',
            description: 'Compare PPA costs against pool exposure under various market conditions. Include extreme scenarios like $999/MWh spikes and $0 price periods.'
          },
          {
            title: 'Evaluate Counterparties',
            description: 'Assess the creditworthiness of potential PPA partners. A great rate means nothing if the counterparty defaults mid-contract.'
          },
          {
            title: 'Negotiate Key Terms',
            description: 'Focus on volume flexibility, termination rights, and force majeure clauses. These matter more than the last $1/MWh in price negotiations.'
          }
        ]}
      />

      {/* Pro Tip */}
      <AESOKeyInsight variant="pro-tip" title="Pro Tip: Consider a Layered Approach" theme="light" className="mt-8">
        <p>
          Many sophisticated operators use a <strong>layered hedging strategy</strong>: 50% fixed PPA for budget certainty, 
          30% floating for market upside, and 20% full pool exposure for optimization. This provides protection 
          against extreme scenarios while maintaining ability to benefit from low-price periods.
        </p>
      </AESOKeyInsight>

      {/* Data Source */}
      <div className="mt-8 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--watt-bitcoin))]"></span>
          Based on Alberta PPA market data and industry best practices
        </span>
      </div>
    </AESOSectionWrapper>
  );
};
