
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { SiteAccessRequestModal } from './SiteAccessRequestModal';
import { ScrollReveal } from './ScrollAnimations';
import './landing-animations.css';

export const OptimizedHeroSection = () => {
  return (
    <section className="relative z-10 pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 bg-watt-navy">
      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Fund badges with clean styling */}
        <ScrollReveal delay={100}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <Badge 
              variant="outline" 
              className="border-watt-trust/30 text-watt-trust bg-watt-trust/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-watt-trust/15 transition-colors duration-200"
            >
              <Zap className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              Fund I • $25M Target
            </Badge>
            <Badge 
              variant="outline" 
              className="border-watt-success/30 text-watt-success bg-watt-success/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-watt-success/15 transition-colors duration-200"
            >
              <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              2.0-2.5x MOIC
            </Badge>
            <Badge 
              variant="outline" 
              className="border-watt-bitcoin/30 text-watt-bitcoin bg-watt-bitcoin/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-watt-bitcoin/15 transition-colors duration-200"
            >
              <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              675MW+ Experience
            </Badge>
          </div>
        </ScrollReveal>
        
        {/* Main heading with clean typography */}
        <ScrollReveal delay={200}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
            <span className="text-white">Turning </span>
            <span className="text-watt-trust">Power</span>
            <br />
            <span className="text-white">into </span>
            <span className="text-watt-bitcoin">Profit</span>
          </h1>
        </ScrollReveal>
        
        {/* Description with clean styling */}
        <ScrollReveal delay={300}>
          <div className="relative mb-8 sm:mb-10 md:mb-12 max-w-5xl mx-auto">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed font-normal px-2">
              Next-generation infrastructure company acquiring power-rich land across North America 
              for <span className="text-watt-trust font-semibold">AI</span>, <span className="text-watt-bitcoin font-semibold">HPC</span>, and <span className="text-watt-success font-semibold">crypto data centers</span>, 
              backed by <span className="text-watt-bitcoin font-bold">675MW+</span> of deal experience.
            </p>
          </div>
        </ScrollReveal>
        
        {/* CTA buttons with solid colors */}
        <ScrollReveal delay={400}>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <Link to="/voltscout" className="w-full sm:w-auto group">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold shadow-institutional-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <span className="flex items-center">
                  Request Platform Access
                  <ArrowRight className="ml-2 sm:ml-3 w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
            </Link>
            
            <SiteAccessRequestModal>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]"
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
