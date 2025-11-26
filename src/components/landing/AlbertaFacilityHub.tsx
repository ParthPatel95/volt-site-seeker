import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Thermometer, Clock, Network, MapPin, DollarSign, Snowflake, Cable, Globe, Zap, Leaf, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { AlbertaEnergyAnalytics } from './AlbertaEnergyAnalytics';
import facilityNight from '@/assets/alberta-facility-night.png';
import facilityAerial1 from '@/assets/alberta-facility-aerial-1.jpg';
import facilityAerial2 from '@/assets/alberta-facility-aerial-2.jpg';

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

const facilityImages = [
  { src: facilityNight, alt: 'Alberta Facility Night View', caption: 'World-Class Infrastructure' },
  { src: facilityAerial1, alt: 'Alberta Facility Aerial View 1', caption: 'Direct Grid Connection' },
  { src: facilityAerial2, alt: 'Alberta Facility Aerial View 2', caption: '135 MW Capacity' }
];

export const AlbertaFacilityHub = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % facilityImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + facilityImages.length) % facilityImages.length);
  };

  return (
    <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-blue/10 border border-electric-blue/30 backdrop-blur-sm mb-4">
            <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse"></div>
            <span className="text-sm font-medium text-electric-blue">Operational Asset</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Alberta Facility <span className="text-neon-green">Overview</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade infrastructure delivering <span className="text-electric-blue font-semibold">reliable, efficient power</span> for high-performance computing
          </p>
        </div>

        {/* Hero Image Carousel */}
        <div className="relative mb-12 sm:mb-16">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-slate-700/50">
            {/* Image */}
            <div className="relative w-full h-full">
              <img 
                src={facilityImages[currentImage].src} 
                alt={facilityImages[currentImage].alt}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="max-w-4xl">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                    {facilityImages[currentImage].caption}
                  </h3>
                  <p className="text-slate-200 text-base sm:text-lg">
                    135 MW facility in Alberta, Canada • 26 acres • Direct AESO grid connection
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white hover:bg-slate-800 hover:border-electric-blue/50 transition-all flex items-center justify-center"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 text-white hover:bg-slate-800 hover:border-electric-blue/50 transition-all flex items-center justify-center"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {facilityImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImage
                      ? 'bg-electric-blue w-8'
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
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
