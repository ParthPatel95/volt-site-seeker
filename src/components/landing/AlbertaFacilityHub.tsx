import React, { useState, useEffect, useRef } from 'react';
import { Building2, Thermometer, Clock, Network, Zap, Leaf, Shield, MapPin, X, DollarSign, Snowflake, Cable, Globe, Video } from 'lucide-react';
import { StrategicMarketAnalytics } from './StrategicMarketAnalytics';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlbertaVideoShowcase } from './AlbertaVideoShowcase';
import facilityAerial1 from '@/assets/alberta-facility-aerial-1.jpg';
import facilityAerial2 from '@/assets/alberta-facility-aerial-2.jpg';

const facilityImages = [{
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
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);


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
  return <section ref={sectionRef} className="relative py-12 md:py-16 overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-8 md:mb-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/30 backdrop-blur-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-watt-trust animate-pulse" />
            <span className="text-sm font-medium text-watt-trust">Under Development</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-5">
            Alberta Heartland <span className="text-watt-success">135</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade infrastructure delivering reliable, efficient power for high-performance computing
          </p>
        </div>

        {/* Video Showcase Section */}
        <div className={`mb-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-watt-trust/10 rounded-xl">
              <Video className="w-5 h-5 text-watt-trust" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Virtual Site Tour</h3>
              <p className="text-xs text-muted-foreground">Experience our 45MW Alberta facility</p>
            </div>
          </div>
          <AlbertaVideoShowcase />
        </div>

        {/* Image Gallery - 2 Column Grid */}
        <div className={`mb-10 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilityImages.map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-institutional" 
                onClick={() => handleImageClick(index)}
              >
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  loading="lazy" 
                  decoding="async" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h5 className="text-base font-bold text-white">{image.caption}</h5>
                  <p className="text-sm text-white/90">{image.description}</p>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-watt-trust/50 rounded-2xl transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Combined Facility Intelligence Section */}
        <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Building2 className="w-7 h-7 text-watt-trust" />
              <h3 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Facility Intelligence
              </h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Technical specifications and market analytics powering strategic decisions
            </p>
          </div>

          {/* Key Metrics - Hero Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Power Capacity - Featured */}
            <div className="md:col-span-1 bg-gradient-to-br from-watt-trust/10 to-watt-trust/5 rounded-2xl p-6 border border-watt-trust/30 hover:border-watt-trust/60 transition-all hover:shadow-institutional-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-card rounded-xl">
                  <Zap className="w-6 h-6 text-watt-trust" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Total Capacity</div>
                  <div className="text-3xl font-bold text-foreground">135 MW</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Enterprise-grade power infrastructure</p>
            </div>

            {/* Facility Size */}
            <div className="bg-card rounded-2xl p-6 border border-border hover:border-watt-success/60 hover:bg-watt-success/5 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-watt-success/10 rounded-xl">
                  <Building2 className="w-6 h-6 text-watt-success" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Land & Facility</div>
                  <div className="text-3xl font-bold text-foreground">26 Acres</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">20,000 sq ft data center space</p>
            </div>

            {/* Grid Connection */}
            <div className="bg-card rounded-2xl p-6 border border-border hover:border-watt-bitcoin/60 hover:bg-watt-bitcoin/5 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-watt-bitcoin/10 rounded-xl">
                  <Network className="w-6 h-6 text-watt-bitcoin" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Grid Status</div>
                  <div className="text-2xl font-bold text-foreground">Direct AESO</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">99.99% uptime reliability</p>
            </div>
          </div>

          {/* Technical Details & Location Benefits - Two Column */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Technical Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-watt-trust/30 to-transparent" />
                <span className="text-xs font-semibold text-watt-trust uppercase tracking-wider">Technical Details</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-watt-trust/30 to-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {specifications.slice(2).map((spec, index) => {
                  const colorClasses = {
                    'watt-success': 'border-watt-success/30 hover:border-watt-success/60 hover:bg-watt-success/5',
                    'watt-bitcoin': 'border-watt-bitcoin/30 hover:border-watt-bitcoin/60 hover:bg-watt-bitcoin/5',
                    'watt-trust': 'border-watt-trust/30 hover:border-watt-trust/60 hover:bg-watt-trust/5'
                  };
                  
                  const iconColorClasses = {
                    'watt-success': 'text-watt-success',
                    'watt-bitcoin': 'text-watt-bitcoin',
                    'watt-trust': 'text-watt-trust'
                  };
                  
                    return (
                      <div key={index} className={`p-4 rounded-xl bg-card border ${colorClasses[spec.color as keyof typeof colorClasses]} transition-all hover:shadow-lg`}>
                        <div className="flex items-center gap-2 mb-2">
                          <spec.icon className={`w-4 h-4 ${iconColorClasses[spec.color as keyof typeof iconColorClasses]}`} />
                          <div className="text-xs text-muted-foreground">{spec.label}</div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-foreground">{spec.value}</span>
                          <span className="text-xs text-muted-foreground">{spec.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location Advantages */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-watt-success/30 to-transparent" />
                <span className="text-xs font-semibold text-watt-success uppercase tracking-wider">Location Advantages</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-watt-success/30 to-transparent" />
              </div>

              <div className="space-y-3">
                {[
                  { icon: DollarSign, title: 'Competitive Pricing', desc: 'Deregulated wholesale rates', color: 'watt-success' },
                  { icon: Snowflake, title: 'Cold Climate', desc: 'Natural cooling advantage', color: 'watt-trust' },
                  { icon: Cable, title: 'Fiber Access', desc: 'Trans-continental connectivity', color: 'watt-bitcoin' },
                  { icon: Globe, title: 'Stable Jurisdiction', desc: 'Canadian rule of law', color: 'watt-trust' }
                ].map((benefit, index) => {
                  const bgColorClasses = {
                    'watt-success': 'bg-watt-success/10',
                    'watt-bitcoin': 'bg-watt-bitcoin/10',
                    'watt-trust': 'bg-watt-trust/10'
                  };
                  
                  const iconColorClasses = {
                    'watt-success': 'text-watt-success',
                    'watt-bitcoin': 'text-watt-bitcoin',
                    'watt-trust': 'text-watt-trust'
                  };
                  
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border hover:border-watt-success/60 hover:shadow-lg transition-all">
                        <div className={`p-2 rounded-lg ${bgColorClasses[benefit.color as keyof typeof bgColorClasses]}`}>
                          <benefit.icon className={`w-4 h-4 ${iconColorClasses[benefit.color as keyof typeof iconColorClasses]}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground">{benefit.title}</div>
                          <div className="text-xs text-muted-foreground">{benefit.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Energy Market Analytics - Embedded */}
          <StrategicMarketAnalytics />
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl p-0 bg-transparent border-none">
          {selectedImage !== null && <div className="relative">
              <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 p-2 rounded-full bg-card backdrop-blur-sm text-foreground hover:bg-muted transition-colors z-50 shadow-lg">
                <X className="w-6 h-6" />
              </button>
              <img src={facilityImages[selectedImage].src} alt={facilityImages[selectedImage].alt} loading="lazy" decoding="async" className="w-full h-auto rounded-xl shadow-institutional-lg" />
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