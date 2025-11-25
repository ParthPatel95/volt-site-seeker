import React from 'react';
import { MapPin, DollarSign, Snowflake, Cable, Globe } from 'lucide-react';

const locationBenefits = [
  {
    icon: DollarSign,
    title: 'Competitive Energy Pricing',
    description: 'Alberta\'s deregulated market offers low-cost, market-driven wholesale power rates'
  },
  {
    icon: Snowflake,
    title: 'Natural Cooling Benefits',
    description: 'Cold climate reduces cooling costs and improves PUE efficiency year-round'
  },
  {
    icon: Cable,
    title: 'Fiber Infrastructure',
    description: 'Direct access to trans-continental fiber routes connecting US and Canadian markets'
  },
  {
    icon: Globe,
    title: 'Stable Jurisdiction',
    description: 'Canadian political stability with strong property rights and regulatory clarity'
  }
];

export const AlbertaLocationMap = () => {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Strategic <span className="text-electric-blue">Location</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Positioned at the heart of North America's <span className="text-neon-green font-semibold">renewable energy corridor</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Placeholder */}
          <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden border-2 border-electric-blue/30 shadow-xl hover:border-electric-blue/50 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MapPin className="w-16 h-16 text-electric-blue mx-auto animate-pulse" />
                <p className="text-slate-300">
                  Interactive map coming soon
                </p>
                <p className="text-sm text-slate-400">
                  Edmonton Region, Alberta, Canada
                </p>
              </div>
            </div>
          </div>

          {/* Location Benefits */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">
              Why <span className="text-electric-yellow">Alberta</span>?
            </h3>
            
            {locationBenefits.map((benefit, index) => (
              <div 
                key={index}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 hover:border-electric-blue/50 transition-all hover:scale-102 hover:bg-slate-800/70"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-electric-blue/10 rounded-lg group-hover:bg-electric-blue/20 transition-colors">
                    <benefit.icon className="w-5 h-5 text-electric-blue" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-2">{benefit.title}</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};