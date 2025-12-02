import { ArrowRight, Target, Bitcoin, Cpu, TrendingUp, Sparkles, Zap, Package, Settings, Award, Clock, CheckCircle2 } from 'lucide-react';
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
          <div className="bg-gradient-to-br from-watt-trust/5 via-white to-watt-bitcoin/5 rounded-3xl p-8 md:p-10 lg:p-12 border-2 border-watt-trust/20 shadow-institutional-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-watt-trust" />
                <h3 className="text-2xl md:text-3xl font-bold text-watt-navy">
                  Our Proprietary Edge
                </h3>
              </div>
              <p className="text-xl font-semibold text-watt-navy mb-2">Modular AI Infrastructure</p>
              <p className="text-base text-watt-trust font-medium">Deploy enterprise-grade AI compute in weeks, not years</p>
            </div>
            
            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {/* Rapid Deployment */}
              <div className="bg-white rounded-xl p-5 border border-watt-trust/20 hover:border-watt-trust/40 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-watt-trust/20 to-watt-trust/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-watt-trust" />
                </div>
                <h4 className="text-sm font-bold text-watt-navy mb-1.5">⚡ Rapid Deployment</h4>
                <p className="text-xs text-watt-navy/70 leading-relaxed">12-16 weeks vs 24+ months traditional build</p>
              </div>
              
              {/* Pre-Built & Tested */}
              <div className="bg-white rounded-xl p-5 border border-watt-trust/20 hover:border-watt-trust/40 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-watt-navy mb-1.5">📦 Pre-Built & Tested</h4>
                <p className="text-xs text-watt-navy/70 leading-relaxed">Factory-built modules with quality assurance</p>
              </div>
              
              {/* Scalable On Demand */}
              <div className="bg-white rounded-xl p-5 border border-watt-trust/20 hover:border-watt-trust/40 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-watt-bitcoin/20 to-watt-bitcoin/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-watt-bitcoin" />
                </div>
                <h4 className="text-sm font-bold text-watt-navy mb-1.5">🔧 Scalable On Demand</h4>
                <p className="text-xs text-watt-navy/70 leading-relaxed">Add capacity incrementally as demand grows</p>
              </div>
              
              {/* Tier 3 Reliability */}
              <div className="bg-white rounded-xl p-5 border border-watt-trust/20 hover:border-watt-trust/40 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-watt-success/20 to-watt-success/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 text-watt-success" />
                </div>
                <h4 className="text-sm font-bold text-watt-navy mb-1.5">🏆 Tier 3 Reliability</h4>
                <p className="text-xs text-watt-navy/70 leading-relaxed">99.99% uptime, same as traditional DCs</p>
              </div>
            </div>
            
            {/* Cost Comparison with Context */}
            <div className="max-w-4xl mx-auto mb-8">
              <h4 className="text-center text-lg font-bold text-watt-navy mb-6">Infrastructure Cost Comparison</h4>
              <div className="space-y-6">
                {/* Traditional */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm font-semibold text-watt-navy/70 w-28">Traditional</span>
                    <div className="flex-1 h-14 bg-gray-200 rounded-xl overflow-hidden relative shadow-inner">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 w-full"></div>
                      <div className="absolute inset-0 flex items-center justify-end pr-4">
                        <span className="text-white font-bold text-xl">
                          $<AnimatedCounter end={12.5} duration={2000} />M/MW
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-watt-navy/60 ml-32 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Site prep, construction, equipment, custom cooling • 24-36 months
                  </p>
                </div>
                
                {/* WattByte */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm font-semibold text-watt-trust w-28">WattByte</span>
                    <div className="flex-1 h-14 bg-watt-trust/10 rounded-xl overflow-hidden relative shadow-inner">
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-watt-trust to-blue-600 rounded-xl shadow-lg"
                        style={{ width: '52%' }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-end pr-4">
                        <span className="text-watt-navy font-bold text-xl">
                          $<AnimatedCounter end={6.5} duration={2000} />M/MW
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-watt-trust/80 ml-32 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Factory-built modular units, rapid deployment • 12-16 weeks
                  </p>
                </div>
              </div>
            </div>
            
            {/* Three-Stat Savings Callout */}
            <div className="max-w-4xl mx-auto mb-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {/* Cost Savings */}
                <div className="bg-watt-success/10 rounded-xl p-5 border-2 border-watt-success/30 text-center hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-watt-success mb-1">
                    $<AnimatedCounter end={6} duration={2000} />M/MW
                  </div>
                  <div className="text-xs font-semibold text-watt-navy/70">Cost Savings</div>
                </div>
                
                {/* Speed Advantage */}
                <div className="bg-watt-trust/10 rounded-xl p-5 border-2 border-watt-trust/30 text-center hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold text-watt-trust mb-1">
                    <AnimatedCounter end={80} duration={2000} />% Faster
                  </div>
                  <div className="text-xs font-semibold text-watt-navy/70">Time to Deploy</div>
                </div>
                
                {/* Quality Parity */}
                <div className="bg-blue-500/10 rounded-xl p-5 border-2 border-blue-500/30 text-center hover:scale-105 transition-transform">
                  <div className="text-2xl font-bold text-blue-600 mb-1 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    Tier 3
                  </div>
                  <div className="text-xs font-semibold text-watt-navy/70">Same Performance</div>
                </div>
              </div>
            </div>
            
            {/* Closing Statement */}
            <div className="text-center">
              <p className="text-lg font-semibold text-watt-navy/80 italic">
                Enterprise-grade AI infrastructure at half the cost
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};