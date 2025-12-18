import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Zap, Building2, Users, Wrench, Snowflake, DollarSign } from 'lucide-react';

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
      color: "bg-watt-bitcoin",
      description: "Primary operating expense - varies by location"
    },
    { 
      category: "Hosting/Rent", 
      icon: Building2,
      percentage: (monthlyHosting / totalMonthlyCost * 100).toFixed(0),
      amount: monthlyHosting,
      color: "bg-watt-purple",
      description: "Facility lease, infrastructure costs"
    },
    { 
      category: "Labor", 
      icon: Users,
      percentage: (monthlyStaffCost / totalMonthlyCost * 100).toFixed(0),
      amount: monthlyStaffCost,
      color: "bg-blue-500",
      description: "Operations, security, management"
    },
    { 
      category: "Maintenance", 
      icon: Wrench,
      percentage: (monthlyMaintenance / totalMonthlyCost * 100).toFixed(0),
      amount: monthlyMaintenance,
      color: "bg-watt-success",
      description: "Repairs, parts, consumables"
    },
  ];

  const energyRates = [
    { region: "Alberta (AESO)", rate: "$0.025-0.045", type: "Deregulated", notes: "Pool price + transmission" },
    { region: "Texas (ERCOT)", rate: "$0.030-0.055", type: "Deregulated", notes: "Wholesale + delivery" },
    { region: "Paraguay", rate: "$0.020-0.035", type: "Hydro PPA", notes: "Itaipu surplus" },
    { region: "US Average", rate: "$0.070-0.120", type: "Retail", notes: "Not competitive" },
    { region: "Iceland", rate: "$0.035-0.045", type: "Geothermal", notes: "100% renewable" },
    { region: "Kazakhstan", rate: "$0.025-0.040", type: "Mixed", notes: "Regulatory risk" },
  ];

  return (
    <section id="costs" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium mb-4">
              Cost Structure
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Mining Cost Analysis
            </h2>
            <p className="text-watt-navy/70 max-w-2xl mx-auto">
              Understanding your cost structure is critical for profitability. 
              Electricity typically accounts for 60-80% of operating expenses.
            </p>
          </div>
        </ScrollReveal>

        {/* Interactive Cost Calculator */}
        <ScrollReveal delay={100}>
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-watt-bitcoin" />
              Operating Cost Calculator
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-watt-navy mb-2">
                    Energy Rate ($/kWh)
                  </label>
                  <input
                    type="range"
                    min="0.02"
                    max="0.12"
                    step="0.005"
                    value={powerCost}
                    onChange={(e) => setPowerCost(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-watt-navy/50 mt-1">
                    <span>$0.02</span>
                    <span className="text-watt-bitcoin font-bold">${powerCost.toFixed(3)}</span>
                    <span>$0.12</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-watt-navy mb-2">
                    Power Capacity (kW)
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={powerUsage}
                    onChange={(e) => setPowerUsage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-watt-navy/50 mt-1">
                    <span>100 kW</span>
                    <span className="text-watt-purple font-bold">{powerUsage.toLocaleString()} kW</span>
                    <span>10 MW</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-watt-navy mb-2">
                    Staff Count
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={staffCount}
                    onChange={(e) => setStaffCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-watt-navy/50 mt-1">
                    <span>1</span>
                    <span className="text-blue-500 font-bold">{staffCount} staff</span>
                    <span>20</span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <div className="space-y-3 mb-4">
                  {costBreakdown.map((cost, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <cost.icon className="w-4 h-4 text-watt-navy/60" />
                          <span className="font-medium text-watt-navy">{cost.category}</span>
                        </div>
                        <span className="font-bold text-watt-navy">
                          ${cost.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cost.color} rounded-full`}
                            style={{ width: `${cost.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-watt-navy/60 w-12 text-right">{cost.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-watt-navy rounded-xl p-4 text-center">
                  <div className="text-sm text-white/60 mb-1">Total Monthly OpEx</div>
                  <div className="text-3xl font-bold text-white">
                    ${totalMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-watt-bitcoin mt-1">
                    ${(totalMonthlyCost / powerUsage).toFixed(2)}/kW/month
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Energy Rates Comparison */}
        <ScrollReveal delay={200}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-watt-bitcoin" />
              Global Energy Rates Comparison
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Region</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Rate Range</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Market Type</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {energyRates.map((rate, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-watt-navy">{rate.region}</td>
                      <td className="py-3 px-4 font-bold text-watt-success">{rate.rate}</td>
                      <td className="py-3 px-4 text-watt-navy/70">{rate.type}</td>
                      <td className="py-3 px-4 text-watt-navy/60 hidden md:table-cell">{rate.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Cooling Overhead */}
        <ScrollReveal delay={300}>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { method: "Air Cooling", pue: "1.3-1.6", overhead: "30-60%", icon: "🌀" },
              { method: "Hydro Cooling", pue: "1.15-1.25", overhead: "15-25%", icon: "💧" },
              { method: "Immersion", pue: "1.02-1.08", overhead: "2-8%", icon: "🔥" },
            ].map((cooling, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                <div className="text-3xl mb-3">{cooling.icon}</div>
                <h4 className="font-bold text-watt-navy mb-2">{cooling.method}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-watt-navy/70">PUE Range</span>
                    <span className="font-medium text-watt-navy">{cooling.pue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-watt-navy/70">Cooling Overhead</span>
                    <span className="font-medium text-watt-bitcoin">{cooling.overhead}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CostStructureSection;
