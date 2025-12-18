import { useState } from 'react';
import { Shield, Building, Fan, Volume2, Vibrate, Mountain, Gauge, Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const techniques = [
  {
    id: 'barriers',
    name: 'Acoustic Barrier Walls',
    icon: Building,
    reduction: '10-15 dB',
    cost: '$$',
    complexity: 'Medium',
    description: 'Solid walls that block direct sound transmission paths between source and receiver.',
    specs: [
      'Height: 2-6m above line of sight',
      'Surface mass: ≥20 kg/m²',
      'Materials: Concrete, steel, timber',
      'No gaps or openings',
    ],
    diagram: (
      <div className="relative h-32 bg-gradient-to-r from-watt-light to-white rounded-lg overflow-hidden">
        <div className="absolute left-4 bottom-4 w-12 h-16 bg-watt-navy rounded" />
        <div className="absolute left-20 bottom-4 w-4 h-20 bg-watt-bitcoin rounded" />
        <div className="absolute right-4 bottom-4 text-2xl">🏠</div>
        {/* Sound wave blocked */}
        <svg className="absolute inset-0" viewBox="0 0 200 80">
          <path d="M 30 40 Q 50 40 60 30" stroke="currentColor" className="text-red-400" strokeWidth="2" fill="none" strokeDasharray="4" />
          <path d="M 60 30 L 65 20" stroke="currentColor" className="text-red-400" strokeWidth="2" fill="none" />
        </svg>
      </div>
    ),
  },
  {
    id: 'enclosures',
    name: 'Acoustic Enclosures',
    icon: Shield,
    reduction: '15-25 dB',
    cost: '$$$',
    complexity: 'High',
    description: 'Full or partial enclosures around noisy equipment with sound-absorbing materials.',
    specs: [
      'Multi-layer construction',
      'Absorption: NRC 0.7-0.9',
      'Ventilation integration',
      'Access panels for maintenance',
    ],
    diagram: (
      <div className="relative h-32 bg-gradient-to-r from-watt-light to-white rounded-lg overflow-hidden flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-16 border-4 border-watt-success rounded-lg border-dashed flex items-center justify-center">
            <Fan className="h-8 w-8 text-watt-navy animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute -inset-2 border-2 border-watt-success/50 rounded-xl" />
        </div>
      </div>
    ),
  },
  {
    id: 'low-rpm',
    name: 'Low-RPM Fans',
    icon: Fan,
    reduction: '8-12 dB',
    cost: '$$',
    complexity: 'Low',
    description: 'Larger diameter fans operating at lower speeds move the same air with less noise.',
    specs: [
      'Fan diameter: 1.5-2× standard',
      'RPM reduction: 30-50%',
      'Blade design: Aerodynamic',
      'Motor: Variable frequency drive',
    ],
    diagram: (
      <div className="relative h-32 bg-gradient-to-r from-watt-light to-white rounded-lg overflow-hidden flex items-center justify-around">
        <div className="text-center">
          <Fan className="h-8 w-8 text-red-400 animate-spin" style={{ animationDuration: '0.5s' }} />
          <p className="text-xs text-watt-navy/60 mt-2">High RPM</p>
          <p className="text-xs font-bold text-red-400">Loud</p>
        </div>
        <div className="text-xl">→</div>
        <div className="text-center">
          <Fan className="h-12 w-12 text-watt-success animate-spin" style={{ animationDuration: '2s' }} />
          <p className="text-xs text-watt-navy/60 mt-2">Low RPM</p>
          <p className="text-xs font-bold text-watt-success">Quiet</p>
        </div>
      </div>
    ),
  },
  {
    id: 'silencers',
    name: 'Duct Silencers',
    icon: Volume2,
    reduction: '10-20 dB',
    cost: '$$',
    complexity: 'Medium',
    description: 'Inline sound attenuators in air ducts with absorptive baffles or reactive chambers.',
    specs: [
      'Length: 0.5-2m',
      'Baffle spacing: 100-200mm',
      'Absorber: Mineral wool, fiberglass',
      'Pressure drop: <100 Pa',
    ],
    diagram: (
      <div className="relative h-32 bg-gradient-to-r from-watt-light to-white rounded-lg overflow-hidden flex items-center justify-center">
        <div className="flex items-center">
          <div className="w-16 h-8 bg-watt-navy/20 rounded-l" />
          <div className="w-24 h-12 bg-watt-coinbase/20 border-2 border-watt-coinbase rounded flex items-center justify-center">
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-16 h-1 bg-watt-coinbase/50 rounded" />
              ))}
            </div>
          </div>
          <div className="w-16 h-8 bg-watt-navy/20 rounded-r" />
        </div>
      </div>
    ),
  },
  {
    id: 'vibration',
    name: 'Vibration Isolation',
    icon: Vibrate,
    reduction: '3-5 dB',
    cost: '$',
    complexity: 'Low',
    description: 'Spring mounts, rubber pads, and isolation bases prevent vibration transmission.',
    specs: [
      'Natural frequency: <10 Hz',
      'Deflection: 25-50mm',
      'Materials: Steel springs, neoprene',
      'Inertia base for heavy equipment',
    ],
    diagram: (
      <div className="relative h-32 bg-gradient-to-r from-watt-light to-white rounded-lg overflow-hidden flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-10 bg-watt-navy rounded" />
          <div className="flex justify-around -mt-1">
            {[1, 2, 3].map((i) => (
              <svg key={i} width="20" height="24" viewBox="0 0 20 24">
                <path d="M10 0 L10 4 L4 8 L16 12 L4 16 L16 20 L10 24" stroke="currentColor" className="text-watt-success" strokeWidth="2" fill="none" />
              </svg>
            ))}
          </div>
          <div className="w-24 h-3 bg-watt-navy/20 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'berms',
    name: 'Earth Berms & Vegetation',
    icon: Mountain,
    reduction: '5-10 dB',
    cost: '$',
    complexity: 'Low',
    description: 'Natural sound barriers using earth mounds and dense plantings.',
    specs: [
      'Berm height: 3-5m',
      'Side slopes: 3:1 to 2:1',
      'Vegetation depth: 30m+',
      'Species: Dense evergreens',
    ],
    diagram: (
      <div className="relative h-32 bg-gradient-to-b from-sky-100 to-watt-light rounded-lg overflow-hidden">
        <div className="absolute left-4 bottom-4 w-12 h-16 bg-watt-navy rounded" />
        <div className="absolute left-24 bottom-0">
          <svg width="60" height="50" viewBox="0 0 60 50">
            <path d="M0 50 Q30 10 60 50" fill="#4ade80" />
          </svg>
        </div>
        <div className="absolute left-32 bottom-12 text-2xl">🌲</div>
        <div className="absolute left-40 bottom-8 text-xl">🌲</div>
        <div className="absolute right-4 bottom-4 text-2xl">🏠</div>
      </div>
    ),
  },
  {
    id: 'vfd',
    name: 'Variable Frequency Drives',
    icon: Gauge,
    reduction: '5-8 dB',
    cost: '$$',
    complexity: 'Medium',
    description: 'Motor speed control reduces fan noise during partial load conditions.',
    specs: [
      'Speed range: 20-100%',
      'Noise ∝ RPM⁵ (fan law)',
      'Energy savings: 20-50%',
      'Soft start capability',
    ],
    diagram: (
      <div className="relative h-32 bg-gradient-to-r from-watt-light to-white rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-watt-navy/20" />
            <div 
              className="absolute inset-0 rounded-full border-4 border-watt-success border-t-transparent"
              style={{ transform: 'rotate(45deg)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-watt-success">70%</span>
            </div>
          </div>
          <p className="text-xs text-watt-navy/60 mt-2">Speed Control</p>
        </div>
      </div>
    ),
  },
  {
    id: 'orientation',
    name: 'Strategic Orientation',
    icon: Compass,
    reduction: '3-8 dB',
    cost: '$',
    complexity: 'Low',
    description: 'Directing exhaust outlets and noisy sides away from sensitive receptors.',
    specs: [
      'Exhaust away from residences',
      'Use buildings as shields',
      'Cluster equipment centrally',
      'Buffer zones on perimeter',
    ],
    diagram: (
      <div className="relative h-32 bg-gradient-to-r from-watt-light to-white rounded-lg overflow-hidden p-4">
        <div className="absolute top-2 right-2 text-xl">🏠</div>
        <div className="absolute bottom-2 right-2 text-xl">🏠</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-10 bg-watt-navy rounded" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-watt-bitcoin">
              →→→
            </div>
            <div className="absolute -left-8 top-0 text-xs text-watt-success font-bold">✓ Quiet</div>
          </div>
        </div>
      </div>
    ),
  },
];

export const MitigationTechniquesSection = () => {
  const [activeTechnique, setActiveTechnique] = useState('barriers');

  const active = techniques.find(t => t.id === activeTechnique) || techniques[0];

  return (
    <section id="mitigation" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-watt-success/10 rounded-full mb-4">
              <Shield className="h-4 w-4 text-watt-success" />
              <span className="text-sm font-medium text-watt-success">Mitigation</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              8 Mitigation Techniques
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Multiple strategies exist to reduce facility noise. The best approach combines several 
              techniques for maximum effectiveness.
            </p>
          </div>
        </ScrollReveal>

        {/* Technique Selection Grid */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {techniques.map((tech) => {
              const Icon = tech.icon;
              return (
                <button
                  key={tech.id}
                  onClick={() => setActiveTechnique(tech.id)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    activeTechnique === tech.id
                      ? 'bg-watt-success text-white shadow-lg scale-105'
                      : 'bg-watt-light text-watt-navy hover:bg-watt-success/10'
                  }`}
                >
                  <Icon className={`h-6 w-6 mb-2 ${activeTechnique === tech.id ? 'text-white' : 'text-watt-success'}`} />
                  <p className="font-semibold text-sm">{tech.name}</p>
                  <p className={`text-xs font-mono font-bold mt-1 ${activeTechnique === tech.id ? 'text-white/90' : 'text-watt-success'}`}>
                    {tech.reduction}
                  </p>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Active Technique Detail */}
        <ScrollReveal delay={200}>
          <Card className="bg-white border-2 border-watt-success/20 shadow-institutional">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-watt-success/10 rounded-xl flex items-center justify-center">
                      <active.icon className="h-7 w-7 text-watt-success" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-watt-navy">{active.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-watt-success text-watt-success font-bold">
                          {active.reduction}
                        </Badge>
                        <Badge variant="outline" className="text-watt-navy/60">
                          Cost: {active.cost}
                        </Badge>
                        <Badge variant="outline" className="text-watt-navy/60">
                          {active.complexity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-watt-navy/70 mb-6">{active.description}</p>

                  <h4 className="font-semibold text-watt-navy mb-3">Specifications:</h4>
                  <ul className="space-y-2">
                    {active.specs.map((spec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-watt-navy/70">
                        <span className="text-watt-success font-bold">•</span>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Diagram */}
                <div>
                  <h4 className="font-semibold text-watt-navy mb-3">Visualization</h4>
                  {active.diagram}
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Summary Table */}
        <ScrollReveal delay={300}>
          <Card className="bg-watt-navy text-white border-none shadow-xl mt-8">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6">Mitigation Techniques Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-sm font-semibold">Technique</th>
                      <th className="text-center py-3 text-sm font-semibold">Reduction</th>
                      <th className="text-center py-3 text-sm font-semibold">Cost</th>
                      <th className="text-center py-3 text-sm font-semibold hidden md:table-cell">Complexity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {techniques.map((tech, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-3 text-sm">{tech.name}</td>
                        <td className="py-3 text-center font-mono font-bold text-watt-success">{tech.reduction}</td>
                        <td className="py-3 text-center">{tech.cost}</td>
                        <td className="py-3 text-center hidden md:table-cell text-white/60">{tech.complexity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-watt-success/20 rounded-lg">
                <p className="text-sm">
                  <strong>Combined Potential:</strong> Strategic application of multiple techniques can achieve 
                  <strong className="text-watt-success"> 25-40+ dB</strong> total reduction when needed.
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};
