import { AlertTriangle, CheckCircle, Zap, ArrowRight, TrendingUp, Building, FileCheck, Globe } from 'lucide-react';
import { ScrollReveal } from './ScrollAnimations';
import { EnhancedLogo } from '../EnhancedLogo';

export const ProblemSolutionSection = () => {
  const problems = [
    {
      icon: Zap,
      title: "Power Scarcity",
      description: "Limited high-capacity sites in competitive markets",
      gradient: "from-red-500 to-orange-500"
    },
    {
      icon: FileCheck,
      title: "Regulatory Complexity",
      description: "Lengthy permitting and entitlement processes",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: TrendingUp,
      title: "Rising Costs",
      description: "Increasing acquisition costs in traditional DC markets",
      gradient: "from-red-600 to-orange-600"
    }
  ];

  const solutions = [
    {
      icon: Building,
      title: "Stranded Assets",
      description: "Identifying underutilized energy infrastructure",
      gradient: "from-neon-green to-electric-blue"
    },
    {
      icon: Zap,
      title: "Fast-Track Process",
      description: "Established relationships and streamlined pathways",
      gradient: "from-electric-blue to-neon-green"
    },
    {
      icon: Globe,
      title: "Strategic Markets",
      description: "Early entry into emerging data center regions",
      gradient: "from-neon-green to-electric-yellow"
    }
  ];

  return (
    <section className="relative z-10 px-4 sm:px-6 py-20 md:py-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal direction="fade" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-blue/10 border border-electric-blue/20 mb-4">
            <Zap className="w-4 h-4 text-electric-blue" />
            <span className="text-sm font-medium text-electric-blue">Market Intelligence</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Turning Power Constraints Into
            <span className="text-electric-yellow"> Profit Opportunities</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            Power constraints are the <span className="text-electric-yellow font-semibold">#1 limiting factor</span> for AI infrastructure growth.
            <br className="hidden sm:block" />
            WattByte transforms these bottlenecks into <span className="text-neon-green font-semibold">investable assets</span>.
          </p>
        </ScrollReveal>

        {/* Problem → Solution Flow */}
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 mb-16">
          {/* Problems Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Industry Pain Points</h3>
            </div>
            
            {problems.map((problem, index) => (
              <ScrollReveal 
                key={index} 
                direction="left" 
                delay={index * 100}
              >
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-xl p-6 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${problem.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <problem.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">{problem.title}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{problem.description}</p>
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
              <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-neon-green to-electric-yellow rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-electric-blue/30">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-electric-blue to-neon-green rounded-2xl flex items-center justify-center p-2">
                    <EnhancedLogo className="w-full h-full object-contain" />
                  </div>
                  <ArrowRight className="w-8 h-8 text-electric-blue animate-pulse" />
                  <div className="text-center">
                    <div className="text-sm font-bold text-white mb-1">WattByte</div>
                    <div className="text-xs text-electric-blue font-medium">AI-Powered</div>
                    <div className="text-xs text-neon-green font-medium">Site Intelligence</div>
                  </div>
                  <ArrowRight className="w-8 h-8 text-neon-green animate-pulse" />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Mobile Bridge */}
          <div className="lg:hidden flex justify-center py-4">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-electric-blue/30">
              <Zap className="w-6 h-6 text-electric-blue" />
              <div className="text-center">
                <div className="text-sm font-bold text-white">WattByte Intelligence</div>
                <div className="text-xs text-neon-green">AI-Powered Solutions</div>
              </div>
              <ArrowRight className="w-6 h-6 text-neon-green" />
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-electric-blue rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Our Solution</h3>
            </div>
            
            {solutions.map((solution, index) => (
              <ScrollReveal 
                key={index} 
                direction="right" 
                delay={index * 100}
              >
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-green to-electric-blue rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-xl p-6 border border-neon-green/30 hover:border-neon-green/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${solution.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <solution.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white mb-2">{solution.title}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{solution.description}</p>
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
            <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/20 via-electric-yellow/20 to-neon-green/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-electric-blue/30">
              <div className="flex items-center justify-center gap-3 mb-6">
                <TrendingUp className="w-7 h-7 text-electric-blue" />
                <h3 className="text-2xl md:text-3xl font-bold text-white">The Result</h3>
              </div>
              
              <p className="text-base md:text-lg text-slate-200 mb-8 max-w-3xl mx-auto text-center leading-relaxed">
                By solving critical industry pain points, WattByte creates{' '}
                <span className="text-electric-yellow font-bold">significant value</span>{' '}
                for data center operators seeking exposure to{' '}
                <span className="text-neon-green font-bold">digital infrastructure growth</span>{' '}
                without operational complexity.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-electric-blue/20 hover:border-electric-blue/40 transition-colors">
                  <div className="text-3xl md:text-4xl font-bold text-electric-blue mb-2">675MW+</div>
                  <div className="text-sm text-slate-300 font-medium">Deal Experience</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-electric-yellow/20 hover:border-electric-yellow/40 transition-colors">
                  <div className="text-3xl md:text-4xl font-bold text-electric-yellow mb-2">2.0-2.5x</div>
                  <div className="text-sm text-slate-300 font-medium">Target MOIC</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-neon-green/20 hover:border-neon-green/40 transition-colors">
                  <div className="text-3xl md:text-4xl font-bold text-neon-green mb-2">$25M</div>
                  <div className="text-sm text-slate-300 font-medium">Fund I Target</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
