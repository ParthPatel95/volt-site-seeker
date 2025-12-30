import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Gauge, DollarSign, Calendar, Award, Thermometer, TrendingUp, Info, Lightbulb } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import { DCESectionWrapper, DCESectionHeader, DCEContentCard, DCEKeyInsight, DCEDeepDive } from './shared';

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
    <DCESectionWrapper theme="accent" id="mining-hardware">
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
      
      <DCESectionHeader
        badge="Section 6 • ASIC Technology"
        badgeIcon={Cpu}
        title="Mining Hardware Showcase"
        description="Compare the latest 2024/2025 ASIC miners powering Bitcoin's 750+ EH/s network hashrate"
        theme="light"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Miner Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2"
        >
          <h3 className="font-semibold text-foreground mb-3">Select Miner</h3>
          {miners.map((miner, index) => (
            <button
              key={index}
              onClick={() => setSelectedMiner(index)}
              className={`w-full p-3 rounded-xl border text-left transition-all ${
                selectedMiner === index
                  ? 'bg-[hsl(var(--watt-bitcoin)/0.1)] border-[hsl(var(--watt-bitcoin))]'
                  : 'bg-card border-border hover:border-[hsl(var(--watt-bitcoin)/0.5)]'
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
                  <div className="text-xs font-bold text-[hsl(var(--watt-bitcoin))]">{miner.hashrate} TH/s</div>
                  <div className="text-[10px] text-muted-foreground">{miner.efficiency} J/TH</div>
                </div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Selected Miner Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <DCEContentCard variant="elevated">
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
              <div className="p-3 bg-muted/50 rounded-xl text-center border border-border">
                <Gauge className="w-5 h-5 text-[hsl(var(--watt-bitcoin))] mx-auto mb-1" />
                <div className="text-xl font-bold text-foreground">
                  <AnimatedCounter end={selectedMinerData.hashrate} suffix=" TH/s" />
                </div>
                <div className="text-[10px] text-muted-foreground">Hashrate</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl text-center border border-border">
                <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <div className="text-xl font-bold text-foreground">
                  <AnimatedCounter end={selectedMinerData.power} suffix="W" />
                </div>
                <div className="text-[10px] text-muted-foreground">Power Draw</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl text-center border border-border">
                <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <div className="text-xl font-bold text-foreground">
                  <AnimatedCounter end={selectedMinerData.efficiency} decimals={1} suffix=" J/TH" />
                </div>
                <div className="text-[10px] text-muted-foreground">Efficiency</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl text-center border border-border">
                <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <div className="text-xl font-bold text-foreground">
                  $<AnimatedCounter end={selectedMinerData.price} />
                </div>
                <div className="text-[10px] text-muted-foreground">Est. Price</div>
              </div>
            </div>

            {/* Thermal Specifications */}
            <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border">
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
                          i === selectedMiner ? 'bg-[hsl(var(--watt-bitcoin))]' : 'bg-muted-foreground/30'
                        }`}
                        style={{ width: `${(12 / miner.efficiency) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs w-14 text-right ${
                      i === selectedMiner ? 'text-[hsl(var(--watt-bitcoin))] font-semibold' : 'text-muted-foreground'
                    }`}>
                      {miner.efficiency} J/TH
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="flex items-center gap-2 flex-wrap">
              <Award className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
              {selectedMinerData.features.map((feature, i) => (
                <span key={i} className="px-2 py-1 bg-muted rounded-full text-xs text-foreground">
                  {feature}
                </span>
              ))}
              <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {selectedMinerData.releaseDate}
              </span>
            </div>
          </DCEContentCard>
        </motion.div>
      </div>

      {/* Hardware Economics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10"
      >
        <div className="p-6 bg-gradient-to-r from-[hsl(var(--watt-navy))] to-[hsl(var(--watt-navy)/0.9)] rounded-2xl text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
            Quick Economics Calculator (at $0.05/kWh)
          </h3>
          <div className="grid md:grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-white/10 rounded-xl">
              <div className="text-xl font-bold text-[hsl(var(--watt-bitcoin))]">{selectedMinerData.hashrate} TH/s</div>
              <div className="text-xs text-white/70">Hashrate</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <div className="text-xl font-bold text-white">{((selectedMinerData.power / 1000) * 24).toFixed(1)} kWh</div>
              <div className="text-xs text-white/70">Daily Power</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <div className="text-xl font-bold text-green-400">${dailyRevenue.toFixed(2)}</div>
              <div className="text-xs text-white/70">Daily Revenue*</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <div className="text-xl font-bold text-red-400">-${dailyPowerCost.toFixed(2)}</div>
              <div className="text-xs text-white/70">Daily Power Cost</div>
            </div>
            <div className="p-3 bg-[hsl(var(--watt-bitcoin)/0.3)] rounded-xl">
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
      </motion.div>

      {/* Key Insight */}
      <DCEKeyInsight variant="insight" title="Hardware Selection Strategy" delay={0.35}>
        <p>
          The right miner depends on your power cost and infrastructure. At $0.03/kWh or below, older models like the S19k Pro 
          remain profitable. At $0.06/kWh+, only the most efficient current-gen units (12-15 J/TH) make economic sense. 
          Hydro-cooled units offer 2x hashrate but require water infrastructure investment.
        </p>
      </DCEKeyInsight>

      {/* Hardware Lifecycle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <DCEContentCard variant="bordered">
          <h3 className="text-lg font-semibold text-foreground mb-4">ASIC Hardware Lifecycle</h3>
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <div className="text-lg font-bold text-green-500 mb-1">Year 1</div>
              <div className="text-sm text-foreground font-medium">Peak ROI</div>
              <div className="text-xs text-muted-foreground mt-1">Best efficiency relative to network</div>
            </div>
            <div className="text-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div className="text-lg font-bold text-emerald-500 mb-1">Year 2</div>
              <div className="text-sm text-foreground font-medium">Strong Returns</div>
              <div className="text-xs text-muted-foreground mt-1">Still competitive with new models</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <div className="text-lg font-bold text-yellow-500 mb-1">Year 3</div>
              <div className="text-sm text-foreground font-medium">Diminishing</div>
              <div className="text-xs text-muted-foreground mt-1">Requires sub-$0.05/kWh power</div>
            </div>
            <div className="text-center p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <div className="text-lg font-bold text-orange-500 mb-1">Year 4</div>
              <div className="text-sm text-foreground font-medium">Marginal</div>
              <div className="text-xs text-muted-foreground mt-1">Only viable with stranded/flare gas</div>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <div className="text-lg font-bold text-red-500 mb-1">Year 5+</div>
              <div className="text-sm text-foreground font-medium">End of Life</div>
              <div className="text-xs text-muted-foreground mt-1">Recycle or secondary markets</div>
            </div>
          </div>
          
          {/* Deep Dive: Why ASICs Depreciate */}
          <DCEDeepDive title="Why ASICs Depreciate So Fast" icon={Info} defaultOpen={false}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-foreground mb-3">The Efficiency Race</h5>
                <p className="text-sm text-muted-foreground mb-4">
                  Bitcoin mining is a zero-sum competition. As network hashrate grows, your share of block rewards shrinks 
                  proportionally. New miners with better efficiency (lower J/TH) directly outcompete older hardware.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-xs text-muted-foreground">S9 (2016)</span>
                    <span className="text-xs font-mono text-foreground">100 J/TH</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-xs text-muted-foreground">S19 (2020)</span>
                    <span className="text-xs font-mono text-foreground">30 J/TH</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-xs text-muted-foreground">S21 Pro (2024)</span>
                    <span className="text-xs font-mono text-foreground">15 J/TH</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded border border-[hsl(var(--watt-bitcoin)/0.2)]">
                    <span className="text-xs text-foreground font-medium">Next Gen (2025+)</span>
                    <span className="text-xs font-mono text-[hsl(var(--watt-bitcoin))]">~10 J/TH</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-foreground mb-3">Failure Modes</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                    <span><strong>Hashboard failure:</strong> Individual ASIC chips fail over time due to thermal stress cycles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                    <span><strong>Fan degradation:</strong> Bearings wear out, reducing airflow and causing overheating</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                    <span><strong>PSU wear:</strong> Capacitors age and efficiency drops, increasing power consumption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[hsl(var(--watt-bitcoin))]">•</span>
                    <span><strong>Connector corrosion:</strong> Environmental factors degrade electrical connections</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-[hsl(var(--watt-bitcoin)/0.1)] rounded-lg border border-[hsl(var(--watt-bitcoin)/0.2)]">
                  <p className="text-xs text-foreground">
                    <strong>Pro Tip:</strong> Immersion cooling extends hardware life 2-3x by eliminating thermal cycling, 
                    dust, and fan wear — offsetting higher upfront costs.
                  </p>
                </div>
              </div>
            </div>
          </DCEDeepDive>
        </DCEContentCard>
      </motion.div>
      
      <SectionSummary
        takeaways={[
          "Latest ASICs achieve 12-17 J/TH efficiency — a 40 million X improvement from CPU mining days",
          "Hardware lifecycle: 2-3 years at grid power, years 3-5 at stranded/cheap power only",
          "Hydro-cooled miners offer 2x hashrate but require water infrastructure",
          "Total cost of ownership includes: hardware, hosting, power, maintenance, and depreciation"
        ]}
      />
    </DCESectionWrapper>
  );
};

export default MiningHardwareShowcaseSection;
