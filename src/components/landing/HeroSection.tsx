
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { PlatformAccessModal } from './PlatformAccessModal';

export const HeroSection = () => {
  return (
    <section className="relative z-10 pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-electric-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-neon-green/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-electric-yellow/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/3 right-1/4 w-24 sm:w-48 h-24 sm:h-48 bg-purple-500/10 rounded-full blur-2xl animate-bounce delay-2000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-32 sm:w-64 h-32 sm:h-64 bg-cyan-400/10 rounded-full blur-2xl animate-bounce delay-3000"></div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Enhanced fund badges without flashing animations */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Badge 
            variant="outline" 
            className="border-electric-blue/50 text-electric-blue bg-electric-blue/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-electric-blue/20 transition-all duration-300"
          >
            <Zap className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            Fund I • $25M Target
          </Badge>
          <Badge 
            variant="outline" 
            className="border-neon-green/50 text-neon-green bg-neon-green/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-neon-green/20 transition-all duration-300"
          >
            <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            2.0-2.5x MOIC
          </Badge>
          <Badge 
            variant="outline" 
            className="border-electric-yellow/50 text-electric-yellow bg-electric-yellow/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-electric-yellow/20 transition-all duration-300"
          >
            <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            675MW+ Experience
          </Badge>
          <Badge 
            variant="outline" 
            className="border-primary/50 text-primary bg-primary/10 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-primary/20 transition-all duration-300"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
            1 Operational Asset
          </Badge>
        </div>
        
        {/* Enhanced main heading with text shadow and glow effects */}
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
          <span className="text-white drop-shadow-2xl">Turning </span>
          <span 
            className="text-electric-blue drop-shadow-2xl relative inline-block"
            style={{
              textShadow: '0 0 20px hsl(var(--watt-primary) / 0.5), 0 0 40px hsl(var(--watt-primary) / 0.3)'
            }}
          >
            Power
          </span>
          <br />
          <span className="text-white drop-shadow-2xl">into </span>
          <span 
            className="text-neon-green drop-shadow-2xl relative inline-block"
            style={{
              textShadow: '0 0 20px hsl(var(--watt-success) / 0.5), 0 0 40px hsl(var(--watt-success) / 0.3)'
            }}
          >
            Profit
          </span>
        </h1>
        
        {/* Enhanced description with better typography */}
        <div className="relative mb-8 sm:mb-10 md:mb-12">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-200 max-w-5xl mx-auto leading-relaxed font-medium px-2 backdrop-blur-sm bg-slate-900/20 rounded-2xl py-6 border border-slate-700/30">
            Next-generation infrastructure company acquiring power-rich land across North America 
            for <span className="text-electric-blue font-semibold bg-electric-blue/10 px-2 py-1 rounded">AI</span>, <span className="text-electric-yellow font-semibold bg-electric-yellow/10 px-2 py-1 rounded">HPC</span>, and <span className="text-neon-green font-semibold bg-neon-green/10 px-2 py-1 rounded">crypto data centers</span>, 
            backed by <span className="text-electric-blue font-bold text-2xl md:text-3xl">675MW+</span> of deal experience.
          </p>
        </div>
        
        {/* Enhanced CTA buttons with improved animations */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-10">
          <PlatformAccessModal>
            <Button 
              size="lg" 
              className="w-full sm:w-auto relative overflow-hidden bg-gradient-to-r from-electric-blue to-neon-green hover:from-bright-cyan hover:to-electric-blue text-white px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold shadow-2xl shadow-electric-blue/25 hover:shadow-electric-blue/40 transition-all duration-500 hover:scale-105 border border-electric-blue/20 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <span className="relative z-10 flex items-center">
                Request Platform Access
                <ArrowRight className="ml-2 sm:ml-3 w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </PlatformAccessModal>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto group border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-semibold bg-slate-900/50 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            onClick={() => {
              const albertaSection = document.getElementById('alberta-facility');
              if (albertaSection) {
                albertaSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <span className="flex items-center">
              Explore Our Alberta Facility
              <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </div>

        {/* Enhanced key metrics with improved visual hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50 hover:border-electric-blue/50 transition-all duration-300 hover:bg-slate-800/70 hover:scale-105">
            <div className="text-2xl sm:text-3xl font-bold text-electric-blue mb-2">
              675MW+
            </div>
            <div className="text-slate-200 text-sm sm:text-base">Deal Experience</div>
            <div className="mt-2 h-1 bg-gradient-to-r from-electric-blue/50 to-transparent rounded-full"></div>
          </div>
          <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50 hover:border-electric-yellow/50 transition-all duration-300 hover:bg-slate-800/70 hover:scale-105 delay-100">
            <div className="text-2xl sm:text-3xl font-bold text-electric-yellow mb-2">
              $25M
            </div>
            <div className="text-slate-200 text-sm sm:text-base">Target Fund Size</div>
            <div className="mt-2 h-1 bg-gradient-to-r from-electric-yellow/50 to-transparent rounded-full"></div>
          </div>
          <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50 hover:border-neon-green/50 transition-all duration-300 hover:bg-slate-800/70 hover:scale-105 delay-200">
            <div className="text-2xl sm:text-3xl font-bold text-neon-green mb-2">
              2.5x
            </div>
            <div className="text-slate-200 text-sm sm:text-base">Target MOIC</div>
            <div className="mt-2 h-1 bg-gradient-to-r from-neon-green/50 to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Floating call-to-action accent */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-electric-blue via-neon-green to-electric-yellow rounded-full animate-pulse"></div>
      </div>
    </section>
  );
};
