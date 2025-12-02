import { ArrowRight, Target, Bitcoin, Cpu, DollarSign, Zap, TrendingUp } from 'lucide-react';
import { ScrollReveal } from './ScrollAnimations';

export const InvestmentThesisSection = () => {
  return (
    <section className="relative z-10 py-12 md:py-16 px-4 sm:px-6 bg-watt-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-watt-navy">
            Our <span className="text-watt-trust">Thesis</span>
          </h2>
          <p className="text-base md:text-lg text-watt-bitcoin font-bold">
            Stranded Power → Bitcoin Mining → AI/HPC Premium
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-start">
          {/* Left: The 3-Stage Strategy */}
          <div className="space-y-6 sm:space-y-8">
            {/* Stage 1: Acquire */}
            <ScrollReveal delay={0.1}>
              <div className="flex items-start space-x-4 sm:space-x-6 group hover:scale-[1.02] transition-transform duration-200">
                <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gray-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-institutional">
                  <Target className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">STAGE 1</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-watt-navy">Identify Stranded Power</h3>
                  <p className="text-watt-navy/60 text-base sm:text-lg leading-relaxed">
                    Target undervalued industrial sites with existing power infrastructure at fraction of greenfield costs
                  </p>
                </div>
              </div>
            </ScrollReveal>
            
            {/* Arrow Down */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 animate-bounce" />
                <div className="w-0.5 h-8 bg-gradient-to-b from-gray-400 to-watt-bitcoin"></div>
              </div>
            </div>
            
            {/* Stage 2: Bitcoin Mining */}
            <ScrollReveal delay={0.2}>
              <div className="flex items-start space-x-4 sm:space-x-6 group hover:scale-[1.02] transition-transform duration-200">
                <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-watt-bitcoin rounded-2xl flex items-center justify-center flex-shrink-0 shadow-institutional">
                  <Bitcoin className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-watt-bitcoin bg-watt-bitcoin/10 px-2 py-1 rounded">STAGE 2</span>
                    <span className="text-xs font-bold text-watt-success bg-watt-success/10 px-2 py-1 rounded">Quick Revenue</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-watt-navy">Deploy Bitcoin Mining</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-watt-bitcoin">$250k/MW</span>
                    <span className="text-sm text-watt-navy/60">deployment cost</span>
                  </div>
                  <p className="text-watt-navy/60 text-base sm:text-lg leading-relaxed">
                    Generate immediate cash flow with low capex Bitcoin mining while infrastructure matures
                  </p>
                </div>
              </div>
            </ScrollReveal>
            
            {/* Arrow Down */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <ArrowRight className="w-6 h-6 text-watt-bitcoin rotate-90 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-0.5 h-8 bg-gradient-to-b from-watt-bitcoin to-watt-trust"></div>
              </div>
            </div>
            
            {/* Stage 3: AI/HPC */}
            <ScrollReveal delay={0.3}>
              <div className="flex items-start space-x-4 sm:space-x-6 group hover:scale-[1.02] transition-transform duration-200">
                <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-watt-trust rounded-2xl flex items-center justify-center flex-shrink-0 shadow-institutional">
                  <Cpu className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-watt-trust bg-watt-trust/10 px-2 py-1 rounded">STAGE 3</span>
                    <span className="text-xs font-bold text-watt-success bg-watt-success/10 px-2 py-1 rounded">10-25x Value</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-watt-navy">Transition to AI/HPC</h3>
                  <p className="text-watt-navy/60 text-base sm:text-lg leading-relaxed">
                    Convert proven power sites to high-value AI data centers commanding premium valuations
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
          
          {/* Right: Cost Advantage Card */}
          <ScrollReveal delay={0.4}>
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-institutional-lg hover:shadow-xl transition-shadow duration-300 h-full">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-watt-trust rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-institutional">
                  <Zap className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-watt-navy mb-2">Our Proprietary Edge</h3>
                <p className="text-sm text-watt-navy/60">Cost advantage through modular infrastructure</p>
              </div>
              
              <div className="space-y-6">
                {/* Bitcoin Mining Cost */}
                <div className="bg-watt-light rounded-xl p-4 sm:p-5 border border-watt-bitcoin/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-watt-navy/70">Bitcoin Mining</span>
                    <Bitcoin className="w-5 h-5 text-watt-bitcoin" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-watt-navy">$250k/MW</div>
                  <div className="text-xs text-watt-navy/60 mt-1">Deployment cost</div>
                </div>
                
                {/* AI/HPC Comparison */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-watt-navy/70 mb-3">AI/HPC Data Centers</div>
                  
                  {/* Traditional */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-watt-navy/60">Traditional</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-600">$12.5M/MW</div>
                    <div className="text-xs text-watt-navy/60 mt-1">Industry standard</div>
                  </div>
                  
                  {/* WattByte - Highlighted */}
                  <div className="bg-gradient-to-r from-watt-trust/10 via-watt-bitcoin/10 to-watt-success/10 rounded-xl p-4 border-2 border-watt-trust/30 shadow-institutional relative">
                    <div className="absolute -top-2 -right-2 bg-watt-success text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      48% LOWER
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-watt-navy">WattByte</span>
                      <Cpu className="w-5 h-5 text-watt-trust" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-watt-trust">$6.5M/MW</div>
                    <div className="text-xs text-watt-navy/80 mt-1 font-medium">Proprietary Modular AI Datacenter (Tier 3)</div>
                  </div>
                </div>
                
                {/* Savings Callout */}
                <div className="bg-watt-success/10 rounded-xl p-4 border border-watt-success/30 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5 text-watt-success" />
                    <span className="text-lg font-bold text-watt-success">$6M/MW Savings</span>
                  </div>
                  <div className="text-xs text-watt-navy/70">Same performance, half the cost</div>
                </div>
              </div>
              
              {/* Timeline Visual */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-xs font-semibold text-watt-navy/70 mb-3 text-center">Typical Timeline</div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 bg-watt-bitcoin/10 rounded-lg p-3 text-center border border-watt-bitcoin/20">
                    <div className="text-xs font-semibold text-watt-bitcoin mb-1">Year 0-1</div>
                    <div className="text-xs text-watt-navy/60">Bitcoin Mining</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-watt-navy/40 flex-shrink-0" />
                  <div className="flex-1 bg-watt-trust/10 rounded-lg p-3 text-center border border-watt-trust/20">
                    <div className="text-xs font-semibold text-watt-trust mb-1">Year 2+</div>
                    <div className="text-xs text-watt-navy/60">AI/HPC</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
        
        {/* Value Multiplier Summary */}
        <ScrollReveal delay={0.5}>
          <div className="mt-8 md:mt-12 bg-gradient-to-r from-watt-trust/5 via-white to-watt-success/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-watt-trust/20 shadow-institutional">
            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-watt-navy mb-2">Complete Value Creation Path</h3>
              <p className="text-sm text-watt-navy/60">From acquisition to premium exit</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <div className="text-sm text-watt-navy/60 mb-1">Land Acquisition</div>
                <div className="text-2xl font-bold text-watt-navy">~$50k/acre</div>
              </div>
              
              <div className="text-center p-4 bg-watt-bitcoin/5 rounded-xl border border-watt-bitcoin/20">
                <div className="text-sm text-watt-navy/60 mb-1">+ Bitcoin Revenue</div>
                <div className="text-2xl font-bold text-watt-bitcoin">Cash Flow+</div>
              </div>
              
              <div className="text-center p-4 bg-watt-trust/5 rounded-xl border border-watt-trust/20">
                <div className="text-sm text-watt-navy/60 mb-1">+ AI/HPC Transition</div>
                <div className="text-2xl font-bold text-watt-trust">$500k+/acre</div>
              </div>
              
              <div className="text-center p-4 bg-watt-success/10 rounded-xl border border-watt-success/30">
                <div className="text-sm text-watt-navy/60 mb-1">Result</div>
                <div className="text-2xl font-bold text-watt-success">10x+ Value</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 bg-watt-success/10 px-4 py-2 rounded-full border border-watt-success/30">
                <DollarSign className="w-4 h-4 text-watt-success" />
                <span className="text-sm font-semibold text-watt-navy">Revenue generation at every stage</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
