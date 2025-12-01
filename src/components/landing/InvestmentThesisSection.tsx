
import { ArrowRight, Cpu, Zap, Building, TrendingUp, DollarSign } from 'lucide-react';

export const InvestmentThesisSection = () => {
  return (
    <section className="relative z-10 py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-watt-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-watt-navy">
            Our <span className="text-watt-trust">Thesis</span>
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-watt-bitcoin font-bold">
            Power Arbitrage → Data Center Gold
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          {/* Market drivers */}
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-start space-x-4 sm:space-x-6 group hover:scale-[1.02] transition-transform duration-200">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-watt-trust rounded-2xl flex items-center justify-center flex-shrink-0 shadow-institutional">
                <Cpu className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-watt-navy">AI/HPC Explosion</h3>
                <p className="text-watt-navy/60 text-base sm:text-lg leading-relaxed">
                  Exponential demand for compute power driving unprecedented data center expansion across North America
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 sm:space-x-6 group hover:scale-[1.02] transition-transform duration-200">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-watt-bitcoin rounded-2xl flex items-center justify-center flex-shrink-0 shadow-institutional">
                <Zap className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-watt-navy">Power Scarcity</h3>
                <p className="text-watt-navy/60 text-base sm:text-lg leading-relaxed">
                  Limited high-capacity power sites creating massive value arbitrage opportunities in strategic locations
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 sm:space-x-6 group hover:scale-[1.02] transition-transform duration-200">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-watt-success rounded-2xl flex items-center justify-center flex-shrink-0 shadow-institutional">
                <Building className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-watt-navy">Industrial Transformation</h3>
                <p className="text-watt-navy/60 text-base sm:text-lg leading-relaxed">
                  Converting undervalued industrial sites into premium digital infrastructure real estate
                </p>
              </div>
            </div>
          </div>
          
          {/* Value creation model */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-institutional-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-watt-trust rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-institutional">
                <TrendingUp className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-watt-navy">Value Creation Model</h3>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-watt-light rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gray-400 rounded-full mr-2 sm:mr-3"></div>
                    <span className="text-watt-navy/70 text-base sm:text-lg font-medium">Industrial Land</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-watt-navy">$50k/acre</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 text-watt-bitcoin" />
                  <span className="text-watt-bitcoin font-semibold text-sm sm:text-base">INFRASTRUCTURE</span>
                  <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 text-watt-bitcoin" />
                </div>
              </div>
              
              <div className="bg-watt-light rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-watt-trust/20">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-watt-trust rounded-full mr-2 sm:mr-3"></div>
                    <span className="text-watt-navy/70 text-base sm:text-lg font-medium">Power Infrastructure</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-watt-trust">+$200k/MW</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 text-watt-success" />
                  <span className="text-watt-success font-semibold text-sm sm:text-base">OPTIMIZATION</span>
                  <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 text-watt-success" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-watt-trust/10 via-watt-bitcoin/10 to-watt-success/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-watt-trust/30 shadow-institutional">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 sm:w-4 h-3 sm:h-4 bg-watt-success rounded-full mr-2 sm:mr-3"></div>
                    <span className="text-watt-navy text-base sm:text-lg font-bold">Data Center Ready</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 sm:w-6 h-5 sm:h-6 text-watt-bitcoin mr-1" />
                    <span className="text-2xl sm:text-3xl font-bold text-watt-bitcoin">500k+/acre</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8 text-center">
              <div className="bg-watt-success/10 rounded-xl p-3 sm:p-4 border border-watt-success/30">
                <p className="text-watt-success font-bold text-base sm:text-lg">10x+ Value Multiplier Potential</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
