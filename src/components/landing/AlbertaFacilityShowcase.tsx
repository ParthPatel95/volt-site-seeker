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
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-watt-navy overflow-hidden scrollbar-hide">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-watt-success/10 border border-watt-success/30 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-watt-success animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-watt-success">Operational Asset</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white px-4">
            Alberta Data Center Facility
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4">
            Our flagship infrastructure asset powering the future of <span className="text-watt-trust font-semibold">AI</span>, <span className="text-watt-bitcoin font-semibold">HPC</span>, and <span className="text-watt-success font-semibold">digital mining</span> operations
          </p>
        </div>

        {/* Main Image Display */}
        <div className="relative group mb-4 sm:mb-6 lg:mb-8">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden border-2 border-watt-trust/30 shadow-2xl hover:border-watt-trust/50 transition-all duration-500">
            <img 
              src={facilityImages[selectedImage].src} 
              alt={facilityImages[selectedImage].label} 
              className="w-full h-full object-cover transition-all duration-700" 
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-watt-navy/90 via-watt-navy/30 to-transparent"></div>
            
            {/* Image Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">
                    {facilityImages[selectedImage].label}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-white/70 line-clamp-2">
                    {facilityImages[selectedImage].description}
                  </p>
                </div>
                
                {/* Key Stats */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <div className="bg-white/5 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-watt-trust/30 hover:border-watt-trust/50 transition-colors">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-watt-trust">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Alberta, CA</span>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-watt-success/30 hover:border-watt-success/50 transition-colors">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-watt-success">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">135 MW</span>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-watt-bitcoin/30 hover:border-watt-bitcoin/50 transition-colors">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-watt-bitcoin">
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
                  ? 'border-watt-trust shadow-lg shadow-watt-trust/30 scale-105' 
                  : 'border-white/10 hover:border-watt-trust/50'
              }`}
            >
              <img 
                src={image.src} 
                alt={image.label} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
              />
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                selectedImage === index 
                  ? 'bg-watt-trust/20' 
                  : 'bg-watt-navy/40 group-hover:bg-watt-navy/20'
              }`}></div>
              <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 bg-gradient-to-t from-watt-navy to-transparent">
                <p className="text-xs font-medium text-white truncate">{image.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Specifications Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Technical <span className="text-watt-bitcoin">Specifications</span>
            </h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4">
              Enterprise-grade infrastructure with <span className="text-watt-success font-semibold">industry-leading</span> performance metrics
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            {/* Technical Specs Grid */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-watt-trust flex-shrink-0" />
                <span>Core Specifications</span>
              </h4>
              
              {technicalSpecs.map((spec, index) => (
                <div 
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-watt-trust/50 transition-all hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <spec.icon className="w-4 h-4 sm:w-5 sm:h-5 text-watt-trust flex-shrink-0" />
                      <span className="text-sm sm:text-base text-white/70 font-medium truncate">{spec.label}</span>
                    </div>
                    <span className="text-sm sm:text-base text-white font-bold whitespace-nowrap">{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Location Benefits */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-watt-success flex-shrink-0" />
                <span>Location Advantages</span>
              </h4>
              
              {locationBenefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 hover:border-watt-success/50 transition-all hover:bg-white/10"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5 text-watt-success mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-sm sm:text-base font-bold text-white mb-1">{benefit.title}</h5>
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{benefit.description}</p>
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