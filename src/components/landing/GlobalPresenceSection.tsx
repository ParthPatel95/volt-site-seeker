import React, { useState, useEffect, useRef } from 'react';
import { ScrollReveal } from './ScrollAnimations';
import { Zap, Droplet, Sun, Globe } from 'lucide-react';
import canadaFlag from '@/assets/pipeline/flags/canada-ca.svg';
import usFlag from '@/assets/pipeline/flags/united-states-us.svg';
import ugandaFlag from '@/assets/pipeline/flags/uganda-ug.svg';
import nepalFlag from '@/assets/pipeline/flags/nepal-np.svg';
import indiaFlag from '@/assets/pipeline/flags/india-in.svg';

// Bhutan flag (using placeholder as asset doesn't exist)
const bhutanFlag = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5MDAiIGhlaWdodD0iNjAwIj48cGF0aCBmaWxsPSIjRkY0RTEyIiBkPSJNMCAwaDkwMHY2MDBIMHoiLz48cGF0aCBmaWxsPSIjRkZEMTAwIiBkPSJNMCAwaDkwMEw0NTAgMzAweiIvPjwvc3ZnPg==';

// Animated Counter Component
const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <div ref={countRef}>{count.toLocaleString()}{suffix}</div>;
};

interface CountryData {
  name: string;
  flag: string;
  capacity: number;
  type: string;
  region: 'Americas' | 'Africa' | 'Asia';
  icon: React.ReactNode;
}

const countries: CountryData[] = [
  { name: 'Canada', flag: canadaFlag, capacity: 333, type: 'Hybrid', region: 'Americas', icon: <Zap className="w-4 h-4" /> },
  { name: 'United States', flag: usFlag, capacity: 536, type: 'Mix + Natgas', region: 'Americas', icon: <Zap className="w-4 h-4" /> },
  { name: 'Uganda', flag: ugandaFlag, capacity: 400, type: 'Hydro', region: 'Africa', icon: <Droplet className="w-4 h-4" /> },
  { name: 'Nepal', flag: nepalFlag, capacity: 75, type: 'Mix', region: 'Asia', icon: <Zap className="w-4 h-4" /> },
  { name: 'Bhutan', flag: bhutanFlag, capacity: 175, type: 'Hydro', region: 'Asia', icon: <Droplet className="w-4 h-4" /> },
  { name: 'India', flag: indiaFlag, capacity: 45, type: 'Solar + Hydro', region: 'Asia', icon: <Sun className="w-4 h-4" /> },
];

const totalCapacity = countries.reduce((sum, c) => sum + c.capacity, 0);

const regions = [
  { name: 'All Regions', total: totalCapacity },
  { name: 'Americas', total: countries.filter(c => c.region === 'Americas').reduce((sum, c) => sum + c.capacity, 0) },
  { name: 'Africa', total: countries.filter(c => c.region === 'Africa').reduce((sum, c) => sum + c.capacity, 0) },
  { name: 'Asia', total: countries.filter(c => c.region === 'Asia').reduce((sum, c) => sum + c.capacity, 0) },
];

const GlobalPresenceSection: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');

  const filteredCountries = selectedRegion === 'All Regions' 
    ? countries 
    : countries.filter(c => c.region === selectedRegion);

  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Global Presence
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Strategic power infrastructure across three continents
            </p>
          </div>
        </ScrollReveal>

        {/* Hero Stats Banner */}
        <ScrollReveal delay={0.1}>
          <div className="bg-card rounded-xl shadow-institutional p-6 md:p-8 mb-8 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 flex items-center justify-center md:justify-start">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                    <AnimatedCounter end={totalCapacity} duration={2000} />
                    <span className="text-watt-bitcoin ml-2">MW</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Total Pipeline Capacity</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    <AnimatedCounter end={6} duration={1500} />
                  </div>
                  <p className="text-sm text-muted-foreground">Countries</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    <AnimatedCounter end={3} duration={1500} />
                  </div>
                  <p className="text-sm text-muted-foreground">Continents</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Region Selector */}
        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {regions.map((region, index) => (
              <button
                key={region.name}
                onClick={() => setSelectedRegion(region.name)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  selectedRegion === region.name
                    ? 'border-watt-bitcoin bg-watt-bitcoin/5 shadow-lg'
                    : 'border-border bg-card hover:border-watt-bitcoin/50 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <Globe className={`w-6 h-6 mx-auto mb-2 ${
                    selectedRegion === region.name ? 'text-watt-bitcoin' : 'text-muted-foreground'
                  }`} />
                  <p className={`text-sm font-semibold mb-1 ${
                    selectedRegion === region.name ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {region.name}
                  </p>
                  <p className={`text-2xl font-bold ${
                    selectedRegion === region.name ? 'text-watt-bitcoin' : 'text-foreground'
                  }`}>
                    {region.total}<span className="text-sm ml-1">MW</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Country Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCountries.map((country, index) => (
            <ScrollReveal key={country.name} delay={0.1 * index}>
              <div className="bg-card rounded-xl shadow-institutional p-6 border border-border hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-watt-bitcoin/30">
                {/* Flag and Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-border shadow-sm flex-shrink-0">
                    <img 
                      src={country.flag} 
                      alt={`${country.name} flag`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{country.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {country.icon}
                      <span>{country.type}</span>
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-bold text-foreground">
                      <AnimatedCounter end={country.capacity} duration={1500} />
                      <span className="text-lg ml-1">MW</span>
                    </span>
                    <span className="text-sm font-semibold text-watt-bitcoin">
                      {((country.capacity / totalCapacity) * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-watt-bitcoin to-watt-bitcoin/80 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(country.capacity / totalCapacity) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Region Badge */}
                <div className="inline-block px-3 py-1 bg-muted rounded-full">
                  <span className="text-xs font-semibold text-muted-foreground">{country.region}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalPresenceSection;
