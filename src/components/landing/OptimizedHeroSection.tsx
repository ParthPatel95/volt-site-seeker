
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { SiteAccessRequestModal } from './SiteAccessRequestModal';
import { ScrollReveal } from './ScrollAnimations';
import { HeroBackground } from './HeroBackground';
import { AnimatedStats } from './AnimatedStats';
import { HeroFloatingElements } from './HeroFloatingElements';
import './landing-animations.css';

export const OptimizedHeroSection = () => {
  return (
    <section className="relative z-10 pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Animated Background */}
      <HeroBackground />
      
      {/* Floating Industry Elements */}
      <HeroFloatingElements />
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Fund badges with enhanced content */}
        <ScrollReveal delay={100}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <Badge 
              variant="outline" 
              className="border-watt-bitcoin/30 text-watt-bitcoin bg-watt-bitcoin/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-watt-bitcoin/20 hover:shadow-lg transition-all duration-200"
            >
              <Zap className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 animate-node-pulse" />
              ⚡ 675MW+ Deal Pipeline
            </Badge>
            <Badge 
              variant="outline" 
              className="border-watt-success/30 text-watt-success bg-watt-success/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-watt-success/20 hover:shadow-lg transition-all duration-200"
            >
              <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              🔥 2.0-2.5x Target MOIC
            </Badge>
            <Badge 
              variant="outline" 
              className="border-watt-trust/30 text-watt-trust bg-watt-trust/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:bg-watt-trust/20 hover:shadow-lg transition-all duration-200"
            >
              <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              🏗️ 6 Active Projects
            </Badge>
          </div>
        </ScrollReveal>
        
        {/* Enhanced main heading */}
        <ScrollReveal delay={200}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-semibold mb-5 sm:mb-7 leading-tight text-watt-navy">
            <span className="block">Where <span className="text-watt-bitcoin">Energy</span></span>
            <span className="block">Meets <span className="text-watt-trust">Compute</span></span>
          </h1>
        </ScrollReveal>
        
        {/* Enhanced description with specific value proposition */}
        <ScrollReveal delay={300}>
          <div className="relative mb-7 sm:mb-9 max-w-3xl mx-auto">
            <p className="text-base md:text-lg text-watt-navy/80 leading-relaxed font-normal px-2">
              Acquiring strategic power infrastructure across <span className="text-watt-trust font-bold">6 countries</span> to deploy{' '}
              <span className="text-watt-bitcoin font-semibold">AI</span>, <span className="text-watt-trust font-semibold">HPC</span>, and{' '}
              <span className="text-watt-success font-semibold">Bitcoin mining</span> facilities. Our team has closed{' '}
              <span className="text-watt-bitcoin font-bold">$200M+</span> in energy infrastructure deals.
            </p>
          </div>
        </ScrollReveal>
        
        {/* Animated Statistics Row */}
        <ScrollReveal delay={400}>
          <AnimatedStats />
        </ScrollReveal>
        
        {/* Enhanced CTA buttons with electric effects */}
        <ScrollReveal delay={500}>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8">
            <Link to="/voltscout" className="w-full sm:w-auto group">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold shadow-institutional-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(247,147,26,0.4)]"
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
                className="w-full sm:w-auto border-2 border-watt-navy/20 bg-white text-watt-navy hover:bg-watt-light hover:border-watt-bitcoin/40 hover:shadow-[0_0_20px_rgba(247,147,26,0.2)] px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold shadow-institutional transition-all duration-200 hover:scale-[1.02]"
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
