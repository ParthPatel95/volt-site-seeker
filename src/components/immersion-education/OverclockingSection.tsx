import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Zap, TrendingUp, Thermometer, AlertTriangle } from 'lucide-react';

const overclockProfiles = [
  {
    model: 'Antminer S21',
    stock: { hashrate: 200, power: 3500, efficiency: 17.5, temp: '75-85°C' },
    moderate: { hashrate: 230, power: 4100, efficiency: 17.8, temp: '70-80°C' },
    aggressive: { hashrate: 260, power: 4800, efficiency: 18.5, temp: '65-75°C' }
  },
  {
    model: 'Antminer S19 Pro',
    stock: { hashrate: 110, power: 3250, efficiency: 29.5, temp: '75-85°C' },
    moderate: { hashrate: 125, power: 3800, efficiency: 30.4, temp: '70-80°C' },
    aggressive: { hashrate: 140, power: 4400, efficiency: 31.4, temp: '65-75°C' }
  },
  {
    model: 'Whatsminer M50S',
    stock: { hashrate: 126, power: 3276, efficiency: 26.0, temp: '75-85°C' },
    moderate: { hashrate: 140, power: 3700, efficiency: 26.4, temp: '70-80°C' },
    aggressive: { hashrate: 155, power: 4300, efficiency: 27.7, temp: '65-75°C' }
  }
];

export default function OverclockingSection() {
  const [selectedModel, setSelectedModel] = useState(0);
  const profile = overclockProfiles[selectedModel];

  const calculateGain = (oc: number, stock: number) => ((oc - stock) / stock * 100).toFixed(0);

  return (
    <section id="overclocking" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Overclocking Potential
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Immersion cooling unlocks significant overclocking headroom by maintaining 
              lower chip temperatures - extract 20-30% more hashrate from your hardware.
            </p>
          </div>
        </ScrollReveal>

        {/* Key Benefits */}
        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">+20-30%</div>
              <div className="text-foreground font-medium mb-1">Hashrate Increase</div>
              <div className="text-sm text-muted-foreground">Above stock performance</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-cyan-500 mb-2">10-15°C</div>
              <div className="text-foreground font-medium mb-1">Lower Chip Temps</div>
              <div className="text-sm text-muted-foreground">Compared to air cooling</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-amber-500 mb-2">Stable</div>
              <div className="text-foreground font-medium mb-1">24/7 Operation</div>
              <div className="text-sm text-muted-foreground">No thermal throttling</div>
            </div>
          </div>
        </ScrollReveal>

        {/* Model Selector */}
        <ScrollReveal delay={150}>
          <div className="flex justify-center gap-3 mb-8">
            {overclockProfiles.map((p, i) => (
              <button
                key={p.model}
                onClick={() => setSelectedModel(i)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  selectedModel === i
                    ? 'border-cyan-500 bg-cyan-500/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/50'
                }`}
              >
                {p.model}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Performance Comparison */}
        <ScrollReveal delay={200}>
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-12">
            <div className="grid md:grid-cols-3">
              {/* Stock */}
              <div className="p-6 border-b md:border-b-0 md:border-r border-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-zinc-500 rounded-full" />
                  <h4 className="font-semibold text-foreground">Stock (Air-Cooled)</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-foreground">{profile.stock.hashrate} TH/s</div>
                    <div className="text-sm text-muted-foreground">Hashrate</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Power</span>
                    <span className="text-foreground">{profile.stock.power} W</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className="text-foreground">{profile.stock.efficiency} J/TH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chip Temp</span>
                    <span className="text-red-400">{profile.stock.temp}</span>
                  </div>
                </div>
              </div>

              {/* Moderate OC */}
              <div className="p-6 border-b md:border-b-0 md:border-r border-border bg-cyan-500/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                  <h4 className="font-semibold text-foreground">Moderate OC (Immersion)</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-cyan-500">{profile.moderate.hashrate} TH/s</div>
                    <div className="text-sm text-green-500">+{calculateGain(profile.moderate.hashrate, profile.stock.hashrate)}% gain</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Power</span>
                    <span className="text-foreground">{profile.moderate.power} W</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className="text-foreground">{profile.moderate.efficiency} J/TH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chip Temp</span>
                    <span className="text-green-400">{profile.moderate.temp}</span>
                  </div>
                </div>
              </div>

              {/* Aggressive OC */}
              <div className="p-6 bg-gradient-to-br from-orange-500/10 to-transparent">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <h4 className="font-semibold text-foreground">Aggressive OC (Immersion)</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-orange-500">{profile.aggressive.hashrate} TH/s</div>
                    <div className="text-sm text-green-500">+{calculateGain(profile.aggressive.hashrate, profile.stock.hashrate)}% gain</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Power</span>
                    <span className="text-foreground">{profile.aggressive.power} W</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className="text-foreground">{profile.aggressive.efficiency} J/TH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Chip Temp</span>
                    <span className="text-green-400">{profile.aggressive.temp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Visual Hashrate Comparison */}
        <ScrollReveal delay={250}>
          <div className="bg-card border border-border rounded-xl p-6 mb-12">
            <h4 className="font-semibold text-foreground mb-6">{profile.model} Hashrate Comparison</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="text-foreground">{profile.stock.hashrate} TH/s</span>
                </div>
                <div className="h-8 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-zinc-500 rounded-full transition-all duration-500"
                    style={{ width: `${(profile.stock.hashrate / profile.aggressive.hashrate) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Moderate OC</span>
                  <span className="text-cyan-500">{profile.moderate.hashrate} TH/s (+{calculateGain(profile.moderate.hashrate, profile.stock.hashrate)}%)</span>
                </div>
                <div className="h-8 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${(profile.moderate.hashrate / profile.aggressive.hashrate) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Aggressive OC</span>
                  <span className="text-orange-500">{profile.aggressive.hashrate} TH/s (+{calculateGain(profile.aggressive.hashrate, profile.stock.hashrate)}%)</span>
                </div>
                <div className="h-8 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Warning */}
        <ScrollReveal delay={300}>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Overclocking Considerations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Higher power consumption increases electricity costs</li>
                <li>• Requires custom firmware (BraiinsOS, VNish, etc.)</li>
                <li>• May accelerate chip degradation over multi-year timescales</li>
                <li>• Ensure cooling system can handle increased heat load</li>
                <li>• Test stability thoroughly before production deployment</li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
