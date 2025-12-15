import React, { useState } from 'react';
import { Zap, Wind, Cpu, Layout, ChevronDown, Server, Thermometer, Bitcoin, Gauge, TrendingDown } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import airCooledImage from '@/assets/datacenter-air-cooled.jpg';

const DatacenterHeroSectionV2 = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const sections = [
    { id: 'power-journey', icon: Zap, title: 'Power Journey', description: '138kV → 12VDC chain' },
    { id: 'cooling-systems', icon: Wind, title: 'Cooling Systems', description: 'Air, Hydro, Immersion' },
    { id: 'mining-hardware', icon: Cpu, title: 'Mining Hardware', description: '2024 ASIC specs' },
    { id: 'facility-tour', icon: Layout, title: 'Facility Tour', description: 'Interactive walkthrough' },
  ];

  const keyStats = [
    { label: 'Target Uptime', value: 95, suffix: '%', icon: Gauge },
    { label: 'Target PUE', value: 1.15, suffix: '', decimals: 2, icon: TrendingDown },
    { label: 'Capacity', value: 135, suffix: 'MW', icon: Zap },
    { label: 'Free Cooling', value: 8000, suffix: '+hrs/yr', icon: Wind },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-[85vh] lg:min-h-screen overflow-hidden flex items-center py-8 lg:py-0">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={airCooledImage} 
          alt="Bitcoin mining datacenter interior" 
          className="w-full h-full object-cover"
          style={{ animation: 'slowZoom 30s ease-in-out infinite alternate' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-watt-navy via-watt-navy/85 to-watt-navy/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-watt-navy via-transparent to-watt-navy/50" />
      </div>

      {/* Animated circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 0 50 L 40 50 L 50 40 L 50 0" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-watt-bitcoin" />
              <path d="M 50 100 L 50 60 L 60 50 L 100 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-watt-bitcoin" />
              <circle cx="50" cy="50" r="3" className="fill-watt-bitcoin" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="text-center mb-6 md:mb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-watt-bitcoin/20 border border-watt-bitcoin/30 mb-4 md:mb-6">
            <div className="w-2 h-2 rounded-full bg-watt-bitcoin animate-pulse" />
            <span className="text-watt-bitcoin text-xs md:text-sm font-medium">Engineer-Grade Education</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 md:mb-4">
            DATACENTERS <span className="text-watt-bitcoin">101</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-6">
            The Complete Engineering Guide to Bitcoin Mining Infrastructure
          </p>

          {/* Key Stats Banner */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-8">
            {keyStats.map((stat, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10"
              >
                <stat.icon className="w-4 h-4 text-watt-bitcoin" />
                <div className="text-left">
                  <div className="text-lg md:text-xl font-bold text-white">
                    <AnimatedCounter 
                      end={stat.value} 
                      decimals={stat.decimals || 0} 
                      suffix={stat.suffix} 
                    />
                  </div>
                  <div className="text-[10px] text-white/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Flow Diagram (Simplified) */}
        <div className="relative max-w-4xl mx-auto mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
            <div className="flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white text-xs md:text-sm font-medium">138kV Grid</span>
            </div>
            <div className="text-white/50">→</div>
            <div className="flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <Server className="w-5 h-5 text-watt-bitcoin" />
              <span className="text-white text-xs md:text-sm font-medium">ASIC Miners</span>
            </div>
            <div className="text-white/50">→</div>
            <div className="flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <Thermometer className="w-5 h-5 text-red-400" />
              <span className="text-white text-xs md:text-sm font-medium">~95% Heat</span>
            </div>
            <div className="text-white/50">→</div>
            <div className="flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <Wind className="w-5 h-5 text-cyan-400" />
              <span className="text-white text-xs md:text-sm font-medium">Cooling</span>
            </div>
            <div className="text-white/50">→</div>
            <div className="flex items-center gap-1 md:gap-2 px-3 py-2 bg-watt-bitcoin/20 rounded-lg border border-watt-bitcoin/30">
              <Bitcoin className="w-5 h-5 text-watt-bitcoin" />
              <span className="text-watt-bitcoin text-xs md:text-sm font-medium">Bitcoin</span>
            </div>
          </div>
        </div>

        {/* Section Preview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative p-3 md:p-4 rounded-xl border transition-all duration-300 text-left ${
                hoveredCard === index 
                  ? 'bg-watt-bitcoin/20 border-watt-bitcoin shadow-lg shadow-watt-bitcoin/20 scale-105' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              style={{
                animation: `fadeInUp 0.6s ease-out forwards`,
                animationDelay: `${0.8 + index * 0.1}s`,
                opacity: 0,
              }}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center mb-2 md:mb-3 transition-colors ${
                hoveredCard === index ? 'bg-watt-bitcoin' : 'bg-white/10'
              }`}>
                <section.icon className={`w-4 h-4 md:w-5 md:h-5 ${hoveredCard === index ? 'text-white' : 'text-watt-bitcoin'}`} />
              </div>
              <h3 className="font-semibold text-white text-xs md:text-sm mb-0.5 md:mb-1">{section.title}</h3>
              <p className="text-white/60 text-[10px] md:text-xs">{section.description}</p>
              
              {/* Hover indicator */}
              <div className={`absolute bottom-2 right-2 transition-opacity ${hoveredCard === index ? 'opacity-100' : 'opacity-0'}`}>
                <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-watt-bitcoin animate-bounce" />
              </div>
            </button>
          ))}
        </div>

        {/* What You'll Learn */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-xs mb-3">What you'll learn:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Voltage Step-Down Chain', 'CFM Calculations', 'PUE Optimization', 'ASIC Thermal Specs', 'Redundancy Configurations'].map((topic) => (
              <span key={topic} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white/70">
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="text-center mt-6 md:mt-8">
          <button 
            onClick={() => scrollToSection('power-journey')}
            className="inline-flex flex-col items-center text-white/60 hover:text-watt-bitcoin transition-colors group"
          >
            <span className="text-xs md:text-sm mb-2">Begin Your Journey</span>
            <div className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-current flex items-start justify-center p-1">
              <div className="w-1 h-1.5 md:w-1.5 md:h-2 bg-current rounded-full animate-bounce" />
            </div>
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
      `}</style>
    </section>
  );
};

export default DatacenterHeroSectionV2;
