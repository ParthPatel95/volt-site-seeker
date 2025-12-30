import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Wind, Cpu, Layout, ChevronDown, Server, Thermometer, Bitcoin, Gauge, TrendingDown, BookOpen, Target } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import airCooledImage from '@/assets/datacenter-air-cooled.jpg';

const DatacenterHeroSectionV2 = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const sections = [
    { id: 'energy-source', icon: Zap, title: 'Power Journey', description: '138kV → 12VDC chain' },
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

  const learningTopics = [
    'Voltage Step-Down Chain',
    'CFM Calculations',
    'PUE Optimization',
    'ASIC Thermal Specs',
    'Redundancy Configurations',
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
        <motion.img 
          src={airCooledImage} 
          alt="Bitcoin mining datacenter interior" 
          className="w-full h-full object-cover"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--watt-navy))] via-[hsl(var(--watt-navy)/0.85)] to-[hsl(var(--watt-navy)/0.6)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--watt-navy))] via-transparent to-[hsl(var(--watt-navy)/0.5)]" />
      </div>

      {/* Animated circuit pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit-hero" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 0 50 L 40 50 L 50 40 L 50 0" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[hsl(var(--watt-bitcoin))]" />
              <path d="M 50 100 L 50 60 L 60 50 L 100 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[hsl(var(--watt-bitcoin))]" />
              <circle cx="50" cy="50" r="3" className="fill-[hsl(var(--watt-bitcoin))]" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-hero)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="text-center mb-6 md:mb-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[hsl(var(--watt-bitcoin)/0.2)] border border-[hsl(var(--watt-bitcoin)/0.3)] mb-4 md:mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--watt-bitcoin))] animate-pulse" />
            <span className="text-[hsl(var(--watt-bitcoin))] text-xs md:text-sm font-medium">Engineer-Grade Education</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 md:mb-4"
          >
            DATACENTERS <span className="text-[hsl(var(--watt-bitcoin))]">101</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-6"
          >
            The Complete Engineering Guide to Bitcoin Mining Infrastructure
          </motion.p>

          {/* Key Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 md:gap-6 mb-8"
          >
            {keyStats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 hover:border-[hsl(var(--watt-bitcoin)/0.3)] transition-colors"
              >
                <stat.icon className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
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
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Energy Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative max-w-4xl mx-auto mb-6 md:mb-8"
        >
          <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
            <div className="flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/10">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white text-xs md:text-sm font-medium">138kV Grid</span>
            </div>
            <div className="text-white/50">→</div>
            <div className="flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/10">
              <Server className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
              <span className="text-white text-xs md:text-sm font-medium">ASIC Miners</span>
            </div>
            <div className="text-white/50">→</div>
            <div className="flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/10">
              <Thermometer className="w-5 h-5 text-red-400" />
              <span className="text-white text-xs md:text-sm font-medium">~95% Heat</span>
            </div>
            <div className="text-white/50">→</div>
            <div className="flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/10">
              <Wind className="w-5 h-5 text-cyan-400" />
              <span className="text-white text-xs md:text-sm font-medium">Cooling</span>
            </div>
            <div className="text-white/50">→</div>
            <div className="flex items-center gap-1 md:gap-2 px-3 py-2 bg-[hsl(var(--watt-bitcoin)/0.2)] rounded-lg border border-[hsl(var(--watt-bitcoin)/0.3)]">
              <Bitcoin className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
              <span className="text-[hsl(var(--watt-bitcoin))] text-xs md:text-sm font-medium">Bitcoin</span>
            </div>
          </div>
        </motion.div>

        {/* Section Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto"
        >
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              onClick={() => scrollToSection(section.id)}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative p-3 md:p-4 rounded-xl border transition-all duration-300 text-left ${
                hoveredCard === index 
                  ? 'bg-[hsl(var(--watt-bitcoin)/0.2)] border-[hsl(var(--watt-bitcoin))] shadow-lg shadow-[hsl(var(--watt-bitcoin)/0.2)] scale-105' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center mb-2 md:mb-3 transition-colors ${
                hoveredCard === index ? 'bg-[hsl(var(--watt-bitcoin))]' : 'bg-white/10'
              }`}>
                <section.icon className={`w-4 h-4 md:w-5 md:h-5 ${hoveredCard === index ? 'text-white' : 'text-[hsl(var(--watt-bitcoin))]'}`} />
              </div>
              <h3 className="font-semibold text-white text-xs md:text-sm mb-0.5 md:mb-1">{section.title}</h3>
              <p className="text-white/60 text-[10px] md:text-xs">{section.description}</p>
              
              {/* Hover indicator */}
              <div className={`absolute bottom-2 right-2 transition-opacity ${hoveredCard === index ? 'opacity-100' : 'opacity-0'}`}>
                <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-[hsl(var(--watt-bitcoin))] animate-bounce" />
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* What You'll Learn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-white/50" />
            <p className="text-white/50 text-xs">What you'll learn:</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {learningTopics.map((topic) => (
              <span 
                key={topic} 
                className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white/70 hover:border-[hsl(var(--watt-bitcoin)/0.3)] hover:text-white/90 transition-colors"
              >
                {topic}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-6 md:mt-8"
        >
          <button 
            onClick={() => scrollToSection('energy-source')}
            className="inline-flex flex-col items-center text-white/60 hover:text-[hsl(var(--watt-bitcoin))] transition-colors group"
          >
            <span className="text-xs md:text-sm mb-2">Begin Your Journey</span>
            <div className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-current flex items-start justify-center p-1">
              <motion.div 
                className="w-1 h-1.5 md:w-1.5 md:h-2 bg-current rounded-full"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default DatacenterHeroSectionV2;
