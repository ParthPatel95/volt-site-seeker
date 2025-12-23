import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Cpu, Clock, DollarSign, TrendingUp } from 'lucide-react';

const HardwareROISection = () => {
  const [machinePrice, setMachinePrice] = useState(5000);
  const [hashrate, setHashrate] = useState(200);
  const [power, setPower] = useState(3500);
  const [energyRate, setEnergyRate] = useState(0.05);
  const [btcPrice, setBtcPrice] = useState(100000);

  // Calculations
  const networkHashrate = 750e6; // TH/s
  const blockReward = 3.125;
  const blocksPerDay = 144;

  const dailyBtc = (hashrate / networkHashrate) * blocksPerDay * blockReward;
  const dailyRevenue = dailyBtc * btcPrice;
  const dailyPowerCost = (power / 1000) * 24 * energyRate;
  const dailyProfit = dailyRevenue - dailyPowerCost;
  const monthlyProfit = dailyProfit * 30;
  const paybackDays = dailyProfit > 0 ? machinePrice / dailyProfit : Infinity;
  const paybackMonths = paybackDays / 30;
  const annualROI = dailyProfit > 0 ? ((dailyProfit * 365) / machinePrice) * 100 : 0;

  const hardwareComparison = [
    { model: "Antminer S21 Pro", price: 6500, hashrate: 234, power: 3510, efficiency: 15 },
    { model: "Antminer S21", price: 5000, hashrate: 200, power: 3500, efficiency: 17.5 },
    { model: "Antminer S19 XP", price: 3000, hashrate: 140, power: 3010, efficiency: 21.5 },
    { model: "Whatsminer M50S", price: 2500, hashrate: 126, power: 3276, efficiency: 26 },
    { model: "Antminer S19 Pro", price: 1500, hashrate: 110, power: 3250, efficiency: 29.5 },
    { model: "Antminer S19", price: 800, hashrate: 95, power: 3250, efficiency: 34 },
  ];

  // Calculate ROI for each machine
  const machineROIs = hardwareComparison.map(hw => {
    const dBtc = (hw.hashrate / networkHashrate) * blocksPerDay * blockReward;
    const dRev = dBtc * btcPrice;
    const dCost = (hw.power / 1000) * 24 * energyRate;
    const dProfit = dRev - dCost;
    const payback = dProfit > 0 ? hw.price / dProfit : Infinity;
    const roi = dProfit > 0 ? ((dProfit * 365) / hw.price) * 100 : 0;
    return { ...hw, dailyProfit: dProfit, paybackDays: payback, annualROI: roi };
  });

  return (
    <section id="hardware-roi" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-watt-purple/10 text-watt-purple rounded-full text-sm font-medium mb-4">
              Hardware ROI
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hardware Investment Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Evaluate the return on investment for mining hardware purchases. 
              Payback periods and ROI vary significantly based on efficiency and market conditions.
            </p>
          </div>
        </ScrollReveal>

        {/* ROI Calculator */}
        <ScrollReveal delay={100}>
          <div className="bg-background rounded-2xl shadow-lg border border-border p-6 mb-8">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-watt-purple" />
              Hardware ROI Calculator
            </h3>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Machine Price: ${machinePrice.toLocaleString()}
                  </label>
                  <input
                    type="range" min="500" max="10000" step="100"
                    value={machinePrice}
                    onChange={(e) => setMachinePrice(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Hashrate: {hashrate} TH/s
                  </label>
                  <input
                    type="range" min="50" max="300" step="10"
                    value={hashrate}
                    onChange={(e) => setHashrate(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Power: {power}W
                  </label>
                  <input
                    type="range" min="2000" max="5000" step="100"
                    value={power}
                    onChange={(e) => setPower(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Energy: ${energyRate.toFixed(3)}/kWh
                  </label>
                  <input
                    type="range" min="0.02" max="0.10" step="0.005"
                    value={energyRate}
                    onChange={(e) => setEnergyRate(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    BTC Price: ${btcPrice.toLocaleString()}
                  </label>
                  <input
                    type="range" min="30000" max="200000" step="1000"
                    value={btcPrice}
                    onChange={(e) => setBtcPrice(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-watt-success/10 rounded-xl p-4 text-center">
                  <DollarSign className="w-6 h-6 text-watt-success mx-auto mb-2" />
                  <div className="text-2xl font-bold text-watt-success">
                    ${dailyProfit.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Daily Profit</div>
                </div>
                <div className="bg-watt-bitcoin/10 rounded-xl p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-watt-bitcoin mx-auto mb-2" />
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    ${monthlyProfit.toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Monthly Profit</div>
                </div>
                <div className="bg-watt-purple/10 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-watt-purple mx-auto mb-2" />
                  <div className="text-2xl font-bold text-watt-purple">
                    {paybackMonths < 100 ? paybackMonths.toFixed(1) : '∞'}
                  </div>
                  <div className="text-xs text-muted-foreground">Payback (months)</div>
                </div>
                <div className="bg-blue-500/10 rounded-xl p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-500">
                    {annualROI.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Annual ROI</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Hardware Comparison */}
        <ScrollReveal delay={200}>
          <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Hardware ROI Comparison
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              At ${energyRate.toFixed(3)}/kWh and ${btcPrice.toLocaleString()} BTC
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-foreground font-semibold">Model</th>
                    <th className="text-right py-3 px-4 text-foreground font-semibold">Price</th>
                    <th className="text-right py-3 px-4 text-foreground font-semibold">Efficiency</th>
                    <th className="text-right py-3 px-4 text-foreground font-semibold">Daily Profit</th>
                    <th className="text-right py-3 px-4 text-foreground font-semibold">Payback</th>
                    <th className="text-right py-3 px-4 text-foreground font-semibold">Annual ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {machineROIs.map((hw, idx) => (
                    <tr key={idx} className={`border-b border-border ${hw.dailyProfit <= 0 ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-4 font-medium text-foreground">{hw.model}</td>
                      <td className="py-3 px-4 text-right text-foreground">${hw.price.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-watt-purple font-medium">{hw.efficiency} J/TH</td>
                      <td className={`py-3 px-4 text-right font-bold ${hw.dailyProfit > 0 ? 'text-watt-success' : 'text-red-500'}`}>
                        ${hw.dailyProfit.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-foreground">
                        {hw.paybackDays < 1000 ? `${(hw.paybackDays / 30).toFixed(1)} mo` : 'N/A'}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${hw.annualROI > 100 ? 'text-watt-success' : hw.annualROI > 0 ? 'text-watt-bitcoin' : 'text-red-500'}`}>
                        {hw.annualROI > 0 ? `${hw.annualROI.toFixed(0)}%` : 'N/A'}
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

export default HardwareROISection;
