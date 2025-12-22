import React, { useState } from 'react';
import { 
  Zap, 
  ArrowDown, 
  Cable,
  Server,
  CheckCircle,
  Info,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const voltageSteps = [
  { voltage: '110-220 kV', name: 'Grid Connection', description: 'High voltage from transmission grid', color: 'from-red-500 to-red-600' },
  { voltage: '35 kV', name: 'Primary Substation', description: 'Step-down transformer at site entrance', color: 'from-orange-500 to-orange-600' },
  { voltage: '10 kV', name: 'Distribution', description: 'Medium voltage ring main units', color: 'from-yellow-500 to-yellow-600' },
  { voltage: '400 V', name: 'Container Input', description: 'Low voltage to mining containers', color: 'from-green-500 to-green-600' },
  { voltage: '12 V DC', name: 'Mining Hardware', description: 'PSU output to ASIC miners', color: 'from-blue-500 to-blue-600' }
];

// Regional voltage standards
const regionalVoltageStandards = [
  {
    region: 'North America (US/Canada)',
    flag: '🇺🇸🇨🇦',
    mediumVoltage: ['13.8 kV', '24.94 kV', '34.5 kV'],
    lowVoltage: '480V / 600V',
    frequency: '60 Hz',
    notes: 'Three-phase delta or wye configurations'
  },
  {
    region: 'Europe (EU/UK)',
    flag: '🇪🇺🇬🇧',
    mediumVoltage: ['10 kV', '20 kV', '35 kV'],
    lowVoltage: '400V',
    frequency: '50 Hz',
    notes: 'IEC standards, TN-S grounding'
  },
  {
    region: 'Middle East / Africa',
    flag: '🌍',
    mediumVoltage: ['11 kV', '22 kV', '33 kV'],
    lowVoltage: '400V / 415V',
    frequency: '50 Hz',
    notes: 'Often follows UK standards'
  },
  {
    region: 'Asia Pacific',
    flag: '🌏',
    mediumVoltage: ['10 kV', '22 kV', '35 kV'],
    lowVoltage: '380V / 400V',
    frequency: '50 Hz',
    notes: 'Varies by country, check local grid'
  }
];

// Transformer specifications
const transformerSpecs = [
  { rating: '2,500 kVA', containers: 2, loadFactor: '≤ 85%', type: 'Oil-immersed', cooling: 'ONAN/ONAF' },
  { rating: '3,150 kVA', containers: 2, loadFactor: '≤ 85%', type: 'Oil-immersed', cooling: 'ONAN/ONAF' },
  { rating: '1,600 kVA', containers: 1, loadFactor: '≤ 85%', type: 'Dry-type', cooling: 'AN/AF' }
];

// Cable specifications
const cableSpecs = [
  { type: 'MV Feeder', voltage: '10-35 kV', size: '3 × 300 mm² Cu', current: '~500A', installation: 'Direct buried or tray' },
  { type: 'LV Main', voltage: '400V', size: '4 × 500 mm² Cu', current: '~1,200A', installation: 'Cable tray' },
  { type: 'Container Feed', voltage: '400V', size: '4 × 240 mm² Cu', current: '~1,972A (2 cables)', installation: 'Overhead or trench' },
  { type: 'Grounding', voltage: 'N/A', size: '95-120 mm² Cu', current: 'Fault current', installation: 'Buried grid' }
];

const cableInstallationMethods = [
  {
    id: 'tray',
    name: 'Cable Tray System',
    advantages: [
      'Easier maintenance access',
      'Better heat dissipation',
      'Faster installation',
      'Lower initial cost'
    ],
    disadvantages: [
      'Exposed to elements',
      'Requires covers in harsh environments',
      'Visual clutter'
    ],
    bestFor: 'Indoor or covered outdoor installations'
  },
  {
    id: 'trench',
    name: 'Underground Trench',
    advantages: [
      'Protected from weather',
      'Clean site appearance',
      'Longer cable lifespan',
      'No overhead clearance issues'
    ],
    disadvantages: [
      'Higher installation cost',
      'Difficult to modify',
      'Drainage requirements'
    ],
    bestFor: 'Permanent outdoor installations'
  }
];

// Protection system requirements
const protectionRequirements = [
  { device: 'Main Circuit Breaker', location: 'Substation', function: 'Overcurrent, earth fault protection' },
  { device: 'MV Switchgear', location: 'Distribution room', function: 'Ring main unit, load break switches' },
  { device: 'Transformer Protection', location: 'Each transformer', function: 'Buchholz, thermal, differential' },
  { device: 'LV Circuit Breaker', location: 'Container input', function: 'Overcurrent, short circuit protection' },
  { device: 'Surge Protection', location: 'MV & LV boards', function: 'Lightning and switching surge protection' },
  { device: 'Ground Fault', location: 'Container level', function: 'Personnel safety, equipment protection' }
];

const HydroElectricalSection = () => {
  const [selectedMethod, setSelectedMethod] = useState('tray');
  const currentMethod = cableInstallationMethods.find(m => m.id === selectedMethod) || cableInstallationMethods[0];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Electrical Infrastructure
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Power Distribution System
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understanding the voltage step-down chain and cable infrastructure 
              for hydro-cooled mining facilities.
            </p>
          </div>
        </ScrollReveal>

        {/* Voltage Step-Down Visualization */}
        <ScrollReveal>
          <Card className="border-border mb-12">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-8 text-center">
                Voltage Transformation Chain
              </h3>
              
              <div className="relative">
                {/* Steps */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                  {voltageSteps.map((step, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
                      {/* Step box */}
                      <div className="flex flex-col items-center">
                        <div className={`w-28 h-24 rounded-xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center text-white shadow-lg hover:scale-105 transition-transform`}>
                          <span className="text-xl font-bold">{step.voltage}</span>
                          <span className="text-xs opacity-80">{step.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2 max-w-[120px]">
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Arrow */}
                      {index < voltageSteps.length - 1 && (
                        <div className="hidden md:flex flex-col items-center mx-2">
                          <ArrowDown className="w-5 h-5 text-muted-foreground/50 rotate-[-90deg]" />
                          <span className="text-[10px] text-muted-foreground/50">step down</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Power flow indicator */}
                <div className="mt-8 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-green-100">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-foreground">Power flows from grid to miners</span>
                    <Server className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Regional Voltage Standards */}
        <ScrollReveal>
          <Card className="border-border mb-12">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Regional Voltage Standards</h3>
                  <p className="text-sm text-muted-foreground">Grid voltage levels vary by region</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {regionalVoltageStandards.map((region, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{region.flag}</span>
                      <span className="font-semibold text-foreground text-sm">{region.region}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs">Medium Voltage</span>
                        <span className="font-mono text-yellow-600">{region.mediumVoltage.join(' / ')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Low Voltage</span>
                        <span className="font-mono text-green-600">{region.lowVoltage}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Frequency</span>
                        <span className="font-mono text-blue-600">{region.frequency}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-2">{region.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Transformer & Cable Specifications */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Transformer Specs */}
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Transformer Specifications
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-semibold text-foreground">Rating</th>
                        <th className="text-center py-2 font-semibold text-foreground">Containers</th>
                        <th className="text-center py-2 font-semibold text-foreground">Load Factor</th>
                        <th className="text-left py-2 font-semibold text-foreground">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transformerSpecs.map((spec, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 font-mono text-yellow-600">{spec.rating}</td>
                          <td className="py-2 text-center">{spec.containers}</td>
                          <td className="py-2 text-center text-green-600">{spec.loadFactor}</td>
                          <td className="py-2 text-muted-foreground">{spec.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      <strong>Load factor ≤85%</strong> required to prevent overheating. 
                      Size transformers for worst-case ambient temperature conditions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cable Specs */}
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Cable className="w-5 h-5 text-orange-500" />
                  Cable Specifications
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-semibold text-foreground">Type</th>
                        <th className="text-left py-2 font-semibold text-foreground">Size</th>
                        <th className="text-center py-2 font-semibold text-foreground">Current</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cableSpecs.map((spec, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 font-medium text-foreground">{spec.type}</td>
                          <td className="py-2 font-mono text-xs text-muted-foreground">{spec.size}</td>
                          <td className="py-2 text-center text-orange-600">{spec.current}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      Container incoming current: <strong>~1,972A</strong> at full load.
                      Use parallel cables or busbar for high-current connections.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        {/* Cable Installation Methods */}
        <ScrollReveal>
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Cable Installation Methods
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {cableInstallationMethods.map((method) => (
              <Card 
                key={method.id}
                className={`border-2 transition-all cursor-pointer ${
                  selectedMethod === method.id 
                    ? 'border-yellow-500 shadow-lg' 
                    : 'border-border hover:border-yellow-300'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      method.id === 'tray' 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                        : 'bg-gradient-to-br from-amber-500 to-orange-500'
                    }`}>
                      <Cable className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">{method.bestFor}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Advantages */}
                    <div className="p-4 rounded-lg bg-green-50">
                      <h5 className="text-sm font-semibold text-green-800 mb-2">Advantages</h5>
                      <ul className="space-y-1">
                        {method.advantages.map((adv, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-green-700">
                            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Disadvantages */}
                    <div className="p-4 rounded-lg bg-amber-50">
                      <h5 className="text-sm font-semibold text-amber-800 mb-2">Considerations</h5>
                      <ul className="space-y-1">
                        {method.disadvantages.map((dis, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {dis}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollReveal>

        {/* Protection System */}
        <ScrollReveal>
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Protection System Requirements
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 font-semibold text-foreground">Protection Device</th>
                      <th className="text-left py-3 font-semibold text-foreground">Location</th>
                      <th className="text-left py-3 font-semibold text-foreground">Function</th>
                    </tr>
                  </thead>
                  <tbody>
                    {protectionRequirements.map((req, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 font-medium text-foreground">{req.device}</td>
                        <td className="py-3 text-muted-foreground">{req.location}</td>
                        <td className="py-3 text-muted-foreground">{req.function}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HydroElectricalSection;