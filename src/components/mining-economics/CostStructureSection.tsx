import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Zap, Building2, Users, Wrench, DollarSign, Info, Thermometer, Globe } from 'lucide-react';
import { PUE_RANGES, DATA_DISCLAIMER } from '@/constants/mining-data';
import { MECSectionWrapper, MECSectionHeader, MECContentCard, MECKeyInsight, MECDeepDive, MECCallout, MECMetricDisplay } from './shared';
import { motion } from 'framer-motion';

const CostStructureSection = () => {
  const [powerCost, setPowerCost] = useState(0.05);
  const [powerUsage, setPowerUsage] = useState(3000); // kW
  const [staffCount, setStaffCount] = useState(5);

  const monthlyPowerCost = powerUsage * 24 * 30 * powerCost;
  const monthlyStaffCost = staffCount * 6000; // avg salary
  const monthlyMaintenance = powerUsage * 0.5; // $0.50/kW estimate
  const monthlyHosting = powerUsage * 3; // $3/kW estimate
  const totalMonthlyCost = monthlyPowerCost + monthlyStaffCost + monthlyMaintenance + monthlyHosting;

  const costBreakdown = [
    { 
      category: "Electricity", 
      icon: Zap,
      percentage: (monthlyPowerCost / totalMonthlyCost * 100).toFixed(0),
      amount: monthlyPowerCost,
      color: "hsl(var(--watt-bitcoin))",
      description: "Primary operating expense - varies by location"
    },
    { 
      category: "Hosting/Rent", 
      icon: Building2,
      percentage: (monthlyHosting / totalMonthlyCost * 100).toFixed(0),
      amount: monthlyHosting,
      color: "hsl(var(--watt-purple))",
      description: "Facility lease, infrastructure costs"
    },
    { 
      category: "Labor", 
      icon: Users,
      percentage: (monthlyStaffCost / totalMonthlyCost * 100).toFixed(0),
      amount: monthlyStaffCost,
      color: "#3b82f6",
      description: "Operations, security, management"
    },
    { 
      category: "Maintenance", 
      icon: Wrench,
      percentage: (monthlyMaintenance / totalMonthlyCost * 100).toFixed(0),
      amount: monthlyMaintenance,
      color: "hsl(var(--watt-success))",
      description: "Repairs, parts, consumables"
    },
  ];

  const energyRates = [
    { region: "Alberta (AESO)", rate: "$0.025-0.045", type: "Deregulated", notes: "Pool price + transmission", competitive: true },
    { region: "Texas (ERCOT)", rate: "$0.030-0.055", type: "Deregulated", notes: "Wholesale + delivery", competitive: true },
    { region: "Paraguay", rate: "$0.020-0.035", type: "Hydro PPA", notes: "Itaipu surplus", competitive: true },
    { region: "Iceland", rate: "$0.035-0.045", type: "Geothermal", notes: "100% renewable", competitive: true },
    { region: "Kazakhstan", rate: "$0.025-0.040", type: "Mixed", notes: "Regulatory risk", competitive: true },
    { region: "US Average", rate: "$0.070-0.120", type: "Retail", notes: "Not competitive", competitive: false },
  ];

  const coolingMethods = [
    { 
      method: "Air Cooling", 
      pue: `${PUE_RANGES.AIR_COOLED.min.toFixed(2)}-${PUE_RANGES.AIR_COOLED.max.toFixed(2)}`, 
      overhead: `${Math.round((PUE_RANGES.AIR_COOLED.min - 1) * 100)}-${Math.round((PUE_RANGES.AIR_COOLED.max - 1) * 100)}%`, 
      icon: "🌀",
      pros: "Lowest CAPEX, simple maintenance",
      cons: "Climate dependent, dust issues"
    },
    { 
      method: "Hydro Cooling", 
      pue: `${PUE_RANGES.HYDRO_COOLED.min.toFixed(2)}-${PUE_RANGES.HYDRO_COOLED.max.toFixed(2)}`, 
      overhead: `${Math.round((PUE_RANGES.HYDRO_COOLED.min - 1) * 100)}-${Math.round((PUE_RANGES.HYDRO_COOLED.max - 1) * 100)}%`, 
      icon: "💧",
      pros: "Good efficiency, moderate cost",
      cons: "Water requirements, some complexity"
    },
    { 
      method: "Immersion", 
      pue: `${PUE_RANGES.IMMERSION_SINGLE_PHASE.min.toFixed(2)}-${PUE_RANGES.IMMERSION_SINGLE_PHASE.max.toFixed(2)}`, 
      overhead: `${Math.round((PUE_RANGES.IMMERSION_SINGLE_PHASE.min - 1) * 100)}-${Math.round((PUE_RANGES.IMMERSION_SINGLE_PHASE.max - 1) * 100)}%`, 
      icon: "🔥",
      pros: "Best efficiency, overclocking potential",
      cons: "High CAPEX, specialized maintenance"
    },
  ];

  return (
    <MECSectionWrapper id="cost-structure" theme="light">
      <ScrollReveal>
        <MECSectionHeader
          badge="Cost Structure"
          badgeIcon={DollarSign}
          title="Mining Cost Analysis"
          description="Understanding your cost structure is critical for profitability. Electricity typically accounts for 60-80% of operating expenses, making energy sourcing the most important decision."
          accentColor="bitcoin"
        />
      </ScrollReveal>

      {/* Interactive Cost Calculator */}
      <ScrollReveal delay={100}>
        <MECContentCard 
          variant="elevated" 
          headerIcon={DollarSign} 
          headerTitle="Operating Cost Calculator" 
          headerIconColor="bitcoin"
          className="mb-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Energy Rate ($/kWh)
                </label>
                <input
                  type="range"
                  min="0.02"
                  max="0.12"
                  step="0.005"
                  value={powerCost}
                  onChange={(e) => setPowerCost(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>$0.02</span>
                  <span className="font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>${powerCost.toFixed(3)}</span>
                  <span>$0.12</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Power Capacity (kW)
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={powerUsage}
                  onChange={(e) => setPowerUsage(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>100 kW</span>
                  <span className="font-bold" style={{ color: 'hsl(var(--watt-purple))' }}>{powerUsage.toLocaleString()} kW</span>
                  <span>10 MW</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Staff Count
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={staffCount}
                  onChange={(e) => setStaffCount(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>1</span>
                  <span className="font-bold" style={{ color: '#3b82f6' }}>{staffCount} staff</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <div className="space-y-3 mb-4">
                {costBreakdown.map((cost, idx) => (
                  <motion.div 
                    key={idx} 
                    className="bg-background rounded-lg p-3 border border-border"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <cost.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{cost.category}</span>
                      </div>
                      <span className="font-bold text-foreground">
                        ${cost.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: cost.color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${cost.percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          viewport={{ once: true }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{cost.percentage}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <MECMetricDisplay
                label="Total Monthly OpEx"
                value={`$${totalMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                subValue={`$${(totalMonthlyCost / powerUsage).toFixed(2)}/kW/month`}
              />
            </div>
          </div>
        </MECContentCard>
      </ScrollReveal>

      {/* Why Energy Dominates */}
      <ScrollReveal delay={150}>
        <MECKeyInsight variant="insight" title="Why Energy is 60-80% of Costs" className="mb-8">
          <p className="mb-3">
            Mining is fundamentally an energy arbitrage business. Your ASICs run 24/7, consuming 
            power constantly. Unlike other businesses where labor or materials dominate costs, 
            in mining, electricity is the overwhelming factor.
          </p>
          <p>
            <strong>Example:</strong> A 100-machine operation (~300 kW) at $0.05/kWh spends 
            ~$10,800/month on power alone. At $0.08/kWh, that jumps to ~$17,280 — a $6,480 
            difference that directly impacts your bottom line.
          </p>
        </MECKeyInsight>
      </ScrollReveal>

      {/* Deep Dive: All-in Energy Cost */}
      <ScrollReveal delay={175}>
        <MECDeepDive title="Understanding 'All-In' Energy Costs" icon={Zap} className="mb-8">
          <div className="space-y-4">
            <p>
              The headline energy rate is just part of the story. Your <strong>all-in cost</strong> 
              includes multiple components that can add 20-50% to your effective rate:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-3 border border-border">
                <h5 className="font-semibold text-foreground mb-1">Energy Charge</h5>
                <p className="text-xs text-muted-foreground">The base $/kWh rate for electricity consumed</p>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border">
                <h5 className="font-semibold text-foreground mb-1">Transmission/Distribution</h5>
                <p className="text-xs text-muted-foreground">Grid delivery charges, often $0.01-0.02/kWh</p>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border">
                <h5 className="font-semibold text-foreground mb-1">Demand Charges</h5>
                <p className="text-xs text-muted-foreground">Peak power fees based on highest usage</p>
              </div>
              <div className="bg-background rounded-lg p-3 border border-border">
                <h5 className="font-semibold text-foreground mb-1">Ancillary Services</h5>
                <p className="text-xs text-muted-foreground">Grid reliability fees, varies by market</p>
              </div>
            </div>
            <MECCallout variant="example" title="Real Example">
              Alberta AESO pool price might show $0.03/kWh, but after transmission (~$0.015) 
              and ancillary services (~$0.005), your all-in rate is closer to $0.05/kWh.
            </MECCallout>
          </div>
        </MECDeepDive>
      </ScrollReveal>

      {/* Energy Rates Comparison */}
      <ScrollReveal delay={200}>
        <MECContentCard 
          variant="elevated" 
          headerIcon={Globe} 
          headerTitle="Global Energy Rates Comparison" 
          headerIconColor="bitcoin"
          className="mb-8"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-foreground font-semibold">Region</th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold">Rate Range</th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold">Market Type</th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {energyRates.map((rate, idx) => (
                  <motion.tr 
                    key={idx} 
                    className={`border-b border-border ${!rate.competitive ? 'opacity-50' : ''}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: rate.competitive ? 1 : 0.5 }}
                    transition={{ delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <td className="py-3 px-4 font-medium text-foreground">{rate.region}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: rate.competitive ? 'hsl(var(--watt-success))' : '#ef4444' }}>
                      {rate.rate}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{rate.type}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{rate.notes}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <MECKeyInsight variant="warning" className="mt-6" title="Location is Destiny">
            A 3¢/kWh difference in energy cost can mean the difference between a 40% margin 
            and breaking even. Site selection based on energy rates is the single most important 
            decision for mining profitability.
          </MECKeyInsight>
        </MECContentCard>
      </ScrollReveal>

      {/* Cooling Overhead - PUE */}
      <ScrollReveal delay={300}>
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Thermometer className="w-5 h-5" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
          Cooling Methods & PUE Overhead
        </h3>
        <div className="grid md:grid-cols-3 gap-6 mb-4">
          {coolingMethods.map((cooling, idx) => (
            <motion.div 
              key={idx} 
              className="rounded-xl p-6 border border-border bg-gradient-to-br from-[hsl(var(--watt-success)/0.05)] to-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl mb-3">{cooling.icon}</div>
              <h4 className="font-bold text-foreground mb-2">{cooling.method}</h4>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PUE Range</span>
                  <span className="font-medium text-foreground">{cooling.pue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cooling Overhead</span>
                  <span className="font-medium" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{cooling.overhead}</span>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-muted-foreground"><span style={{ color: 'hsl(var(--watt-success))' }}>✓</span> {cooling.pros}</p>
                <p className="text-muted-foreground"><span style={{ color: '#ef4444' }}>✗</span> {cooling.cons}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Deep Dive: PUE */}
        <MECDeepDive title="What is PUE and Why It Matters" icon={Thermometer}>
          <div className="space-y-3">
            <p>
              <strong>Power Usage Effectiveness (PUE)</strong> measures total facility power 
              divided by IT equipment power. A PUE of 1.2 means for every 1 kW powering your 
              miners, you use 0.2 kW for cooling and infrastructure.
            </p>
            <MECCallout variant="formula" title="PUE Impact">
              At $0.05/kWh with 1 MW load: PUE 1.30 = $54K/month | PUE 1.10 = $47K/month (Save $7K/month)
            </MECCallout>
            <p className="text-xs">
              Lower PUE directly reduces your effective energy cost. A 0.2 PUE improvement 
              on a 10 MW facility can save $800K+ annually.
            </p>
          </div>
        </MECDeepDive>
        
        {/* Data Disclaimer */}
        <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{DATA_DISCLAIMER.short}</span>
        </div>
      </ScrollReveal>
    </MECSectionWrapper>
  );
};

export default CostStructureSection;
