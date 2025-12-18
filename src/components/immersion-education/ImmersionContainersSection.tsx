import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Box, Zap, Thermometer, Volume2, Ruler, CheckCircle2 } from 'lucide-react';

const containerSpecs = {
  name: 'Bitmain ANTSPACE HD5',
  type: '40ft Immersion Container',
  image: '📦',
  keySpecs: {
    miners: '280 ASICs',
    power: '840 kW',
    hashrate: '56+ PH/s',
    noise: '<55 dB',
    pue: '1.02',
    cooling: 'Single-phase immersion'
  },
  dimensions: {
    length: '12,192 mm (40 ft)',
    width: '2,438 mm (8 ft)',
    height: '2,896 mm (9.5 ft)',
    weight: '~25,000 kg (loaded)'
  },
  features: [
    'Pre-engineered turnkey solution',
    'Integrated dry coolers',
    'Remote monitoring & control',
    'Modular tank design',
    'AntSentry management system',
    'Fire suppression ready',
    'Climate-independent operation',
    'Rapid deployment (< 2 weeks)'
  ],
  electricalReqs: {
    voltage: '380-480V 3-phase',
    frequency: '50/60 Hz',
    maxCurrent: '~1,200A @ 480V',
    distribution: 'Internal PDUs'
  },
  coolingSystem: {
    fluidType: 'Engineered dielectric oil',
    fluidVolume: '~15,000 liters',
    heatRejection: '840 kW',
    ambientRange: '-40°C to +50°C'
  }
};

const comparisonData = [
  { model: 'HK3 (Hydro)', miners: 210, power: '630 kW', type: 'Hydro-cooling', footprint: '40ft' },
  { model: 'HW5 (Hydro)', miners: 104, power: '312 kW', type: 'Hydro-cooling', footprint: '20ft' },
  { model: 'HD5 (Immersion)', miners: 280, power: '840 kW', type: 'Immersion', footprint: '40ft' },
  { model: 'Air-cooled rack', miners: 20, power: '70 kW', type: 'Air', footprint: 'Standard rack' }
];

export default function ImmersionContainersSection() {
  return (
    <section id="containers" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Immersion Container Systems
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Factory-engineered immersion containers provide turnkey deployment - 
              plug in power and start mining within days, not months.
            </p>
          </div>
        </ScrollReveal>

        {/* HD5 Showcase */}
        <ScrollReveal delay={100}>
          <div className="bg-gradient-to-br from-cyan-500/10 via-background to-blue-500/10 border border-cyan-500/20 rounded-2xl overflow-hidden mb-12">
            <div className="p-6 border-b border-cyan-500/20 bg-cyan-500/5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{containerSpecs.image}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{containerSpecs.name}</h3>
                    <p className="text-muted-foreground">{containerSpecs.type}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-500 rounded-full text-sm font-medium">
                    Industrial Grade
                  </span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                    Turnkey Solution
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(containerSpecs.keySpecs).map(([key, value]) => (
                  <div key={key} className="bg-card border border-border rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-500">{value}</div>
                    <div className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                  </div>
                ))}
              </div>
              
              {/* Detailed Specs Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Dimensions */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Ruler className="w-5 h-5 text-cyan-500" />
                    <h4 className="font-semibold text-foreground">Dimensions</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    {Object.entries(containerSpecs.dimensions).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key}</span>
                        <span className="text-foreground font-mono text-xs">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Electrical */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-foreground">Electrical</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    {Object.entries(containerSpecs.electricalReqs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-foreground font-mono text-xs">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Cooling */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Thermometer className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-foreground">Cooling System</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    {Object.entries(containerSpecs.coolingSystem).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-foreground font-mono text-xs">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Features */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-foreground">Features</h4>
                  </div>
                  <div className="space-y-1">
                    {containerSpecs.features.slice(0, 6).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-1 h-1 bg-green-500 rounded-full" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Container Comparison */}
        <ScrollReveal delay={150}>
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-12">
            <div className="p-4 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-foreground">Bitmain Container Comparison</h3>
              <p className="text-sm text-muted-foreground">Cooling solutions for different scales</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Model</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Capacity</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Power</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Cooling Type</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Footprint</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr 
                      key={row.model} 
                      className={`border-b border-border/50 ${
                        row.model.includes('HD5') 
                          ? 'bg-cyan-500/5' 
                          : i % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                      }`}
                    >
                      <td className="p-4 font-medium text-foreground">
                        {row.model}
                        {row.model.includes('HD5') && (
                          <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-500 px-2 py-0.5 rounded">
                            Immersion
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-foreground">{row.miners} miners</td>
                      <td className="p-4 text-muted-foreground">{row.power}</td>
                      <td className="p-4 text-muted-foreground">{row.type}</td>
                      <td className="p-4 text-muted-foreground">{row.footprint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Deployment Benefits */}
        <ScrollReveal delay={200}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Rapid Deployment</h4>
              <p className="text-sm text-muted-foreground">
                From delivery to mining in under 2 weeks. Pre-tested systems 
                eliminate months of construction and commissioning.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Any Climate</h4>
              <p className="text-sm text-muted-foreground">
                Operate from -40°C to +50°C ambient. Deploy in deserts, 
                arctic regions, or tropical climates without modification.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Integrated Management</h4>
              <p className="text-sm text-muted-foreground">
                AntSentry system provides remote monitoring, fleet management, 
                and automated optimization across all containers.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
