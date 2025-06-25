
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { SiteAccessRequestModal } from './SiteAccessRequestModal';
import { InteractiveInvestmentCalculator } from './InteractiveInvestmentCalculator';
import { LiveDataPreview } from './LiveDataPreview';
import { LiveAESOData } from './LiveAESOData';
import { LiveERCOTData } from './LiveERCOTData';
import { ScrollReveal, ParallaxElement } from './ScrollAnimations';
import './landing-animations.css';

export const OptimizedHeroSection = () => {
  return (
    <section className="relative z-10 pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 md:pb-12 px-4 sm:px-6">
      {/* Enhanced background with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <ParallaxElement speed={0.3}>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-electric-blue/10 rounded-full blur-3xl"></div>
        </ParallaxElement>
        <ParallaxElement speed={0.4}>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-green/10 rounded-full blur-3xl"></div>
        </ParallaxElement>
        <ParallaxElement speed={0.2}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-electric-yellow/5 rounded-full blur-3xl"></div>
        </ParallaxElement>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Fund badges with scroll reveal */}
        <ScrollReveal delay={100}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <Badge 
              variant="outline" 
              className="border-electric-blue/50 text-electric-blue bg-electric-blue/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-electric-blue/20 transition-colors duration-200 hover-lift"
            >
              <Zap className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              Fund I • $25M Target
            </Badge>
            <Badge 
              variant="outline" 
              className="border-neon-green/50 text-neon-green bg-neon-green/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-neon-green/20 transition-colors duration-200 hover-lift stagger-1"
            >
              <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              2.0-2.5x MOIC
            </Badge>
            <Badge 
              variant="outline" 
              className="border-electric-yellow/50 text-electric-yellow bg-electric-yellow/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-electric-yellow/20 transition-colors duration-200 hover-lift stagger-2"
            >
              <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              675MW+ Experience
            </Badge>
          </div>
        </ScrollReveal>
        
        {/* Main heading with scroll reveal */}
        <ScrollReveal delay={200}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-3 sm:mb-4 leading-tight">
            <span className="text-white">Turning </span>
            <span className="text-electric-blue">Power</span>
            <br />
            <span className="text-white">into </span>
            <span className="text-neon-green">Profit</span>
          </h1>
        </ScrollReveal>
        
        {/* Description with scroll reveal */}
        <ScrollReveal delay={300}>
          <div className="relative mb-4 sm:mb-5">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-200 max-w-5xl mx-auto leading-relaxed font-medium px-2 bg-slate-900/20 rounded-2xl py-6 border border-slate-700/30 hover-glow">
              Next-generation infrastructure fund acquiring power-rich land across North America 
              for <span className="text-electric-blue font-semibold">AI</span>, <span className="text-electric-yellow font-semibold">HPC</span>, and <span className="text-neon-green font-semibold">crypto data centers</span>, 
              backed by <span className="text-electric-blue font-bold text-2xl md:text-3xl">675MW+</span> of deal experience.
            </p>
          </div>
        </ScrollReveal>
        
        {/* Combined CTA buttons and Live Data Grid */}
        <ScrollReveal delay={400}>
          <div className="space-y-4 sm:space-y-5">
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link to="/voltscout" className="w-full sm:w-auto group">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-electric-blue text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 hover-glow"
                >
                  <span className="flex items-center">
                    Request Platform Access
                    <ArrowRight className="ml-2 sm:ml-3 w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </Link>
              
              <SiteAccessRequestModal>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-2 border-slate-300 text-slate-100 hover:bg-slate-800 hover:text-white hover:border-electric-blue px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover-lift"
                >
                  View Available Sites
                </Button>
              </SiteAccessRequestModal>
            </div>

            {/* Live Data Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <InteractiveInvestmentCalculator />
              <LiveDataPreview />
              <LiveERCOTData />
              <LiveAESOData />
            </div>

            {/* Key metrics - now more compact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto pt-2">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-slate-600/50 hover:border-electric-blue/50 transition-all duration-200 hover:bg-slate-800/70 hover-lift stagger-1">
                <div className="text-xl sm:text-2xl font-bold text-electric-blue mb-1">675MW+</div>
                <div className="text-slate-200 text-xs sm:text-sm">Deal Experience</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-slate-600/50 hover:border-electric-yellow/50 transition-all duration-200 hover:bg-slate-800/70 hover-lift stagger-2">
                <div className="text-xl sm:text-2xl font-bold text-electric-yellow mb-1">$25M</div>
                <div className="text-slate-200 text-xs sm:text-sm">Target Fund Size</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-slate-600/50 hover:border-neon-green/50 transition-all duration-200 hover:bg-slate-800/70 hover-lift stagger-3">
                <div className="text-xl sm:text-2xl font-bold text-neon-green mb-1">2.5x</div>
                <div className="text-slate-200 text-xs sm:text-sm">Target MOIC</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
