import React, { useState } from 'react';
import { 
  Waves, 
  Droplets, 
  Thermometer,
  ArrowRight,
  Filter,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const waterSystems = [
  {
    id: 'plate-exchanger',
    name: 'Plate Heat Exchanger System',
    description: 'Uses natural water bodies for heat exchange with minimal environmental impact',
    steps: [
      { name: 'Intake', description: 'Water drawn from river/lake/sea through screened intake', icon: Waves },
      { name: 'Pre-Filter', description: 'Remove debris, sediment, and organic matter', icon: Filter },
      { name: 'Heat Exchange', description: 'Plate exchanger transfers heat from coolant to water', icon: Thermometer },
      { name: 'Discharge', description: 'Warm water returned to source (max +3°C rise)', icon: ArrowRight }
    ],
    metrics: {
      'Water Temperature Rise': '≤ 3°C',
      'Flow Rate (100 MW)': '~8,000 m³/hour',
      'Intake Distance': '< 500m recommended',
      'Environmental Permit': 'Required'
    }
  },
  {
    id: 'makeup-water',
    name: 'Cooling Tower Makeup System',
    description: 'Supplies water to compensate for evaporative losses in wet cooling towers',
    steps: [
      { name: 'Source', description: 'Water from municipal supply, well, or reservoir', icon: Waves },
      { name: 'Treatment', description: 'Softening, anti-scaling, biocide treatment', icon: Filter },
      { name: 'Storage', description: 'Buffer tank for consistent supply (2-4 hour capacity)', icon: Droplets },
      { name: 'Distribution', description: 'Pumped to cooling tower basins on demand', icon: ArrowRight }
    ],
    metrics: {
      'Evaporation Rate': '~1.5% of circulation',
      'Blowdown Rate': '~0.5% of circulation',
      'Makeup Volume (100 MW)': '~150 m³/hour peak',
      'Treatment Cost': '$0.10-0.15/m³'
    }
  }
];

const temperatureWaterCurve = [
  { temp: 20, water: 50 },
  { temp: 25, water: 80 },
  { temp: 30, water: 120 },
  { temp: 35, water: 180 },
  { temp: 40, water: 280 },
  { temp: 45, water: 400 }
];

const HydroWaterSystemsSection = () => {
  const [activeSystem, setActiveSystem] = useState('plate-exchanger');
  const currentSystem = waterSystems.find(s => s.id === activeSystem) || waterSystems[0];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-cyan-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-4">
              <Waves className="w-4 h-4" />
              Water Systems
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Water Management Systems
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Understanding the water infrastructure required for different hydro-cooling approaches.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <Tabs value={activeSystem} onValueChange={setActiveSystem} className="w-full">
            <TabsList className="grid grid-cols-2 gap-4 h-auto bg-transparent mb-8">
              {waterSystems.map((system) => (
                <TabsTrigger
                  key={system.id}
                  value={system.id}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all data-[state=active]:border-cyan-500 data-[state=active]:bg-cyan-50 border-watt-navy/10 bg-white hover:border-cyan-300"
                >
                  <Waves className="w-6 h-6 text-cyan-600" />
                  <span className="text-sm font-medium text-watt-navy">{system.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {waterSystems.map((system) => (
              <TabsContent key={system.id} value={system.id} className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Water Flow Diagram */}
                  <div className="lg:col-span-2">
                    <Card className="border-watt-navy/10 h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-watt-navy mb-2">{system.name}</h3>
                        <p className="text-sm text-watt-navy/70 mb-6">{system.description}</p>
                        
                        {/* Flow Steps */}
                        <div className="relative">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {system.steps.map((step, index) => (
                              <div key={index} className="relative">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-3 relative z-10">
                                    <step.icon className="w-7 h-7 text-white" />
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-watt-navy text-white text-xs flex items-center justify-center font-bold">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-watt-navy text-sm mb-1">{step.name}</h4>
                                  <p className="text-xs text-watt-navy/60">{step.description}</p>
                                </div>
                                
                                {/* Connector Arrow */}
                                {index < system.steps.length - 1 && (
                                  <div className="hidden md:block absolute top-8 left-[calc(100%-8px)] w-[calc(100%-32px)]">
                                    <div className="flex items-center">
                                      <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400" />
                                      <ArrowRight className="w-4 h-4 text-blue-400 -ml-1" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Animated water flow indicator */}
                          <div className="mt-8 p-4 rounded-lg bg-cyan-50 border border-cyan-200">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-cyan-700">Continuous water circulation in progress</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Metrics */}
                  <Card className="border-watt-navy/10">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-watt-navy mb-4">System Metrics</h4>
                      <ul className="space-y-4">
                        {Object.entries(system.metrics).map(([key, value], index) => (
                          <li key={index} className="flex flex-col">
                            <span className="text-xs text-watt-navy/60">{key}</span>
                            <span className="text-lg font-semibold text-cyan-600">{value}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </ScrollReveal>

        {/* Water Consumption Curve */}
        <ScrollReveal delay={200}>
          <Card className="border-watt-navy/10 mt-12">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-watt-navy mb-6 text-center">
                Water Consumption vs Temperature (100 MW Facility)
              </h3>
              
              <div className="relative h-64 mb-6">
                {/* Y-axis */}
                <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between items-end pr-2">
                  <span className="text-xs text-watt-navy/60">400</span>
                  <span className="text-xs text-watt-navy/60">300</span>
                  <span className="text-xs text-watt-navy/60">200</span>
                  <span className="text-xs text-watt-navy/60">100</span>
                  <span className="text-xs text-watt-navy/60">0</span>
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-watt-navy/60 origin-center">
                  m³/hour
                </div>

                {/* Chart area */}
                <div className="absolute left-20 right-4 top-0 bottom-8 border-l-2 border-b-2 border-watt-navy/20">
                  {/* Grid lines */}
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-watt-navy/10"
                      style={{ top: `${(i + 1) * 20}%` }}
                    />
                  ))}

                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-around px-4">
                    {temperatureWaterCurve.map((point, index) => (
                      <div key={index} className="flex flex-col items-center gap-1">
                        <div
                          className="w-12 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-cyan-400 hover:to-blue-300"
                          style={{ height: `${(point.water / 400) * 100}%` }}
                        >
                          <div className="text-xs text-white font-bold text-center pt-1">
                            {point.water}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="absolute left-20 right-4 bottom-0 flex justify-around">
                  {temperatureWaterCurve.map((point, index) => (
                    <span key={index} className="text-xs text-watt-navy/60">{point.temp}°C</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-watt-navy/70">
                <Thermometer className="w-4 h-4" />
                Ambient Temperature
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-800 text-sm">Cold Climate (≤25°C)</h4>
                      <p className="text-xs text-green-700">Minimal water consumption, dry cooling often sufficient</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-800 text-sm">Hot Climate (≥35°C)</h4>
                      <p className="text-xs text-amber-700">High water consumption, ensure reliable water source</p>
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

export default HydroWaterSystemsSection;
