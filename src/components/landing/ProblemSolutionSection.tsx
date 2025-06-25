
import { AlertTriangle, CheckCircle, Zap, Building, TrendingUp } from 'lucide-react';

export const ProblemSolutionSection = () => {
  return (
    <section className="relative z-10 py-6 md:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Turning Power Constraints Into 
            <span className="text-electric-yellow"> Profit Opportunities</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            The data center industry faces <span className="text-electric-yellow font-semibold">critical bottlenecks</span> in scaling 
            to meet explosive AI demand. Power constraints are the 
            <span className="text-neon-green font-semibold"> #1 limiting factor</span> across North America.
          </p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Challenge Side */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Industry Challenges</h3>
                  <p className="text-red-400 font-medium">Data Center Developers Face</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "Sourcing power-rich, low-cost sites in competitive markets",
                  "Complex land entitlement & permitting across jurisdictions", 
                  "Securing favorable power purchase agreements (PPAs)",
                  "Building critical utility and municipal relationships",
                  "Rising acquisition costs in traditional DC markets",
                  "Meeting environmental & sustainability requirements"
                ].map((challenge, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-red-500/5 transition-colors">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300 text-sm leading-relaxed">{challenge}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-red-500/20 flex items-center text-red-400">
                <Building className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Critical Infrastructure Bottlenecks</span>
              </div>
            </div>
          </div>

          {/* Solution Side */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-neon-green to-electric-blue rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-neon-green/30">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-blue rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">WattByte's Solution</h3>
                  <p className="text-neon-green font-medium">Turning Problems into Profits</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  "Identifying stranded/underutilized energy assets across North America",
                  "Fast-tracking site control through established processes",
                  "Delivering plug-and-play brownfield assets with clear pathways", 
                  "Leveraging existing relationships with power providers",
                  "Strategic land acquisition in emerging DC markets",
                  "Prioritizing renewable energy sites for ESG compliance"
                ].map((solution, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neon-green/5 transition-colors">
                    <div className="w-2 h-2 bg-neon-green rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300 text-sm leading-relaxed">{solution}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-neon-green/20 flex items-center text-neon-green">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">AI-Powered Infrastructure Intelligence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 via-electric-yellow/20 to-neon-green/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-electric-blue/30 text-center">
            <div className="flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-electric-blue mr-3" />
              <h3 className="text-3xl font-bold text-white">The Result</h3>
            </div>
            
            <p className="text-lg text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              By solving these critical industry pain points, WattByte creates{' '}
              <span className="text-electric-yellow font-bold">significant value</span>{' '}
              for data center operators and investors seeking exposure to{' '}
              <span className="text-neon-green font-bold">digital infrastructure growth</span>{' '}
              without operational complexity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-electric-blue mb-2">675MW+</div>
                <div className="text-gray-400 font-medium">Deal Experience</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-electric-yellow mb-2">2.0-2.5x</div>
                <div className="text-gray-400 font-medium">Target MOIC</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-neon-green mb-2">$25M</div>
                <div className="text-gray-400 font-medium">Fund I Target</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
