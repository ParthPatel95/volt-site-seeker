import { useState } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Box, Ruler, Calculator, ArrowRight } from 'lucide-react';

const tankTypes = [
  {
    name: 'Single-Miner Tank',
    capacity: '1 ASIC',
    dimensions: '60 × 30 × 40 cm',
    fluidVolume: '50-80L',
    useCase: 'Home mining, testing',
    cost: '$200-500'
  },
  {
    name: 'Rack Tank',
    capacity: '4-6 ASICs',
    dimensions: '120 × 60 × 50 cm',
    fluidVolume: '200-400L',
    useCase: 'Small operations',
    cost: '$1,000-2,500'
  },
  {
    name: 'Industrial Tank',
    capacity: '12-20 ASICs',
    dimensions: '240 × 100 × 60 cm',
    fluidVolume: '800-1,500L',
    useCase: 'Commercial mining',
    cost: '$5,000-15,000'
  },
  {
    name: 'Container System',
    capacity: '200-300 ASICs',
    dimensions: '40ft container',
    fluidVolume: '10,000-20,000L',
    useCase: 'Large-scale farms',
    cost: '$200,000+'
  }
];

const tankComponents = [
  { name: 'Tank Body', material: 'Stainless steel or HDPE', purpose: 'Contains fluid and hardware' },
  { name: 'Heat Exchanger', material: 'Copper/Aluminum coils', purpose: 'Transfers heat to external system' },
  { name: 'Circulation Pump', material: 'Mag-drive or gear pump', purpose: 'Moves fluid past heat exchanger' },
  { name: 'Filtration System', material: 'Mesh + activated carbon', purpose: 'Removes particles and contaminants' },
  { name: 'ASIC Racks', material: 'Stainless steel frames', purpose: 'Holds ASICs in proper orientation' },
  { name: 'Level Sensor', material: 'Float or capacitive', purpose: 'Monitors fluid level' },
  { name: 'Temperature Probes', material: 'RTD or thermocouple', purpose: 'Monitors fluid and chip temps' },
  { name: 'Overflow/Drain', material: 'Ball valves + drain pan', purpose: 'Emergency overflow and maintenance' }
];

export default function TankSystemsSection() {
  const [asicCount, setAsicCount] = useState(10);
  const [asicModel, setAsicModel] = useState('s21');
  
  const asicSpecs: Record<string, { name: string; power: number; dimensions: number[] }> = {
    s21: { name: 'S21', power: 3500, dimensions: [400, 195, 290] },
    s19pro: { name: 'S19 Pro', power: 3250, dimensions: [400, 195, 290] },
    m50s: { name: 'M50S', power: 3276, dimensions: [390, 195, 260] }
  };
  
  const spec = asicSpecs[asicModel];
  const asicVolume = (spec.dimensions[0] * spec.dimensions[1] * spec.dimensions[2]) / 1e6; // m³
  const fluidPerAsic = asicVolume * 1000 * 2.5; // ~2.5x ASIC volume for fluid
  const totalFluid = Math.round(fluidPerAsic * asicCount);
  const tankLength = Math.ceil(Math.sqrt(asicCount) * (spec.dimensions[0] / 1000 + 0.1));
  const tankWidth = Math.ceil(asicCount / Math.ceil(Math.sqrt(asicCount))) * (spec.dimensions[1] / 1000 + 0.1);
  const tankDepth = (spec.dimensions[2] / 1000) + 0.15;

  return (
    <section id="tank-systems" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tank Design & Systems
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From single-miner tanks to industrial container systems - understand the 
              components and sizing requirements for immersion cooling infrastructure.
            </p>
          </div>
        </ScrollReveal>

        {/* Tank Types */}
        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {tankTypes.map((tank) => (
              <div key={tank.name} className="bg-card border border-border rounded-xl p-5 hover:border-cyan-500/50 transition-colors">
                <Box className="w-8 h-8 text-cyan-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{tank.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="text-foreground">{tank.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="text-foreground">{tank.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fluid</span>
                    <span className="text-foreground">{tank.fluidVolume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="text-cyan-500 font-medium">{tank.cost}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{tank.useCase}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Tank Sizing Calculator */}
        <ScrollReveal delay={150}>
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8 mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-6 h-6 text-cyan-500" />
              <h3 className="text-xl font-bold text-foreground">Tank Sizing Calculator</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ASIC Model
                  </label>
                  <select
                    value={asicModel}
                    onChange={(e) => setAsicModel(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground"
                  >
                    <option value="s21">Antminer S21 (200 TH/s)</option>
                    <option value="s19pro">Antminer S19 Pro (110 TH/s)</option>
                    <option value="m50s">Whatsminer M50S (126 TH/s)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Number of ASICs: {asicCount}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={asicCount}
                    onChange={(e) => setAsicCount(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>
              </div>
              
              {/* Results */}
              <div className="bg-card/50 rounded-xl p-6">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-500" />
                  Recommended Specifications
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground">Tank Dimensions (L×W×D)</span>
                    <span className="font-mono text-cyan-500">
                      {tankLength.toFixed(1)} × {tankWidth.toFixed(1)} × {tankDepth.toFixed(1)} m
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground">Fluid Volume</span>
                    <span className="font-mono text-cyan-500">{totalFluid} L</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground">Total Power</span>
                    <span className="font-mono text-cyan-500">{((spec.power * asicCount) / 1000).toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground">Heat Rejection</span>
                    <span className="font-mono text-cyan-500">{((spec.power * asicCount) / 1000).toFixed(1)} kW</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Tank Components */}
        <ScrollReveal delay={200}>
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Essential Tank Components</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tankComponents.map((component, i) => (
              <div key={component.name} className="bg-card border border-border rounded-xl p-4">
                <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-cyan-500 font-bold text-sm">{i + 1}</span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">{component.name}</h4>
                <p className="text-xs text-cyan-500 mb-2">{component.material}</p>
                <p className="text-xs text-muted-foreground">{component.purpose}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
