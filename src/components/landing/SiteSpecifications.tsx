import React from 'react';
import { Building2, Zap, Thermometer, Clock, Network, Leaf, Shield, MapPin } from 'lucide-react';

const specifications = [
  {
    icon: Zap,
    label: 'Total Power Capacity',
    value: '150 MW',
    detail: 'With 300 MW expansion capacity'
  },
  {
    icon: Building2,
    label: 'Facility Size',
    value: '500,000 sq ft',
    detail: 'Multi-phase data center campus'
  },
  {
    icon: Thermometer,
    label: 'Cooling System',
    value: 'Hybrid',
    detail: 'Immersion + air-cooled systems'
  },
  {
    icon: Clock,
    label: 'Uptime SLA',
    value: '99.99%',
    detail: 'Tier III+ redundancy'
  },
  {
    icon: Network,
    label: 'Grid Connection',
    value: 'Direct AESO',
    detail: 'Substation on-site'
  },
  {
    icon: Leaf,
    label: 'Renewable Mix',
    value: '85%+',
    detail: 'Alberta wind & hydro power'
  },
  {
    icon: Shield,
    label: 'Security',
    value: '24/7/365',
    detail: 'SOC 2 Type II certified'
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Alberta, CA',
    detail: 'Strategic North American hub'
  }
];

const locationBenefits = [
  {
    title: 'Favorable Energy Pricing',
    description: 'Alberta\'s deregulated energy market provides competitive wholesale rates',
    progress: 95
  },
  {
    title: 'Cold Climate Advantage',
    description: 'Natural cooling reduces PUE and operational costs year-round',
    progress: 90
  },
  {
    title: 'Fiber Connectivity',
    description: 'Proximity to major trans-continental fiber routes',
    progress: 85
  },
  {
    title: 'Political Stability',
    description: 'Canadian jurisdiction with strong property rights and rule of law',
    progress: 100
  }
];

export const SiteSpecifications = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-slate-950 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Technical Specifications
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade infrastructure designed for mission-critical operations
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {specifications.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-all duration-300 group"
              >
                <Icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-sm text-muted-foreground mb-1">{spec.label}</div>
                <div className="text-xl sm:text-2xl font-bold text-foreground mb-1">{spec.value}</div>
                <div className="text-xs text-muted-foreground">{spec.detail}</div>
              </div>
            );
          })}
        </div>

        {/* Location Benefits */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">
            Strategic Alberta Location Benefits
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {locationBenefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-base sm:text-lg font-semibold text-foreground">{benefit.title}</h4>
                  <span className="text-sm font-bold text-primary">{benefit.progress}%</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{benefit.description}</p>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000 rounded-full"
                    style={{ width: `${benefit.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Note */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            All specifications exceed industry standards for Tier III data centers. 
            Facility design follows ASHRAE thermal guidelines and meets SOC 2 Type II compliance requirements.
          </p>
        </div>
      </div>
    </section>
  );
};
