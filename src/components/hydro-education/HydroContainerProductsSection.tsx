import React, { useState } from 'react';
import { 
  Box, 
  Zap, 
  Thermometer,
  Ruler,
  Weight,
  Droplets,
  CheckCircle,
  Server,
  Info
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const containerProducts = [
  {
    id: 'hk3',
    name: 'ANTSPACE HK3',
    subtitle: 'Plate Heat Exchanger Cooling',
    description: 'High-efficiency hydro-cooling container using plate heat exchangers for direct water cooling from natural sources.',
    image: '🏭',
    color: 'from-blue-500 to-cyan-500',
    specs: {
      dimensions: '12,192 × 2,438 × 2,896 mm',
      weight: '~8,500 kg (empty)',
      minerCapacity: '210 miners (S21 Hydro)',
      powerCapacity: '~630 kW per container',
      coolingMethod: 'Plate Heat Exchanger',
      waterFlow: '31-110 m³/h (temp dependent)',
      noiseLevel: '< 65 dB at 1m',
      operatingTemp: '-40°C to +45°C'
    },
    features: [
      'Direct natural water cooling',
      'Minimal water consumption',
      'Low maintenance',
      'Suitable for river/lake/sea water',
      'No evaporative losses'
    ],
    applications: ['Riverside sites', 'Lakeside facilities', 'Coastal operations'],
    basicUnit: {
      transformers: 1,
      containers: 2,
      power: '2.5 MW'
    }
  },
  {
    id: 'hw5',
    name: 'ANTSPACE HW5',
    subtitle: 'Dry-Wet Cooling Tower',
    description: 'Versatile hydro-cooling container combining dry and wet cooling for optimal efficiency across temperature ranges.',
    image: '🏗️',
    color: 'from-green-500 to-emerald-500',
    specs: {
      dimensions: '12,192 × 2,438 × 2,896 mm',
      weight: '~9,200 kg (empty)',
      minerCapacity: '210 miners (S21 Hydro)',
      powerCapacity: '~630 kW per container',
      coolingMethod: 'Dry-Wet Hybrid Tower',
      waterFlow: '1.3 m³/h makeup per tower',
      noiseLevel: '< 70 dB at 1m',
      operatingTemp: '-35°C to +50°C'
    },
    features: [
      'Hybrid dry/wet operation',
      'No natural water source needed',
      'Optimized for various climates',
      'Automatic mode switching',
      'Higher ambient temp tolerance'
    ],
    applications: ['Inland sites', 'Desert regions', 'Urban locations'],
    basicUnit: {
      transformers: 1,
      containers: 2,
      power: '2.5 MW'
    }
  },
  {
    id: 'hd5',
    name: 'ANTSPACE HD5',
    subtitle: 'High-Density Immersion',
    description: 'Maximum density immersion cooling container for the highest power density and efficiency requirements.',
    image: '💧',
    color: 'from-purple-500 to-violet-500',
    specs: {
      dimensions: '12,192 × 2,438 × 2,896 mm',
      weight: '~12,000 kg (with coolant)',
      minerCapacity: '280 miners (S21 Hydro)',
      powerCapacity: '~840 kW per container',
      coolingMethod: 'Single-Phase Immersion',
      waterFlow: 'Closed loop circulation',
      noiseLevel: '< 55 dB at 1m',
      operatingTemp: '-20°C to +55°C'
    },
    features: [
      'Highest power density',
      'Near-silent operation',
      'Extended hardware lifespan',
      'Minimal dust/corrosion',
      'Overclocking potential'
    ],
    applications: ['Space-constrained sites', 'Noise-sensitive areas', 'Premium facilities'],
    basicUnit: {
      transformers: 1,
      containers: 2,
      power: '3.0 MW'
    }
  }
];

const coolingComparison = [
  { feature: 'Water Source Required', hk3: 'Natural (river/lake)', hw5: 'Municipal/well', hd5: 'None (closed loop)' },
  { feature: 'Water Consumption', hk3: 'Zero (through-flow)', hw5: '1.3 m³/h per tower', hd5: 'Zero' },
  { feature: 'Max Ambient Temp', hk3: '45°C', hw5: '50°C', hd5: '55°C' },
  { feature: 'Noise Level', hk3: '< 65 dB', hw5: '< 70 dB', hd5: '< 55 dB' },
  { feature: 'PUE Rating', hk3: '1.02-1.05', hw5: '1.05-1.10', hd5: '1.02-1.04' },
  { feature: 'Initial Cost', hk3: 'Medium', hw5: 'Medium', hd5: 'High' },
  { feature: 'Maintenance', hk3: 'Low', hw5: 'Medium', hd5: 'Low' }
];

const HydroContainerProductsSection = () => {
  const [selectedContainer, setSelectedContainer] = useState(containerProducts[0]);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
              <Box className="w-4 h-4" />
              Container Products
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hydro-Cooling Container Systems
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built 40ft containers engineered for liquid-cooled Bitcoin mining 
              with different cooling technologies for various deployment scenarios.
            </p>
          </div>
        </ScrollReveal>

        {/* Container Selector */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {containerProducts.map((container) => (
              <Button
                key={container.id}
                variant={selectedContainer.id === container.id ? "default" : "outline"}
                className={`h-auto py-6 px-6 flex flex-col items-center gap-3 ${
                  selectedContainer.id === container.id 
                    ? 'bg-gradient-to-br ' + container.color + ' text-white border-0 shadow-lg' 
                    : 'border-border text-foreground hover:border-blue-300'
                }`}
                onClick={() => setSelectedContainer(container)}
              >
                <span className="text-4xl">{container.image}</span>
                <div className="text-center">
                  <span className="text-lg font-bold block">{container.name}</span>
                  <span className="text-sm opacity-80">{container.subtitle}</span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* Selected Container Details */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Container Visualization */}
            <Card className="border-border overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-br ${selectedContainer.color} p-8 text-white`}>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-6xl">{selectedContainer.image}</span>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedContainer.name}</h3>
                      <p className="text-white/80">{selectedContainer.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-white/90 mb-6">{selectedContainer.description}</p>
                  
                  {/* Container Diagram */}
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="aspect-[3/1] relative border-2 border-white/30 rounded-lg">
                      {/* Container body */}
                      <div className="absolute inset-2 bg-white/20 rounded flex items-center justify-center gap-1">
                        {[...Array(7)].map((_, i) => (
                          <div key={i} className="w-8 h-12 bg-white/40 rounded flex items-center justify-center">
                            <Server className="w-4 h-4 text-white/80" />
                          </div>
                        ))}
                      </div>
                      {/* Labels */}
                      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-white/70">
                        <span>← 12.2m →</span>
                        <span>{selectedContainer.specs.minerCapacity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Key Features</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedContainer.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications Panel */}
            <div className="space-y-6">
              {/* Technical Specs */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-blue-500" />
                    Technical Specifications
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(selectedContainer.specs).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-medium text-foreground font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Basic Unit Configuration */}
              <Card className="border-watt-navy/10 bg-gradient-to-br from-watt-navy to-blue-900 text-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Basic Unit Configuration</h4>
                      <p className="text-sm text-white/70 mb-4">
                        Standard modular deployment unit for scalable operations:
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg bg-white/10">
                          <span className="text-2xl font-bold">{selectedContainer.basicUnit.transformers}</span>
                          <span className="text-xs block opacity-70">Transformer</span>
                          <span className="text-xs block opacity-50">2,500 kVA</span>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/10">
                          <span className="text-2xl font-bold">{selectedContainer.basicUnit.containers}</span>
                          <span className="text-xs block opacity-70">Containers</span>
                          <span className="text-xs block opacity-50">40ft each</span>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/10">
                          <span className="text-2xl font-bold">{selectedContainer.basicUnit.power}</span>
                          <span className="text-xs block opacity-70">Total Power</span>
                          <span className="text-xs block opacity-50">per unit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best Applications */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Best Applications</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContainer.applications.map((app, i) => (
                      <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-700">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal>
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">
                Container Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                      <th className="text-center py-3 px-4 font-semibold text-blue-600">HK3</th>
                      <th className="text-center py-3 px-4 font-semibold text-green-600">HW5</th>
                      <th className="text-center py-3 px-4 font-semibold text-purple-600">HD5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coolingComparison.map((row, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-muted-foreground">{row.feature}</td>
                        <td className="py-3 px-4 text-center font-medium text-foreground">{row.hk3}</td>
                        <td className="py-3 px-4 text-center font-medium text-foreground">{row.hw5}</td>
                        <td className="py-3 px-4 text-center font-medium text-foreground">{row.hd5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Scaling Guide */}
        <ScrollReveal delay={100}>
          <Card className="border-border mt-8 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Scaling to 100 MW</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    For a 100 MW facility using HK3 containers with plate heat exchangers:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-white text-center">
                      <span className="text-2xl font-bold text-blue-600">40</span>
                      <span className="text-xs block text-muted-foreground">Basic Units</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white text-center">
                      <span className="text-2xl font-bold text-blue-600">80</span>
                      <span className="text-xs block text-muted-foreground">Containers</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white text-center">
                      <span className="text-2xl font-bold text-blue-600">40</span>
                      <span className="text-xs block text-muted-foreground">Transformers</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white text-center">
                      <span className="text-2xl font-bold text-blue-600">16,800</span>
                      <span className="text-xs block text-muted-foreground">Total Miners</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HydroContainerProductsSection;
