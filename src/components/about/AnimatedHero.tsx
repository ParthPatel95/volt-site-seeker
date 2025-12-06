import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

interface AnimatedHeroProps {
  className?: string;
}

// Animated counter component for stats
const AnimatedStat: React.FC<{ value: string; label: string; delay?: number }> = ({ value, label, delay = 0 }) => {
  return (
    <div 
      className="text-center md:text-left animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-3xl md:text-4xl font-bold text-watt-bitcoin mb-1">{value}</div>
      <div className="text-sm text-white/70 uppercase tracking-wide">{label}</div>
    </div>
  );
};

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({ className = '' }) => {
  return (
    <section className={`relative min-h-[70vh] flex items-center overflow-hidden ${className}`}>
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80"
          alt="Digital infrastructure"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay - white on left for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-watt-navy via-watt-navy/90 to-watt-navy/40" />
      </div>

      {/* Refined floating particles - 6 particles like landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-watt-bitcoin/30 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="max-w-2xl">
          <ScrollReveal>
            <Badge className="mb-6 bg-watt-bitcoin text-white border-none px-4 py-2 text-sm font-semibold">
              Digital Infrastructure Company
            </Badge>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              About <span className="text-watt-bitcoin">WattByte</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
              Building Digital Infrastructure at Scale
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <p className="text-lg text-white/70 mb-10 leading-relaxed">
              WattByte transforms stranded power assets into revenue-generating digital infrastructure, 
              powering the future of AI, high-performance computing, and Bitcoin mining operations across the globe.
            </p>
          </ScrollReveal>

          {/* Company Stats */}
          <ScrollReveal delay={400}>
            <div className="flex flex-wrap gap-8 md:gap-12">
              <AnimatedStat value="6" label="Countries" delay={500} />
              <AnimatedStat value="1,429MW" label="Global Pipeline" delay={600} />
              <AnimatedStat value="135MW" label="Under Development" delay={700} />
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center text-white/60 animate-bounce">
          <span className="text-xs uppercase tracking-widest mb-2">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
};

export default AnimatedHero;
