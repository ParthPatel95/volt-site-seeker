
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { SiteAccessRequestModal } from './SiteAccessRequestModal';
import { ScrollReveal } from './ScrollAnimations';
import { FacilityShowcase } from './FacilityShowcase';
import './landing-animations.css';

export const OptimizedHeroSection = () => {
  return (
    <section className="relative z-10 w-full min-h-[70vh] overflow-hidden">
      {/* Full-Width Background Photo Layer */}
      <div className="absolute inset-0 w-full h-full">
        <FacilityShowcase />
      </div>
      
      {/* Gradient Overlay for Text Legibility */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(to right, hsl(var(--background) / 0.98) 0%, hsl(var(--background) / 0.85) 35%, hsl(var(--background) / 0.4) 60%, transparent 80%)',
        }}
      />
      
      {/* Floating Content Layer */}
      <div className="relative z-10 flex items-center min-h-[70vh] pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24">
        <div className="w-full px-6 sm:px-8 lg:px-16 max-w-2xl">
          {/* Institutional eyebrow */}
          <ScrollReveal delay={0.05}>
            <div className="mb-6 inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-border bg-background/70 backdrop-blur-sm">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
                Operating in 6 countries · 1,429 MW pipeline · Since 2019
              </span>
            </div>
          </ScrollReveal>

          {/* Main heading */}
          <ScrollReveal delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight tracking-tight">
              <span className="text-[hsl(222_47%_11%)] dark:text-[hsl(210_40%_98%)]">Building Digital</span><br />
              <span className="text-primary">Infrastructure</span><br />
              <span className="text-[hsl(222_47%_11%)] dark:text-[hsl(210_40%_98%)]">at Scale</span>
            </h1>
          </ScrollReveal>
          
          {/* Description */}
          <ScrollReveal delay={0.2}>
            <div className="mb-10 sm:mb-12">
              <p className="text-lg md:text-xl text-[hsl(215_16%_40%)] dark:text-[hsl(215_20%_65%)] leading-relaxed font-normal">
                WattByte acquires and develops strategic power infrastructure for AI, 
                high-performance computing, and Bitcoin mining operations.
              </p>
            </div>
          </ScrollReveal>
          
          {/* Real Statistics */}
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-start justify-start gap-8 sm:gap-10 mb-12 sm:mb-14">
              <div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-2">
                  1,429<span className="text-3xl sm:text-4xl md:text-5xl">MW</span>
                </div>
                <div className="text-sm sm:text-base text-[hsl(215_16%_40%)] dark:text-[hsl(215_20%_65%)] font-medium uppercase tracking-wider">
                  Global Pipeline
                </div>
              </div>
              <div className="hidden sm:block w-px h-16 bg-border" />
              <div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[hsl(142_76%_36%)] mb-2">
                  135<span className="text-3xl sm:text-4xl md:text-5xl">MW</span>
                </div>
                <div className="text-sm sm:text-base text-[hsl(215_16%_40%)] dark:text-[hsl(215_20%_65%)] font-medium uppercase tracking-wider">
                  Under Development
                </div>
              </div>
              <div className="hidden sm:block w-px h-16 bg-border" />
              <div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-2">
                  6
                </div>
                <div className="text-sm sm:text-base text-[hsl(215_16%_40%)] dark:text-[hsl(215_20%_65%)] font-medium uppercase tracking-wider">
                  Countries
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
