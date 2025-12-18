import { useState } from 'react';
import { Fan, Droplets, Thermometer, Zap, Wind, Server } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScrollReveal from '@/components/animations/ScrollReveal';

const noiseSources = [
  {
    id: 'air-cooled',
    name: 'Air-Cooled Containers',
    icon: Fan,
    range: '85-105 dB',
    avgDb: 95,
    color: 'watt-bitcoin',
    description: 'High-speed axial fans create significant noise. Each container may have 20-40 fans running at 3000+ RPM.',
    components: [
      { name: 'Intake Fans (x20)', db: '80-90 dB' },
      { name: 'Exhaust Fans (x20)', db: '82-92 dB' },
      { name: 'ASIC Miner Fans', db: '75-85 dB' },
      { name: 'Combined Total', db: '95-105 dB' },
    ],
  },
  {
    id: 'hydro-cooled',
    name: 'Hydro-Cooled Containers',
    icon: Droplets,
    range: '60-75 dB',
    avgDb: 67,
    color: 'watt-coinbase',
    description: 'Water circulation replaces most fans. Quieter operation with pumps and reduced airflow requirements.',
    components: [
      { name: 'Circulation Pumps', db: '55-65 dB' },
      { name: 'Heat Exchanger Fans', db: '50-60 dB' },
      { name: 'ASIC Units (fanless)', db: '40-50 dB' },
      { name: 'Combined Total', db: '60-75 dB' },
    ],
  },
  {
    id: 'immersion',
    name: 'Immersion Cooling',
    icon: Thermometer,
    range: '50-65 dB',
    avgDb: 55,
    color: 'watt-success',
    description: 'Nearly silent operation with ASICs submerged in dielectric fluid. Minimal moving parts.',
    components: [
      { name: 'Dielectric Pumps', db: '45-55 dB' },
      { name: 'External Dry Cooler', db: '50-60 dB' },
      { name: 'ASIC Units (silent)', db: '< 40 dB' },
      { name: 'Combined Total', db: '50-65 dB' },
    ],
  },
];

const otherSources = [
  { name: 'Power Transformers', range: '55-75 dB', icon: Zap, note: '60Hz hum, always-on' },
  { name: 'Cooling Towers', range: '65-85 dB', icon: Wind, note: 'Fan + water splash noise' },
  { name: 'HVAC Systems', range: '50-70 dB', icon: Fan, note: 'Office/control room cooling' },
  { name: 'Backup Generators', range: '85-100 dB', icon: Server, note: 'Intermittent, emergency only' },
];

export const NoiseSourcesSection = () => {
  const [activeSource, setActiveSource] = useState('hydro-cooled');

  return (
    <section id="noise-sources" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-watt-coinbase/10 rounded-full mb-4">
              <Server className="h-4 w-4 text-watt-coinbase" />
              <span className="text-sm font-medium text-watt-coinbase">Noise Sources</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Mining Facility Noise Sources
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Different cooling technologies produce vastly different noise levels. Understanding these sources
              is key to selecting the right solution for your site.
            </p>
          </div>
        </ScrollReveal>

        {/* Cooling Technology Comparison */}
        <ScrollReveal delay={100}>
          <Tabs value={activeSource} onValueChange={setActiveSource} className="mb-12">
            <TabsList className="grid w-full grid-cols-3 bg-watt-light p-1 rounded-xl h-auto">
              {noiseSources.map((source) => {
                const Icon = source.icon;
                return (
                  <TabsTrigger
                    key={source.id}
                    value={source.id}
                    className={`flex flex-col md:flex-row items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs md:text-sm font-medium">{source.name.split(' ')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {noiseSources.map((source) => {
              const Icon = source.icon;
              return (
                <TabsContent key={source.id} value={source.id} className="mt-6">
                  <Card className="bg-white border border-watt-navy/10 shadow-institutional">
                    <CardContent className="p-6 md:p-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Info */}
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-14 h-14 bg-${source.color}/10 rounded-xl flex items-center justify-center`}>
                              <Icon className={`h-7 w-7 text-${source.color}`} />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-watt-navy">{source.name}</h3>
                              <p className={`text-${source.color} font-bold text-lg`}>{source.range}</p>
                            </div>
                          </div>
                          <p className="text-watt-navy/70 mb-6">{source.description}</p>
                          
                          {/* Component Breakdown */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-watt-navy">Noise Components:</h4>
                            {source.components.map((comp, idx) => (
                              <div key={idx} className="flex justify-between items-center py-2 border-b border-watt-navy/10 last:border-0">
                                <span className="text-sm text-watt-navy/70">{comp.name}</span>
                                <span className={`font-mono font-bold ${idx === source.components.length - 1 ? `text-${source.color}` : 'text-watt-navy'}`}>
                                  {comp.db}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Visual Diagram */}
                        <div className="relative">
                          <div className="bg-watt-light rounded-xl p-6 h-full flex items-center justify-center">
                            {/* Container Visualization */}
                            <div className="relative w-full max-w-xs">
                              {/* Container Body */}
                              <div className={`bg-gradient-to-br from-${source.color}/20 to-${source.color}/5 border-2 border-${source.color}/30 rounded-lg p-6 aspect-[2/1]`}>
                                <div className="text-center">
                                  <Icon className={`h-12 w-12 mx-auto text-${source.color} mb-2`} />
                                  <p className="text-sm font-medium text-watt-navy">{source.name}</p>
                                </div>
                              </div>
                              
                              {/* Sound Waves Animation */}
                              <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                                {[1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className={`absolute border-2 border-${source.color}/30 rounded-full animate-ping`}
                                    style={{
                                      width: `${30 + i * 20}px`,
                                      height: `${30 + i * 20}px`,
                                      top: `${-15 - i * 10}px`,
                                      left: `${-15 - i * 10}px`,
                                      animationDelay: `${i * 0.3}s`,
                                      animationDuration: '2s',
                                    }}
                                  />
                                ))}
                              </div>

                              {/* dB Badge */}
                              <div className={`absolute -top-3 -right-3 bg-${source.color} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
                                ~{source.avgDb} dB
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </ScrollReveal>

        {/* Comparison Bar Chart */}
        <ScrollReveal delay={200}>
          <Card className="bg-watt-navy text-white border-none shadow-xl mb-12">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6">Cooling Technology Noise Comparison</h3>
              <div className="space-y-4">
                {noiseSources.map((source) => {
                  const percentage = (source.avgDb / 105) * 100;
                  return (
                    <div key={source.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{source.name}</span>
                        <span className="font-mono font-bold">{source.avgDb} dB avg</span>
                      </div>
                      <div className="h-6 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${source.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 p-4 bg-watt-success/20 rounded-lg">
                <p className="text-sm">
                  <strong className="text-watt-success">Hydro Advantage:</strong> Choosing hydro-cooled over air-cooled 
                  reduces noise by ~28 dB, equivalent to <strong>630× less sound energy</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Other Noise Sources */}
        <ScrollReveal delay={300}>
          <h3 className="text-xl font-bold text-watt-navy mb-6">Other Facility Noise Sources</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherSources.map((source, idx) => {
              const Icon = source.icon;
              return (
                <Card key={idx} className="bg-white border-none shadow-institutional">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-watt-light rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-watt-navy" />
                      </div>
                      <div>
                        <p className="font-semibold text-watt-navy text-sm">{source.name}</p>
                        <p className="text-watt-bitcoin font-mono font-bold text-sm">{source.range}</p>
                      </div>
                    </div>
                    <p className="text-xs text-watt-navy/60">{source.note}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
