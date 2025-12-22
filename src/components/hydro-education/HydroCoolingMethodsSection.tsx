import React, { useState } from 'react';
import { 
  Waves, 
  Wind, 
  Droplets, 
  CloudRain,
  Thermometer,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const coolingMethods = [
  {
    id: 'plate-exchanger',
    name: 'Plate Heat Exchanger',
    icon: Waves,
    description: 'Uses natural water bodies (rivers, lakes, seas) for heat exchange. Most efficient method with lowest operational costs.',
    suitableFor: ['Coastal regions', 'River-adjacent sites', 'Tropical climates'],
    requirements: ['Access to natural water body', 'Water quality testing', 'Environmental permits'],
    landArea: '15,000 - 20,000 m²',
    waterConsumption: 'Moderate (recirculated)',
    pue: '1.02 - 1.05',
    bestTemps: 'All climates',
    color: 'from-blue-500 to-cyan-500',
    diagram: (
      <div className="relative h-48 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-blue-400/50 flex items-center justify-center">
          <span className="text-xs font-medium text-blue-800">Natural Water Source</span>
        </div>
        <div className="absolute top-1/4 left-1/4 w-24 h-16 bg-white rounded border-2 border-blue-500 flex items-center justify-center">
          <span className="text-xs text-center">Heat<br/>Exchanger</span>
        </div>
        <div className="absolute top-1/4 right-1/4 w-20 h-12 bg-gray-700 rounded flex items-center justify-center">
          <span className="text-xs text-white">Miners</span>
        </div>
        {/* Flow arrows */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>
          <path d="M 140 60 L 180 60" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <path d="M 220 80 L 140 80" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead)" />
        </svg>
      </div>
    )
  },
  {
    id: 'dry-wet-tower',
    name: 'Dry-Wet Cooling Tower',
    icon: CloudRain,
    description: 'Combines dry cooling with evaporative cooling during peak temperatures. Ideal for hot climates with available water.',
    suitableFor: ['Desert regions', 'Middle East', 'Hot summer climates'],
    requirements: ['Water source for makeup', 'Larger land area', 'Water treatment system'],
    landArea: '25,000 - 35,000 m²',
    waterConsumption: 'High (evaporative)',
    pue: '1.05 - 1.08',
    bestTemps: '30°C - 45°C ambient',
    color: 'from-orange-500 to-yellow-500',
    diagram: (
      <div className="relative h-48 bg-gradient-to-b from-orange-100 to-orange-200 rounded-lg overflow-hidden">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-20 bg-gray-500 rounded-t-lg relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-400 rounded-full animate-pulse" />
            <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] text-white">Tower</span>
          </div>
        </div>
        <div className="absolute bottom-8 left-8 w-20 h-12 bg-gray-700 rounded flex items-center justify-center">
          <span className="text-xs text-white">Miners</span>
        </div>
        <div className="absolute bottom-8 right-8 w-16 h-10 bg-blue-400 rounded flex items-center justify-center">
          <span className="text-[8px] text-white text-center">Water<br/>Tank</span>
        </div>
        <div className="absolute top-1/3 left-4 right-4 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 h-4 bg-blue-400/50 rounded animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'dry-tower',
    name: 'Dry Cooling Tower',
    icon: Wind,
    description: 'Air-only cooling through radiators. Zero water consumption, ideal for cold climates with low ambient temperatures.',
    suitableFor: ['Northern regions', 'Canada', 'Scandinavia', 'Russia'],
    requirements: ['Cold climate (<25°C average)', 'No water infrastructure needed'],
    landArea: '20,000 - 30,000 m²',
    waterConsumption: 'Zero',
    pue: '1.02 - 1.04',
    bestTemps: '-20°C - 25°C ambient',
    color: 'from-gray-500 to-slate-500',
    diagram: (
      <div className="relative h-48 bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg overflow-hidden">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-10 h-16 bg-gray-600 rounded-t-lg relative">
              <Wind className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 text-blue-300 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-gray-700 rounded flex items-center justify-center">
          <span className="text-xs text-white">Mining Units</span>
        </div>
        {/* Cold air indicators */}
        <div className="absolute top-20 left-1/4 text-blue-400 text-xs animate-pulse">❄️ Cold Air</div>
        <div className="absolute top-20 right-1/4 text-red-400 text-xs animate-pulse">🔥 Hot Air</div>
      </div>
    )
  },
  {
    id: 'dry-curtain',
    name: 'Dry Tower + Water Curtain',
    icon: Droplets,
    description: 'Dry cooling with water curtain spray activation during extreme heat. Balances water efficiency with peak cooling needs.',
    suitableFor: ['Variable climates', 'Seasonal temperature swings', 'Water-scarce regions'],
    requirements: ['Backup water supply', 'Automated controls', 'Spray system'],
    landArea: '22,000 - 32,000 m²',
    waterConsumption: 'Low (seasonal)',
    pue: '1.03 - 1.06',
    bestTemps: '-10°C - 40°C ambient',
    color: 'from-teal-500 to-blue-500',
    diagram: (
      <div className="relative h-48 bg-gradient-to-b from-teal-100 to-teal-200 rounded-lg overflow-hidden">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <div className="w-12 h-20 bg-gray-600 rounded-t-lg relative">
            <Wind className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 text-gray-300" />
          </div>
          <div className="w-8 h-20 bg-blue-400/50 rounded flex flex-col items-center justify-center gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1 h-2 bg-blue-500 rounded animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-20 h-10 bg-gray-700 rounded flex items-center justify-center">
          <span className="text-xs text-white">Miners</span>
        </div>
        <div className="absolute top-1/2 right-8 px-2 py-1 bg-teal-500 rounded text-[8px] text-white">
          Auto Spray<br/>@ 35°C+
        </div>
      </div>
    )
  }
];

const HydroCoolingMethodsSection = () => {
  const [selectedMethod, setSelectedMethod] = useState(coolingMethods[0].id);
  const activeMethod = coolingMethods.find(m => m.id === selectedMethod) || coolingMethods[0];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-4">
              <Thermometer className="w-4 h-4" />
              Cooling Methods
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Cooling Strategy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the optimal cooling method based on your site's climate, 
              water availability, and operational requirements.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <Tabs value={selectedMethod} onValueChange={setSelectedMethod} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto bg-transparent mb-8">
              {coolingMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <TabsTrigger
                    key={method.id}
                    value={method.id}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 border-border bg-white hover:border-blue-300`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{method.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {coolingMethods.map((method) => (
              <TabsContent key={method.id} value={method.id} className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Diagram and Description */}
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-4">{method.name}</h3>
                      <p className="text-muted-foreground mb-6">{method.description}</p>
                      
                      {/* Interactive Diagram */}
                      <div className="mb-6">
                        <span className="text-sm font-medium text-muted-foreground mb-2 block">System Diagram</span>
                        {method.diagram}
                      </div>

                      {/* Suitable Regions */}
                      <div className="flex flex-wrap gap-2">
                        {method.suitableFor.map((region, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                            <MapPin className="w-3 h-3" />
                            {region}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: Specifications */}
                  <div className="space-y-4">
                    {/* Key Metrics */}
                    <Card className="border-border">
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-foreground mb-4">Key Specifications</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-blue-50">
                            <span className="text-xs text-muted-foreground">PUE Rating</span>
                            <div className="text-xl font-bold text-blue-600">{method.pue}</div>
                          </div>
                          <div className="p-4 rounded-lg bg-green-50">
                            <span className="text-xs text-muted-foreground">Land Required</span>
                            <div className="text-xl font-bold text-green-600">{method.landArea}</div>
                          </div>
                          <div className="p-4 rounded-lg bg-cyan-50">
                            <span className="text-xs text-muted-foreground">Water Usage</span>
                            <div className="text-xl font-bold text-cyan-600">{method.waterConsumption}</div>
                          </div>
                          <div className="p-4 rounded-lg bg-orange-50">
                            <span className="text-xs text-muted-foreground">Best Temperature Range</span>
                            <div className="text-xl font-bold text-orange-600">{method.bestTemps}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Requirements */}
                    <Card className="border-border">
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-foreground mb-4">Requirements</h4>
                        <ul className="space-y-2">
                          {method.requirements.map((req, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HydroCoolingMethodsSection;
