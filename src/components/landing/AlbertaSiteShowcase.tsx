import React, { useState } from 'react';
import { MapPin, Calendar, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    description: 'Advanced liquid cooling and thermal management systems'
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

export const AlbertaSiteShowcase = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <section className="relative py-12 sm:py-16 md:py-24 bg-gradient-to-b from-background via-slate-950 to-background overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-foreground">Operational Asset</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Alberta Data Center Facility
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Our flagship infrastructure asset powering the future of AI, HPC, and digital mining operations
          </p>
        </div>

        {/* Main Image Display */}
        <div className="relative group mb-6 sm:mb-8">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-xl sm:rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl">
            <img 
              src={facilityImages[selectedImage].src} 
              alt={facilityImages[selectedImage].label}
              className="w-full h-full object-cover transition-all duration-700"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            
            {/* Image Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                    {facilityImages[selectedImage].label}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300">
                    {facilityImages[selectedImage].description}
                  </p>
                </div>
                
                {/* Key Stats */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <div className="bg-slate-900/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 text-primary">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">Alberta, Canada</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 text-primary">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">150 MW</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {facilityImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative group aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === index 
                  ? 'border-primary shadow-lg shadow-primary/20 scale-105' 
                  : 'border-slate-800 hover:border-primary/50'
              }`}
            >
              <img 
                src={image.src} 
                alt={image.label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                selectedImage === index 
                  ? 'bg-primary/20' 
                  : 'bg-slate-950/40 group-hover:bg-slate-950/20'
              }`}></div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-950 to-transparent">
                <p className="text-xs font-medium text-white truncate">{image.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="group bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8"
          >
            Request Site Tour
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};
