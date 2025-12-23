import { useState } from 'react';
import { Ruler, Calculator, Wind, Mountain, TreePine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import LearningObjectives from '@/components/academy/LearningObjectives';
import SectionSummary from '@/components/academy/SectionSummary';
import AnimatedSoundPropagation from './AnimatedSoundPropagation';

const learningObjectives = [
  "Apply the inverse square law: -6 dB per doubling of distance",
  "Calculate distance attenuation using the formula",
  "Understand atmospheric absorption and ground effects",
  "Visualize sound propagation from source to receptor",
];
export const DistanceAttenuationSection = () => {
  const [sourceDb, setSourceDb] = useState(81.8);
  const [distance, setDistance] = useState(1700);
  const [refDistance] = useState(1);

  // Distance attenuation: L_d = L_ref - 20 × log₁₀(d/d_ref)
  const attenuation = 20 * Math.log10(distance / refDistance);
  const resultDb = sourceDb - attenuation;

  // Additional atmospheric absorption (~0.005 dB/m at 1kHz, increases with frequency)
  const atmosphericLoss = distance * 0.002; // Conservative estimate
  const totalResultDb = Math.max(0, resultDb - atmosphericLoss);

  return (
    <section id="distance" className="py-16 md:py-24 bg-watt-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal delay={50}>
          <LearningObjectives 
            objectives={learningObjectives}
            estimatedTime="5 min read"
          />
        </ScrollReveal>

        {/* Animated Sound Propagation */}
        <ScrollReveal delay={100}>
          <div className="mb-12">
            <AnimatedSoundPropagation initialSourceDb={81.8} initialDistance={1700} />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-watt-coinbase/10 rounded-full mb-4">
              <Ruler className="h-4 w-4 text-watt-coinbase" />
              <span className="text-sm font-medium text-watt-coinbase">Distance Effects</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Distance Attenuation
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Sound naturally decreases as it travels. Understanding this attenuation is crucial
              for predicting noise levels at receptor locations.
            </p>
          </div>
        </ScrollReveal>

        {/* Formula and Concepts */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <ScrollReveal delay={100}>
            <Card className="bg-white border-none shadow-institutional h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-watt-navy mb-4">Spherical Spreading Loss</h3>
                <div className="bg-watt-navy text-white rounded-xl p-6 font-mono mb-4">
                  <p className="text-lg">L<sub>d</sub> = L<sub>ref</sub> - 20 × log₁₀(d / d<sub>ref</sub>)</p>
                  <p className="text-sm text-white/70 mt-4">Rule of thumb: -6 dB per doubling of distance</p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-watt-navy">Distance vs. Attenuation:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { dist: '10m', atten: '-20 dB' },
                      { dist: '100m', atten: '-40 dB' },
                      { dist: '500m', atten: '-54 dB' },
                      { dist: '1km', atten: '-60 dB' },
                      { dist: '1.7km', atten: '-65 dB' },
                      { dist: '5km', atten: '-74 dB' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between bg-watt-light rounded-lg px-3 py-2">
                        <span className="text-watt-navy/70">{item.dist}</span>
                        <span className="font-mono font-bold text-watt-coinbase">{item.atten}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <Card className="bg-white border-none shadow-institutional h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-watt-navy mb-4">Additional Factors</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-watt-light rounded-lg">
                    <div className="w-10 h-10 bg-watt-coinbase/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Wind className="h-5 w-5 text-watt-coinbase" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-watt-navy">Atmospheric Absorption</h4>
                      <p className="text-sm text-watt-navy/70">
                        Air absorbs sound energy, especially high frequencies. Adds ~0.5-2 dB per 100m.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-watt-light rounded-lg">
                    <div className="w-10 h-10 bg-watt-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mountain className="h-5 w-5 text-watt-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-watt-navy">Ground Effects</h4>
                      <p className="text-sm text-watt-navy/70">
                        Soft ground (grass, crops) absorbs more than hard surfaces (concrete, water).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-watt-light rounded-lg">
                    <div className="w-10 h-10 bg-watt-bitcoin/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TreePine className="h-5 w-5 text-watt-bitcoin" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-watt-navy">Barriers & Terrain</h4>
                      <p className="text-sm text-watt-navy/70">
                        Hills, buildings, and dense vegetation provide additional attenuation (3-20+ dB).
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Interactive Distance Calculator */}
        <ScrollReveal delay={300}>
          <Card className="bg-gradient-to-br from-watt-navy to-watt-navy/90 text-white border-none shadow-xl mb-12">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Interactive Distance Attenuation Calculator
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-white/80 mb-2 block">Source Noise Level (dB)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[sourceDb]}
                        onValueChange={(value) => setSourceDb(value[0])}
                        min={50}
                        max={120}
                        step={0.1}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={sourceDb}
                        onChange={(e) => setSourceDb(Number(e.target.value))}
                        className="w-24 bg-white/10 border-white/20 text-white text-center"
                        step={0.1}
                      />
                    </div>
                    <p className="text-xs text-white/50 mt-2">Alberta Heartland: 81.8 dB</p>
                  </div>

                  <div>
                    <Label className="text-white/80 mb-2 block">Distance to Receptor (meters)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[distance]}
                        onValueChange={(value) => setDistance(value[0])}
                        min={10}
                        max={5000}
                        step={10}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-24 bg-white/10 border-white/20 text-white text-center"
                      />
                    </div>
                    <p className="text-xs text-white/50 mt-2">Alberta Heartland nearest residence: 1,700m</p>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-white/70">Distance Attenuation</p>
                        <p className="text-2xl font-bold text-watt-bitcoin font-mono">
                          -{attenuation.toFixed(1)} dB
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/70">Atmospheric Loss</p>
                        <p className="text-2xl font-bold text-watt-coinbase font-mono">
                          -{atmosphericLoss.toFixed(1)} dB
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-sm text-white/70">Noise at {(distance/1000).toFixed(2)}km</p>
                      <p className="text-4xl font-bold text-watt-success font-mono">
                        {totalResultDb.toFixed(1)} dB
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 text-sm">
                    <p className="text-white/70">
                      <strong>Formula:</strong><br />
                      {sourceDb.toFixed(1)} - 20×log₁₀({distance}) - {atmosphericLoss.toFixed(1)} = {totalResultDb.toFixed(1)} dB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Visual Propagation Diagram */}
        <ScrollReveal delay={400}>
          <Card className="bg-white border-none shadow-institutional">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-watt-navy mb-6">Sound Propagation Visualization</h3>
              
              {/* Distance Visualization */}
              <div className="relative h-40 bg-gradient-to-r from-watt-bitcoin/20 via-watt-bitcoin/10 to-watt-success/5 rounded-xl overflow-hidden mb-6">
                {/* Facility */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <div className="w-16 h-24 bg-watt-navy rounded-lg flex flex-col items-center justify-center">
                    <span className="text-white text-xs">45MW</span>
                    <span className="text-white text-xs">Facility</span>
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-watt-bitcoin text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    81.8 dB
                  </div>
                </div>

                {/* Sound waves */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="absolute left-20 top-1/2 -translate-y-1/2 border-2 border-watt-bitcoin/20 rounded-full"
                    style={{
                      width: `${i * 80}px`,
                      height: `${i * 60}px`,
                      opacity: 1 - i * 0.15,
                    }}
                  />
                ))}

                {/* Distance markers */}
                {[
                  { pos: '30%', label: '500m', db: '28 dB' },
                  { pos: '50%', label: '1km', db: '22 dB' },
                  { pos: '70%', label: '1.7km', db: '17 dB' },
                ].map((marker, idx) => (
                  <div
                    key={idx}
                    className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                    style={{ left: marker.pos }}
                  >
                    <div className="w-px h-8 bg-watt-navy/20" />
                    <span className="text-xs text-watt-navy/60 mt-1">{marker.label}</span>
                    <span className="text-xs font-bold text-watt-success">{marker.db}</span>
                  </div>
                ))}

                {/* House */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="text-3xl">🏠</div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-watt-success text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    ~17 dB
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-watt-bitcoin/10 rounded-lg">
                  <p className="text-2xl font-bold text-watt-bitcoin">81.8 dB</p>
                  <p className="text-sm text-watt-navy/70">At Source (0m)</p>
                </div>
                <div className="text-center p-4 bg-watt-coinbase/10 rounded-lg">
                  <p className="text-2xl font-bold text-watt-coinbase">-64.6 dB</p>
                  <p className="text-sm text-watt-navy/70">Distance Loss (1.7km)</p>
                </div>
                <div className="text-center p-4 bg-watt-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-watt-success">~17 dB</p>
                  <p className="text-sm text-watt-navy/70">At Nearest Residence</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-watt-light rounded-lg">
                <p className="text-sm text-watt-navy/70">
                  <strong className="text-watt-success">Result:</strong> At 1.7km, noise from our 45MW facility 
                  is approximately <strong>17 dB</strong> — below the threshold of perception in rural Alberta 
                  (typically 25-35 dB ambient) and essentially <strong>inaudible</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};
