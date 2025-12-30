import { useState, useMemo } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, Cpu, Zap, DollarSign, Target } from 'lucide-react';
import { MECSectionWrapper, MECSectionHeader, MECContentCard, MECStatCard, MECKeyInsight, MECDeepDive, MECCallout, MECMetricDisplay } from './shared';
import { motion } from 'framer-motion';

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
    { gen: "S9 (2017)", efficiency: 98, hashrate: 14, status: "Obsolete", profitable: false },
    { gen: "S17 (2019)", efficiency: 45, hashrate: 56, status: "Obsolete", profitable: false },
    { gen: "S19 (2020)", efficiency: 34, hashrate: 95, status: "End of life", profitable: true },
    { gen: "S19 XP (2022)", efficiency: 21.5, hashrate: 140, status: "Current", profitable: true },
    { gen: "S21 (2024)", efficiency: 17.5, hashrate: 200, status: "Latest", profitable: true },
    { gen: "S21 Pro (2024)", efficiency: 15, hashrate: 234, status: "Latest", profitable: true },
  ];

  return (
    <MECSectionWrapper id="profitability" theme="gradient">
      <ScrollReveal>
        <MECSectionHeader
          badge="Profitability Analysis"
          badgeIcon={Calculator}
          title="Mining Profitability Calculator"
          description="Model your mining operation's profitability based on hardware, energy costs, and market conditions. Understand the variables that determine success or failure."
          accentColor="success"
        />
      </ScrollReveal>

      {/* Full Calculator */}
      <ScrollReveal delay={100}>
        <MECContentCard variant="elevated" headerIcon={Calculator} headerTitle="Profitability Model" headerIconColor="success" className="mb-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Inputs */}
            <div className="space-y-5">
              <h4 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: 'hsl(var(--watt-success))' }} />
                Input Variables
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  BTC Price: ${btcPrice.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="30000"
                  max="200000"
                  step="1000"
                  value={btcPrice}
                  onChange={(e) => setBtcPrice(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Machine Count: {machineCount}
                </label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={machineCount}
                  onChange={(e) => setMachineCount(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hashrate/Machine: {hashrate} TH/s
                </label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={hashrate}
                  onChange={(e) => setHashrate(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Power/Machine: {powerWatts}W
                </label>
                <input
                  type="range"
                  min="1500"
                  max="5000"
                  step="100"
                  value={powerWatts}
                  onChange={(e) => setPowerWatts(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Energy Rate: ${energyRate.toFixed(3)}/kWh
                </label>
                <input
                  type="range"
                  min="0.02"
                  max="0.10"
                  step="0.005"
                  value={energyRate}
                  onChange={(e) => setEnergyRate(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4" style={{ color: 'hsl(var(--watt-purple))' }} />
                Operation Metrics
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Total Hashrate</div>
                  <div className="font-bold text-foreground">{(calculations.totalHashrate / 1000).toFixed(1)} PH/s</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Total Power</div>
                  <div className="font-bold text-foreground">{calculations.totalPowerKw.toLocaleString()} kW</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Efficiency</div>
                  <div className="font-bold" style={{ color: 'hsl(var(--watt-purple))' }}>{calculations.efficiency.toFixed(1)} J/TH</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Daily BTC</div>
                  <div className="font-bold" style={{ color: 'hsl(var(--watt-bitcoin))' }}>{calculations.dailyBtc.toFixed(4)}</div>
                </div>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{ backgroundColor: 'hsl(var(--watt-success) / 0.1)' }}
              >
                <div className="text-sm text-muted-foreground mb-1">Monthly Revenue</div>
                <div className="text-2xl font-bold" style={{ color: 'hsl(var(--watt-success))' }}>
                  ${calculations.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <div className="text-sm text-muted-foreground mb-1">Monthly Costs</div>
                <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                  ${calculations.totalMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" style={{ color: 'hsl(var(--watt-bitcoin))' }} />
                Bottom Line
              </h4>
              
              <motion.div 
                className={`rounded-xl p-6 text-center`}
                style={{ 
                  backgroundColor: calculations.monthlyProfit >= 0 
                    ? 'hsl(var(--watt-success) / 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)' 
                }}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm text-muted-foreground mb-1">Monthly Profit</div>
                <div 
                  className="text-3xl font-bold"
                  style={{ color: calculations.monthlyProfit >= 0 ? 'hsl(var(--watt-success))' : '#ef4444' }}
                >
                  {calculations.monthlyProfit >= 0 ? '+' : ''}${calculations.monthlyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {calculations.profitMargin >= 0 ? (
                    <TrendingUp className="w-4 h-4" style={{ color: 'hsl(var(--watt-success))' }} />
                  ) : (
                    <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />
                  )}
                  <span 
                    className="font-medium"
                    style={{ color: calculations.profitMargin >= 0 ? 'hsl(var(--watt-success))' : '#ef4444' }}
                  >
                    {calculations.profitMargin.toFixed(1)}% margin
                  </span>
                </div>
              </motion.div>

              <MECMetricDisplay
                label="Break-even BTC Price"
                value={`$${calculations.breakEvenPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              />

              {calculations.breakEvenPrice > btcPrice && (
                <motion.div 
                  className="rounded-xl p-4 flex items-start gap-2"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} />
                  <p className="text-sm" style={{ color: '#ef4444' }}>
                    Operating below break-even. Consider reducing energy costs or upgrading hardware.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </MECContentCard>
      </ScrollReveal>

      {/* Sensitivity Analysis Deep Dive */}
      <ScrollReveal delay={150}>
        <MECDeepDive title="Sensitivity Analysis: What Moves the Needle?" icon={TrendingUp} className="mb-8">
          <div className="space-y-4">
            <p>
              Not all variables affect profitability equally. Understanding sensitivity 
              helps you focus on what matters most:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-4 border border-border">
                <h5 className="font-semibold text-foreground mb-2" style={{ color: 'hsl(var(--watt-bitcoin))' }}>High Impact Variables</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Energy rate:</strong> 1¢ change = ${(calculations.totalPowerKw * 24 * 30 * 0.01).toLocaleString()}/mo</li>
                  <li>• <strong>BTC price:</strong> 10% change = ${(calculations.monthlyRevenue * 0.1).toLocaleString()}/mo</li>
                  <li>• <strong>Hardware efficiency:</strong> Determines break-even threshold</li>
                </ul>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <h5 className="font-semibold text-foreground mb-2">Lower Impact Variables</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Labor costs (unless scaling rapidly)</li>
                  <li>• Maintenance (predictable, ~1-2% of revenue)</li>
                  <li>• Hosting (somewhat negotiable)</li>
                </ul>
              </div>
            </div>
            <MECCallout variant="example" title="Rule of Thumb">
              A 1¢/kWh reduction in energy costs has roughly the same profit impact as a 
              $5,000-10,000 increase in BTC price for most operations.
            </MECCallout>
          </div>
        </MECDeepDive>
      </ScrollReveal>

      {/* Efficiency Benchmarks */}
      <ScrollReveal delay={200}>
        <MECContentCard variant="elevated" headerIcon={Cpu} headerTitle="Hardware Efficiency Evolution" headerIconColor="purple">
          <p className="text-sm text-muted-foreground mb-4">
            Hardware efficiency (J/TH) determines your competitive position. Lower is better — 
            more efficient machines can operate profitably at higher energy costs.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-foreground font-semibold">Generation</th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold">Efficiency (J/TH)</th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold">Hashrate (TH/s)</th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {efficiencyBenchmarks.map((hw, idx) => (
                  <motion.tr 
                    key={idx} 
                    className={`border-b border-border ${hw.status === 'Latest' ? 'bg-[hsl(var(--watt-success)/0.05)]' : ''} ${!hw.profitable ? 'opacity-50' : ''}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: hw.profitable ? 1 : 0.5 }}
                    transition={{ delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <td className="py-3 px-4 font-medium text-foreground">{hw.gen}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: 'hsl(var(--watt-purple))' }}>{hw.efficiency} J/TH</td>
                    <td className="py-3 px-4 text-foreground">{hw.hashrate} TH/s</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        hw.status === 'Latest' ? 'text-white' :
                        hw.status === 'Current' ? 'text-white' :
                        'bg-muted text-muted-foreground'
                      }`}
                      style={{
                        backgroundColor: hw.status === 'Latest' ? 'hsl(var(--watt-success))' :
                                        hw.status === 'Current' ? '#3b82f6' : undefined
                      }}>
                        {hw.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <MECKeyInsight variant="insight" className="mt-6" title="Efficiency is Survival">
            Each hardware generation is roughly 20-30% more efficient than the last. 
            Machines that were profitable 2-3 years ago are often unprofitable today. 
            Plan for regular hardware refresh cycles (every 2-3 years typically).
          </MECKeyInsight>
        </MECContentCard>
      </ScrollReveal>
    </MECSectionWrapper>
  );
};

export default ProfitabilityAnalysisSection;
