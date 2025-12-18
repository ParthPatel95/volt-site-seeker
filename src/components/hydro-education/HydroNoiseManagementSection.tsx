import React, { useState, useMemo } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { 
  Volume2, VolumeX, Shield, Building2, Wind, Waves, 
  Calculator, AlertTriangle, CheckCircle, Info, 
  BarChart3, Layers, Box, TreePine, Settings, Gauge
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

// Industry standards data
const industryStandards = [
  {
    name: 'WHO Guidelines',
    icon: Shield,
    daytime: 55,
    nighttime: 45,
    description: 'World Health Organization community noise guidelines for residential areas',
    color: 'watt-trust'
  },
  {
    name: 'Alberta AUC Rule 012',
    icon: Building2,
    daytime: 50,
    nighttime: 40,
    description: 'Alberta Utilities Commission noise control rules for energy facilities',
    color: 'watt-bitcoin'
  },
  {
    name: 'OSHA Workplace',
    icon: AlertTriangle,
    daytime: 90,
    nighttime: 90,
    description: 'Occupational Safety and Health Administration 8-hour TWA limit',
    color: 'watt-success'
  }
];

// Noise reduction techniques with engineering specifications
const noiseReductionTechniques = [
  {
    id: 'barriers',
    name: 'Acoustic Barrier Walls',
    reduction: '10-15 dB',
    reductionValue: 12.5,
    description: 'Mass-loaded vinyl barriers with absorptive facing, minimum 3m height',
    specifications: ['STC Rating: 25-35', 'Material: Steel + MLV composite', 'Height: 3-5m typical'],
    icon: Layers,
    color: 'bg-blue-500'
  },
  {
    id: 'enclosures',
    name: 'Acoustic Enclosures',
    reduction: '15-25 dB',
    reductionValue: 20,
    description: 'Full container enclosure with ventilated acoustic panels',
    specifications: ['Panel thickness: 100-150mm', 'NRC: 0.85-0.95', 'Ventilation: Silenced louvers'],
    icon: Box,
    color: 'bg-purple-500'
  },
  {
    id: 'lowrpm',
    name: 'Low-RPM Fans',
    reduction: '8-12 dB',
    reductionValue: 10,
    description: 'Larger diameter fans operating at reduced speeds (≤600 RPM)',
    specifications: ['Fan diameter: 1.2-1.8m', 'Speed: 400-600 RPM', 'Blade design: Swept-back'],
    icon: Wind,
    color: 'bg-cyan-500'
  },
  {
    id: 'silencers',
    name: 'Duct Silencers',
    reduction: '10-20 dB',
    reductionValue: 15,
    description: 'Absorptive silencers on air intakes and exhausts',
    specifications: ['Type: Splitter/Tubular', 'Length: 1.5-3m', 'Pressure drop: <50 Pa'],
    icon: VolumeX,
    color: 'bg-green-500'
  },
  {
    id: 'isolation',
    name: 'Vibration Isolation',
    reduction: '3-5 dB',
    reductionValue: 4,
    description: 'Spring/rubber mounts to prevent structure-borne noise transmission',
    specifications: ['Mount type: Neoprene/Spring', 'Isolation: 95%+', 'Natural freq: 3-8 Hz'],
    icon: Settings,
    color: 'bg-orange-500'
  },
  {
    id: 'berms',
    name: 'Earth Berms & Vegetation',
    reduction: '5-10 dB',
    reductionValue: 7.5,
    description: 'Natural barriers using landscaping and earth mounding',
    specifications: ['Berm height: 3-6m', 'Vegetation: Dense evergreen', 'Width: 10-20m'],
    icon: TreePine,
    color: 'bg-emerald-500'
  },
  {
    id: 'vfd',
    name: 'Variable Frequency Drives',
    reduction: '5-8 dB',
    reductionValue: 6.5,
    description: 'Speed control to match cooling demand and reduce noise during low-load periods',
    specifications: ['Speed range: 30-100%', 'Power factor: 0.95+', 'Harmonics: <5% THD'],
    icon: Gauge,
    color: 'bg-indigo-500'
  },
  {
    id: 'orientation',
    name: 'Strategic Site Orientation',
    reduction: '3-8 dB',
    reductionValue: 5.5,
    description: 'Position exhaust away from receptors, use buildings as natural barriers',
    specifications: ['Buffer distance: 200-500m', 'Orientation: Prevailing wind', 'Terrain: Natural shielding'],
    icon: Building2,
    color: 'bg-pink-500'
  }
];

// Cooling type noise comparison
const coolingTypeNoise = [
  { type: 'Air-Cooled', range: '85-105 dB', avg: 95, description: 'High-speed axial fans, multiple units' },
  { type: 'Hydro-Cooled', range: '60-75 dB', avg: 67, description: 'Pump systems, reduced fan dependency' },
  { type: 'Immersion', range: '50-65 dB', avg: 57, description: 'Minimal moving parts, liquid circulation only' }
];

const HydroNoiseManagementSection = () => {
  const [facilityMW, setFacilityMW] = useState(45);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(['barriers', 'silencers', 'lowrpm']);
  const [distanceMeters, setDistanceMeters] = useState(100);

  // Calculate number of containers based on MW (2.5MW per container average)
  const containerCount = useMemo(() => Math.ceil(facilityMW / 2.5), [facilityMW]);

  // Calculate source noise level using logarithmic addition
  // Each container: ~95 dB air-cooled, ~67 dB hydro-cooled
  const sourceNoiseAirCooled = useMemo(() => {
    const singleContainerDb = 95;
    // L_total = 10 × log₁₀(n × 10^(L/10))
    return singleContainerDb + 10 * Math.log10(containerCount);
  }, [containerCount]);

  const sourceNoiseHydroCooled = useMemo(() => {
    const singleContainerDb = 67;
    return singleContainerDb + 10 * Math.log10(containerCount);
  }, [containerCount]);

  // Calculate total noise reduction from selected techniques
  const totalReduction = useMemo(() => {
    return selectedTechniques.reduce((sum, techId) => {
      const technique = noiseReductionTechniques.find(t => t.id === techId);
      return sum + (technique?.reductionValue || 0);
    }, 0);
  }, [selectedTechniques]);

  // Calculate distance attenuation (-6 dB per doubling of distance from 1m reference)
  const distanceAttenuation = useMemo(() => {
    return 20 * Math.log10(distanceMeters);
  }, [distanceMeters]);

  // Final noise at receptor
  const finalNoiseAirCooled = useMemo(() => {
    return Math.max(20, sourceNoiseAirCooled - totalReduction - distanceAttenuation);
  }, [sourceNoiseAirCooled, totalReduction, distanceAttenuation]);

  const finalNoiseHydroCooled = useMemo(() => {
    return Math.max(20, sourceNoiseHydroCooled - totalReduction - distanceAttenuation);
  }, [sourceNoiseHydroCooled, totalReduction, distanceAttenuation]);

  const toggleTechnique = (techId: string) => {
    setSelectedTechniques(prev => 
      prev.includes(techId) 
        ? prev.filter(id => id !== techId)
        : [...prev, techId]
    );
  };

  const getComplianceStatus = (noiseLevel: number) => {
    if (noiseLevel <= 45) return { status: 'Excellent', color: 'text-watt-success', bg: 'bg-watt-success/10' };
    if (noiseLevel <= 55) return { status: 'Compliant', color: 'text-watt-trust', bg: 'bg-watt-trust/10' };
    if (noiseLevel <= 70) return { status: 'Marginal', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'Non-Compliant', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-watt-light">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-watt-bitcoin/10 text-watt-bitcoin border-watt-bitcoin/20">
              <Volume2 className="w-3 h-3 mr-1" />
              Acoustic Engineering
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-watt-navy mb-4">
              Noise Management & Mitigation
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Engineer-grade acoustic solutions for mining facilities. Calculate cumulative noise levels, 
              ensure regulatory compliance, and design effective mitigation strategies.
            </p>
          </div>
        </ScrollReveal>

        {/* 45MW Noise Calculation Explainer */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-2 border-watt-navy/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-watt-navy text-white p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Understanding Cumulative Noise: The 45MW Example
                </h3>
                <p className="text-white/80">
                  Sound levels don't add linearly. When combining multiple sources, we use logarithmic addition.
                </p>
              </div>
              <div className="p-6 space-y-6">
                {/* Formula */}
                <div className="bg-watt-light rounded-xl p-6">
                  <h4 className="font-semibold text-watt-navy mb-3">Logarithmic Sound Addition Formula</h4>
                  <div className="bg-white rounded-lg p-4 font-mono text-center text-lg border border-watt-navy/10">
                    L<sub>total</sub> = 10 × log<sub>10</sub>(Σ 10<sup>(Li/10)</sup>)
                  </div>
                  <p className="text-sm text-watt-navy/60 mt-3">
                    For n identical sources: L<sub>total</sub> = L<sub>single</sub> + 10 × log<sub>10</sub>(n)
                  </p>
                </div>

                {/* Calculation breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-watt-navy">Air-Cooled Calculation (45MW)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-watt-light rounded">
                        <span>Single container noise:</span>
                        <span className="font-mono font-semibold">95 dB</span>
                      </div>
                      <div className="flex justify-between p-2 bg-watt-light rounded">
                        <span>Number of containers (45MW ÷ 2.5MW):</span>
                        <span className="font-mono font-semibold">18 units</span>
                      </div>
                      <div className="flex justify-between p-2 bg-watt-light rounded">
                        <span>Additional noise (10 × log₁₀(18)):</span>
                        <span className="font-mono font-semibold">+12.6 dB</span>
                      </div>
                      <div className="flex justify-between p-3 bg-red-50 rounded border border-red-200">
                        <span className="font-semibold">Total at source:</span>
                        <span className="font-mono font-bold text-red-600">107.6 dB</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-watt-navy">Hydro-Cooled Calculation (45MW)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-watt-light rounded">
                        <span>Single container noise:</span>
                        <span className="font-mono font-semibold">67 dB</span>
                      </div>
                      <div className="flex justify-between p-2 bg-watt-light rounded">
                        <span>Number of containers (45MW ÷ 2.5MW):</span>
                        <span className="font-mono font-semibold">18 units</span>
                      </div>
                      <div className="flex justify-between p-2 bg-watt-light rounded">
                        <span>Additional noise (10 × log₁₀(18)):</span>
                        <span className="font-mono font-semibold">+12.6 dB</span>
                      </div>
                      <div className="flex justify-between p-3 bg-green-50 rounded border border-green-200">
                        <span className="font-semibold">Total at source:</span>
                        <span className="font-mono font-bold text-watt-success">79.6 dB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key insight */}
                <div className="flex items-start gap-4 p-4 bg-watt-bitcoin/5 rounded-xl border border-watt-bitcoin/20">
                  <Info className="w-6 h-6 text-watt-bitcoin flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-watt-navy">Key Insight: Hydro-Cooling Advantage</p>
                    <p className="text-sm text-watt-navy/70">
                      Hydro-cooled systems produce <strong>28 dB less noise</strong> at source compared to air-cooled. 
                      This is a <strong>630× reduction</strong> in sound energy, making regulatory compliance significantly easier.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Interactive Calculator */}
        <ScrollReveal delay={200}>
          <Card className="mb-12 border-2 border-watt-trust/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-watt-trust to-watt-trust/80 text-white p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Interactive Noise Calculator
                </h3>
                <p className="text-white/80">
                  Configure your facility size, mitigation techniques, and distance to calculate noise levels at property boundary.
                </p>
              </div>
              <div className="p-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Controls */}
                  <div className="space-y-6">
                    {/* Facility Size */}
                    <div>
                      <label className="block text-sm font-semibold text-watt-navy mb-2">
                        Facility Size: {facilityMW} MW ({containerCount} containers)
                      </label>
                      <Slider
                        value={[facilityMW]}
                        onValueChange={(value) => setFacilityMW(value[0])}
                        min={5}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-watt-navy/50 mt-1">
                        <span>5 MW</span>
                        <span>100 MW</span>
                      </div>
                    </div>

                    {/* Distance */}
                    <div>
                      <label className="block text-sm font-semibold text-watt-navy mb-2">
                        Distance to Receptor: {distanceMeters}m
                      </label>
                      <Slider
                        value={[distanceMeters]}
                        onValueChange={(value) => setDistanceMeters(value[0])}
                        min={10}
                        max={500}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-watt-navy/50 mt-1">
                        <span>10m</span>
                        <span>500m</span>
                      </div>
                    </div>

                    {/* Mitigation Techniques Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-watt-navy mb-3">
                        Select Mitigation Techniques:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {noiseReductionTechniques.map((tech) => (
                          <button
                            key={tech.id}
                            onClick={() => toggleTechnique(tech.id)}
                            className={`p-2 rounded-lg border-2 text-left transition-all text-xs ${
                              selectedTechniques.includes(tech.id)
                                ? 'border-watt-trust bg-watt-trust/10'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded ${tech.color} flex items-center justify-center`}>
                                <tech.icon className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-watt-navy truncate">{tech.name}</div>
                                <div className="text-watt-navy/60">-{tech.reduction}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-watt-navy">Calculation Results</h4>
                    
                    {/* Air-Cooled Results */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-watt-navy">Air-Cooled</span>
                        <Wind className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Source level:</span>
                          <span className="font-mono">{sourceNoiseAirCooled.toFixed(1)} dB</span>
                        </div>
                        <div className="flex justify-between text-watt-success">
                          <span>Mitigation:</span>
                          <span className="font-mono">-{totalReduction.toFixed(1)} dB</span>
                        </div>
                        <div className="flex justify-between text-watt-trust">
                          <span>Distance attenuation:</span>
                          <span className="font-mono">-{distanceAttenuation.toFixed(1)} dB</span>
                        </div>
                        <hr className="border-gray-200" />
                        <div className={`flex justify-between p-2 rounded ${getComplianceStatus(finalNoiseAirCooled).bg}`}>
                          <span className="font-semibold">At receptor:</span>
                          <span className={`font-mono font-bold ${getComplianceStatus(finalNoiseAirCooled).color}`}>
                            {finalNoiseAirCooled.toFixed(1)} dB
                          </span>
                        </div>
                        <div className={`text-center text-xs font-semibold ${getComplianceStatus(finalNoiseAirCooled).color}`}>
                          {getComplianceStatus(finalNoiseAirCooled).status}
                        </div>
                      </div>
                    </div>

                    {/* Hydro-Cooled Results */}
                    <div className="p-4 rounded-xl bg-watt-trust/5 border border-watt-trust/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-watt-navy">Hydro-Cooled</span>
                        <Waves className="w-5 h-5 text-watt-trust" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Source level:</span>
                          <span className="font-mono">{sourceNoiseHydroCooled.toFixed(1)} dB</span>
                        </div>
                        <div className="flex justify-between text-watt-success">
                          <span>Mitigation:</span>
                          <span className="font-mono">-{totalReduction.toFixed(1)} dB</span>
                        </div>
                        <div className="flex justify-between text-watt-trust">
                          <span>Distance attenuation:</span>
                          <span className="font-mono">-{distanceAttenuation.toFixed(1)} dB</span>
                        </div>
                        <hr className="border-watt-trust/20" />
                        <div className={`flex justify-between p-2 rounded ${getComplianceStatus(finalNoiseHydroCooled).bg}`}>
                          <span className="font-semibold">At receptor:</span>
                          <span className={`font-mono font-bold ${getComplianceStatus(finalNoiseHydroCooled).color}`}>
                            {finalNoiseHydroCooled.toFixed(1)} dB
                          </span>
                        </div>
                        <div className={`text-center text-xs font-semibold ${getComplianceStatus(finalNoiseHydroCooled).color}`}>
                          {getComplianceStatus(finalNoiseHydroCooled).status}
                        </div>
                      </div>
                    </div>

                    {/* Compliance Summary */}
                    <div className="p-4 bg-watt-light rounded-xl">
                      <h5 className="font-semibold text-watt-navy mb-2">Regulatory Thresholds</h5>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>WHO Nighttime (residential):</span>
                          <span className="font-mono">45 dB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Alberta AUC Rule 012:</span>
                          <span className="font-mono">40-50 dB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>OSHA Workplace 8-hr:</span>
                          <span className="font-mono">90 dB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Industry Standards */}
        <ScrollReveal delay={300}>
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-watt-navy text-center mb-8">
              Regulatory Standards & Compliance
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {industryStandards.map((standard, index) => (
                <Card key={index} className="border-2 border-watt-navy/10 hover:border-watt-bitcoin/30 transition-all">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-${standard.color}/10 flex items-center justify-center mb-4`}>
                      <standard.icon className={`w-6 h-6 text-${standard.color}`} />
                    </div>
                    <h4 className="text-lg font-bold text-watt-navy mb-2">{standard.name}</h4>
                    <p className="text-sm text-watt-navy/60 mb-4">{standard.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-yellow-50 rounded-lg text-center">
                        <div className="text-xs text-watt-navy/60 mb-1">Daytime</div>
                        <div className="text-xl font-bold text-watt-navy">{standard.daytime} dB</div>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg text-center">
                        <div className="text-xs text-watt-navy/60 mb-1">Nighttime</div>
                        <div className="text-xl font-bold text-watt-navy">{standard.nighttime} dB</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* 3D Sound Propagation Visualization */}
        <ScrollReveal delay={400}>
          <Card className="mb-12 overflow-hidden border-2 border-watt-navy/10">
            <CardContent className="p-0">
              <div className="bg-watt-navy text-white p-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Sound Propagation & Distance Attenuation
                </h3>
              </div>
              <div className="p-6">
                {/* Isometric 3D-style visualization */}
                <div className="relative bg-gradient-to-br from-watt-light to-white rounded-xl p-8 overflow-hidden">
                  {/* Grid lines for depth */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 400 300">
                      {/* Perspective grid */}
                      {[...Array(10)].map((_, i) => (
                        <line
                          key={`h-${i}`}
                          x1="50"
                          y1={50 + i * 25}
                          x2="350"
                          y2={50 + i * 25}
                          stroke="#0A1628"
                          strokeWidth="0.5"
                        />
                      ))}
                      {[...Array(12)].map((_, i) => (
                        <line
                          key={`v-${i}`}
                          x1={50 + i * 28}
                          y1="50"
                          x2={50 + i * 28}
                          y2="275"
                          stroke="#0A1628"
                          strokeWidth="0.5"
                        />
                      ))}
                    </svg>
                  </div>

                  <div className="relative z-10">
                    {/* Sound source and propagation rings */}
                    <div className="flex justify-center mb-8">
                      <div className="relative">
                        {/* Concentric dB rings */}
                        {[
                          { size: 320, db: '50 dB', color: 'border-green-300', bg: 'bg-green-50/30' },
                          { size: 240, db: '60 dB', color: 'border-yellow-300', bg: 'bg-yellow-50/30' },
                          { size: 160, db: '70 dB', color: 'border-orange-300', bg: 'bg-orange-50/30' },
                          { size: 80, db: '80 dB', color: 'border-red-300', bg: 'bg-red-50/50' },
                        ].map((ring, i) => (
                          <div
                            key={i}
                            className={`absolute rounded-full border-2 ${ring.color} ${ring.bg} flex items-center justify-center animate-pulse`}
                            style={{
                              width: ring.size,
                              height: ring.size,
                              left: `calc(50% - ${ring.size / 2}px)`,
                              top: `calc(50% - ${ring.size / 2}px)`,
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '3s'
                            }}
                          >
                            <span className="absolute -top-3 bg-white px-2 text-xs font-mono text-watt-navy/60">
                              {ring.db}
                            </span>
                          </div>
                        ))}
                        
                        {/* Center - Mining Container */}
                        <div className="relative w-20 h-20 bg-gradient-to-br from-watt-bitcoin to-watt-bitcoin/80 rounded-lg flex items-center justify-center shadow-lg z-20">
                          <Volume2 className="w-8 h-8 text-white" />
                          <div className="absolute -bottom-8 whitespace-nowrap text-xs font-semibold text-watt-navy">
                            Source: 95-107 dB
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Distance markers */}
                    <div className="flex justify-between px-8 mt-16">
                      {[
                        { distance: '10m', db: '~90 dB' },
                        { distance: '50m', db: '~75 dB' },
                        { distance: '100m', db: '~65 dB' },
                        { distance: '200m', db: '~55 dB' },
                        { distance: '500m', db: '~45 dB' },
                      ].map((marker, i) => (
                        <div key={i} className="text-center">
                          <div className="w-8 h-8 rounded-full bg-watt-navy/10 flex items-center justify-center mx-auto mb-2">
                            <div className="w-2 h-2 rounded-full bg-watt-navy"></div>
                          </div>
                          <div className="text-xs font-semibold text-watt-navy">{marker.distance}</div>
                          <div className="text-xs text-watt-navy/60">{marker.db}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formula overlay */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 border border-watt-navy/10">
                    <div className="text-xs font-mono text-watt-navy/70">
                      L<sub>d</sub> = L<sub>ref</sub> - 20 × log₁₀(d/d<sub>ref</sub>)
                    </div>
                    <div className="text-xs text-watt-navy/50 mt-1">
                      ≈ -6 dB per doubling of distance
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Noise Reduction Techniques Grid */}
        <ScrollReveal delay={500}>
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-watt-navy text-center mb-4">
              8 Engineering Mitigation Techniques
            </h3>
            <p className="text-center text-watt-navy/60 mb-8 max-w-2xl mx-auto">
              Combine multiple techniques for cumulative noise reduction. Click to see detailed specifications.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {noiseReductionTechniques.map((tech, index) => (
                <Card 
                  key={tech.id} 
                  className="border-2 border-watt-navy/10 hover:border-watt-bitcoin/30 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${tech.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <tech.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-watt-navy text-sm mb-1">{tech.name}</h4>
                    <div className="text-lg font-bold text-watt-success mb-2">-{tech.reduction}</div>
                    <p className="text-xs text-watt-navy/60 mb-3">{tech.description}</p>
                    <div className="space-y-1">
                      {tech.specifications.map((spec, i) => (
                        <div key={i} className="text-xs text-watt-navy/50 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-watt-success flex-shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Acoustic Barrier Cross-Section Diagram */}
        <ScrollReveal delay={600}>
          <Card className="mb-12 overflow-hidden border-2 border-watt-navy/10">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-watt-navy mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Acoustic Barrier Cross-Section
              </h3>
              <div className="relative bg-gradient-to-b from-sky-100 to-watt-light rounded-xl p-8">
                {/* Cross-section diagram */}
                <svg viewBox="0 0 600 300" className="w-full h-auto">
                  {/* Ground line */}
                  <rect x="0" y="250" width="600" height="50" fill="#8B7355" />
                  <text x="50" y="280" fill="#fff" fontSize="12">Ground Level</text>

                  {/* Source (Mining Container) */}
                  <rect x="30" y="180" width="80" height="70" fill="#F7931A" rx="4" />
                  <text x="70" y="220" fill="#fff" fontSize="10" textAnchor="middle">Source</text>
                  <text x="70" y="235" fill="#fff" fontSize="8" textAnchor="middle">95-107 dB</text>

                  {/* Sound waves from source */}
                  {[1, 2, 3].map((i) => (
                    <path
                      key={i}
                      d={`M 110 215 Q ${130 + i * 15} ${200 - i * 10} ${150 + i * 30} 215`}
                      fill="none"
                      stroke="#F7931A"
                      strokeWidth="2"
                      strokeDasharray="5,3"
                      opacity={0.6 - i * 0.15}
                    />
                  ))}

                  {/* Acoustic Barrier */}
                  <g>
                    {/* Barrier structure */}
                    <rect x="200" y="100" width="30" height="150" fill="#374151" />
                    
                    {/* Absorptive layer */}
                    <rect x="195" y="100" width="5" height="150" fill="#6B7280" />
                    <text x="175" y="175" fill="#374151" fontSize="8" textAnchor="end" transform="rotate(-90 175 175)">Absorptive</text>
                    
                    {/* Mass layer */}
                    <rect x="230" y="100" width="5" height="150" fill="#1F2937" />
                    <text x="255" y="175" fill="#374151" fontSize="8" transform="rotate(90 255 175)">Mass Layer</text>
                    
                    {/* Dimensions */}
                    <line x1="200" y1="90" x2="235" y2="90" stroke="#374151" strokeWidth="1" />
                    <text x="217" y="85" fill="#374151" fontSize="9" textAnchor="middle">150mm</text>
                    
                    <line x1="180" y1="100" x2="180" y2="250" stroke="#374151" strokeWidth="1" />
                    <text x="165" y="175" fill="#374151" fontSize="9" textAnchor="middle" transform="rotate(-90 165 175)">3-5m</text>
                  </g>

                  {/* Reflected waves */}
                  <path d="M 200 150 Q 160 120 180 90" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,3" />
                  <text x="145" y="110" fill="#EF4444" fontSize="9">Reflected</text>

                  {/* Transmitted (reduced) waves */}
                  <path d="M 235 175 Q 280 175 320 180" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="5,3" opacity="0.5" />
                  <path d="M 235 190 Q 300 190 380 200" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.3" />

                  {/* Receptor */}
                  <rect x="450" y="200" width="60" height="50" fill="#0052FF" rx="4" />
                  <text x="480" y="230" fill="#fff" fontSize="10" textAnchor="middle">Receptor</text>

                  {/* dB levels */}
                  <rect x="430" y="150" width="100" height="40" fill="#fff" stroke="#E5E7EB" rx="4" />
                  <text x="480" y="168" fill="#374151" fontSize="10" textAnchor="middle" fontWeight="bold">Reduced Level</text>
                  <text x="480" y="182" fill="#22C55E" fontSize="12" textAnchor="middle" fontWeight="bold">-15 to -25 dB</text>

                  {/* Legend */}
                  <g transform="translate(400, 50)">
                    <rect x="0" y="0" width="180" height="80" fill="#fff" stroke="#E5E7EB" rx="4" />
                    <text x="10" y="20" fill="#374151" fontSize="10" fontWeight="bold">Barrier Components:</text>
                    <rect x="10" y="30" width="15" height="10" fill="#6B7280" />
                    <text x="30" y="38" fill="#374151" fontSize="9">Absorptive (NRC 0.85+)</text>
                    <rect x="10" y="45" width="15" height="10" fill="#374151" />
                    <text x="30" y="53" fill="#374151" fontSize="9">Steel Core (STC 25-35)</text>
                    <rect x="10" y="60" width="15" height="10" fill="#1F2937" />
                    <text x="30" y="68" fill="#374151" fontSize="9">Mass-Loaded Vinyl</text>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Cooling Type Comparison */}
        <ScrollReveal delay={700}>
          <Card className="mb-12 overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-watt-navy mb-6">
                Cooling Technology Noise Comparison
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {coolingTypeNoise.map((cooling, index) => (
                  <div 
                    key={index}
                    className={`p-6 rounded-xl border-2 ${
                      index === 0 ? 'border-red-200 bg-red-50/50' :
                      index === 1 ? 'border-watt-trust/30 bg-watt-trust/5' :
                      'border-watt-success/30 bg-watt-success/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {index === 0 ? <Wind className="w-8 h-8 text-red-500" /> :
                       index === 1 ? <Waves className="w-8 h-8 text-watt-trust" /> :
                       <Box className="w-8 h-8 text-watt-success" />}
                      <div>
                        <h4 className="font-bold text-watt-navy">{cooling.type}</h4>
                        <p className="text-sm text-watt-navy/60">{cooling.range}</p>
                      </div>
                    </div>
                    
                    {/* Visual dB bar */}
                    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`absolute left-0 top-0 h-full rounded-full ${
                          index === 0 ? 'bg-red-400' :
                          index === 1 ? 'bg-watt-trust' :
                          'bg-watt-success'
                        }`}
                        style={{ width: `${(cooling.avg / 120) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {cooling.avg} dB avg
                      </div>
                    </div>
                    
                    <p className="text-xs text-watt-navy/60">{cooling.description}</p>
                    
                    {index > 0 && (
                      <div className="mt-3 p-2 bg-watt-success/10 rounded text-xs text-watt-success font-semibold text-center">
                        {index === 1 ? '70% quieter than air-cooled' : '85% quieter than air-cooled'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* 45MW Case Study */}
        <ScrollReveal delay={800}>
          <Card className="border-2 border-watt-success/30 bg-gradient-to-br from-watt-success/5 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-watt-success/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-watt-success" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-watt-navy">Case Study: 45MW Hydro-Cooled Facility</h3>
                  <p className="text-watt-navy/60">Achieving Alberta AUC Rule 012 compliance at property boundary</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Mitigation Strategy Applied</h4>
                  <div className="space-y-2">
                    {[
                      { technique: 'Hydro-cooling (vs air)', reduction: 28 },
                      { technique: 'Acoustic barrier walls (4m)', reduction: 12 },
                      { technique: 'Duct silencers', reduction: 15 },
                      { technique: 'Low-RPM fans', reduction: 10 },
                      { technique: 'Strategic orientation', reduction: 5 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                        <span className="text-sm text-watt-navy">{item.technique}</span>
                        <Badge variant="outline" className="bg-watt-success/10 text-watt-success border-watt-success/20">
                          -{item.reduction} dB
                        </Badge>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 bg-watt-success/10 rounded-lg border border-watt-success/30">
                      <span className="font-semibold text-watt-navy">Total Reduction</span>
                      <span className="font-bold text-watt-success">-70 dB</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-watt-navy">Results at 200m Property Boundary</h4>
                  <div className="p-6 bg-white rounded-xl border border-gray-100">
                    <div className="text-center mb-4">
                      <div className="text-5xl font-bold text-watt-success mb-2">42 dB</div>
                      <div className="text-sm text-watt-navy/60">At nearest residential receptor</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Alberta AUC Rule 012 (nighttime):</span>
                        <span className="font-semibold">40 dB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>WHO Guidelines (nighttime):</span>
                        <span className="font-semibold">45 dB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Achieved level:</span>
                        <span className="font-semibold text-watt-success">42 dB ✓</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-watt-success/10 rounded-lg text-center">
                      <span className="text-sm font-semibold text-watt-success">
                        ✓ Compliant with all major standards
                      </span>
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

export default HydroNoiseManagementSection;
