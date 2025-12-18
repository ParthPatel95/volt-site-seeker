import React, { useState } from 'react';
import { Cpu, Zap, Gauge, DollarSign, Calendar, Award, Thermometer, TrendingUp } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';

const MiningHardwareShowcaseSection = () => {
  const [selectedMiner, setSelectedMiner] = useState(0);

  // Updated 2024/2025 ASIC models with accurate engineering specs
  const miners = [
    {
      name: 'Antminer S21 XP Hyd',
      manufacturer: 'Bitmain',
      generation: '2024 Latest',
      hashrate: 473,
      power: 5676,
      efficiency: 12.0,
      price: 14000,
      releaseDate: 'Q4 2024',
      cooling: 'Hydro',
      algorithm: 'SHA-256',
      features: ['Hydro cooling required', '3nm chip technology', 'Highest hashrate available', 'Industrial-only'],
      thermalData: {
        maxInlet: '35°C (95°F)',
        typicalJunction: '70-80°C',
        waterFlow: '4.0 L/min',
      }
    },
    {
      name: 'Antminer S21 Pro',
      manufacturer: 'Bitmain',
      generation: '2024 Latest',
      hashrate: 234,
      power: 3531,
      efficiency: 15.1,
      price: 5500,
      releaseDate: 'Q2 2024',
      cooling: 'Air',
      algorithm: 'SHA-256',
      features: ['Air-cooled', '5nm chip', 'High efficiency', 'Widely deployed'],
      thermalData: {
        maxInlet: '40°C (104°F)',
        typicalJunction: '80-90°C',
        airflow: '280 CFM',
      }
    },
    {
      name: 'Whatsminer M60S',
      manufacturer: 'MicroBT',
      generation: '2024 Latest',
      hashrate: 186,
      power: 3422,
      efficiency: 18.4,
      price: 4200,
      releaseDate: 'Q1 2024',
      cooling: 'Air',
      algorithm: 'SHA-256',
      features: ['Excellent reliability', 'Easy maintenance', 'Proven MicroBT quality', 'Good for hosting'],
      thermalData: {
        maxInlet: '40°C (104°F)',
        typicalJunction: '80-90°C',
        airflow: '250 CFM',
      }
    },
    {
      name: 'Antminer S19k Pro',
      manufacturer: 'Bitmain',
      generation: '2023',
      hashrate: 120,
      power: 2760,
      efficiency: 23.0,
      price: 1800,
      releaseDate: 'Q2 2023',
      cooling: 'Air',
      algorithm: 'SHA-256',
      features: ['Budget-friendly', 'Battle-tested', 'Good for cheap power', 'High resale liquidity'],
      thermalData: {
        maxInlet: '40°C (104°F)',
        typicalJunction: '80-90°C',
        airflow: '200 CFM',
      }
    },
    {
      name: 'Whatsminer M50S++',
      manufacturer: 'MicroBT',
      generation: '2023',
      hashrate: 150,
      power: 3450,
      efficiency: 23.0,
      price: 2400,
      releaseDate: 'Q3 2023',
      cooling: 'Air',
      algorithm: 'SHA-256',
      features: ['Reliable workhorse', 'Easy firmware', 'Good support', 'Competitive efficiency'],
      thermalData: {
        maxInlet: '40°C (104°F)',
        typicalJunction: '80-90°C',
        airflow: '230 CFM',
      }
    },
  ];

  const selectedMinerData = miners[selectedMiner];

  // Calculate daily metrics (simplified)
  const btcPrice = 100000; // Placeholder
  const networkHashrate = 750; // EH/s
  const blockReward = 3.125;
  const dailyBTC = (selectedMinerData.hashrate / (networkHashrate * 1e6)) * 144 * blockReward;
  const dailyRevenue = dailyBTC * btcPrice;
  const dailyPowerCost = (selectedMinerData.power / 1000) * 24 * 0.05; // $0.05/kWh
  const dailyProfit = dailyRevenue - dailyPowerCost;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningObjectives
          objectives={[
            "Compare latest 2024/2025 ASIC miners: hashrate, efficiency, and pricing",
            "Understand the hardware lifecycle from deployment to end-of-life",
            "Calculate profitability based on hashrate, power, and electricity costs",
            "Know when to choose air-cooled vs hydro-cooled miners"
          ]}
          estimatedTime="10 min"
          prerequisites={[
            { title: "Bitcoin Mining", href: "/bitcoin#mining" }
          ]}
        />
        
        <ScrollReveal>
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 rounded-full bg-watt-bitcoin/10 text-watt-bitcoin text-sm font-medium mb-4">
              Section 3 • ASIC Technology
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Mining Hardware Showcase
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compare the latest 2024/2025 ASIC miners powering Bitcoin's 750+ EH/s network hashrate
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Miner Selection */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground mb-3">Select Miner</h3>
              {miners.map((miner, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMiner(index)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedMiner === index
                      ? 'bg-watt-bitcoin/10 border-watt-bitcoin'
                      : 'bg-card border-border hover:border-watt-bitcoin/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      miner.manufacturer === 'Bitmain' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                    }`}>
                      <Cpu className={`w-5 h-5 ${
                        miner.manufacturer === 'Bitmain' ? 'text-orange-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-sm truncate">{miner.name}</div>
                      <div className="text-xs text-muted-foreground">{miner.manufacturer} • {miner.cooling}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-watt-bitcoin">{miner.hashrate} TH/s</div>
                      <div className="text-[10px] text-muted-foreground">{miner.efficiency} J/TH</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Selected Miner Details */}
          <ScrollReveal delay={0.2} className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-5 md:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMinerData.manufacturer === 'Bitmain' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                  }`}>
                    <Cpu className={`w-6 h-6 ${
                      selectedMinerData.manufacturer === 'Bitmain' ? 'text-orange-500' : 'text-blue-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{selectedMinerData.name}</h3>
                    <p className="text-muted-foreground text-sm">{selectedMinerData.manufacturer} • {selectedMinerData.algorithm}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedMinerData.generation.includes('2024') 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {selectedMinerData.generation}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedMinerData.cooling === 'Hydro' ? 'bg-blue-500/10 text-blue-500' : 'bg-cyan-500/10 text-cyan-500'
                  }`}>
                    {selectedMinerData.cooling} Cooled
                  </span>
                </div>
              </div>

              {/* Main Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <Gauge className="w-5 h-5 text-watt-bitcoin mx-auto mb-1" />
                  <div className="text-xl font-bold text-foreground">
                    <AnimatedCounter end={selectedMinerData.hashrate} suffix=" TH/s" />
                  </div>
                  <div className="text-[10px] text-muted-foreground">Hashrate</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-foreground">
                    <AnimatedCounter end={selectedMinerData.power} suffix="W" />
                  </div>
                  <div className="text-[10px] text-muted-foreground">Power Draw</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-foreground">
                    <AnimatedCounter end={selectedMinerData.efficiency} decimals={1} suffix=" J/TH" />
                  </div>
                  <div className="text-[10px] text-muted-foreground">Efficiency</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl text-center">
                  <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-foreground">
                    $<AnimatedCounter end={selectedMinerData.price} />
                  </div>
                  <div className="text-[10px] text-muted-foreground">Est. Price</div>
                </div>
              </div>

              {/* Thermal Specifications */}
              <div className="mb-6 p-4 bg-muted/30 rounded-xl">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  Thermal Specifications
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(selectedMinerData.thermalData).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-xs text-muted-foreground capitalize mb-1">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="text-sm font-semibold text-foreground">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Efficiency Comparison Bar */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3 text-sm">Efficiency Comparison (Lower = Better)</h4>
                <div className="space-y-2">
                  {miners.map((miner, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-28 text-xs text-muted-foreground truncate">{miner.name.split(' ').slice(0, 2).join(' ')}</span>
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            i === selectedMiner ? 'bg-watt-bitcoin' : 'bg-muted-foreground/30'
                          }`}
                          style={{ width: `${(12 / miner.efficiency) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs w-14 text-right ${
                        i === selectedMiner ? 'text-watt-bitcoin font-semibold' : 'text-muted-foreground'
                      }`}>
                        {miner.efficiency} J/TH
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="flex items-center gap-2 flex-wrap">
                <Award className="w-4 h-4 text-watt-bitcoin" />
                {selectedMinerData.features.map((feature, i) => (
                  <span key={i} className="px-2 py-1 bg-muted rounded-full text-xs text-foreground">
                    {feature}
                  </span>
                ))}
                <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {selectedMinerData.releaseDate}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Hardware Economics */}
        <ScrollReveal delay={0.3}>
          <div className="mt-10 p-5 bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl text-white">
            <h3 className="text-lg font-semibold mb-4">Quick Economics Calculator (at $0.05/kWh)</h3>
            <div className="grid md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-watt-bitcoin">{selectedMinerData.hashrate} TH/s</div>
                <div className="text-xs text-white/70">Hashrate</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">{((selectedMinerData.power / 1000) * 24).toFixed(1)} kWh</div>
                <div className="text-xs text-white/70">Daily Power</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-400">${dailyRevenue.toFixed(2)}</div>
                <div className="text-xs text-white/70">Daily Revenue*</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-400">-${dailyPowerCost.toFixed(2)}</div>
                <div className="text-xs text-white/70">Daily Power Cost</div>
              </div>
              <div>
                <div className={`text-xl font-bold ${dailyProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${dailyProfit.toFixed(2)}
                </div>
                <div className="text-xs text-white/70">Daily Profit</div>
              </div>
            </div>
            <p className="text-xs text-white/50 mt-3">
              *Estimated at $100K BTC, 750 EH/s network, 3.125 BTC block reward. Actual results vary with difficulty and price.
            </p>
          </div>
        </ScrollReveal>

        {/* Hardware Lifecycle */}
        <ScrollReveal delay={0.4}>
          <div className="mt-8 p-5 bg-card rounded-2xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">ASIC Hardware Lifecycle</h3>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-green-500/10 rounded-xl">
                <div className="text-lg font-bold text-green-500 mb-1">Year 1</div>
                <div className="text-sm text-foreground font-medium">Peak ROI</div>
                <div className="text-xs text-muted-foreground mt-1">Best efficiency relative to network</div>
              </div>
              <div className="text-center p-3 bg-emerald-500/10 rounded-xl">
                <div className="text-lg font-bold text-emerald-500 mb-1">Year 2</div>
                <div className="text-sm text-foreground font-medium">Strong Returns</div>
                <div className="text-xs text-muted-foreground mt-1">Still competitive with new models</div>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-xl">
                <div className="text-lg font-bold text-yellow-500 mb-1">Year 3</div>
                <div className="text-sm text-foreground font-medium">Diminishing</div>
                <div className="text-xs text-muted-foreground mt-1">Requires sub-$0.05/kWh power</div>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-xl">
                <div className="text-lg font-bold text-orange-500 mb-1">Year 4</div>
                <div className="text-sm text-foreground font-medium">Marginal</div>
                <div className="text-xs text-muted-foreground mt-1">Only viable with stranded/flare gas</div>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-xl">
                <div className="text-lg font-bold text-red-500 mb-1">Year 5+</div>
                <div className="text-sm text-foreground font-medium">End of Life</div>
                <div className="text-xs text-muted-foreground mt-1">Recycle or secondary markets</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
        
        <SectionSummary
          takeaways={[
            "Latest ASICs achieve 12-17 J/TH efficiency — a 40 million X improvement from CPU mining days",
            "Hardware lifecycle: 2-3 years at grid power, years 3-5 at stranded/cheap power only",
            "Hydro-cooled miners offer 2x hashrate but require water infrastructure",
            "Total cost of ownership includes: hardware, hosting, power, maintenance, and depreciation"
          ]}
          proTip="Don't chase the newest hardware at launch — wait 3-6 months for prices to stabilize and early bugs to be fixed. The sweet spot is often one generation behind latest."
          nextSteps={[
            { title: "Facility Tour", href: "/datacenter-education#facility-tour" },
            { title: "Mining Economics", href: "/mining-economics" }
          ]}
        />
      </div>
    </section>
  );
};

export default MiningHardwareShowcaseSection;
