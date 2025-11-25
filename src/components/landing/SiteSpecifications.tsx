import React from 'react';
import { Building2, Zap, Thermometer, Clock, Network, Leaf, Shield, MapPin, DollarSign, Snowflake, Cable, Globe } from 'lucide-react';

const technicalSpecs = [
  {
    icon: Zap,
    label: 'Total Power Capacity',
    value: '135 MW'
  },
  {
    icon: Building2,
    label: 'Facility Size',
    value: '26 AC / 20,000 sq ft'
  },
  {
    icon: Thermometer,
    label: 'Cooling System',
    value: 'Air Cooled'
  },
  {
    icon: Clock,
    label: 'Uptime SLA',
    value: '99.99%'
  },
  {
    icon: Network,
    label: 'Grid Connection',
    value: 'Direct AESO'
  },
  {
    icon: Leaf,
    label: 'Renewable Mix',
    value: 'AESO Grid Mix'
  },
  {
    icon: Shield,
    label: 'Security',
    value: '24/7/365'
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Alberta, CA'
  }
];

const locationBenefits = [
  {
    icon: DollarSign,
    title: 'Favorable Energy Pricing',
    description: 'Alberta\'s deregulated energy market provides competitive wholesale rates'
  },
  {
    icon: Snowflake,
    title: 'Cold Climate Advantage',
    description: 'Natural cooling reduces PUE and operational costs year-round'
  },
  {
    icon: Cable,
    title: 'Fiber Connectivity',
    description: 'Proximity to major trans-continental fiber routes'
  },
  {
    icon: Globe,
    title: 'Political Stability',
    description: 'Canadian jurisdiction with strong property rights and rule of law'
  }
];

export const SiteSpecifications = () => {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Technical <span className="text-electric-yellow">Specifications</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade infrastructure with <span className="text-neon-green font-semibold">industry-leading</span> performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Technical Specs Grid */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-electric-blue" />
              Core Specifications
            </h3>
            
            {technicalSpecs.map((spec, index) => (
              <div 
                key={index}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-electric-blue/50 transition-all hover:bg-slate-800/70"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <spec.icon className="w-5 h-5 text-electric-blue" />
                    <span className="text-slate-300 font-medium">{spec.label}</span>
                  </div>
                  <span className="text-white font-bold">{spec.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Location Benefits */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-neon-green" />
              Location Advantages
            </h3>
            
            {locationBenefits.map((benefit, index) => (
              <div 
                key={index}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-neon-green/50 transition-all hover:bg-slate-800/70"
              >
                <div className="flex items-start gap-3">
                  <benefit.icon className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white mb-1">{benefit.title}</h4>
                    <p className="text-sm text-slate-300">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison to Industry */}
        <div className="bg-gradient-to-r from-electric-blue/10 via-electric-yellow/10 to-neon-green/10 rounded-2xl p-6 sm:p-8 border border-electric-blue/30 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Industry <span className="text-electric-yellow">Comparison</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-electric-blue mb-2">PUE &lt; 1.2</div>
              <div className="text-sm text-slate-300 mb-2">vs Industry Avg 1.5</div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-electric-blue to-neon-green" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-green mb-2">99.99%</div>
              <div className="text-sm text-slate-300 mb-2">Uptime SLA</div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-green to-electric-yellow" style={{ width: '99%' }}></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-electric-yellow mb-2">AESO Grid</div>
              <div className="text-sm text-slate-300 mb-2">Renewable Mix (Live)</div>
              <div className="text-xs text-slate-400 mt-1">Powered by Alberta's grid</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};