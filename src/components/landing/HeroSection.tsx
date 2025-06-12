
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, TrendingUp } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative z-10 pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Animated background elements - adjusted for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-electric-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-neon-green/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-electric-yellow/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Enhanced fund badge - responsive */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Badge 
            variant="outline" 
            className="border-electric-blue/50 text-electric-blue bg-electric-blue/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold"
          >
            <Zap className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            Fund I • $25M Target
          </Badge>
          <Badge 
            variant="outline" 
            className="border-neon-green/50 text-neon-green bg-neon-green/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold"
          >
            <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            2.0-2.5x MOIC
          </Badge>
        </div>
        
        {/* Fixed main heading - using bright, visible colors only */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
          <span className="text-white">Turning </span>
          <span className="text-electric-blue">Power</span>
          <br />
          <span className="text-white">into </span>
          <span className="text-neon-green">Profit</span>
        </h1>
        
        {/* Enhanced description - consolidated into one sentence */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-200 mb-8 sm:mb-10 md:mb-12 max-w-5xl mx-auto leading-relaxed font-medium px-2">
          Next-generation infrastructure fund acquiring power-rich land across North America 
          for <span className="text-electric-blue font-semibold">AI</span>, <span className="text-electric-yellow font-semibold">HPC</span>, and <span className="text-neon-green font-semibold">crypto data centers</span>, 
          backed by <span className="text-electric-blue font-bold">675MW+</span> of deal experience.
        </p>
        
        {/* Enhanced CTA buttons - responsive layout and sizing */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-6 sm:mb-8">
          <Link to="/voltscout" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-neon-green text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold shadow-2xl shadow-electric-blue/25 hover:shadow-electric-blue/40 transition-all duration-300 hover:scale-105"
            >
              Request Platform Access
              <ArrowRight className="ml-2 sm:ml-3 w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto border-2 border-slate-300 text-slate-100 hover:bg-slate-800 hover:text-white hover:border-electric-blue px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            View Pipeline
          </Button>
        </div>

        {/* Key metrics - reduced spacing to match other sections */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50">
            <div className="text-2xl sm:text-3xl font-bold text-electric-blue mb-2">675MW+</div>
            <div className="text-slate-200 text-sm sm:text-base">Deal Experience</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50">
            <div className="text-2xl sm:text-3xl font-bold text-electric-yellow mb-2">$25M</div>
            <div className="text-slate-200 text-sm sm:text-base">Target Fund Size</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50">
            <div className="text-2xl sm:text-3xl font-bold text-neon-green mb-2">2.5x</div>
            <div className="text-slate-200 text-sm sm:text-base">Target MOIC</div>
          </div>
        </div>
      </div>
    </section>
  );
};
