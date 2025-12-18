import { useState, useMemo } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Calculator, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const ProfitabilityAnalysisSection = () => {
  const [btcPrice, setBtcPrice] = useState(100000);
  const [hashrate, setHashrate] = useState(200); // TH/s per machine
  const [powerWatts, setPowerWatts] = useState(3000); // watts per machine
  const [machineCount, setMachineCount] = useState(100);
  const [energyRate, setEnergyRate] = useState(0.05);

  const calculations = useMemo(() => {
    const networkHashrate = 750; // EH/s
    const blockReward = 3.125;
    const blocksPerDay = 144;

    // Revenue
    const totalHashrate = hashrate * machineCount;
    const dailyBtc = (totalHashrate / (networkHashrate * 1e6)) * blocksPerDay * blockReward;
    const dailyRevenue = dailyBtc * btcPrice;
    const monthlyRevenue = dailyRevenue * 30;

    // Costs
    const totalPowerKw = (powerWatts * machineCount) / 1000;
    const dailyKwh = totalPowerKw * 24;
    const dailyEnergyCost = dailyKwh * energyRate;
    const monthlyEnergyCost = dailyEnergyCost * 30;

    // Other costs (estimated)
    const monthlyHosting = totalPowerKw * 3;
    const monthlyMaintenance = machineCount * 5;
    const monthlyLabor = Math.ceil(machineCount / 200) * 5000;
    const totalMonthlyCost = monthlyEnergyCost + monthlyHosting + monthlyMaintenance + monthlyLabor;

    // Profit
    const monthlyProfit = monthlyRevenue - totalMonthlyCost;
    const profitMargin = (monthlyProfit / monthlyRevenue) * 100;
    const breakEvenPrice = (totalMonthlyCost / (dailyBtc * 30));
    const efficiency = powerWatts / hashrate; // J/TH

    return {
      dailyBtc,
      dailyRevenue,
      monthlyRevenue,
      dailyEnergyCost,
      monthlyEnergyCost,
      totalMonthlyCost,
      monthlyProfit,
      profitMargin,
      breakEvenPrice,
      efficiency,
      totalHashrate,
      totalPowerKw
    };
  }, [btcPrice, hashrate, powerWatts, machineCount, energyRate]);

  const efficiencyBenchmarks = [
    { gen: "S9 (2017)", efficiency: 98, hashrate: 14, status: "Obsolete" },
    { gen: "S17 (2019)", efficiency: 45, hashrate: 56, status: "Obsolete" },
    { gen: "S19 (2020)", efficiency: 34, hashrate: 95, status: "End of life" },
    { gen: "S19 XP (2022)", efficiency: 21.5, hashrate: 140, status: "Current" },
    { gen: "S21 (2024)", efficiency: 17.5, hashrate: 200, status: "Latest" },
    { gen: "S21 Pro (2024)", efficiency: 15, hashrate: 234, status: "Latest" },
  ];

  return (
    <section id="profitability" className="py-20 bg-watt-light">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-success/10 text-watt-success rounded-full text-sm font-medium mb-4">
              Profitability Analysis
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Mining Profitability Calculator
            </h2>
            <p className="text-watt-navy/70 max-w-2xl mx-auto">
              Model your mining operation's profitability based on hardware,
              energy costs, and market conditions.
            </p>
          </div>
        </ScrollReveal>

        {/* Full Calculator */}
        <ScrollReveal delay={100}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-watt-success" />
              Profitability Model
            </h3>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Inputs */}
              <div className="space-y-5">
                <h4 className="font-semibold text-watt-navy border-b pb-2">Inputs</h4>
                
                <div>
                  <label className="block text-sm font-medium text-watt-navy mb-2">
                    BTC Price: ${btcPrice.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="30000"
                    max="200000"
                    step="1000"
                    value={btcPrice}
                    onChange={(e) => setBtcPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-watt-navy mb-2">
                    Machine Count: {machineCount}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={machineCount}
                    onChange={(e) => setMachineCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-watt-navy mb-2">
                    Hashrate/Machine: {hashrate} TH/s
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    step="10"
                    value={hashrate}
                    onChange={(e) => setHashrate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-watt-navy mb-2">
                    Power/Machine: {powerWatts}W
                  </label>
                  <input
                    type="range"
                    min="1500"
                    max="5000"
                    step="100"
                    value={powerWatts}
                    onChange={(e) => setPowerWatts(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-watt-navy mb-2">
                    Energy Rate: ${energyRate.toFixed(3)}/kWh
                  </label>
                  <input
                    type="range"
                    min="0.02"
                    max="0.10"
                    step="0.005"
                    value={energyRate}
                    onChange={(e) => setEnergyRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <h4 className="font-semibold text-watt-navy border-b pb-2">Key Metrics</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-watt-navy/60">Total Hashrate</div>
                    <div className="font-bold text-watt-navy">{(calculations.totalHashrate / 1000).toFixed(1)} PH/s</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-watt-navy/60">Total Power</div>
                    <div className="font-bold text-watt-navy">{calculations.totalPowerKw.toLocaleString()} kW</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-watt-navy/60">Efficiency</div>
                    <div className="font-bold text-watt-purple">{calculations.efficiency.toFixed(1)} J/TH</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-watt-navy/60">Daily BTC</div>
                    <div className="font-bold text-watt-bitcoin">{calculations.dailyBtc.toFixed(4)}</div>
                  </div>
                </div>

                <div className="bg-watt-success/10 rounded-xl p-4">
                  <div className="text-sm text-watt-navy/60 mb-1">Monthly Revenue</div>
                  <div className="text-2xl font-bold text-watt-success">
                    ${calculations.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4">
                  <div className="text-sm text-watt-navy/60 mb-1">Monthly Costs</div>
                  <div className="text-2xl font-bold text-red-500">
                    ${calculations.totalMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <h4 className="font-semibold text-watt-navy border-b pb-2">Results</h4>
                
                <div className={`rounded-xl p-6 text-center ${calculations.monthlyProfit >= 0 ? 'bg-watt-success/20' : 'bg-red-100'}`}>
                  <div className="text-sm text-watt-navy/60 mb-1">Monthly Profit</div>
                  <div className={`text-3xl font-bold ${calculations.monthlyProfit >= 0 ? 'text-watt-success' : 'text-red-500'}`}>
                    {calculations.monthlyProfit >= 0 ? '+' : ''}${calculations.monthlyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {calculations.profitMargin >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-watt-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`font-medium ${calculations.profitMargin >= 0 ? 'text-watt-success' : 'text-red-500'}`}>
                      {calculations.profitMargin.toFixed(1)}% margin
                    </span>
                  </div>
                </div>

                <div className="bg-watt-navy rounded-xl p-4 text-center">
                  <div className="text-sm text-white/60 mb-1">Break-even BTC Price</div>
                  <div className="text-xl font-bold text-white">
                    ${calculations.breakEvenPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>

                {calculations.breakEvenPrice > btcPrice && (
                  <div className="bg-red-100 rounded-xl p-4 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">
                      Operating below break-even. Consider reducing energy costs or upgrading hardware.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Efficiency Benchmarks */}
        <ScrollReveal delay={200}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-watt-navy mb-6">
              Hardware Efficiency Evolution
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Generation</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Efficiency (J/TH)</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Hashrate (TH/s)</th>
                    <th className="text-left py-3 px-4 text-watt-navy font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {efficiencyBenchmarks.map((hw, idx) => (
                    <tr key={idx} className={`border-b border-gray-100 ${hw.status === 'Latest' ? 'bg-watt-success/5' : ''}`}>
                      <td className="py-3 px-4 font-medium text-watt-navy">{hw.gen}</td>
                      <td className="py-3 px-4 font-bold text-watt-purple">{hw.efficiency} J/TH</td>
                      <td className="py-3 px-4 text-watt-navy">{hw.hashrate} TH/s</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          hw.status === 'Latest' ? 'bg-watt-success/20 text-watt-success' :
                          hw.status === 'Current' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {hw.status}
                        </span>
                      </td>
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
};

export default ProfitabilityAnalysisSection;
