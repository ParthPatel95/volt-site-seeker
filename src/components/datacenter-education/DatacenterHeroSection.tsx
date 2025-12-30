import React from 'react';
import { Server, Zap, Thermometer, Globe } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const DatacenterHeroSection = () => {
  const stats = [
    { icon: Zap, value: 170, suffix: ' GW', label: 'Global Mining Power' },
    { icon: Server, value: 500, suffix: '+', label: 'Major Facilities Worldwide' },
    { icon: Thermometer, value: 99.9, suffix: '%', label: 'Uptime Standard', decimals: 1 },
    { icon: Globe, value: 50, suffix: '+', label: 'Countries Mining' },
  ];

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[hsl(var(--watt-navy))]">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--watt-bitcoin) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--watt-bitcoin) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Animated floating server icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-[hsl(var(--watt-bitcoin)/0.2)] hidden md:block"
            style={{
              left: `${15 + i * 20}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <Server size={40 + i * 10} />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--watt-navy))] via-[hsl(var(--watt-navy)/0.95)] to-[hsl(var(--watt-navy))]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ScrollReveal>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--watt-bitcoin)/0.1)] border border-[hsl(var(--watt-bitcoin)/0.3)] rounded-full text-[hsl(var(--watt-bitcoin))] text-sm font-medium mb-6">
            <Server className="w-4 h-4" />
            Infrastructure Education
          </span>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Learn{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--watt-bitcoin))] to-[hsl(var(--watt-bitcoin)/0.7)]">
              Datacenters
            </span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-12">
            Discover how Bitcoin mining datacenters work — from power infrastructure and cooling systems 
            to hardware optimization and facility operations. A comprehensive guide to mining infrastructure.
          </p>
        </ScrollReveal>

        {/* Animated Stats Bar */}
        <ScrollReveal delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative group p-4 md:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-[hsl(var(--watt-bitcoin)/0.3)] transition-all duration-300"
              >
                <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-[hsl(var(--watt-bitcoin))] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix}
                    decimals={stat.decimals || 0}
                  />
                </div>
                <div className="text-xs md:text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Scroll indicator */}
        <ScrollReveal delay={0.5}>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-[hsl(var(--watt-bitcoin))] rounded-full animate-pulse" />
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </section>
  );
};

export default DatacenterHeroSection;