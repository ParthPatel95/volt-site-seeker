import React, { useState } from 'react';
import { 
  Zap, 
  ArrowDown, 
  Cable,
  Server,
  CheckCircle,
  Info
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';

const voltageSteps = [
  { voltage: '110-220 kV', name: 'Grid Connection', description: 'High voltage from transmission grid', color: 'from-red-500 to-red-600' },
  { voltage: '35 kV', name: 'Primary Substation', description: 'Step-down transformer at site entrance', color: 'from-orange-500 to-orange-600' },
  { voltage: '10 kV', name: 'Distribution', description: 'Medium voltage ring main units', color: 'from-yellow-500 to-yellow-600' },
  { voltage: '400 V', name: 'Container Input', description: 'Low voltage to mining containers', color: 'from-green-500 to-green-600' },
  { voltage: '12 V DC', name: 'Mining Hardware', description: 'PSU output to ASIC miners', color: 'from-blue-500 to-blue-600' }
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
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Power Distribution System
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Understanding the voltage step-down chain and cable infrastructure 
              for hydro-cooled mining facilities.
            </p>
          </div>
        </ScrollReveal>

        {/* Voltage Step-Down Visualization */}
        <ScrollReveal>
          <Card className="border-watt-navy/10 mb-12">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-watt-navy mb-8 text-center">
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
                        <p className="text-xs text-watt-navy/60 text-center mt-2 max-w-[120px]">
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Arrow */}
                      {index < voltageSteps.length - 1 && (
                        <div className="hidden md:flex flex-col items-center mx-2">
                          <ArrowDown className="w-5 h-5 text-watt-navy/40 rotate-[-90deg]" />
                          <span className="text-[10px] text-watt-navy/40">step down</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Power flow indicator */}
                <div className="mt-8 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-green-100">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-watt-navy">Power flows from grid to miners</span>
                    <Server className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Cable Installation Methods */}
        <ScrollReveal>
          <h3 className="text-2xl font-bold text-watt-navy mb-8 text-center">
            Cable Installation Methods
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {cableInstallationMethods.map((method) => (
              <Card 
                key={method.id}
                className={`border-2 transition-all cursor-pointer ${
                  selectedMethod === method.id 
                    ? 'border-yellow-500 shadow-lg' 
                    : 'border-watt-navy/10 hover:border-yellow-300'
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
                      <h4 className="text-lg font-semibold text-watt-navy">{method.name}</h4>
                      <p className="text-sm text-watt-navy/60">{method.bestFor}</p>
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

        {/* Network Topology */}
        <ScrollReveal delay={200}>
          <Card className="border-watt-navy/10 mt-12">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-watt-navy mb-6 text-center">
                Network Architecture
              </h3>
              
              <div className="relative bg-slate-50 rounded-xl p-8">
                {/* Internet */}
                <div className="flex justify-center mb-6">
                  <div className="px-6 py-3 rounded-lg bg-blue-500 text-white font-medium flex items-center gap-2">
                    🌐 Internet (Dual ISP)
                  </div>
                </div>

                {/* Main Router */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-1 h-8 bg-blue-400 mx-auto" />
                    <div className="px-6 py-3 rounded-lg bg-watt-navy text-white font-medium">
                      Core Router (Redundant)
                    </div>
                  </div>
                </div>

                {/* Switches */}
                <div className="flex justify-center gap-4 mb-6">
                  {['Switch A', 'Switch B', 'Switch C'].map((sw, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-1 h-6 bg-gray-400" />
                      <div className="px-4 py-2 rounded bg-gray-600 text-white text-sm">
                        {sw}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Containers */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-0.5 h-4 bg-gray-300" />
                      <div className="w-12 h-8 rounded bg-gradient-to-b from-green-500 to-green-600 flex items-center justify-center">
                        <Server className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Labels */}
                <div className="mt-4 flex justify-center gap-8 text-xs text-watt-navy/60">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    WAN
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-watt-navy" />
                    Core Network
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    Mining Containers
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Redundancy', value: 'Dual ISP, Dual Core' },
                  { label: 'Bandwidth', value: '1 Gbps minimum' },
                  { label: 'Latency', value: '< 50ms to pool' }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-blue-50 text-center">
                    <span className="text-xs text-watt-navy/60 block">{item.label}</span>
                    <span className="text-lg font-bold text-blue-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HydroElectricalSection;
