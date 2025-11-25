import React from 'react';
import { Zap, Wind, TrendingUp, Gauge } from 'lucide-react';

const highlights = [
  {
    icon: Zap,
    title: 'Power Infrastructure',
    metric: '150 MW Capacity',
    description: 'Redundant electrical distribution with N+1 backup systems ensuring 99.99% uptime'
  },
  {
    icon: Gauge,
    title: 'Cooling Systems',
    metric: 'PUE < 1.2',
    description: 'Advanced hybrid cooling combining immersion and air-cooled systems for maximum efficiency'
  },
  {
    icon: Wind,
    title: 'Renewable Integration',
    metric: '85%+ Green Energy',
    description: 'Direct connection to Alberta\'s renewable grid with wind and hydro power sourcing'
  },
  {
    icon: TrendingUp,
    title: 'Scalability',
    metric: '300 MW Expansion',
    description: 'Expansion-ready design with pre-approved permits for doubling capacity by 2026'
  }
];

export const InfrastructureHighlights = () => {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            World-Class <span className="text-electric-blue">Infrastructure</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Purpose-built facilities designed for <span className="text-neon-green font-semibold">maximum efficiency</span> and <span className="text-electric-yellow font-semibold">reliability</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {highlights.map((highlight, index) => (
            <div 
              key={index}
              className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-electric-blue/50 transition-all duration-300 hover:scale-105 hover:bg-slate-800/70"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="mb-4 p-3 bg-electric-blue/10 rounded-xl w-fit group-hover:bg-electric-blue/20 transition-colors">
                  <highlight.icon className="w-8 h-8 text-electric-blue" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  {highlight.title}
                </h3>
                
                <div className="text-2xl font-bold text-neon-green mb-3">
                  {highlight.metric}
                </div>
                
                <p className="text-slate-300 text-sm leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};