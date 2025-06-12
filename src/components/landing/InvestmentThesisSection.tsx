
import { ArrowRight, Cpu, Zap, Building } from 'lucide-react';

export const InvestmentThesisSection = () => {
  return (
    <section className="relative z-10 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3 text-white">
            Our Thesis
          </h2>
          <p className="text-xl text-slate-200 font-semibold">
            Power Arbitrage → Data Center Gold
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-electric-blue/20 rounded-lg flex items-center justify-center mt-1">
                <Cpu className="w-4 h-4 text-electric-blue" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-white">AI/HPC Explosion</h3>
                <p className="text-slate-200 text-sm">Exponential demand for compute power driving unprecedented data center expansion</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-electric-yellow/20 rounded-lg flex items-center justify-center mt-1">
                <Zap className="w-4 h-4 text-electric-yellow" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-white">Power Scarcity</h3>
                <p className="text-slate-200 text-sm">Limited high-capacity power sites creating massive value arbitrage opportunities</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-neon-green/20 rounded-lg flex items-center justify-center mt-1">
                <Building className="w-4 h-4 text-neon-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-white">Industrial Transformation</h3>
                <p className="text-slate-200 text-sm">Converting undervalued industrial sites into premium digital infrastructure real estate</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-center text-white">Value Creation Model</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-200 text-sm">Industrial Land</span>
                <span className="text-neon-green font-bold">$50k/acre</span>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-electric-blue" />
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-200 text-sm">Power Infrastructure</span>
                <span className="text-electric-blue font-bold">+$200k/MW</span>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-electric-yellow" />
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-electric-blue/20 to-electric-yellow/20 rounded-lg border border-electric-blue/30">
                <span className="text-white font-semibold text-sm">Data Center Ready</span>
                <span className="text-electric-yellow font-bold">$500k+/acre</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
