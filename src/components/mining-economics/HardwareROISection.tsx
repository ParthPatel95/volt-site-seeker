import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Cpu, Clock, DollarSign, TrendingUp, AlertTriangle, Zap, Calendar } from 'lucide-react';
import { MECSectionWrapper, MECSectionHeader, MECContentCard, MECStatCard, MECKeyInsight, MECDeepDive, MECCallout } from './shared';
import { motion } from 'framer-motion';

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
    <MECSectionWrapper id="hardware-roi" theme="gradient">
      <ScrollReveal>
        <MECSectionHeader
          badge="Hardware ROI"
          badgeIcon={Cpu}
          title="Hardware Investment Analysis"
          description="Evaluate the return on investment for mining hardware purchases. Payback periods and ROI vary significantly based on efficiency and market conditions."
          accentColor="purple"
        />
      </ScrollReveal>

      {/* ROI Calculator */}
      <ScrollReveal delay={100}>
        <MECContentCard variant="elevated" headerIcon={Cpu} headerTitle="Hardware ROI Calculator" headerIconColor="purple" className="mb-8">
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
              <MECStatCard
                icon={DollarSign}
                value={`$${dailyProfit.toFixed(2)}`}
                label="Daily Profit"
                color={dailyProfit >= 0 ? "success" : "red"}
              />
              <MECStatCard
                icon={TrendingUp}
                value={`$${monthlyProfit.toFixed(0)}`}
                label="Monthly Profit"
                color="bitcoin"
              />
              <MECStatCard
                icon={Clock}
                value={paybackMonths < 100 ? paybackMonths.toFixed(1) : '∞'}
                label="Payback (months)"
                color="purple"
              />
              <MECStatCard
                icon={TrendingUp}
                value={`${annualROI.toFixed(0)}%`}
                label="Annual ROI"
                color="blue"
              />
            </div>
          </div>

          {dailyProfit < 0 && (
            <motion.div 
              className="mt-6 p-4 rounded-xl flex items-start gap-3"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
              <div>
                <p className="font-semibold" style={{ color: '#ef4444' }}>Negative Daily Profit</p>
                <p className="text-sm text-muted-foreground">
                  This hardware configuration is not profitable at current settings. 
                  Consider lower energy costs or wait for higher BTC prices.
                </p>
              </div>
            </motion.div>
          )}
        </MECContentCard>
      </ScrollReveal>

      {/* ROI Decision Framework */}
      <ScrollReveal delay={150}>
        <MECDeepDive title="Hardware Purchase Decision Framework" icon={Calendar} className="mb-8">
          <div className="space-y-4">
            <p>
              Hardware purchases are significant capital investments. Use this framework 
              to make informed decisions:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-background rounded-lg p-4 border-l-4" style={{ borderColor: 'hsl(var(--watt-success))' }}>
                <h5 className="font-semibold text-foreground mb-2">Strong Buy Signal</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Payback &lt; 12 months</li>
                  <li>• ROI &gt; 100% annually</li>
                  <li>• Secured low energy rate</li>
                  <li>• Bull market early stages</li>
                </ul>
              </div>
              <div className="bg-background rounded-lg p-4 border-l-4" style={{ borderColor: 'hsl(var(--watt-bitcoin))' }}>
                <h5 className="font-semibold text-foreground mb-2">Consider Carefully</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Payback 12-18 months</li>
                  <li>• ROI 50-100% annually</li>
                  <li>• Average energy costs</li>
                  <li>• Mid-cycle market</li>
                </ul>
              </div>
              <div className="bg-background rounded-lg p-4 border-l-4" style={{ borderColor: '#ef4444' }}>
                <h5 className="font-semibold text-foreground mb-2">Wait/Avoid</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Payback &gt; 18 months</li>
                  <li>• ROI &lt; 50% annually</li>
                  <li>• High energy costs</li>
                  <li>• Peak bull market prices</li>
                </ul>
              </div>
            </div>
            <MECCallout variant="example" title="Timing Tip">
              Hardware prices typically drop 20-40% in bear markets. Buying discounted 
              hardware during bear markets with secured power positions you for maximum 
              ROI when markets recover.
            </MECCallout>
          </div>
        </MECDeepDive>
      </ScrollReveal>

      {/* Hardware Comparison */}
      <ScrollReveal delay={200}>
        <MECContentCard variant="elevated" headerIcon={Cpu} headerTitle="Hardware ROI Comparison" headerIconColor="purple">
          <p className="text-sm text-muted-foreground mb-2">
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
                  <motion.tr 
                    key={idx} 
                    className={`border-b border-border ${hw.dailyProfit <= 0 ? 'opacity-40' : ''}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: hw.dailyProfit > 0 ? 1 : 0.4 }}
                    transition={{ delay: idx * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <td className="py-3 px-4 font-medium text-foreground">{hw.model}</td>
                    <td className="py-3 px-4 text-right text-foreground">${hw.price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: 'hsl(var(--watt-purple))' }}>{hw.efficiency} J/TH</td>
                    <td 
                      className="py-3 px-4 text-right font-bold"
                      style={{ color: hw.dailyProfit > 0 ? 'hsl(var(--watt-success))' : '#ef4444' }}
                    >
                      ${hw.dailyProfit.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {hw.paybackDays < 1000 ? `${(hw.paybackDays / 30).toFixed(1)} mo` : 'N/A'}
                    </td>
                    <td 
                      className="py-3 px-4 text-right font-bold"
                      style={{ 
                        color: hw.annualROI > 100 ? 'hsl(var(--watt-success))' : 
                               hw.annualROI > 0 ? 'hsl(var(--watt-bitcoin))' : '#ef4444' 
                      }}
                    >
                      {hw.annualROI > 0 ? `${hw.annualROI.toFixed(0)}%` : 'N/A'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <MECKeyInsight variant="insight" className="mt-6" title="New vs. Used Hardware">
            <p className="mb-2">
              Newer hardware has better efficiency but higher cost. Used hardware has lower 
              cost but shorter remaining lifespan and higher failure rates.
            </p>
            <p>
              <strong>Rule of thumb:</strong> If used hardware payback is &lt;6 months with 
              reasonable failure risk priced in, it may be a better value than new equipment.
            </p>
          </MECKeyInsight>
        </MECContentCard>
      </ScrollReveal>

      {/* Hardware Lifecycle */}
      <ScrollReveal delay={250}>
        <MECDeepDive title="Hardware Lifecycle Planning" icon={Zap}>
          <div className="space-y-4">
            <p>
              Mining hardware doesn't last forever. Plan for the full lifecycle:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-4 border border-border">
                <h5 className="font-semibold text-foreground mb-2">Typical ASIC Lifespan</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Physical life:</strong> 4-6 years with maintenance</li>
                  <li>• <strong>Economic life:</strong> 2-4 years (until unprofitable)</li>
                  <li>• <strong>Warranty:</strong> Typically 6-12 months</li>
                </ul>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <h5 className="font-semibold text-foreground mb-2">Depreciation Approach</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Assume 3-year economic life for planning</li>
                  <li>• Budget ~33%/year depreciation</li>
                  <li>• Plan for 2-5% annual maintenance costs</li>
                </ul>
              </div>
            </div>
            <MECCallout variant="formula" title="Monthly Depreciation">
              Hardware Cost ÷ 36 months = Monthly depreciation expense
            </MECCallout>
          </div>
        </MECDeepDive>
      </ScrollReveal>
    </MECSectionWrapper>
  );
};

export default HardwareROISection;
