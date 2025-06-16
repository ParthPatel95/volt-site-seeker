
import { AlertTriangle, CheckCircle, Zap, Building } from 'lucide-react';

export const ProblemSolutionSection = () => {
  return (
    <section className="relative z-10 py-6 sm:py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-lg sm:text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed">
            The data center industry faces <span className="text-electric-yellow font-semibold">critical bottlenecks</span> in scaling 
            to meet explosive AI and cloud computing demand. Power constraints have become the 
            <span className="text-neon-green font-semibold"> #1 limiting factor</span> across North America.
          </p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 mb-6">
          {/* Challenge Side */}
          <div className="relative group">
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-red-500/20 shadow-2xl group-hover:shadow-red-500/20 transition-all duration-500 group-hover:scale-[1.02]">
              {/* Header */}
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Industry Challenges
                  </h3>
                  <p className="text-red-400 font-medium">Data Center Developers Face</p>
                </div>
              </div>

              {/* Challenges List */}
              <div className="space-y-4">
                {[
                  { text: "Sourcing power-rich, low-cost sites in increasingly competitive markets", icon: "🎯" },
                  { text: "Navigating complex land entitlement & permitting processes across jurisdictions", icon: "📋" },
                  { text: "Securing power purchase agreements (PPAs) with favorable terms", icon: "⚡" },
                  { text: "Building critical local relationships with utilities and municipalities", icon: "🤝" },
                  { text: "Managing rising land acquisition costs in traditional data center markets", icon: "📈" },
                  { text: "Addressing environmental and sustainability concerns", icon: "🌱" },
                  { text: "Balancing speed-to-market with thorough due diligence", icon: "⏱️" }
                ].map((challenge, index) => (
                  <div key={index} className="group/item flex items-start space-x-3 p-3 rounded-xl hover:bg-red-500/5 transition-all duration-300 hover:translate-x-2">
                    <div className="text-lg flex-shrink-0 mt-0.5">{challenge.icon}</div>
                    <div className="flex-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-2 group-hover/item:scale-125 transition-transform duration-300"></div>
                      <p className="text-white leading-relaxed group-hover/item:text-white transition-colors duration-300 text-sm">
                        {challenge.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom accent */}
              <div className="mt-6 pt-4 border-t border-red-500/20">
                <div className="flex items-center text-red-400">
                  <Building className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Critical Infrastructure Bottlenecks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Side */}
          <div className="relative group">
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-neon-green/10 to-electric-blue/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-neon-green/30 shadow-2xl group-hover:shadow-neon-green/20 transition-all duration-500 group-hover:scale-[1.02]">
              {/* Header */}
              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-blue rounded-2xl flex items-center justify-center mr-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                    WattByte's Solution
                  </h3>
                  <p className="text-neon-green font-medium">Turning Problems into Profits</p>
                </div>
              </div>

              {/* Solutions List */}
              <div className="space-y-4">
                {[
                  { text: "Identifying stranded or underutilized energy assets across North America", icon: "🔍" },
                  { text: "Fast-tracking site control and infrastructure planning through established processes", icon: "🚀" },
                  { text: "Offering buyers plug-and-play brownfield assets with clear development pathways", icon: "🔌" },
                  { text: "Leveraging existing relationships with power providers and local governments", icon: "🌐" },
                  { text: "Creating value through strategic land acquisition in emerging data center markets", icon: "💎" },
                  { text: "Prioritizing sites with renewable energy potential to meet ESG requirements", icon: "♻️" },
                  { text: "De-risking development through comprehensive technical & environmental assessment", icon: "🛡️" }
                ].map((solution, index) => (
                  <div key={index} className="group/item flex items-start space-x-3 p-3 rounded-xl hover:bg-neon-green/5 transition-all duration-300 hover:translate-x-2">
                    <div className="text-lg flex-shrink-0 mt-0.5">{solution.icon}</div>
                    <div className="flex-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-neon-green to-electric-blue rounded-full mb-2 group-hover/item:scale-125 transition-transform duration-300"></div>
                      <p className="text-white leading-relaxed group-hover/item:text-white transition-colors duration-300 text-sm">
                        {solution.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom accent */}
              <div className="mt-6 pt-4 border-t border-neon-green/20">
                <div className="flex items-center text-neon-green">
                  <Zap className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">AI-Powered Infrastructure Intelligence</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Value Proposition */}
        <div className="relative group">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/5 via-electric-yellow/10 to-neon-green/5 rounded-3xl blur-xl"></div>
          
          <div className="relative bg-gradient-to-r from-slate-800/80 via-slate-900/90 to-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-electric-blue/30 max-w-6xl mx-auto text-center shadow-2xl group-hover:shadow-electric-blue/20 transition-all duration-500">
            {/* Header without arrows */}
            <div className="flex items-center justify-center mb-4">
              <h4 className="text-2xl md:text-3xl font-bold text-white">The Result</h4>
            </div>

            {/* Main text with white color */}
            <p className="text-lg md:text-xl text-white font-medium leading-relaxed mb-6">
              By solving these critical industry pain points, WattByte creates{' '}
              <span className="text-white font-bold">
                significant value
              </span>{' '}
              for both data center operators and investors seeking exposure to{' '}
              <span className="text-white font-bold">
                digital infrastructure growth
              </span>{' '}
              without the operational complexity of data center development.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-600/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-blue mb-1">675MW+</div>
                <div className="text-white text-sm">Deal Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-yellow mb-1">2.0-2.5x</div>
                <div className="text-white text-sm">Target MOIC</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green mb-1">$25M</div>
                <div className="text-white text-sm">Fund I Target</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
