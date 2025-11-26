import React, { useState, useEffect, useRef } from 'react';
import { Building2, Thermometer, Clock, Network, MapPin, DollarSign, Snowflake, Cable, Globe, Zap, Leaf, Shield, X } from 'lucide-react';
import { AlbertaEnergyAnalytics } from './AlbertaEnergyAnalytics';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import facilityNight from '@/assets/alberta-facility-night.png';
import facilityAerial1 from '@/assets/alberta-facility-aerial-1.jpg';
import facilityAerial2 from '@/assets/alberta-facility-aerial-2.jpg';

const facilityImages = [
  { src: facilityNight, alt: 'Alberta Facility Night View', caption: 'World-Class Infrastructure', description: '135 MW operational facility in Alberta, Canada' },
  { src: facilityAerial1, alt: 'Alberta Facility Aerial View 1', caption: 'Direct Grid Connection', description: '26 acres with direct AESO grid connectivity' },
  { src: facilityAerial2, alt: 'Alberta Facility Aerial View 2', caption: 'Enterprise Scale', description: '20,000 sq ft data center with 99.99% uptime' }
];

const specifications = [
  { icon: Zap, label: 'Power Capacity', value: '135', unit: 'MW', color: 'electric-blue', size: 'large' },
  { icon: Building2, label: 'Facility Size', value: '26', unit: 'Acres', color: 'electric-blue', size: 'medium' },
  { icon: Thermometer, label: 'Warehouse Space', value: '20,000', unit: 'sq ft', color: 'electric-purple', size: 'medium' },
  { icon: Network, label: 'Grid Connection', value: 'Direct', unit: 'AESO', color: 'neon-green', size: 'medium' },
  { icon: Clock, label: 'Uptime SLA', value: '99.99', unit: '%', color: 'neon-green', size: 'small' },
  { icon: Leaf, label: 'Cooling', value: 'Air', unit: 'Cooled', color: 'electric-yellow', size: 'small' },
  { icon: Shield, label: 'Security', value: '24/7', unit: '365', color: 'warm-orange', size: 'small' },
  { icon: MapPin, label: 'Location', value: 'Alberta', unit: 'CA', color: 'electric-blue', size: 'small' }
];

const locationBenefits = [
  { icon: DollarSign, title: 'Competitive Energy Pricing', description: 'Deregulated market with wholesale rates', color: 'neon-green' },
  { icon: Snowflake, title: 'Cold Climate Advantage', description: 'Natural cooling reduces operational costs', color: 'electric-blue' },
  { icon: Cable, title: 'Fiber Connectivity', description: 'Trans-continental fiber route access', color: 'electric-purple' },
  { icon: Globe, title: 'Political Stability', description: 'Canadian jurisdiction with strong rule of law', color: 'electric-yellow' }
];

export const AlbertaFacilityHub = () => {
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % facilityImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
  };

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-blue/10 border border-electric-blue/30 backdrop-blur-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
            <span className="text-sm font-medium text-electric-blue">Operational Asset</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Alberta Facility <span className="text-neon-green">Experience</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade infrastructure delivering reliable, efficient power for high-performance computing
          </p>
        </div>

        {/* Cinematic Hero Section */}
        <div className={`relative mb-20 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="relative aspect-[21/9] rounded-3xl overflow-hidden group">
            {/* Hero images with crossfade */}
            {facilityImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentHeroImage ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover animate-ken-burns"
                />
              </div>
            ))}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            
            {/* Floating key stats */}
            <div className="absolute bottom-8 left-0 right-0 px-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap gap-6 justify-center sm:justify-start mb-6">
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
                    <div className="text-3xl font-bold text-white mb-1">135 MW</div>
                    <div className="text-sm text-slate-300">Power Capacity</div>
                  </div>
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
                    <div className="text-3xl font-bold text-white mb-1">26 Acres</div>
                    <div className="text-sm text-slate-300">Facility Size</div>
                  </div>
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
                    <div className="text-3xl font-bold text-neon-green mb-1">99.99%</div>
                    <div className="text-sm text-slate-300">Uptime SLA</div>
                  </div>
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
                    <div className="text-3xl font-bold text-electric-blue mb-1">Direct</div>
                    <div className="text-sm text-slate-300">AESO Grid</div>
                  </div>
                </div>
                
                {/* Dot indicators */}
                <div className="flex gap-2 justify-center sm:justify-start">
                  {facilityImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentHeroImage(index)}
                      className={`h-1 rounded-full transition-all ${
                        index === currentHeroImage
                          ? 'bg-electric-blue w-8'
                          : 'bg-white/30 w-6 hover:bg-white/50'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Image Gallery */}
        <div className={`mb-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large featured image */}
            <div 
              className="md:col-span-2 relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(0)}
            >
              <img 
                src={facilityImages[0].src} 
                alt={facilityImages[0].alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h4 className="text-xl font-bold text-white mb-1">{facilityImages[0].caption}</h4>
                <p className="text-sm text-slate-300">{facilityImages[0].description}</p>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-electric-blue/50 rounded-2xl transition-colors duration-300" />
            </div>

            {/* Vertical stack of smaller images */}
            <div className="flex flex-col gap-4">
              {facilityImages.slice(1).map((image, index) => (
                <div 
                  key={index + 1}
                  className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => handleImageClick(index + 1)}
                >
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h5 className="text-sm font-bold text-white">{image.caption}</h5>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-electric-blue/50 rounded-2xl transition-colors duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bento-Style Specifications Grid */}
        <div className={`mb-20 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            <Building2 className="inline-block w-8 h-8 mr-3 text-electric-blue" />
            Technical Specifications
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specifications.map((spec, index) => {
              const isLarge = spec.size === 'large';
              const isMedium = spec.size === 'medium';
              
              const colorClasses = {
                'electric-blue': 'text-electric-blue bg-electric-blue/10 border-electric-blue/50',
                'electric-purple': 'text-electric-purple bg-electric-purple/10 border-electric-purple/50',
                'neon-green': 'text-neon-green bg-neon-green/10 border-neon-green/50',
                'electric-yellow': 'text-electric-yellow bg-electric-yellow/10 border-electric-yellow/50',
                'warm-orange': 'text-warm-orange bg-warm-orange/10 border-warm-orange/50'
              };
              
              return (
                <div 
                  key={index}
                  className={`
                    group relative overflow-hidden rounded-2xl p-6 
                    bg-gradient-to-br from-slate-800/50 to-slate-900/50 
                    border border-slate-700/50 
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:scale-105 hover:shadow-xl
                    ${isLarge ? 'col-span-2 row-span-2' : isMedium ? 'col-span-2' : 'col-span-1'}
                  `}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    ...(colorClasses[spec.color as keyof typeof colorClasses] && {
                      '--hover-color': `var(--watt-${spec.color === 'electric-blue' ? 'primary' : spec.color === 'neon-green' ? 'success' : spec.color === 'electric-yellow' ? 'accent' : 'warning'})`
                    })
                  }}
                >
                  {/* Background gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-current opacity-0 group-hover:opacity-5 transition-opacity duration-300" style={{ color: `hsl(var(--watt-${spec.color === 'electric-blue' ? 'primary' : spec.color === 'neon-green' ? 'success' : spec.color === 'electric-yellow' ? 'accent' : 'warning'}))` }} />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center p-3 rounded-xl mb-4 ${colorClasses[spec.color as keyof typeof colorClasses]?.split(' ')[1]}`}>
                      <spec.icon className={`${colorClasses[spec.color as keyof typeof colorClasses]?.split(' ')[0]} ${isLarge ? 'w-10 h-10' : 'w-6 h-6'}`} />
                    </div>
                    
                    <div className={`${isLarge ? 'text-5xl' : isMedium ? 'text-3xl' : 'text-2xl'} font-bold text-white mb-2`}>
                      {spec.value}
                      <span className={`${isLarge ? 'text-2xl' : 'text-xl'} text-slate-400 ml-2`}>{spec.unit}</span>
                    </div>
                    
                    <div className={`${isMedium || isLarge ? 'text-base' : 'text-sm'} text-slate-300 font-medium`}>
                      {spec.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Benefits - Horizontal Scroll */}
        <div className={`mb-20 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            <MapPin className="inline-block w-8 h-8 mr-3 text-neon-green" />
            Strategic Location Advantages
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {locationBenefits.map((benefit, index) => {
              const colorClasses = {
                'neon-green': 'text-neon-green bg-neon-green/10 hover:border-neon-green/50',
                'electric-blue': 'text-electric-blue bg-electric-blue/10 hover:border-electric-blue/50',
                'electric-purple': 'text-electric-purple bg-electric-purple/10 hover:border-electric-purple/50',
                'electric-yellow': 'text-electric-yellow bg-electric-yellow/10 hover:border-electric-yellow/50'
              };
              
              return (
                <div 
                  key={index}
                  className={`
                    group relative p-6 rounded-2xl 
                    bg-gradient-to-br from-slate-800/50 to-slate-900/50
                    border border-slate-700/50
                    ${colorClasses[benefit.color as keyof typeof colorClasses]?.split(' ')[2]}
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:-translate-y-2 hover:shadow-xl
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`inline-flex items-center justify-center p-3 rounded-xl mb-4 ${colorClasses[benefit.color as keyof typeof colorClasses]?.split(' ')[1]}`}>
                    <benefit.icon className={`w-6 h-6 ${colorClasses[benefit.color as keyof typeof colorClasses]?.split(' ')[0]}`} />
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-2">{benefit.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streamlined Energy Analytics */}
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <AlbertaEnergyAnalytics />
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none">
          {selectedImage !== null && (
            <div className="relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-slate-900/80 backdrop-blur-sm text-white hover:bg-slate-800 transition-colors z-50"
              >
                <X className="w-6 h-6" />
              </button>
              <img 
                src={facilityImages[selectedImage].src} 
                alt={facilityImages[selectedImage].alt}
                className="w-full h-auto rounded-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-8 rounded-b-xl">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {facilityImages[selectedImage].caption}
                </h3>
                <p className="text-slate-300">
                  {facilityImages[selectedImage].description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
