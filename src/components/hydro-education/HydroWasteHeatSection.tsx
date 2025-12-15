import React from 'react';
import { 
  Flame, 
  Factory, 
  Home, 
  Droplets,
  Leaf,
  TrendingUp,
  DollarSign,
  Thermometer
} from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Card, CardContent } from '@/components/ui/card';

const applications = [
  {
    icon: Factory,
    title: 'Industrial Heating',
    description: 'Supply heat to nearby industrial processes such as food processing, chemical manufacturing, or textile production.',
    heatOutput: '60-80°C water',
    roi: '15-25%',
    bestFor: 'Industrial parks',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Home,
    title: 'District Heating',
    description: 'Provide residential heating to nearby communities, reducing their reliance on fossil fuels.',
    heatOutput: '50-70°C water',
    roi: '10-18%',
    bestFor: 'Cold climate regions',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    icon: Droplets,
    title: 'Hot Water Generation',
    description: 'Pre-heat municipal or commercial hot water supply, reducing energy consumption.',
    heatOutput: '40-60°C water',
    roi: '8-15%',
    bestFor: 'Hotels, hospitals',
    color: 'from-cyan-500 to-blue-500'
  },
  {
    icon: Leaf,
    title: 'Greenhouse Heating',
    description: 'Extend growing seasons and enable year-round agriculture in cold climates.',
    heatOutput: '30-45°C air/water',
    roi: '20-35%',
    bestFor: 'Agricultural regions',
    color: 'from-green-500 to-emerald-500'
  }
];

const environmentalBenefits = [
  { metric: 'CO₂ Reduction', value: '1,200', unit: 'tons/year per 10MW', description: 'When replacing fossil fuel heating' },
  { metric: 'Energy Recovered', value: '85', unit: '%', description: 'Of waste heat can be captured' },
  { metric: 'Fuel Savings', value: '$500K', unit: '/year per 10MW', description: 'Heating cost offset value' }
];

const HydroWasteHeatSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
              <Flame className="w-4 h-4" />
              Waste Heat Recovery
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Turn Heat Waste Into Value
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Hydro-cooled mining generates significant waste heat that can be captured 
              and monetized for various applications.
            </p>
          </div>
        </ScrollReveal>

        {/* Heat Recovery Diagram */}
        <ScrollReveal>
          <Card className="border-watt-navy/10 mb-12 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-r from-watt-navy via-blue-900 to-watt-navy p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  {/* Input */}
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
                      <Thermometer className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-white font-semibold">Mining Heat</span>
                    <span className="text-white/60 text-sm block">~3.4 MW thermal per MW electric</span>
                  </div>

                  {/* Heat Exchanger */}
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center">
                      <div className="w-16 h-1 bg-red-400" />
                      <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-red-400" />
                    </div>
                    <div className="w-24 h-24 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <div className="text-center">
                        <Flame className="w-8 h-8 text-orange-400 mx-auto" />
                        <span className="text-white text-xs">Recovery</span>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center">
                      <div className="w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-blue-400" />
                      <div className="w-16 h-1 bg-blue-400" />
                    </div>
                  </div>

                  {/* Output */}
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-white font-semibold">Usable Heat</span>
                    <span className="text-white/60 text-sm block">40-80°C hot water</span>
                  </div>
                </div>

                {/* Efficiency indicator */}
                <div className="mt-8 flex justify-center">
                  <div className="px-6 py-2 rounded-full bg-white/10 backdrop-blur text-white text-sm">
                    <span className="text-green-400 font-bold">85%</span> heat recovery efficiency achievable
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {applications.map((app, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <Card className="border-watt-navy/10 h-full hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <app.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-watt-navy mb-2">{app.title}</h3>
                      <p className="text-sm text-watt-navy/70 mb-4">{app.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded bg-watt-navy/5 text-center">
                          <span className="text-xs text-watt-navy/60 block">Heat Output</span>
                          <span className="text-sm font-semibold text-watt-navy">{app.heatOutput}</span>
                        </div>
                        <div className="p-2 rounded bg-green-50 text-center">
                          <span className="text-xs text-green-600 block">ROI Boost</span>
                          <span className="text-sm font-semibold text-green-700">{app.roi}</span>
                        </div>
                        <div className="p-2 rounded bg-blue-50 text-center">
                          <span className="text-xs text-blue-600 block">Best For</span>
                          <span className="text-sm font-semibold text-blue-700">{app.bestFor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Environmental Benefits */}
        <ScrollReveal>
          <Card className="border-watt-navy/10 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-watt-navy">Environmental Impact</h3>
                  <p className="text-sm text-watt-navy/60">Sustainability benefits of waste heat recovery</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {environmentalBenefits.map((benefit, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-4xl font-bold text-green-600">{benefit.value}</span>
                      <span className="text-sm text-watt-navy/60 pb-1">{benefit.unit}</span>
                    </div>
                    <h4 className="font-semibold text-watt-navy mb-1">{benefit.metric}</h4>
                    <p className="text-xs text-watt-navy/60">{benefit.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-lg bg-white border border-green-200">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">ESG Advantage</h4>
                    <p className="text-sm text-green-700">
                      Waste heat recovery programs improve environmental, social, and governance (ESG) 
                      scores, making facilities more attractive to institutional investors and potentially 
                      qualifying for green energy incentives and carbon credits.
                    </p>
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

export default HydroWasteHeatSection;
