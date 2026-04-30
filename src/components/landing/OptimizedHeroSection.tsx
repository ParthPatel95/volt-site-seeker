
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
            <div className="flex flex-col sm:flex-row items-start justify-start gap-8 sm:gap-12 mb-12 sm:mb-14">
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
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
