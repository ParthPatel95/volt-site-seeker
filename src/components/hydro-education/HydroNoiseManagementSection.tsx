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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Noise Management & Mitigation
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Engineer-grade acoustic solutions for mining facilities. Calculate cumulative noise levels, 
              ensure regulatory compliance, and design effective mitigation strategies.
            </p>
          </div>
        </ScrollReveal>

        {/* 45MW Noise Calculation Explainer */}
        <ScrollReveal delay={100}>
          <Card className="mb-12 border-2 border-border overflow-hidden">
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
                  <h4 className="font-semibold text-foreground mb-3">Logarithmic Sound Addition Formula</h4>
                  <div className="bg-white rounded-lg p-4 font-mono text-center text-lg border border-border">
                    L<sub>total</sub> = 10 × log<sub>10</sub>(Σ 10<sup>(Li/10)</sup>)
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    For n identical sources: L<sub>total</sub> = L<sub>single</sub> + 10 × log<sub>10</sub>(n)
                  </p>
                </div>

                {/* Calculation breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Air-Cooled Calculation (45MW)</h4>
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
                    <h4 className="font-semibold text-foreground">Hydro-Cooled Calculation (45MW)</h4>
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
                    <p className="font-semibold text-foreground">Key Insight: Hydro-Cooling Advantage</p>
                    <p className="text-sm text-muted-foreground">
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
                      <label className="block text-sm font-semibold text-foreground mb-2">
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
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>5 MW</span>
                        <span>100 MW</span>
                      </div>
                    </div>

                    {/* Distance */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
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
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>10m</span>
                        <span>500m</span>
                      </div>
                    </div>

                    {/* Mitigation Techniques Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">
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
                                <div className="font-medium text-foreground truncate">{tech.name}</div>
                                <div className="text-muted-foreground">-{tech.reduction}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Calculation Results</h4>
                    
                    {/* Air-Cooled Results */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-foreground">Air-Cooled</span>
                        <Wind className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Source level:</span>
                          <span className="font-mono">{sourceNoiseAirCooled.toFixed(1)} dB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>After mitigation:</span>
                          <span className="font-mono">{(sourceNoiseAirCooled - totalReduction).toFixed(1)} dB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>At {distanceMeters}m:</span>
                          <span className="font-mono font-bold text-red-600">{finalNoiseAirCooled.toFixed(1)} dB</span>
                        </div>
                      </div>
                    </div>

                    {/* Hydro-Cooled Results */}
                    <div className="p-4 rounded-xl bg-watt-success/10 border border-watt-success/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-foreground">Hydro-Cooled</span>
                        <Waves className="w-5 h-5 text-watt-success" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Source level:</span>
                          <span className="font-mono">{sourceNoiseHydroCooled.toFixed(1)} dB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>After mitigation:</span>
                          <span className="font-mono">{(sourceNoiseHydroCooled - totalReduction).toFixed(1)} dB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>At {distanceMeters}m:</span>
                          <span className="font-mono font-bold text-watt-success">{finalNoiseHydroCooled.toFixed(1)} dB</span>
                        </div>
                      </div>
                      <div className={`mt-3 p-2 rounded text-center ${getComplianceStatus(finalNoiseHydroCooled).bg}`}>
                        <span className={`text-sm font-semibold ${getComplianceStatus(finalNoiseHydroCooled).color}`}>
                          {getComplianceStatus(finalNoiseHydroCooled).status}
                        </span>
                      </div>
                    </div>

                    {/* Mitigation summary */}
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Mitigation Applied</span>
                      </div>
                      <div className="text-sm text-blue-700">
                        <strong>{selectedTechniques.length}</strong> techniques selected = 
                        <strong> -{totalReduction.toFixed(1)} dB</strong> reduction
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Cooling Type Comparison */}
        <ScrollReveal delay={300}>
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-watt-bitcoin" />
                Cooling Technology Noise Comparison
              </h3>
              <div className="space-y-4">
                {coolingTypeNoise.map((cooling, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-foreground">{cooling.type}</div>
                    <div className="flex-1 h-8 bg-muted rounded-full relative overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          cooling.type === 'Hydro-Cooled' ? 'bg-watt-success' :
                          cooling.type === 'Immersion' ? 'bg-watt-trust' : 'bg-watt-bitcoin'
                        }`}
                        style={{ width: `${(cooling.avg / 105) * 100}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-foreground">
                        {cooling.range}
                      </span>
                    </div>
                    <div className="w-16 text-sm font-mono font-bold text-foreground">{cooling.avg} dB</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Cooling systems typically generate 85-100+ dB at the source
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HydroNoiseManagementSection;