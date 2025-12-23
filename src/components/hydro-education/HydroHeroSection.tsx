import React from 'react';
import { Droplets, Thermometer, Volume2, Box, ArrowDown, Clock, BookOpen, Calculator } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Badge } from '@/components/ui/badge';

const HydroHeroSection = () => {
  const stats = [
    { icon: Thermometer, value: '45°C', label: 'Max Operation Temp' },
    { icon: Droplets, value: '1.02-1.08', label: 'PUE Rating' },
    { icon: Volume2, value: '70%', label: 'Less Noise' },
    { icon: Box, value: 'Modular', label: 'Container Design' },
  ];

  const courseStats = [
    { icon: Clock, value: '~71 min', label: 'Total Reading Time' },
    { icon: BookOpen, value: '12', label: 'Sections' },
    { icon: Calculator, value: '5+', label: 'Interactive Tools' },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-watt-navy via-watt-navy/95 to-blue-900">
      {/* Animated water-like background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-500/20 to-transparent" />
        {/* Water ripple effects */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-blue-400/30"
            style={{
              width: `${200 + i * 150}px`,
              height: `${200 + i * 150}px`,
              left: '50%',
              top: '60%',
              transform: 'translate(-50%, -50%)',
              animation: `pulse ${3 + i * 0.5}s ease-out infinite`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0.3 - i * 0.05,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 mb-8">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Hydro Datacenters 101</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Liquid-Cooled Mining
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Infrastructure
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8">
            Advanced hydro-cooling technology enables mining operations in extreme environments 
            with superior energy efficiency, reduced noise, and modular scalability.
          </p>
        </ScrollReveal>

        {/* Course Stats */}
        <ScrollReveal delay={250}>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {courseStats.map((stat, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-4 py-2 bg-white/10 text-white/90 border border-white/20 hover:bg-white/15"
              >
                <stat.icon className="w-4 h-4 mr-2 text-cyan-400" />
                <span className="font-bold mr-1">{stat.value}</span>
                <span className="text-white/60">{stat.label}</span>
              </Badge>
            ))}
          </div>
        </ScrollReveal>

        {/* Stats Bar */}
        <ScrollReveal delay={300}>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Scroll indicator */}
        <ScrollReveal delay={400}>
          <button
            onClick={() => document.getElementById('advantages')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <span className="text-sm">Explore Technology</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>
        </ScrollReveal>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HydroHeroSection;
