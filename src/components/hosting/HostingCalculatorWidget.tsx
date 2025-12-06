import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { useState, useEffect, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Bitcoin, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const asicModels = [
  { id: 's21', name: 'Antminer S21', hashrate: 200, power: 3500 },
  { id: 's21-pro', name: 'Antminer S21 Pro', hashrate: 234, power: 3531 },
  { id: 's19-xp', name: 'Antminer S19 XP', hashrate: 140, power: 3010 },
  { id: 'm60', name: 'WhatsMiner M60', hashrate: 186, power: 3422 },
  { id: 'm50', name: 'WhatsMiner M50', hashrate: 118, power: 3306 },
];

const packages = [
  { id: 'byom', name: 'Bring Your Own Machine', rate: 0.078 },
  { id: 'buyhost', name: 'Buy & Host', rate: 0.075 },
  { id: 'industrial', name: 'Industrial (5MW+)', rate: 0.071 },
];

// Network constants (approximate)
const NETWORK_DIFFICULTY = 103.92e12; // ~104 trillion
const BLOCK_REWARD = 3.125; // Post-halving
const BLOCKS_PER_DAY = 144;

export const HostingCalculatorWidget = () => {
  const [minerCount, setMinerCount] = useState(50);
  const [selectedAsic, setSelectedAsic] = useState('s21');
  const [selectedPackage, setSelectedPackage] = useState('buyhost');
  const [btcPrice, setBtcPrice] = useState(100000);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch live BTC price
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await res.json();
        if (data.bitcoin?.usd) {
          setBtcPrice(data.bitcoin.usd);
        }
      } catch (error) {
        // Use default price on error
      }
    };
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  // Trigger animation on value changes
  useEffect(() => {
    setIsAnimating(true);
    const timeout = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timeout);
  }, [minerCount, selectedAsic, selectedPackage]);

  const calculations = useMemo(() => {
    const asic = asicModels.find(a => a.id === selectedAsic) || asicModels[0];
    const pkg = packages.find(p => p.id === selectedPackage) || packages[1];

    // Total hashrate in TH/s
    const totalHashrate = minerCount * asic.hashrate;
    
    // Total power in kW
    const totalPowerKw = (minerCount * asic.power) / 1000;
    
    // Daily BTC earnings (simplified calculation)
    const dailyBtc = (totalHashrate * 1e12 / NETWORK_DIFFICULTY) * BLOCK_REWARD * BLOCKS_PER_DAY;
    
    // Daily power cost
    const hoursPerDay = 24;
    const dailyPowerCost = totalPowerKw * hoursPerDay * pkg.rate;
    
    // Daily revenue and profit
    const dailyRevenue = dailyBtc * btcPrice;
    const dailyProfit = dailyRevenue - dailyPowerCost;
    
    // Monthly figures
    const monthlyRevenue = dailyRevenue * 30;
    const monthlyPowerCost = dailyPowerCost * 30;
    const monthlyProfit = dailyProfit * 30;
    
    // ROI metrics
    const profitMargin = dailyRevenue > 0 ? (dailyProfit / dailyRevenue) * 100 : 0;

    return {
      totalHashrate,
      totalPowerKw,
      dailyBtc,
      dailyRevenue,
      dailyPowerCost,
      dailyProfit,
      monthlyRevenue,
      monthlyPowerCost,
      monthlyProfit,
      profitMargin,
      isProfitable: dailyProfit > 0
    };
  }, [minerCount, selectedAsic, selectedPackage, btcPrice]);

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-watt-bitcoin/10 border border-watt-bitcoin/20 rounded-full mb-4">
              <Calculator className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Live Calculator</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-watt-navy mb-4">
              Estimate Your Mining Profits
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Calculate potential earnings based on your hardware and our competitive hosting rates
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <ScrollReveal delay={0.1}>
            <div className="bg-watt-light rounded-2xl p-6 border border-border">
              <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center">
                <Zap className="w-5 h-5 text-watt-bitcoin mr-2" />
                Configure Your Setup
              </h3>

              {/* Number of Miners */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-watt-navy mb-2">
                  Number of Miners: <span className="text-watt-bitcoin font-bold">{minerCount}</span>
                </label>
                <Slider
                  value={[minerCount]}
                  onValueChange={(value) => setMinerCount(value[0])}
                  min={10}
                  max={500}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-watt-navy/50 mt-1">
                  <span>10</span>
                  <span>500</span>
                </div>
              </div>

              {/* ASIC Model */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-watt-navy mb-2">
                  ASIC Model
                </label>
                <Select value={selectedAsic} onValueChange={setSelectedAsic}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {asicModels.map(asic => (
                      <SelectItem key={asic.id} value={asic.id}>
                        <span className="font-medium">{asic.name}</span>
                        <span className="text-watt-navy/50 ml-2">({asic.hashrate} TH/s)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Package Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-watt-navy mb-2">
                  Hosting Package
                </label>
                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        <span className="font-medium">{pkg.name}</span>
                        <span className="text-watt-bitcoin ml-2">({(pkg.rate * 100).toFixed(1)}¢/kWh)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-border">
                <div className="text-center">
                  <div className="text-xs text-watt-navy/50 mb-1">BTC Price</div>
                  <div className="text-lg font-bold text-watt-navy">
                    ${btcPrice.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-watt-navy/50 mb-1">Total Hashrate</div>
                  <div className="text-lg font-bold text-watt-bitcoin">
                    {(calculations.totalHashrate / 1000).toFixed(1)} PH/s
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Results Panel */}
          <ScrollReveal delay={0.2}>
            <div className={`bg-gradient-to-br from-watt-navy to-watt-navy/90 rounded-2xl p-6 text-white transition-all duration-300 ${isAnimating ? 'scale-[1.01]' : ''}`}>
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 text-watt-bitcoin mr-2" />
                Estimated Returns
              </h3>

              {/* Daily Earnings */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Daily BTC</div>
                  <div className="text-2xl font-bold text-watt-bitcoin">
                    ₿ {calculations.dailyBtc.toFixed(6)}
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Daily Revenue</div>
                  <div className="text-2xl font-bold text-watt-success">
                    ${calculations.dailyRevenue.toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown */}
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="text-sm text-white/60 mb-3">Monthly Breakdown</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Revenue</span>
                    <span className="font-bold text-watt-success">
                      ${calculations.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Power Cost</span>
                    <span className="font-bold text-red-400">
                      -${calculations.monthlyPowerCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="h-px bg-white/20" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Net Profit</span>
                    <span className={`text-2xl font-bold ${calculations.isProfitable ? 'text-watt-success' : 'text-red-400'}`}>
                      ${calculations.monthlyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profit Margin */}
              <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                <div>
                  <div className="text-sm text-white/60">Profit Margin</div>
                  <div className={`text-3xl font-bold ${calculations.isProfitable ? 'text-watt-success' : 'text-red-400'}`}>
                    <AnimatedCounter end={Math.round(calculations.profitMargin)} suffix="%" />
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${calculations.isProfitable ? 'bg-watt-success/20' : 'bg-red-500/20'}`}>
                  <DollarSign className={`w-8 h-8 ${calculations.isProfitable ? 'text-watt-success' : 'text-red-400'}`} />
                </div>
              </div>

              <p className="text-xs text-white/40 mt-4 text-center">
                *Estimates based on current network difficulty. Actual results may vary.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
