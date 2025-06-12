
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const ProblemSolutionSection = () => {
  return (
    <section className="relative z-10 py-16 px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Problem We Solve
          </h2>
          <p className="text-xl text-slate-200 max-w-4xl mx-auto leading-relaxed">
            The data center industry faces significant challenges in scaling to meet the explosive demand growth from AI and cloud computing. Power constraints have emerged as the primary bottleneck in North America's digital infrastructure landscape.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Data Center Developer Challenges */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center">
              <AlertTriangle className="w-7 h-7 text-electric-yellow mr-3" />
              Data Center Developer Challenges
            </h3>
            <div className="space-y-4">
              {[
                "Sourcing power-rich, low-cost sites in increasingly competitive markets",
                "Navigating complex land entitlement & permitting processes across jurisdictions",
                "Securing power purchase agreements (PPAs) with favorable terms",
                "Building critical local relationships with utilities and municipalities",
                "Managing rising land acquisition costs in traditional data center markets",
                "Addressing environmental and sustainability concerns",
                "Balancing speed-to-market with thorough due diligence"
              ].map((challenge, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-electric-yellow rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-slate-200">{challenge}</p>
                </div>
              ))}
            </div>
          </div>

          {/* WattByte's Solution */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-neon-green/30">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center">
              <CheckCircle className="w-7 h-7 text-neon-green mr-3" />
              WattByte's Solution
            </h3>
            <div className="space-y-4">
              {[
                "Identifying stranded or underutilized energy assets across North America",
                "Fast-tracking site control and infrastructure planning through established processes",
                "Offering buyers plug-and-play brownfield assets with clear development pathways",
                "Leveraging existing relationships with power providers and local governments",
                "Creating value through strategic land acquisition in emerging data center markets",
                "Prioritizing sites with renewable energy potential to meet ESG requirements",
                "De-risking development through comprehensive technical & environmental assessment"
              ].map((solution, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neon-green rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-slate-200">{solution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-electric-blue/20 to-neon-green/20 rounded-2xl p-8 border border-electric-blue/30 max-w-4xl mx-auto">
            <p className="text-lg text-white font-medium leading-relaxed">
              By solving these critical industry pain points, WattByte creates significant value for both data center operators and investors 
              seeking exposure to digital infrastructure growth without the operational complexity of data center development.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
