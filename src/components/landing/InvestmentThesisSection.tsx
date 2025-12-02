import { ArrowRight, Target, Bitcoin, Cpu, TrendingUp, Sparkles } from 'lucide-react';
import { ScrollReveal } from './ScrollAnimations';
import { AnimatedCounter } from '@/components/AnimatedCounter';

export const InvestmentThesisSection = () => {
  return (
    <section className="relative z-10 py-12 md:py-16 px-4 sm:px-6 bg-watt-light">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 text-watt-navy">
            Our <span className="text-watt-trust">Thesis</span>
          </h2>
          <p className="text-base md:text-lg text-watt-bitcoin font-bold">
            Stranded Power → Bitcoin Mining → AI/HPC Premium
          </p>
        </div>
        
        {/* Three Stage Cards - Horizontal Flow */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Stage 1: ACQUIRE */}
          <ScrollReveal delay={0.1}>
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-300 shadow-institutional hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative">
              <div className="flex flex-col h-full">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                
                {/* Badge */}
                <div className="mb-3">
                  <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">STAGE 1</span>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-watt-navy">Identify Stranded Power</h3>
                
                {/* Key Point */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-700">Below-market acquisition</div>
                </div>
                
                {/* Description */}
                <p className="text-watt-navy/70 text-sm leading-relaxed flex-grow">
                  Target undervalued industrial sites with existing power infrastructure
                </p>
              </div>
              
              {/* Connecting Arrow (Desktop) */}
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <div className="w-6 h-6 bg-watt-bitcoin rounded-full flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </ScrollReveal>
          
          {/* Stage 2: MONETIZE */}
          <ScrollReveal delay={0.2}>
            <div className="bg-white rounded-2xl p-6 border-2 border-watt-bitcoin shadow-institutional hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative">
              <div className="flex flex-col h-full">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-watt-bitcoin to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Bitcoin className="w-8 h-8 text-white" />
                </div>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs font-bold text-watt-bitcoin bg-watt-bitcoin/10 px-3 py-1 rounded-full">STAGE 2</span>
                  <span className="text-xs font-bold text-watt-success bg-watt-success/10 px-3 py-1 rounded-full">Year 0-1</span>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-watt-navy">Deploy Bitcoin Mining</h3>
                
                {/* Key Metric */}
                <div className="mb-4 p-4 bg-gradient-to-br from-watt-bitcoin/10 to-orange-100/50 rounded-lg border-2 border-watt-bitcoin/30">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-watt-bitcoin">
                      $<AnimatedCounter end={250} duration={2000} />k/MW
                    </span>
                  </div>
                  <div className="text-xs text-watt-navy/60 mt-1">deployment cost</div>
                </div>
                
                {/* Description */}
                <p className="text-watt-navy/70 text-sm leading-relaxed flex-grow">
                  Generate immediate cash flow while infrastructure matures
                </p>
              </div>
              
              {/* Connecting Arrow (Desktop) */}
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <div className="w-6 h-6 bg-watt-trust rounded-full flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </ScrollReveal>
          
          {/* Stage 3: TRANSFORM */}
          <ScrollReveal delay={0.3}>
            <div className="bg-white rounded-2xl p-6 border-2 border-watt-trust shadow-institutional hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative">
              <div className="flex flex-col h-full">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-watt-trust to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs font-bold text-watt-trust bg-watt-trust/10 px-3 py-1 rounded-full">STAGE 3</span>
                  <span className="text-xs font-bold text-watt-success bg-watt-success/10 px-3 py-1 rounded-full">Year 2+</span>
                  <span className="text-xs font-bold text-white bg-watt-success px-3 py-1 rounded-full shadow">48% SAVINGS</span>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-watt-navy">Transition to AI/HPC</h3>
                
                {/* Key Metric */}
                <div className="mb-4 p-4 bg-gradient-to-br from-watt-trust/10 to-blue-100/50 rounded-lg border-2 border-watt-trust/30">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-watt-trust">
                      $<AnimatedCounter end={6.5} duration={2000} />M/MW
                    </span>
                  </div>
                  <div className="text-xs text-watt-navy/60">
                    vs <span className="line-through text-gray-500">$<AnimatedCounter end={12.5} duration={2000} />M</span> traditional
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-watt-navy/70 text-sm leading-relaxed flex-grow">
                  Convert proven sites to high-value AI data centers commanding 10-25x valuations
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
        
        {/* Proprietary Edge Banner - Separate Section */}
        <ScrollReveal delay={0.4}>
          <div className="bg-gradient-to-br from-watt-trust/5 via-white to-watt-bitcoin/5 rounded-3xl p-8 md:p-10 border-2 border-watt-trust/20 shadow-institutional-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-watt-trust" />
                <h3 className="text-2xl md:text-3xl font-bold text-watt-navy">
                  Our Proprietary Edge
                </h3>
              </div>
              <p className="text-watt-navy/70 font-semibold">Modular AI Infrastructure</p>
            </div>
            
            {/* Comparison Bars */}
            <div className="max-w-4xl mx-auto space-y-4 mb-8">
              {/* Traditional */}
              <div className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm font-semibold text-watt-navy/70 w-24">Traditional</span>
                  <div className="flex-1 h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 w-full"></div>
                    <div className="absolute inset-0 flex items-center justify-end pr-4">
                      <span className="text-white font-bold text-lg">
                        $<AnimatedCounter end={12.5} duration={2000} />M/MW
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* WattByte */}
              <div className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm font-semibold text-watt-trust w-24">WattByte</span>
                  <div className="flex-1 h-12 bg-watt-trust/10 rounded-lg overflow-hidden relative">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-watt-trust to-blue-600 rounded-lg shadow-lg"
                      style={{ width: '52%' }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-end pr-4">
                      <span className="text-watt-navy font-bold text-lg">
                        $<AnimatedCounter end={6.5} duration={2000} />M/MW
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Savings Callout */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-watt-success/10 rounded-2xl p-6 border-2 border-watt-success/30 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8 text-watt-success" />
                  <div>
                    <div className="text-3xl md:text-4xl font-bold text-watt-success">
                      $<AnimatedCounter end={6} duration={2000} />M/MW Savings
                    </div>
                    <div className="text-sm text-watt-navy/70 mt-1">
                      Same Tier 3 Performance • Half the Cost
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};