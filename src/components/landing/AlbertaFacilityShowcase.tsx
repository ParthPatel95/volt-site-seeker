import React, { useState } from 'react';
import { MapPin, Calendar, Zap, Building2, Thermometer, Clock, Network, Leaf, Shield, DollarSign, Snowflake, Cable, Globe } from 'lucide-react';
import aerialNight from '@/assets/alberta-facility/aerial-night.png';
import coolingInfra from '@/assets/alberta-facility/cooling-infrastructure.jpg';
import powerDist from '@/assets/alberta-facility/power-distribution.jpg';
import siteOverview from '@/assets/alberta-facility/site-overview.jpg';

const facilityImages = [
  {
    src: aerialNight,
    label: 'Night Aerial View',
    description: 'Complete facility overview showcasing our infrastructure'
  },
  {
    src: coolingInfra,
    label: 'Cooling Infrastructure',
    description: 'Advanced air cooling and thermal management systems'
  },
  {
    src: powerDist,
    label: 'Power Distribution',
    description: 'High-capacity electrical distribution network'
  },
  {
    src: siteOverview,
    label: 'Full Site Overview',
    description: 'Operational data center facility in Alberta'
  }
];

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

export const AlbertaFacilityShowcase = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-neon-green/10 border border-neon-green/30 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-neon-green">Operational Asset</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white px-4">
            Alberta Data Center Facility
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed px-4">
            Our flagship infrastructure asset powering the future of <span className="text-electric-blue font-semibold">AI</span>, <span className="text-electric-yellow font-semibold">HPC</span>, and <span className="text-neon-green font-semibold">digital mining</span> operations
          </p>
        </div>

        {/* Main Image Display */}
        <div className="relative group mb-4 sm:mb-6 lg:mb-8">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden border-2 border-electric-blue/30 shadow-2xl hover:border-electric-blue/50 transition-all duration-500">
            <img 
              src={facilityImages[selectedImage].src} 
              alt={facilityImages[selectedImage].label} 
              className="w-full h-full object-cover transition-all duration-700" 
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            
            {/* Image Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">
                    {facilityImages[selectedImage].label}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-300 line-clamp-2">
                    {facilityImages[selectedImage].description}
                  </p>
                </div>
                
                {/* Key Stats */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="bg-slate-900/80 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-electric-blue/30 hover:border-electric-blue/50 transition-colors">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-electric-blue">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Alberta, CA</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-neon-green/30 hover:border-neon-green/50 transition-colors">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-neon-green">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">135 MW</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-electric-yellow/30 hover:border-electric-yellow/50 transition-colors">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-electric-yellow">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-10 lg:mb-12">
          {facilityImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative group aspect-video rounded-md sm:rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === index 
                  ? 'border-electric-blue shadow-lg shadow-electric-blue/30 scale-105' 
                  : 'border-slate-800 hover:border-electric-blue/50'
              }`}
            >
              <img 
                src={image.src} 
                alt={image.label} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
              />
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                selectedImage === index 
                  ? 'bg-electric-blue/20' 
                  : 'bg-slate-950/40 group-hover:bg-slate-950/20'
              }`}></div>
              <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 bg-gradient-to-t from-slate-950 to-transparent">
                <p className="text-xs font-medium text-white truncate">{image.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Specifications Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Technical <span className="text-electric-yellow">Specifications</span>
            </h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed px-4">
              Enterprise-grade infrastructure with <span className="text-neon-green font-semibold">industry-leading</span> performance metrics
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {/* Technical Specs Grid */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-electric-blue flex-shrink-0" />
                <span>Core Specifications</span>
              </h4>
              
              {technicalSpecs.map((spec, index) => (
                <div 
                  key={index}
                  className="group bg-slate-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-700/50 hover:border-electric-blue/50 transition-all hover:bg-slate-800/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <spec.icon className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue flex-shrink-0" />
                      <span className="text-sm sm:text-base text-slate-300 font-medium truncate">{spec.label}</span>
                    </div>
                    <span className="text-sm sm:text-base text-white font-bold whitespace-nowrap">{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Location Benefits */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-neon-green flex-shrink-0" />
                <span>Location Advantages</span>
              </h4>
              
              {locationBenefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="group bg-slate-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-700/50 hover:border-neon-green/50 transition-all hover:bg-slate-800/70"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5 text-neon-green mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm sm:text-base font-bold text-white mb-1">{benefit.title}</h5>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
