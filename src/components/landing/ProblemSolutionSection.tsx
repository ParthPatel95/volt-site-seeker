
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export const ProblemSolutionSection = () => {
  return (
    <section className="relative z-10 py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white">
            Problem We <span className="text-electric-yellow">Solve</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-200 max-w-5xl mx-auto leading-relaxed px-2">
            The data center industry faces significant challenges in scaling to meet the explosive demand growth from AI and cloud computing. 
            <span className="text-electric-yellow font-semibold"> Power constraints</span> have emerged as the primary bottleneck in North America's digital infrastructure landscape.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-start">
          {/* Data Center Developer Challenges */}
          <div className="group hover:scale-105 transition-all duration-500">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-600/50 shadow-2xl hover:shadow-electric-yellow/20">
              <div className="flex items-center mb-6 sm:mb-8">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-electric-yellow to-warm-orange rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <AlertTriangle className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                  Data Center Developer Challenges
                </h3>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {[
                  "Sourcing power-rich, low-cost sites in increasingly competitive markets",
                  "Navigating complex land entitlement & permitting processes across jurisdictions",
                  "Securing power purchase agreements (PPAs) with favorable terms",
                  "Building critical local relationships with utilities and municipalities",
                  "Managing rising land acquisition costs in traditional data center markets",
                  "Addressing environmental and sustainability concerns",
                  "Balancing speed-to-market with thorough due diligence"
                ].map((challenge, index) => (
                  <div key={index} className="flex items-start space-x-3 sm:space-x-4 group/item hover:translate-x-2 transition-transform duration-300">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-r from-electric-yellow to-warm-orange rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-300"></div>
                    <p className="text-slate-100 leading-relaxed text-sm sm:text-base">{challenge}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WattByte's Solution */}
          <div className="group hover:scale-105 transition-all duration-500">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-neon-green/30 shadow-2xl hover:shadow-neon-green/20">
              <div className="flex items-center mb-6 sm:mb-8">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-neon-green to-electric-blue rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                  WattByte's Solution
                </h3>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {[
                  "Identifying stranded or underutilized energy assets across North America",
                  "Fast-tracking site control and infrastructure planning through established processes",
                  "Offering buyers plug-and-play brownfield assets with clear development pathways",
                  "Leveraging existing relationships with power providers and local governments",
                  "Creating value through strategic land acquisition in emerging data center markets",
                  "Prioritizing sites with renewable energy potential to meet ESG requirements",
                  "De-risking development through comprehensive technical & environmental assessment"
                ].map((solution, index) => (
                  <div key={index} className="flex items-start space-x-3 sm:space-x-4 group/item hover:translate-x-2 transition-transform duration-300">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-gradient-to-r from-neon-green to-electric-blue rounded-full mt-1.5 sm:mt-2 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-300"></div>
                    <p className="text-slate-100 leading-relaxed text-sm sm:text-base">{solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced value proposition */}
        <div className="mt-8 sm:mt-12 md:mt-16">
          <div className="bg-gradient-to-r from-electric-blue/10 via-electric-yellow/10 to-neon-green/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-electric-blue/20 max-w-5xl mx-auto text-center shadow-2xl">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <ArrowRight className="w-6 sm:w-8 h-6 sm:h-8 text-electric-blue mr-2 sm:mr-3" />
              <h4 className="text-xl sm:text-2xl font-bold text-white">The Result</h4>
              <ArrowRight className="w-6 sm:w-8 h-6 sm:h-8 text-neon-green ml-2 sm:ml-3" />
            </div>
            <p className="text-lg sm:text-xl text-slate-100 font-medium leading-relaxed">
              By solving these critical industry pain points, WattByte creates <span className="text-electric-blue font-bold">significant value</span> for both 
              data center operators and investors seeking exposure to <span className="text-neon-green font-bold">digital infrastructure growth</span> without 
              the operational complexity of data center development.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
