import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Thermometer, Clock, Network, MapPin, DollarSign, Snowflake, Cable, Globe, Zap, Leaf, Shield } from 'lucide-react';
import { AlbertaEnergyAnalytics } from './AlbertaEnergyAnalytics';


const technicalSpecs = [
  {
    icon: Zap,
    label: 'Total Power Capacity',
    value: '135 MW',
    color: 'text-electric-blue'
  },
  {
    icon: Building2,
    label: 'Facility Size',
    value: '26 AC / 20,000 sq ft',
    color: 'text-electric-blue'
  },
  {
    icon: Thermometer,
    label: 'Cooling System',
    value: 'Air Cooled',
    color: 'text-electric-blue'
  },
  {
    icon: Clock,
    label: 'Uptime SLA',
    value: '99.99%',
    color: 'text-neon-green'
  },
  {
    icon: Network,
    label: 'Grid Connection',
    value: 'Direct AESO',
    color: 'text-electric-blue'
  },
  {
    icon: Leaf,
    label: 'Renewable Mix',
    value: 'AESO Grid Mix',
    color: 'text-neon-green'
  },
  {
    icon: Shield,
    label: 'Security',
    value: '24/7/365',
    color: 'text-electric-yellow'
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Alberta, CA',
    color: 'text-electric-blue'
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

export const AlbertaFacilityHub = () => {

  return (
    <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-blue/10 border border-electric-blue/30 backdrop-blur-sm mb-4">
            <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse"></div>
            <span className="text-sm font-medium text-electric-blue">Facility Intelligence Hub</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Alberta Facility <span className="text-neon-green">Overview</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Comprehensive insights into our <span className="text-electric-blue font-semibold">operational asset</span>, technical capabilities, and strategic positioning
          </p>
        </div>

        <Tabs defaultValue="technical" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800/50 border border-slate-700/50 p-1">
            <TabsTrigger 
              value="technical" 
              className="data-[state=active]:bg-electric-blue/20 data-[state=active]:text-electric-blue data-[state=active]:border-electric-blue/50 text-slate-300"
            >
              <Building2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Infrastructure</span>
              <span className="sm:hidden">Tech</span>
            </TabsTrigger>
            <TabsTrigger 
              value="location" 
              className="data-[state=active]:bg-electric-blue/20 data-[state=active]:text-electric-blue data-[state=active]:border-electric-blue/50 text-slate-300"
            >
              <MapPin className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Energy Market</span>
              <span className="sm:hidden">Market</span>
            </TabsTrigger>
          </TabsList>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Building2 className="w-6 h-6 mr-2 text-electric-blue" />
                Core Infrastructure Specifications
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {technicalSpecs.map((spec, index) => (
                  <div 
                    key={index}
                    className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-electric-blue/50 transition-all hover:bg-slate-800/70"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <spec.icon className={`w-5 h-5 ${spec.color} flex-shrink-0`} />
                        <span className="text-base text-slate-300 font-medium truncate">{spec.label}</span>
                      </div>
                      <span className="text-base text-white font-bold whitespace-nowrap">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-electric-blue/10 rounded-lg flex-shrink-0">
                  <Shield className="w-6 h-6 text-electric-blue" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Enterprise-Grade Infrastructure</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Our Alberta facility features state-of-the-art cooling systems, redundant power distribution, 
                    and 24/7 security monitoring. With direct AESO grid connectivity and industry-leading PUE, 
                    we deliver reliable, efficient operations for high-performance computing workloads.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-neon-green" />
                Strategic Location Advantages
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {locationBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-neon-green/50 transition-all hover:bg-slate-800/70"
                  >
                    <div className="flex items-start gap-3">
                      <benefit.icon className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h5 className="text-base font-bold text-white mb-1">{benefit.title}</h5>
                        <p className="text-sm text-slate-300 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alberta Energy Analytics */}
              <AlbertaEnergyAnalytics />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
