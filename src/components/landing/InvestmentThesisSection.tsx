
import { ArrowRight, Cpu, Zap, Building, TrendingUp, DollarSign } from 'lucide-react';

export const InvestmentThesisSection = () => {
  return (
    <section className="relative z-10 py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white">
            Our <span className="bg-gradient-to-r from-electric-blue to-neon-green bg-clip-text text-transparent">Thesis</span>
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-electric-yellow font-bold">
            Power Arbitrage → Data Center Gold
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          {/* Market drivers */}
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-start space-x-4 sm:space-x-6 group hover:scale-105 transition-all duration-300">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-br from-electric-blue to-bright-cyan rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-electric-blue/50">
                <Cpu className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white">AI/HPC Explosion</h3>
                <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                  Exponential demand for compute power driving unprecedented data center expansion across North America
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 sm:space-x-6 group hover:scale-105 transition-all duration-300">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-br from-electric-yellow to-warm-orange rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-electric-yellow/50">
                <Zap className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white">Power Scarcity</h3>
                <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                  Limited high-capacity power sites creating massive value arbitrage opportunities in strategic locations
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 sm:space-x-6 group hover:scale-105 transition-all duration-300">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-br from-neon-green to-electric-blue rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-neon-green/50">
                <Building className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white">Industrial Transformation</h3>
                <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
                  Converting undervalued industrial sites into premium digital infrastructure real estate
                </p>
              </div>
            </div>
          </div>
          
          {/* Value creation model */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-600/50 shadow-2xl hover:shadow-electric-blue/20 transition-all duration-500">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-br from-electric-blue to-neon-green rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <TrendingUp className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Value Creation Model</h3>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-slate-800/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-600/30 hover:border-electric-blue/30 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-slate-300 rounded-full mr-2 sm:mr-3"></div>
                    <span className="text-slate-200 text-base sm:text-lg font-medium">Industrial Land</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-slate-200">$50k/acre</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 text-electric-yellow" />
                  <span className="text-electric-yellow font-semibold text-sm sm:text-base">INFRASTRUCTURE</span>
                  <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 text-electric-yellow" />
                </div>
              </div>
              
              <div className="bg-slate-800/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-electric-blue/30 hover:border-electric-blue/50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-electric-blue rounded-full mr-2 sm:mr-3"></div>
                    <span className="text-slate-200 text-base sm:text-lg font-medium">Power Infrastructure</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-electric-blue">+$200k/MW</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 text-neon-green" />
                  <span className="text-neon-green font-semibold text-sm sm:text-base">OPTIMIZATION</span>
                  <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 text-neon-green" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-electric-blue/20 via-electric-yellow/20 to-neon-green/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-electric-blue/50 shadow-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 sm:w-4 h-3 sm:h-4 bg-gradient-to-r from-electric-blue to-neon-green rounded-full mr-2 sm:mr-3"></div>
                    <span className="text-white text-base sm:text-lg font-bold">Data Center Ready</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 sm:w-6 h-5 sm:h-6 text-electric-yellow mr-1" />
                    <span className="text-2xl sm:text-3xl font-bold text-electric-yellow">500k+/acre</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8 text-center">
              <div className="bg-gradient-to-r from-neon-green/20 to-electric-blue/20 rounded-xl p-3 sm:p-4 border border-neon-green/30">
                <p className="text-neon-green font-bold text-base sm:text-lg">10x+ Value Multiplier Potential</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
