
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { SiteAccessRequestModal } from './SiteAccessRequestModal';
import { ScrollReveal } from './ScrollAnimations';
import { DatacenterAnimation } from './DatacenterAnimation';
import './landing-animations.css';

export const OptimizedHeroSection = () => {
  return (
    <section className="relative z-10 pt-24 sm:pt-32 md:pt-36 pb-20 sm:pb-24 md:pb-28 px-4 sm:px-6 overflow-hidden">
      {/* Professional Datacenter Animation */}
      <DatacenterAnimation />
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Main heading */}
        <ScrollReveal delay={100}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight text-watt-navy tracking-tight">
            Building Digital<br />
            <span className="text-watt-bitcoin">Infrastructure</span><br />
            at Scale
          </h1>
        </ScrollReveal>
        
        {/* Description */}
        <ScrollReveal delay={200}>
          <div className="relative mb-10 sm:mb-12 max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-watt-navy/70 leading-relaxed font-normal px-2">
              WattByte acquires and develops strategic power infrastructure for AI, 
              high-performance computing, and Bitcoin mining operations.
            </p>
          </div>
        </ScrollReveal>
        
        {/* Real Statistics */}
        <ScrollReveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mb-12 sm:mb-14">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-watt-bitcoin mb-2">
                1,429<span className="text-3xl sm:text-4xl md:text-5xl">MW</span>
              </div>
              <div className="text-sm sm:text-base text-watt-navy/60 font-medium uppercase tracking-wider">
                Global Pipeline
              </div>
            </div>
            <div className="hidden sm:block w-px h-16 bg-watt-navy/20" />
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-watt-trust mb-2">
                135<span className="text-3xl sm:text-4xl md:text-5xl">MW</span>
              </div>
              <div className="text-sm sm:text-base text-watt-navy/60 font-medium uppercase tracking-wider">
                Under Development
              </div>
            </div>
          </div>
        </ScrollReveal>
        
        {/* CTA buttons */}
        <ScrollReveal delay={400}>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center">
            <Link to="/voltscout" className="w-full sm:w-auto group">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 text-base sm:text-lg font-semibold shadow-institutional-lg transition-all duration-200"
              >
                <span className="flex items-center">
                  Request Platform Access
                  <ArrowRight className="ml-2 sm:ml-3 w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </Link>
            
            <SiteAccessRequestModal>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto border-2 border-watt-navy/20 bg-white text-watt-navy hover:bg-watt-light hover:border-watt-navy/30 px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 text-base sm:text-lg font-semibold shadow-institutional transition-all duration-200"
              >
                View Available Sites
              </Button>
            </SiteAccessRequestModal>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
