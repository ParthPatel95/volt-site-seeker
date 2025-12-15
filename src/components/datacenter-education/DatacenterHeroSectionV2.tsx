import React, { useState } from 'react';
import { Zap, Wind, Cpu, Layout, ChevronDown, Server, Thermometer, Bitcoin } from 'lucide-react';

const DatacenterHeroSectionV2 = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const sections = [
    { id: 'power-journey', icon: Zap, title: 'Power Journey', description: 'From grid to Bitcoin' },
    { id: 'cooling-systems', icon: Wind, title: 'Cooling Systems', description: 'Heat management tech' },
    { id: 'mining-hardware', icon: Cpu, title: 'Mining Hardware', description: 'ASIC technology' },
    { id: 'facility-tour', icon: Layout, title: 'Facility Tour', description: 'Inside a datacenter' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-[85vh] lg:min-h-screen bg-watt-navy overflow-hidden flex items-center py-8 lg:py-0">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Circuit board pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 0 50 L 40 50 L 50 40 L 50 0" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-watt-bitcoin" />
                <path d="M 50 100 L 50 60 L 60 50 L 100 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-watt-bitcoin" />
                <circle cx="50" cy="50" r="3" className="fill-watt-bitcoin" />
                <circle cx="0" cy="50" r="2" className="fill-watt-bitcoin/50" />
                <circle cx="50" cy="0" r="2" className="fill-watt-bitcoin/50" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>

        {/* Animated energy lines */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-watt-bitcoin to-transparent"
              style={{
                top: `${20 + i * 15}%`,
                left: 0,
                right: 0,
                animation: `energyFlow ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>

        {/* Floating server racks */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-20"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animation: `float ${4 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <Server className="w-8 h-8 text-watt-bitcoin" />
            </div>
          ))}
        </div>

        {/* Heat particles rising */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gradient-to-t from-red-500 to-orange-300"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-5%',
                animation: `heatRise ${4 + Math.random() * 3}s ease-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-watt-navy via-watt-navy/95 to-watt-navy" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="text-center mb-6 md:mb-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-watt-bitcoin/20 border border-watt-bitcoin/30 mb-4 md:mb-6">
            <div className="w-2 h-2 rounded-full bg-watt-bitcoin animate-pulse" />
            <span className="text-watt-bitcoin text-xs md:text-sm font-medium">Interactive Learning Experience</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 md:mb-6">
            DATACENTERS <span className="text-watt-bitcoin">101</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-white/70 max-w-3xl mx-auto mb-6 md:mb-8">
            The Complete Guide to Bitcoin Mining Infrastructure
          </p>
        </div>

        {/* Isometric Datacenter Visualization */}
        <div className="relative max-w-4xl mx-auto mb-6 md:mb-10">
          <div className="relative h-48 sm:h-56 md:h-72 lg:h-80">
            {/* Central datacenter representation */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {/* Main structure */}
              <div className="relative">
                {/* Server rack visualization */}
                <div className="w-48 h-32 md:w-64 md:h-40 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg border border-slate-600 shadow-2xl transform perspective-1000 rotateX-10">
                  {/* Server units */}
                  <div className="absolute inset-2 flex flex-col gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex-1 bg-slate-800 rounded flex items-center px-2 gap-1">
                        <div 
                          className="w-1.5 h-1.5 rounded-full bg-green-500"
                          style={{ animation: `blink ${1 + Math.random()}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
                        />
                        <div 
                          className="w-1.5 h-1.5 rounded-full bg-watt-bitcoin"
                          style={{ animation: `blink ${1.5 + Math.random()}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
                        />
                        <div className="flex-1 h-1 bg-slate-700 rounded ml-1" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Power input animation */}
                <div className="absolute -left-20 md:-left-32 top-1/2 -translate-y-1/2 flex items-center">
                  <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
                  <div className="w-12 md:w-24 h-1 bg-gradient-to-r from-yellow-400 to-watt-bitcoin relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-powerFlow" />
                  </div>
                </div>

                {/* Heat output animation */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Thermometer 
                        key={i} 
                        className="w-5 h-5 text-red-500"
                        style={{ animation: `heatPulse 2s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-red-400 text-xs mt-1">95% Heat</span>
                </div>

                {/* Bitcoin output animation */}
                <div className="absolute -right-20 md:-right-32 top-1/2 -translate-y-1/2 flex items-center">
                  <div className="w-12 md:w-24 h-0.5 bg-gradient-to-r from-watt-bitcoin to-green-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-powerFlow" />
                  </div>
                  <Bitcoin className="w-8 h-8 text-watt-bitcoin animate-pulse" />
                </div>

                {/* Cooling input animation */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <span className="text-cyan-400 text-xs mb-1">Cooling</span>
                  <Wind className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
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
              className={`group relative p-3 md:p-5 rounded-xl border transition-all duration-300 text-left ${
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

        {/* Scroll indicator */}
        <div className="text-center mt-6 md:mt-10">
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
        @keyframes energyFlow {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes heatRise {
          0% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-200px) scale(0.5); opacity: 0; }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes powerFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes heatPulse {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-5px); opacity: 0.7; }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-powerFlow {
          animation: powerFlow 1.5s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default DatacenterHeroSectionV2;
