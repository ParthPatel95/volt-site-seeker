import React, { useState, useEffect, useRef } from 'react';
import { Building2, Thermometer, Clock, Network, Zap, Leaf, Shield, MapPin, X } from 'lucide-react';
import { StrategicMarketAnalytics } from './StrategicMarketAnalytics';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import facilityNight from '@/assets/alberta-facility-night.png';
import facilityAerial1 from '@/assets/alberta-facility-aerial-1.jpg';
import facilityAerial2 from '@/assets/alberta-facility-aerial-2.jpg';
const facilityImages = [{
  src: facilityNight,
  alt: 'Alberta Facility Night View',
  caption: 'World-Class Infrastructure',
  description: '135 MW operational facility in Alberta, Canada'
}, {
  src: facilityAerial1,
  alt: 'Alberta Facility Aerial View 1',
  caption: 'Direct Grid Connection',
  description: '26 acres with direct AESO grid connectivity'
}, {
  src: facilityAerial2,
  alt: 'Alberta Facility Aerial View 2',
  caption: 'Enterprise Scale',
  description: '20,000 sq ft data center with 99.99% uptime'
}];
const specifications = [{
  icon: Zap,
  label: 'Power Capacity',
  value: '135',
  unit: 'MW',
  color: 'watt-trust',
  size: 'large'
}, {
  icon: Building2,
  label: 'Facility Size',
  value: '26',
  unit: 'Acres',
  color: 'watt-trust',
  size: 'medium'
}, {
  icon: Thermometer,
  label: 'Warehouse Space',
  value: '20,000',
  unit: 'sq ft',
  color: 'watt-bitcoin',
  size: 'medium'
}, {
  icon: Network,
  label: 'Grid Connection',
  value: 'Direct',
  unit: 'AESO',
  color: 'watt-success',
  size: 'medium'
}, {
  icon: Clock,
  label: 'Uptime SLA',
  value: '99.99',
  unit: '%',
  color: 'watt-success',
  size: 'small'
}, {
  icon: Leaf,
  label: 'Cooling',
  value: 'Air',
  unit: 'Cooled',
  color: 'watt-bitcoin',
  size: 'small'
}, {
  icon: Shield,
  label: 'Security',
  value: '24/7',
  unit: '365',
  color: 'watt-trust',
  size: 'small'
}, {
  icon: MapPin,
  label: 'Location',
  value: 'Alberta',
  unit: 'CA',
  color: 'watt-trust',
  size: 'small'
}];
export const AlbertaFacilityHub = () => {
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage(prev => (prev + 1) % facilityImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, {
      threshold: 0.1
    });
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);
  const handleImageClick = (index: number) => {
    setSelectedImage(index);
  };
  return <section ref={sectionRef} className="relative pt-20 md:pt-32 pb-8 md:pb-12 overflow-hidden bg-white">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/30 backdrop-blur-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-watt-trust animate-pulse" />
            <span className="text-sm font-medium text-watt-trust">Under Development</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-watt-navy mb-6">
            Alberta Heartland <span className="text-watt-success">135</span>
          </h2>
          <p className="text-lg sm:text-xl text-watt-navy/70 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade infrastructure delivering reliable, efficient power for high-performance computing
          </p>
        </div>

        {/* Interactive Image Gallery */}
        <div className={`mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large featured image */}
            <div className="md:col-span-2 relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group shadow-institutional" onClick={() => handleImageClick(0)}>
              <img src={facilityImages[0].src} alt={facilityImages[0].alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h4 className="text-xl font-bold text-white mb-1">{facilityImages[0].caption}</h4>
                <p className="text-sm text-white/90">{facilityImages[0].description}</p>
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-watt-trust/50 rounded-2xl transition-colors duration-300" />
            </div>

            {/* Vertical stack of smaller images */}
            <div className="flex flex-col gap-4">
              {facilityImages.slice(1).map((image, index) => <div key={index + 1} className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-institutional" onClick={() => handleImageClick(index + 1)}>
                  <img src={image.src} alt={image.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h5 className="text-sm font-bold text-white">{image.caption}</h5>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-watt-trust/50 rounded-2xl transition-colors duration-300" />
                </div>)}
            </div>
          </div>
        </div>

        {/* Technical Specifications - Compact Grid */}
        <div className={`mb-12 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-3xl font-bold text-watt-navy mb-8 text-center">
            <Building2 className="inline-block w-8 h-8 mr-3 text-watt-trust" />
            Technical Specifications
          </h3>
          
          {/* Primary specs - larger cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {specifications.slice(0, 4).map((spec, index) => {
            const colorClasses = {
              'watt-trust': 'from-watt-trust/10 to-watt-trust/5 border-watt-trust/30 group-hover:border-watt-trust/60',
              'watt-bitcoin': 'from-watt-bitcoin/10 to-watt-bitcoin/5 border-watt-bitcoin/30 group-hover:border-watt-bitcoin/60',
              'watt-success': 'from-watt-success/10 to-watt-success/5 border-watt-success/30 group-hover:border-watt-success/60'
            };
            return <div key={index} className={`group relative overflow-hidden rounded-xl p-5 bg-gradient-to-br ${colorClasses[spec.color as keyof typeof colorClasses]} border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 shadow-institutional-lg`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg bg-white/80`}>
                      <spec.icon className={`w-5 h-5 text-${spec.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-watt-navy/60 mb-1">{spec.label}</div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-watt-navy">{spec.value}</span>
                        <span className="text-base text-watt-navy/60 font-medium">{spec.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>;
          })}
          </div>
          
          {/* Secondary specs - compact row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {specifications.slice(4).map((spec, index) => {
            const colorClasses = {
              'watt-success': 'border-watt-success/30 hover:border-watt-success/60 hover:bg-watt-success/5',
              'watt-bitcoin': 'border-watt-bitcoin/30 hover:border-watt-bitcoin/60 hover:bg-watt-bitcoin/5',
              'watt-trust': 'border-watt-trust/30 hover:border-watt-trust/60 hover:bg-watt-trust/5'
            };
            return <div key={index} className={`group relative overflow-hidden rounded-lg p-4 bg-white border ${colorClasses[spec.color as keyof typeof colorClasses]} backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 shadow-institutional`}>
                  <div className="flex items-center gap-3">
                    <spec.icon className={`w-4 h-4 text-${spec.color} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-watt-navy/60 mb-0.5">{spec.label}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-watt-navy">{spec.value}</span>
                        <span className="text-xs text-watt-navy/60">{spec.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>;
          })}
          </div>
        </div>

        {/* Strategic Market Analytics - Combined Location & Energy Analytics */}
        <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <StrategicMarketAnalytics />
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none">
          {selectedImage !== null && <div className="relative">
              <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 p-2 rounded-full bg-white/90 backdrop-blur-sm text-watt-navy hover:bg-white transition-colors z-50 shadow-institutional">
                <X className="w-6 h-6" />
              </button>
              <img src={facilityImages[selectedImage].src} alt={facilityImages[selectedImage].alt} className="w-full h-auto rounded-xl shadow-institutional-lg" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 rounded-b-xl">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {facilityImages[selectedImage].caption}
                </h3>
                <p className="text-white/90">
                  {facilityImages[selectedImage].description}
                </p>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </section>;
};