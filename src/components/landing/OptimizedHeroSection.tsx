
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OptimizedHeroSection = () => {
  return (
    <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Power Into</span>
            <br />
            <span className="bg-gradient-to-r from-electric-blue via-electric-yellow to-neon-green bg-clip-text text-transparent">
              Profit
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            WattByte identifies <span className="text-electric-yellow font-semibold">power-rich land opportunities</span> 
            {" "}across North America for <span className="text-neon-green font-semibold">premium data center development</span>
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-electric-blue mb-2">$25M</div>
              <div className="text-gray-400 font-medium">Fund I Target</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-electric-yellow mb-2">2.0-2.5x</div>
              <div className="text-gray-400 font-medium">Target MOIC</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-neon-green mb-2">675MW+</div>
              <div className="text-gray-400 font-medium">Deal Experience</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-electric-blue to-neon-green hover:from-electric-blue/80 hover:to-neon-green/80 text-white font-semibold px-8 py-4 text-lg"
            >
              Get Investment Access
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Link to="/app">
              <Button 
                variant="outline" 
                size="lg"
                className="border-electric-yellow text-electric-yellow hover:bg-electric-yellow hover:text-black font-semibold px-8 py-4 text-lg"
              >
                <TrendingUp className="mr-2 w-5 h-5" />
                View Pipeline
              </Button>
            </Link>
          </div>

          {/* Trust Indicator */}
          <div className="mt-12 flex items-center justify-center space-x-2 text-gray-400">
            <Zap className="w-5 h-5 text-electric-yellow" />
            <span className="text-sm">Trusted by institutional investors across North America</span>
          </div>
        </div>
      </div>
    </section>
  );
};
