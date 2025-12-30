import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calculator, PieChart, BarChart3, ArrowRight, Zap, Building2, Wind, Users, Wrench, Shield, Info, Lightbulb } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { PUE_RANGES, CURRENT_BTC_PRICE, DATA_DISCLAIMER } from '@/constants/mining-data';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import { DCESectionWrapper, DCESectionHeader, DCEContentCard, DCEKeyInsight, DCECallout, DCEDeepDive } from './shared';

const DatacenterEconomicsSection = () => {
  const [facilitySize, setFacilitySize] = useState(50); // MW
  const [powerCost, setPowerCost] = useState(0.05); // $/kWh
  const [btcPrice, setBtcPrice] = useState(100000);

  // CapEx breakdown per MW
  const capexPerMW = {
    land: 50000, // $50K/MW
    building: 150000, // $150K/MW
    electrical: 300000, // $300K/MW (transformers, switchgear, PDUs)
    cooling: 100000, // $100K/MW
    networkSecurity: 50000, // $50K/MW
    sitework: 50000, // $50K/MW
  };

  // OpEx per MW per year
  const opexPerMWYear = {
    power: powerCost * 1000 * 24 * 365 * 0.95, // 95% uptime
    labor: 30000, // $30K/MW/year
    maintenance: 20000, // $20K/MW/year
    insurance: 10000, // $10K/MW/year
    network: 5000, // $5K/MW/year
    other: 10000, // $10K/MW/year
  };

  const totalCapexPerMW = Object.values(capexPerMW).reduce((a, b) => a + b, 0);
  const totalCapex = totalCapexPerMW * facilitySize;
  const totalOpexPerMWYear = Object.values(opexPerMWYear).reduce((a, b) => a + b, 0);
  const totalOpexYear = totalOpexPerMWYear * facilitySize;

  // Revenue calculation (simplified)
  const minerEfficiency = 23; // J/TH
  const networkHashrate = 750; // EH/s
  const blockReward = 3.125;
  const dailyBlocks = 144;
  
  const facilityHashrate = (facilitySize * 1000000) / (minerEfficiency * 1000000000000); // EH/s
  const dailyBTC = (facilityHashrate / networkHashrate) * dailyBlocks * blockReward;
  const annualRevenue = dailyBTC * 365 * btcPrice;
  const annualProfit = annualRevenue - totalOpexYear;
  const paybackMonths = annualProfit > 0 ? (totalCapex / annualProfit) * 12 : Infinity;

  const capexBreakdown = [
    { name: 'Electrical Infrastructure', value: capexPerMW.electrical, color: 'bg-yellow-500', icon: Zap },
    { name: 'Building/Structure', value: capexPerMW.building, color: 'bg-blue-500', icon: Building2 },
    { name: 'Cooling Systems', value: capexPerMW.cooling, color: 'bg-cyan-500', icon: Wind },
    { name: 'Land/Site', value: capexPerMW.land + capexPerMW.sitework, color: 'bg-green-500', icon: Building2 },
    { name: 'Network/Security', value: capexPerMW.networkSecurity, color: 'bg-purple-500', icon: Shield },
  ];

  const opexBreakdown = [
    { name: 'Electricity', value: opexPerMWYear.power, color: 'bg-yellow-500', percentage: (opexPerMWYear.power / totalOpexPerMWYear * 100).toFixed(0) },
    { name: 'Labor', value: opexPerMWYear.labor, color: 'bg-blue-500', percentage: (opexPerMWYear.labor / totalOpexPerMWYear * 100).toFixed(0) },
    { name: 'Maintenance', value: opexPerMWYear.maintenance, color: 'bg-cyan-500', percentage: (opexPerMWYear.maintenance / totalOpexPerMWYear * 100).toFixed(0) },
    { name: 'Insurance', value: opexPerMWYear.insurance, color: 'bg-green-500', percentage: (opexPerMWYear.insurance / totalOpexPerMWYear * 100).toFixed(0) },
    { name: 'Other', value: opexPerMWYear.network + opexPerMWYear.other, color: 'bg-purple-500', percentage: ((opexPerMWYear.network + opexPerMWYear.other) / totalOpexPerMWYear * 100).toFixed(0) },
  ];

  const buildCostComparison = [
    { type: 'Warehouse (Air)', costPerMW: '$600-800K', buildTime: '12-18 mo', pue: `${PUE_RANGES.AIR_COOLED.min.toFixed(2)}-${PUE_RANGES.AIR_COOLED.typical.toFixed(2)}`, notes: 'Best for large scale' },
    { type: 'Container (RDHX)', costPerMW: '$800K-1.2M', buildTime: '4-8 wks', pue: `${PUE_RANGES.HYDRO_COOLED.typical.toFixed(2)}-${PUE_RANGES.HYDRO_COOLED.max.toFixed(2)}`, notes: 'Fast deployment' },
    { type: 'Immersion Container', costPerMW: '$1.2-1.8M', buildTime: '6-10 wks', pue: `${PUE_RANGES.IMMERSION_SINGLE_PHASE.min.toFixed(2)}-${PUE_RANGES.IMMERSION_SINGLE_PHASE.max.toFixed(2)}`, notes: 'Highest efficiency' },
    { type: 'Prefab Modular', costPerMW: '$700K-1M', buildTime: '6-10 mo', pue: `${PUE_RANGES.AIR_COOLED.min.toFixed(2)}-${PUE_RANGES.HYDRO_COOLED.max.toFixed(2)}`, notes: 'Balanced approach' },
  ];

  // NPV/IRR Financial Analysis Framework
  const financialAnalysis = {
    npv: {
      name: 'Net Present Value (NPV)',
      formula: 'NPV = Σ [CFt / (1 + r)^t] - Initial Investment',
      description: 'Sum of discounted future cash flows minus initial investment. NPV > 0 means project creates value.',
      variables: [
        { symbol: 'CFt', meaning: 'Cash flow at time t', typical: 'Annual mining revenue - OpEx' },
        { symbol: 'r', meaning: 'Discount rate', typical: '10-15% for mining operations' },
        { symbol: 't', meaning: 'Time period', typical: '5-7 year project horizon' },
      ],
      interpretation: [
        { result: 'NPV > 0', meaning: 'Project creates value, accept investment' },
        { result: 'NPV = 0', meaning: 'Project breaks even at discount rate' },
        { result: 'NPV < 0', meaning: 'Project destroys value, reject or renegotiate' },
      ],
    },
    irr: {
      name: 'Internal Rate of Return (IRR)',
      formula: '0 = Σ [CFt / (1 + IRR)^t] - Initial Investment',
      description: 'Discount rate that makes NPV equal to zero. Compare IRR to hurdle rate.',
      benchmarks: [
        { category: 'Conservative', irr: '15-20%', risk: 'Low', description: 'Stable power, proven site' },
        { category: 'Moderate', irr: '25-35%', risk: 'Medium', description: 'Standard mining operation' },
        { category: 'Aggressive', irr: '40-60%', risk: 'High', description: 'New site, volatile power' },
        { category: 'Speculative', irr: '>60%', risk: 'Very High', description: 'Stranded assets, political risk' },
      ],
    },
    payback: {
      name: 'Payback Period',
      simple: 'Simple Payback = CapEx / Annual Net Cash Flow',
      discounted: 'Discounted Payback = Time when cumulative discounted CF > CapEx',
      targets: [
        { scenario: 'Excellent', period: '< 12 months', notes: 'Very low power cost, high BTC price' },
        { scenario: 'Good', period: '12-24 months', notes: 'Industry standard target' },
        { scenario: 'Acceptable', period: '24-36 months', notes: 'May require favorable BTC outlook' },
        { scenario: 'Risky', period: '> 36 months', notes: 'High difficulty/halving risk' },
      ],
    },
  };

  // Sensitivity Analysis Variables
  const sensitivityFactors = [
    { factor: 'BTC Price', impact: 'Very High', direction: 'Linear positive', sensitivity: '±10% BTC → ±15% profit' },
    { factor: 'Power Cost', impact: 'Very High', direction: 'Linear negative', sensitivity: '±$0.01/kWh → ±$4.2M/yr (50MW)' },
    { factor: 'Network Difficulty', impact: 'High', direction: 'Inverse', sensitivity: '+10% difficulty → -10% BTC mined' },
    { factor: 'Uptime', impact: 'High', direction: 'Linear positive', sensitivity: '1% uptime loss → ~$1.5M/yr (50MW)' },
    { factor: 'Miner Efficiency', impact: 'Medium', direction: 'Inverse', sensitivity: '-5 J/TH → +20% hashrate/MW' },
    { factor: 'Hardware Depreciation', impact: 'Medium', direction: 'Affects CAPEX recovery', sensitivity: '3yr vs 5yr life → major NPV impact' },
  ];

  // Depreciation Schedules (MACRS)
  const depreciationSchedules = {
    macrs5: {
      name: 'MACRS 5-Year (Mining Equipment)',
      description: 'ASICs, PDUs, cooling equipment typically qualify for 5-year MACRS',
      rates: [
        { year: 1, rate: '20.00%', cumulative: '20.00%' },
        { year: 2, rate: '32.00%', cumulative: '52.00%' },
        { year: 3, rate: '19.20%', cumulative: '71.20%' },
        { year: 4, rate: '11.52%', cumulative: '82.72%' },
        { year: 5, rate: '11.52%', cumulative: '94.24%' },
        { year: 6, rate: '5.76%', cumulative: '100.00%' },
      ],
      taxBenefit: 'Accelerated depreciation front-loads tax deductions, improving early cash flow',
    },
    macrs15: {
      name: 'MACRS 15-Year (Land Improvements)',
      description: 'Site work, fencing, roads depreciate over 15 years',
      taxBenefit: 'Slower depreciation, but still provides tax shield',
    },
    macrs39: {
      name: 'MACRS 39-Year (Commercial Buildings)',
      description: 'Warehouse structures use 39-year straight-line depreciation',
      taxBenefit: 'Minimal annual deduction, consider leasing vs ownership',
    },
    bonus: {
      name: 'Bonus Depreciation (100% Year 1)',
      description: 'Qualified property may be 100% expensed in year of acquisition (phase-out in effect)',
      eligibility: 'New & used equipment placed in service, not real property',
      taxBenefit: 'Massive first-year deduction, accelerates ROI significantly',
    },
  };

  // Financing Options Comparison
  const financingOptions = [
    {
      type: 'Self-Funded (Equity)',
      description: 'Deploy capital from company reserves or investors',
      pros: ['No interest costs', 'Full ownership', 'Maximum flexibility', 'No debt covenants'],
      cons: ['Ties up capital', 'Higher opportunity cost', 'Concentration risk'],
      typical: 'Well-capitalized mining companies, family offices',
      cost: '15-25% cost of equity (expected returns)',
    },
    {
      type: 'Equipment Financing',
      description: 'Asset-backed loans secured by miners and equipment',
      pros: ['Preserves cash', 'Equipment as collateral', 'Fixed payments', 'Builds credit'],
      cons: ['Interest expense (8-15%)', 'Equipment pledged', 'Covenants possible'],
      typical: 'Most common for ASIC purchases',
      cost: '8-15% APR depending on credit',
    },
    {
      type: 'Power Purchase Agreement (PPA)',
      description: 'Off-take agreement with power provider, may include financing',
      pros: ['Locked-in power rates', 'Provider may fund infrastructure', 'Aligned incentives'],
      cons: ['Long-term commitment (5-15 yrs)', 'Take-or-pay clauses', 'Limited flexibility'],
      typical: 'Behind-the-meter, stranded gas, curtailed renewable',
      cost: 'Power rate premium (often offset by stability)',
    },
    {
      type: 'Sale-Leaseback',
      description: 'Sell facility to investor, lease it back for operations',
      pros: ['Immediate cash infusion', 'Off-balance-sheet', 'Retain operations'],
      cons: ['Long-term lease payments', 'Loss of ownership', 'Landlord approval for changes'],
      typical: 'Real estate investors, REITs, infrastructure funds',
      cost: '6-10% cap rate equivalent',
    },
    {
      type: 'Hashrate Forward Contracts',
      description: 'Pre-sell future hashrate production for upfront capital',
      pros: ['Non-dilutive funding', 'Based on production', 'Hedges BTC exposure'],
      cons: ['Gives up upside', 'Performance obligations', 'Counterparty risk'],
      typical: 'Institutional miners, project financing',
      cost: 'Discount to spot (10-30% depending on term)',
    },
  ];

  return (
    <DCESectionWrapper theme="light" id="economics">
      <LearningObjectives
        objectives={[
          "Understand Total Cost of Ownership (TCO) for mining facilities",
          "Learn CapEx breakdown: electrical, building, cooling, land, security",
          "Analyze OpEx: electricity dominates at 85%+ of operating costs",
          "Calculate payback periods based on facility size and power costs"
        ]}
        estimatedTime="12 min"
        prerequisites={[
          { title: "Operations & Monitoring", href: "#operations" }
        ]}
      />
      
      <DCESectionHeader
        badge="Section 8 • Financial Analysis"
        badgeIcon={DollarSign}
        title="Datacenter Economics"
        description="Total Cost of Ownership, CapEx/OpEx breakdown, and profitability analysis"
        theme="light"
      />

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
          <span className="text-amber-600 text-sm">⚠️</span>
          <span className="text-xs text-amber-700">All costs are industry estimates and vary by location, vendor, and market conditions</span>
        </div>
      </motion.div>

      {/* Interactive Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] rounded-2xl p-6 md:p-8 mb-10 text-white"
      >
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-[hsl(var(--watt-bitcoin))]" />
          Quick TCO Calculator
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Inputs */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Facility Size (MW)</label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={facilitySize}
              onChange={(e) => setFacilitySize(Number(e.target.value))}
              className="w-full accent-[hsl(var(--watt-bitcoin))]"
            />
            <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">{facilitySize} MW</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Power Cost ($/kWh)</label>
            <input
              type="range"
              min="0.02"
              max="0.10"
              step="0.005"
              value={powerCost}
              onChange={(e) => setPowerCost(Number(e.target.value))}
              className="w-full accent-[hsl(var(--watt-bitcoin))]"
            />
            <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">${powerCost.toFixed(3)}/kWh</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">BTC Price</label>
            <input
              type="range"
              min="50000"
              max="200000"
              step="5000"
              value={btcPrice}
              onChange={(e) => setBtcPrice(Number(e.target.value))}
              className="w-full accent-[hsl(var(--watt-bitcoin))]"
            />
            <div className="text-2xl font-bold text-[hsl(var(--watt-bitcoin))]">${(btcPrice / 1000).toFixed(0)}K</div>
          </div>
        </div>
        
        {/* Results */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-xs text-white/70 mb-1">Total CapEx</div>
            <div className="text-xl font-bold">${(totalCapex / 1000000).toFixed(1)}M</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-xs text-white/70 mb-1">Annual OpEx</div>
            <div className="text-xl font-bold">${(totalOpexYear / 1000000).toFixed(1)}M</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-xs text-white/70 mb-1">Hashrate</div>
            <div className="text-xl font-bold">{facilityHashrate.toFixed(2)} EH/s</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-xs text-white/70 mb-1">Annual Revenue*</div>
            <div className="text-xl font-bold text-green-400">${(annualRevenue / 1000000).toFixed(1)}M</div>
          </div>
          <div className="bg-[hsl(var(--watt-bitcoin)/0.3)] rounded-xl p-4 text-center">
            <div className="text-xs text-white/70 mb-1">Payback</div>
            <div className={`text-xl font-bold ${paybackMonths < 24 ? 'text-green-400' : paybackMonths < 48 ? 'text-yellow-400' : 'text-red-400'}`}>
              {paybackMonths < 120 ? `${paybackMonths.toFixed(0)} mo` : 'N/A'}
            </div>
          </div>
        </div>
        
        <p className="text-xs text-white/50 mt-4">
          *Simplified model at 23 J/TH efficiency, 750 EH/s network, 95% uptime. Actual results vary.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        {/* CapEx Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <DCEContentCard variant="elevated">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                CapEx Breakdown (per MW)
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                Industry Est.
              </span>
            </div>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-foreground">
                $<AnimatedCounter end={totalCapexPerMW / 1000} decimals={0} suffix="K" />
              </div>
              <div className="text-sm text-muted-foreground">per MW installed</div>
            </div>
            
            <div className="space-y-3">
              {capexBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${item.color}/20 flex items-center justify-center`}>
                    <item.icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.name}</span>
                      <span className="font-medium text-foreground">${(item.value / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${(item.value / totalCapexPerMW) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DCEContentCard>
        </motion.div>

        {/* OpEx Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DCEContentCard variant="elevated">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                OpEx Breakdown (per MW/year)
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                Industry Est.
              </span>
            </div>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-foreground">
                $<AnimatedCounter end={totalOpexPerMWYear / 1000} decimals={0} suffix="K" />
              </div>
              <div className="text-sm text-muted-foreground">per MW per year</div>
            </div>
            
            <div className="space-y-3">
              {opexBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${item.color}/20 flex items-center justify-center`}>
                    <span className="text-xs font-bold text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.name}</span>
                      <span className="font-medium text-foreground">${(item.value / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-xs text-yellow-600">
                ⚡ Electricity is ~{((opexPerMWYear.power / totalOpexPerMWYear) * 100).toFixed(0)}% of operating costs. 
                Securing low power rates is critical to profitability.
              </p>
            </div>
          </DCEContentCard>
        </motion.div>
      </div>

      {/* Key Insight */}
      <DCEKeyInsight variant="insight" title="The Power Cost Equation" delay={0.25}>
        <p>
          At $0.05/kWh, a 50MW facility spends approximately <strong>$20M/year</strong> on electricity alone. 
          Every $0.01/kWh reduction saves <strong>$4.2M annually</strong>. This is why operators relocate to 
          regions with cheap hydro, stranded gas, or curtailed renewable power — even small rate differences 
          compound into millions in savings over facility lifetime.
        </p>
      </DCEKeyInsight>

      {/* Build Cost Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <DCEContentCard variant="bordered">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-foreground">Facility Type Cost Comparison</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
              Industry Est.
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Total installed cost including building, electrical, cooling, and infrastructure
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Facility Type</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Cost per MW</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Build Time</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">PUE</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {buildCostComparison.map((row) => (
                  <tr key={row.type} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium text-foreground">{row.type}</td>
                    <td className="py-3 px-4 text-[hsl(var(--watt-bitcoin))] font-mono">{row.costPerMW}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.buildTime}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.pue}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DCEContentCard>
      </motion.div>

      {/* NPV/IRR Financial Framework */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-8"
      >
        <DCEDeepDive title="Financial Analysis: NPV, IRR & Payback" icon={Calculator}>
          <div className="space-y-6">
            {/* NPV */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h4 className="font-bold text-foreground mb-2">{financialAnalysis.npv.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{financialAnalysis.npv.description}</p>
              <div className="bg-background rounded-lg p-3 mb-4 font-mono text-sm text-[hsl(var(--watt-bitcoin))] overflow-x-auto">
                {financialAnalysis.npv.formula}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-foreground mb-2">Variables:</div>
                  {financialAnalysis.npv.variables.map((v) => (
                    <div key={v.symbol} className="flex items-start gap-2 text-xs mb-1">
                      <span className="font-mono text-[hsl(var(--watt-bitcoin))] w-8">{v.symbol}</span>
                      <span className="text-muted-foreground">{v.meaning} ({v.typical})</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground mb-2">Interpretation:</div>
                  {financialAnalysis.npv.interpretation.map((i) => (
                    <div key={i.result} className="flex items-start gap-2 text-xs mb-1">
                      <span className={`font-mono w-16 ${
                        i.result.includes('>') ? 'text-green-500' :
                        i.result.includes('<') ? 'text-red-500' : 'text-yellow-500'
                      }`}>{i.result}</span>
                      <span className="text-muted-foreground">{i.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* IRR Benchmarks */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h4 className="font-bold text-foreground mb-2">{financialAnalysis.irr.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{financialAnalysis.irr.description}</p>
              <div className="grid md:grid-cols-2 gap-2">
                {financialAnalysis.irr.benchmarks.map((b) => (
                  <div key={b.category} className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        b.risk === 'Low' ? 'bg-green-500' :
                        b.risk === 'Medium' ? 'bg-yellow-500' :
                        b.risk === 'High' ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium text-foreground">{b.category}</span>
                    </div>
                    <span className="text-[hsl(var(--watt-bitcoin))] font-mono">{b.irr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payback Targets */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h4 className="font-bold text-foreground mb-2">{financialAnalysis.payback.name}</h4>
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div className="bg-background rounded-lg p-3 text-xs">
                  <div className="font-medium text-foreground mb-1">Simple Payback</div>
                  <div className="font-mono text-[hsl(var(--watt-bitcoin))]">{financialAnalysis.payback.simple}</div>
                </div>
                <div className="bg-background rounded-lg p-3 text-xs">
                  <div className="font-medium text-foreground mb-1">Discounted Payback</div>
                  <div className="font-mono text-[hsl(var(--watt-bitcoin))]">{financialAnalysis.payback.discounted}</div>
                </div>
              </div>
              <div className="space-y-2">
                {financialAnalysis.payback.targets.map((t) => (
                  <div key={t.scenario} className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-medium ${
                        t.scenario === 'Excellent' ? 'bg-green-500/20 text-green-500' :
                        t.scenario === 'Good' ? 'bg-blue-500/20 text-blue-500' :
                        t.scenario === 'Acceptable' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'
                      }`}>{t.scenario}</span>
                      <span className="font-mono text-foreground">{t.period}</span>
                    </div>
                    <span className="text-muted-foreground hidden md:inline">{t.notes}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DCEDeepDive>
      </motion.div>

      {/* Sensitivity Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <DCEContentCard variant="bordered">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            Sensitivity Analysis Factors
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Key variables that impact profitability — ranked by impact magnitude
          </p>
          <div className="space-y-2">
            {sensitivityFactors.map((factor) => (
              <div key={factor.factor} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${
                    factor.impact === 'Very High' ? 'bg-red-500' :
                    factor.impact === 'High' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} />
                  <span className="font-medium text-foreground text-sm">{factor.factor}</span>
                </div>
                <span className="text-xs text-muted-foreground hidden md:inline">{factor.sensitivity}</span>
              </div>
            ))}
          </div>
        </DCEContentCard>
      </motion.div>

      {/* Depreciation Schedules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mt-8"
      >
        <DCEDeepDive title="Depreciation Schedules (MACRS)" icon={PieChart}>
          <div className="space-y-4">
            {/* 5-Year MACRS with rates */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h4 className="font-bold text-foreground mb-1">{depreciationSchedules.macrs5.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{depreciationSchedules.macrs5.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {depreciationSchedules.macrs5.rates.map((r) => (
                  <div key={r.year} className="px-3 py-2 bg-background rounded-lg text-center border border-border">
                    <div className="text-[10px] text-muted-foreground">Yr {r.year}</div>
                    <div className="text-sm font-bold text-[hsl(var(--watt-bitcoin))]">{r.rate}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                💡 {depreciationSchedules.macrs5.taxBenefit}
              </div>
            </div>

            {/* Bonus Depreciation */}
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h4 className="font-bold text-foreground mb-1">{depreciationSchedules.bonus.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">{depreciationSchedules.bonus.description}</p>
              <p className="text-xs text-muted-foreground mb-2"><strong>Eligibility:</strong> {depreciationSchedules.bonus.eligibility}</p>
              <div className="text-xs text-muted-foreground bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg p-2 border border-[hsl(var(--watt-bitcoin)/0.2)]">
                ⚡ {depreciationSchedules.bonus.taxBenefit}
              </div>
            </div>

            {/* Other schedules */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <h4 className="font-bold text-foreground text-sm mb-1">{depreciationSchedules.macrs15.name}</h4>
                <p className="text-xs text-muted-foreground">{depreciationSchedules.macrs15.description}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <h4 className="font-bold text-foreground text-sm mb-1">{depreciationSchedules.macrs39.name}</h4>
                <p className="text-xs text-muted-foreground">{depreciationSchedules.macrs39.description}</p>
              </div>
            </div>
          </div>
        </DCEDeepDive>
      </motion.div>

      {/* Financing Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8"
      >
        <DCEContentCard variant="elevated">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            Financing Options Comparison
          </h3>
          <div className="space-y-4">
            {financingOptions.map((option) => (
              <div key={option.type} className="p-4 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-foreground">{option.type}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))] rounded whitespace-nowrap">
                    {option.cost}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="text-xs font-medium text-green-500 mb-1">Pros:</div>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {option.pros.slice(0, 3).map((pro) => (
                        <li key={pro}>✓ {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-red-500 mb-1">Cons:</div>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {option.cons.slice(0, 3).map((con) => (
                        <li key={con}>✗ {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                  <strong>Typical:</strong> {option.typical}
                </div>
              </div>
            ))}
          </div>
        </DCEContentCard>
      </motion.div>

      {/* Key Economic Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="mt-10 grid md:grid-cols-3 gap-4"
      >
        {[
          {
            title: 'Break-Even Power Cost',
            value: '$0.08/kWh',
            description: 'Maximum sustainable rate at current difficulty',
            trend: 'Decreasing with difficulty',
            icon: Zap,
          },
          {
            title: 'Target Payback',
            value: '18-24 mo',
            description: 'Industry standard for new builds',
            trend: 'Depends on BTC price',
            icon: TrendingUp,
          },
          {
            title: 'Hardware Refresh',
            value: '3-4 years',
            description: 'Typical ASIC replacement cycle',
            trend: 'Major cost consideration',
            icon: Wrench,
          },
        ].map((insight) => (
          <div key={insight.title} className="bg-card rounded-xl border border-border p-5 text-center hover:border-[hsl(var(--watt-bitcoin)/0.5)] transition-colors">
            <insight.icon className="w-8 h-8 text-[hsl(var(--watt-bitcoin))] mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground mb-1">{insight.value}</div>
            <div className="font-medium text-foreground text-sm mb-1">{insight.title}</div>
            <div className="text-xs text-muted-foreground">{insight.description}</div>
            <div className="text-xs text-[hsl(var(--watt-bitcoin))] mt-2">{insight.trend}</div>
          </div>
        ))}
      </motion.div>

      <SectionSummary
        takeaways={[
          "CapEx runs $600K-1.8M per MW depending on facility type (air/hydro/immersion)",
          "OpEx dominated by electricity (85%+) — power cost is the #1 profitability driver",
          "Target payback of 18-24 months with healthy margins; >48 months is risky",
          "Container solutions offer faster deployment (weeks) vs warehouse builds (12-18 months)"
        ]}
      />
    </DCESectionWrapper>
  );
};

export default DatacenterEconomicsSection;
