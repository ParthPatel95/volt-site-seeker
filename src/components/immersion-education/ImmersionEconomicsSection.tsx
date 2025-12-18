import { useState, useMemo } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Calculator, DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function ImmersionEconomicsSection() {
  const [asicCount, setAsicCount] = useState(20);
  const [electricityRate, setElectricityRate] = useState(0.05);
  const [btcPrice, setBtcPrice] = useState(100000);
  const [fluidType, setFluidType] = useState<'mineral' | 'synthetic'>('mineral');

  const economics = useMemo(() => {
    // Air-cooled baseline
    const airHashrate = 200; // TH/s per S21
    const airPower = 3.5; // kW per S21
    const airPUE = 1.35;
    
    // Immersion with 25% OC
    const immersionHashrate = 250;
    const immersionPower = 4.2;
    const immersionPUE = 1.03;
    
    // Costs
    const fluidCostPerLiter = fluidType === 'mineral' ? 3 : 12;
    const fluidPerAsic = 60; // liters
    const tankCostPerAsic = 800;
    const heatExchangerCost = 5000 + asicCount * 200;
    const pumpingCost = 2000 + asicCount * 100;
    
    // Upfront costs
    const fluidCost = asicCount * fluidPerAsic * fluidCostPerLiter;
    const infrastructureCost = asicCount * tankCostPerAsic + heatExchangerCost + pumpingCost;
    const totalUpfront = fluidCost + infrastructureCost;
    
    // Daily operations - Air
    const airTotalPower = asicCount * airPower * airPUE;
    const airDailyKwh = airTotalPower * 24;
    const airDailyElectricity = airDailyKwh * electricityRate;
    const airTotalHashrate = asicCount * airHashrate;
    
    // Daily operations - Immersion
    const immersionTotalPower = asicCount * immersionPower * immersionPUE;
    const immersionDailyKwh = immersionTotalPower * 24;
    const immersionDailyElectricity = immersionDailyKwh * electricityRate;
    const immersionTotalHashrate = asicCount * immersionHashrate;
    
    // BTC mining (simplified - using rough network hashrate)
    const networkHashrate = 750e6; // 750 EH/s
    const btcPerDay = 450; // block rewards per day
    const airDailyBtc = (airTotalHashrate * 1e12 / (networkHashrate * 1e18)) * btcPerDay;
    const immersionDailyBtc = (immersionTotalHashrate * 1e12 / (networkHashrate * 1e18)) * btcPerDay;
    
    const airDailyRevenue = airDailyBtc * btcPrice;
    const immersionDailyRevenue = immersionDailyBtc * btcPrice;
    
    const airDailyProfit = airDailyRevenue - airDailyElectricity;
    const immersionDailyProfit = immersionDailyRevenue - immersionDailyElectricity;
    
    const dailyProfitIncrease = immersionDailyProfit - airDailyProfit;
    const paybackDays = totalUpfront / dailyProfitIncrease;
    
    // 5-year projection
    const years = 5;
    const airTotalProfit = airDailyProfit * 365 * years;
    const immersionTotalProfit = immersionDailyProfit * 365 * years - totalUpfront;
    
    return {
      totalUpfront,
      fluidCost,
      infrastructureCost,
      airDailyElectricity,
      immersionDailyElectricity,
      airTotalHashrate,
      immersionTotalHashrate,
      airDailyProfit,
      immersionDailyProfit,
      dailyProfitIncrease,
      paybackDays: Math.round(paybackDays),
      airTotalProfit,
      immersionTotalProfit,
      roi: ((immersionTotalProfit - airTotalProfit) / totalUpfront * 100).toFixed(0)
    };
  }, [asicCount, electricityRate, btcPrice, fluidType]);

  return (
    <section id="economics" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Economics & ROI Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate the financial case for immersion cooling - higher upfront investment 
              offset by increased hashrate and operational efficiency.
            </p>
          </div>
        </ScrollReveal>

        {/* ROI Calculator */}
        <ScrollReveal delay={100}>
          <div className="bg-card border border-border rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-6 h-6 text-cyan-500" />
              <h3 className="text-xl font-bold text-foreground">Immersion ROI Calculator</h3>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Number of S21 ASICs: {asicCount}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={asicCount}
                    onChange={(e) => setAsicCount(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Electricity Rate: ${electricityRate}/kWh
                  </label>
                  <input
                    type="range"
                    min="0.02"
                    max="0.12"
                    step="0.01"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    BTC Price: ${btcPrice.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="50000"
                    max="200000"
                    step="5000"
                    value={btcPrice}
                    onChange={(e) => setBtcPrice(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fluid Type
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFluidType('mineral')}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                        fluidType === 'mineral'
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="text-sm font-medium text-foreground">Mineral Oil</div>
                      <div className="text-xs text-muted-foreground">~$3/L</div>
                    </button>
                    <button
                      onClick={() => setFluidType('synthetic')}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                        fluidType === 'synthetic'
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="text-sm font-medium text-foreground">Synthetic Oil</div>
                      <div className="text-xs text-muted-foreground">~$12/L</div>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Results */}
              <div className="bg-muted/30 rounded-xl p-6">
                <h4 className="font-semibold text-foreground mb-4">Investment Summary</h4>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fluid Cost</span>
                    <span className="font-mono text-foreground">${economics.fluidCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Infrastructure</span>
                    <span className="font-mono text-foreground">${economics.infrastructureCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3">
                    <span className="font-medium text-foreground">Total Upfront</span>
                    <span className="font-mono font-bold text-cyan-500">${economics.totalUpfront.toLocaleString()}</span>
                  </div>
                </div>
                
                <h4 className="font-semibold text-foreground mb-4">Daily Operations</h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Air-Cooled</div>
                    <div className="text-sm font-medium text-foreground">{economics.airTotalHashrate} TH/s</div>
                    <div className="text-xs text-red-400">${economics.airDailyElectricity.toFixed(0)}/day power</div>
                  </div>
                  <div className="bg-cyan-500/10 rounded-lg p-3">
                    <div className="text-xs text-cyan-500 mb-1">Immersion (+25% OC)</div>
                    <div className="text-sm font-medium text-foreground">{economics.immersionTotalHashrate} TH/s</div>
                    <div className="text-xs text-amber-400">${economics.immersionDailyElectricity.toFixed(0)}/day power</div>
                  </div>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-foreground">Daily Profit Increase</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    +${economics.dailyProfitIncrease.toFixed(0)}/day
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Payback period: <span className="text-foreground font-medium">{economics.paybackDays} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 5-Year Projection */}
        <ScrollReveal delay={150}>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-cyan-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">
                {economics.paybackDays} days
              </div>
              <div className="text-sm text-muted-foreground">Payback Period</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-green-500 mb-1">
                +${((economics.immersionTotalProfit - economics.airTotalProfit) / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-muted-foreground">5-Year Additional Profit</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-orange-500 mb-1">
                {economics.roi}%
              </div>
              <div className="text-sm text-muted-foreground">5-Year ROI on Investment</div>
            </div>
          </div>
        </ScrollReveal>

        {/* Cost Comparison Table */}
        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-foreground">Air-Cooled vs Immersion Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Metric</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Air-Cooled</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Immersion</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'PUE', air: '1.30-1.50', immersion: '1.02-1.05', advantage: '~25% less cooling energy' },
                    { metric: 'Overclocking', air: 'Limited (thermal)', immersion: '+20-30%', advantage: 'Significant hashrate gain' },
                    { metric: 'ASIC Lifespan', air: '3-4 years', immersion: '5-7 years', advantage: 'Reduced replacement costs' },
                    { metric: 'Noise Level', air: '75-85 dB', immersion: '<55 dB', advantage: 'Site flexibility' },
                    { metric: 'Maintenance', air: 'Fan failures, dust', immersion: 'Fluid checks', advantage: 'Less downtime' },
                    { metric: 'Density', air: '1 kW/sq ft', immersion: '2-3 kW/sq ft', advantage: 'Smaller footprint' }
                  ].map((row, i) => (
                    <tr key={row.metric} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                      <td className="p-4 font-medium text-foreground">{row.metric}</td>
                      <td className="p-4 text-muted-foreground">{row.air}</td>
                      <td className="p-4 text-cyan-500">{row.immersion}</td>
                      <td className="p-4 text-sm text-green-500">{row.advantage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
