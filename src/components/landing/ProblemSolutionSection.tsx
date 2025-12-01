import { AlertTriangle, CheckCircle, Zap, ArrowRight, TrendingUp, Building, FileCheck, Globe } from 'lucide-react';
import { ScrollReveal } from './ScrollAnimations';
import { EnhancedLogo } from '../EnhancedLogo';

export const ProblemSolutionSection = () => {
  const problems = [
    {
      icon: Zap,
      title: "Power Scarcity",
      description: "Limited high-capacity sites in competitive markets"
    },
    {
      icon: FileCheck,
      title: "Regulatory Complexity",
      description: "Lengthy permitting and entitlement processes"
    },
    {
      icon: TrendingUp,
      title: "Rising Costs",
      description: "Increasing acquisition costs in traditional DC markets"
    }
  ];

  const solutions = [
    {
      icon: Building,
      title: "Stranded Assets",
      description: "Identifying underutilized energy infrastructure"
    },
    {
      icon: Zap,
      title: "Fast-Track Process",
      description: "Established relationships and streamlined pathways"
    },
    {
      icon: Globe,
      title: "Strategic Markets",
      description: "Early entry into emerging data center regions"
    }
  ];

  return (
    <section className="relative z-10 px-4 sm:px-6 py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal direction="fade" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-trust/10 border border-watt-trust/20 mb-4">
            <Zap className="w-4 h-4 text-watt-trust" />
            <span className="text-sm font-medium text-watt-trust">Market Intelligence</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-watt-navy mb-4">
            Turning Power Constraints Into
            <span className="text-watt-bitcoin"> Profit Opportunities</span>
          </h2>
          <p className="text-lg md:text-xl text-watt-navy/70 max-w-3xl mx-auto">
            Power constraints are the <span className="text-watt-bitcoin font-semibold">#1 limiting factor</span> for AI infrastructure growth.
            <br className="hidden sm:block" />
            WattByte transforms these bottlenecks into <span className="text-watt-success font-semibold">investable assets</span>.
          </p>
        </ScrollReveal>

        {/* Problem → Solution Flow */}
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 mb-16">
          {/* Problems Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-institutional">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-watt-navy">Industry Pain Points</h3>
            </div>
            
            {problems.map((problem, index) => (
              <ScrollReveal 
                key={index} 
                direction="left" 
                delay={index * 100}
              >
                <div className="group">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-watt-trust/30 hover:shadow-institutional transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <problem.icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-watt-navy mb-2">{problem.title}</h4>
                        <p className="text-watt-navy/60 text-sm leading-relaxed">{problem.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Center Bridge */}
          <ScrollReveal direction="fade" delay={200} className="hidden lg:flex flex-col items-center justify-center">
            <div className="relative">
              <div className="bg-watt-light rounded-2xl p-8 border border-gray-200 shadow-institutional">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-3 border border-gray-200 shadow-institutional">
                    <EnhancedLogo className="w-full h-full object-contain" />
                  </div>
                  <ArrowRight className="w-8 h-8 text-watt-trust" />
                  <div className="text-center">
                    <div className="text-sm font-bold text-watt-navy mb-1">WattByte</div>
                    <div className="text-xs text-watt-trust font-medium">AI-Powered</div>
                    <div className="text-xs text-watt-success font-medium">Site Intelligence</div>
                  </div>
                  <ArrowRight className="w-8 h-8 text-watt-success" />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Mobile Bridge */}
          <div className="lg:hidden flex justify-center py-4">
            <div className="flex items-center gap-3 px-6 py-4 bg-watt-light rounded-xl border border-gray-200 shadow-institutional">
              <Zap className="w-6 h-6 text-watt-trust" />
              <div className="text-center">
                <div className="text-sm font-bold text-watt-navy">WattByte Intelligence</div>
                <div className="text-xs text-watt-success">AI-Powered Solutions</div>
              </div>
              <ArrowRight className="w-6 h-6 text-watt-success" />
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-watt-success rounded-lg flex items-center justify-center shadow-institutional">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-watt-navy">Our Solution</h3>
            </div>
            
            {solutions.map((solution, index) => (
              <ScrollReveal 
                key={index} 
                direction="right" 
                delay={index * 100}
              >
                <div className="group">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-watt-success/30 hover:shadow-institutional transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <solution.icon className="w-6 h-6 text-watt-success" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-watt-navy mb-2">{solution.title}</h4>
                        <p className="text-watt-navy/60 text-sm leading-relaxed">{solution.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Results Banner */}
        <ScrollReveal direction="up" delay={400}>
          <div className="relative">
            <div className="bg-watt-light rounded-2xl p-8 md:p-10 border border-gray-200 shadow-institutional-lg">
              <div className="flex items-center justify-center gap-3 mb-6">
                <TrendingUp className="w-7 h-7 text-watt-trust" />
                <h3 className="text-2xl md:text-3xl font-bold text-watt-navy">The Result</h3>
              </div>
              
              <p className="text-base md:text-lg text-watt-navy/70 mb-8 max-w-3xl mx-auto text-center leading-relaxed">
                By solving critical industry pain points, WattByte creates{' '}
                <span className="text-watt-bitcoin font-semibold">significant value</span>{' '}
                for data center operators seeking exposure to{' '}
                <span className="text-watt-success font-semibold">digital infrastructure growth</span>{' '}
                without operational complexity.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center p-4 rounded-xl bg-white border border-gray-200 hover:border-watt-trust/30 hover:shadow-institutional transition-all duration-200">
                  <div className="text-3xl md:text-4xl font-bold text-watt-trust mb-2">675MW+</div>
                  <div className="text-sm text-watt-navy/60 font-medium">Deal Experience</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white border border-gray-200 hover:border-watt-bitcoin/30 hover:shadow-institutional transition-all duration-200">
                  <div className="text-3xl md:text-4xl font-bold text-watt-bitcoin mb-2">2.0-2.5x</div>
                  <div className="text-sm text-watt-navy/60 font-medium">Target MOIC</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white border border-gray-200 hover:border-watt-success/30 hover:shadow-institutional transition-all duration-200">
                  <div className="text-3xl md:text-4xl font-bold text-watt-success mb-2">$25M</div>
                  <div className="text-sm text-watt-navy/60 font-medium">Fund I Target</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
