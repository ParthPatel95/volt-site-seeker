import React, { useState } from 'react';
import { Cpu, Zap, Gauge, DollarSign, Calendar, Award } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const MiningHardwareShowcaseSection = () => {
  const [selectedMiner, setSelectedMiner] = useState(0);

  const miners = [
    {
      name: 'Antminer S21 Pro',
      manufacturer: 'Bitmain',
      generation: 'Latest',
      hashrate: 234,
      power: 3531,
      efficiency: 15.1,
      price: 5500,
      releaseDate: '2024',
      image: '🔷',
      features: ['Hydro-compatible', '5nm chip', 'Low noise'],
    },
    {
      name: 'Whatsminer M60S',
      manufacturer: 'MicroBT',
      generation: 'Latest',
      hashrate: 186,
      power: 3422,
      efficiency: 18.4,
      price: 4200,
      releaseDate: '2024',
      image: '🔶',
      features: ['High reliability', 'Easy maintenance', 'Proven track record'],
    },
    {
      name: 'Antminer S19 XP',
      manufacturer: 'Bitmain',
      generation: 'Previous',
      hashrate: 140,
      power: 3010,
      efficiency: 21.5,
      price: 2800,
      releaseDate: '2022',
      image: '⬛',
      features: ['Battle-tested', 'Widely available', 'Good resale'],
    },
    {
      name: 'Avalon A1466',
      manufacturer: 'Canaan',
      generation: 'Latest',
      hashrate: 150,
      power: 3230,
      efficiency: 21.5,
      price: 3200,
      releaseDate: '2024',
      image: '🟩',
      features: ['Compact design', 'Lower noise', 'Easy setup'],
    },
  ];

  const selectedMinerData = miners[selectedMiner];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Mining Hardware Showcase
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compare the latest ASIC miners powering Bitcoin's global hashrate
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Miner Selection */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground mb-4">Select Miner</h3>
              {miners.map((miner, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMiner(index)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedMiner === index
                      ? 'bg-watt-bitcoin/10 border-watt-bitcoin'
                      : 'bg-card border-border hover:border-watt-bitcoin/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{miner.image}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{miner.name}</div>
                      <div className="text-sm text-muted-foreground">{miner.manufacturer}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-watt-bitcoin">{miner.hashrate} TH/s</div>
                      <div className="text-xs text-muted-foreground">{miner.efficiency} J/TH</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Selected Miner Details */}
          <ScrollReveal delay={0.2} className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-4xl">{selectedMinerData.image}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{selectedMinerData.name}</h3>
                      <p className="text-muted-foreground">{selectedMinerData.manufacturer}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedMinerData.generation === 'Latest' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {selectedMinerData.generation} Gen
                </span>
              </div>

              {/* Main Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <Gauge className="w-6 h-6 text-watt-bitcoin mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    <AnimatedCounter end={selectedMinerData.hashrate} suffix=" TH/s" />
                  </div>
                  <div className="text-xs text-muted-foreground">Hashrate</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    <AnimatedCounter end={selectedMinerData.power} suffix="W" />
                  </div>
                  <div className="text-xs text-muted-foreground">Power Draw</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <Cpu className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    <AnimatedCounter end={selectedMinerData.efficiency} decimals={1} suffix=" J/TH" />
                  </div>
                  <div className="text-xs text-muted-foreground">Efficiency</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    $<AnimatedCounter end={selectedMinerData.price} />
                  </div>
                  <div className="text-xs text-muted-foreground">Est. Price</div>
                </div>
              </div>

              {/* Efficiency Comparison Bar */}
              <div className="mb-8">
                <h4 className="font-semibold text-foreground mb-3">Efficiency Comparison</h4>
                <div className="space-y-3">
                  {miners.map((miner, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-32 text-sm text-muted-foreground truncate">{miner.name.split(' ').slice(0, 2).join(' ')}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            i === selectedMiner ? 'bg-watt-bitcoin' : 'bg-muted-foreground/30'
                          }`}
                          style={{ width: `${(15 / miner.efficiency) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm w-16 text-right ${
                        i === selectedMiner ? 'text-watt-bitcoin font-semibold' : 'text-muted-foreground'
                      }`}>
                        {miner.efficiency} J/TH
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Lower J/TH = More efficient</p>
              </div>

              {/* Features */}
              <div className="flex items-center gap-2 flex-wrap">
                <Award className="w-4 h-4 text-watt-bitcoin" />
                {selectedMinerData.features.map((feature, i) => (
                  <span key={i} className="px-3 py-1 bg-muted rounded-full text-xs text-foreground">
                    {feature}
                  </span>
                ))}
                <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {selectedMinerData.releaseDate}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Hardware Lifecycle */}
        <ScrollReveal delay={0.3}>
          <div className="mt-12 p-6 bg-gradient-to-r from-watt-navy to-watt-navy/90 rounded-2xl text-white">
            <h3 className="text-xl font-semibold mb-4">ASIC Hardware Lifecycle</h3>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-watt-bitcoin mb-1">Year 1</div>
                <div className="text-sm text-white/70">Peak Profitability</div>
                <div className="text-xs text-white/50 mt-1">100% of network hashrate value</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-watt-bitcoin mb-1">Year 2-3</div>
                <div className="text-sm text-white/70">Steady Returns</div>
                <div className="text-xs text-white/50 mt-1">Competitive with new models</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-watt-bitcoin mb-1">Year 3-4</div>
                <div className="text-sm text-white/70">Low-Cost Operation</div>
                <div className="text-xs text-white/50 mt-1">Only viable with cheap power</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-watt-bitcoin mb-1">Year 5+</div>
                <div className="text-sm text-white/70">End of Life</div>
                <div className="text-xs text-white/50 mt-1">Recycling or secondary markets</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default MiningHardwareShowcaseSection;
