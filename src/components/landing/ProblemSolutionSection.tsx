
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  CheckCircle,
  Zap,
  Building2,
  MapPin,
  DollarSign
} from 'lucide-react';
import { InteractiveInvestmentCalculator } from './InteractiveInvestmentCalculator';
import { LiveDataPreview } from './LiveDataPreview';
import { LiveAESOData } from './LiveAESOData';
import { LiveERCOTData } from './LiveERCOTData';
import { ScrollReveal } from './ScrollAnimations';

export const ProblemSolutionSection = () => {
  const problems = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-warm-orange" />,
      title: "Power Scarcity Crisis",
      description: "Data centers need 10-50MW+ but face 3-7 year grid connection waits, creating massive opportunity gaps."
    },
    {
      icon: <Building2 className="w-6 h-6 text-electric-blue" />,
      title: "Location Intelligence Gap",
      description: "Developers lack real-time insights into power availability, pricing, and regulatory landscapes across regions."
    },
    {
      icon: <DollarSign className="w-6 h-6 text-neon-green" />,
      title: "Capital Inefficiency",
      description: "Institutional investors struggle to identify and validate power-rich real estate opportunities at scale."
    }
  ];

  const solutions = [
    {
      icon: <Target className="w-6 h-6 text-electric-blue" />,
      title: "Strategic Land Banking",
      description: "Acquire power-entitled land ahead of demand, creating immediate development-ready opportunities."
    },
    {
      icon: <Zap className="w-6 h-6 text-electric-yellow" />,
      title: "AI-Powered Discovery",
      description: "VoltScout platform identifies optimal sites using real-time grid data, pricing analytics, and regulatory intelligence."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-neon-green" />,
      title: "Value Creation Engine",
      description: "Turn power constraints into profit opportunities through strategic infrastructure investment."
    }
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Turning Power Constraints</span>
              <br />
              <span className="text-electric-blue">Into Profit Opportunities</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              The energy transition creates unprecedented infrastructure investment opportunities. 
              WattByte bridges the gap between power availability and digital infrastructure demand.
            </p>
          </div>
        </ScrollReveal>

        {/* Problem Statement */}
        <ScrollReveal delay={200}>
          <div className="mb-16">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                The <span className="text-warm-orange">Challenge</span>
              </h3>
              <p className="text-slate-300 text-lg max-w-3xl mx-auto">
                North America faces a critical power infrastructure bottleneck that's constraining digital economy growth
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {problems.map((problem, index) => (
                <Card key={index} className="bg-slate-800/30 border-slate-700/50 hover:border-warm-orange/30 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      {problem.icon}
                      <CardTitle className="text-lg text-white group-hover:text-warm-orange transition-colors">
                        {problem.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{problem.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Solution Framework */}
        <ScrollReveal delay={300}>
          <div className="mb-16">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Our <span className="text-neon-green">Solution</span>
              </h3>
              <p className="text-slate-300 text-lg max-w-3xl mx-auto">
                Strategic infrastructure investment backed by real-time intelligence and proven execution
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {solutions.map((solution, index) => (
                <Card key={index} className="bg-slate-800/30 border-slate-700/50 hover:border-neon-green/30 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      {solution.icon}
                      <CardTitle className="text-lg text-white group-hover:text-neon-green transition-colors">
                        {solution.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{solution.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Live Data Grid Section */}
        <ScrollReveal delay={400}>
          <div className="mb-16">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                <span className="text-electric-blue">Real-Time</span> Market Intelligence
              </h3>
              <p className="text-slate-300 text-lg max-w-3xl mx-auto">
                Live data and interactive tools powering informed investment decisions
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InteractiveInvestmentCalculator />
              <LiveDataPreview />
              <LiveERCOTData />
              <LiveAESOData />
            </div>
          </div>
        </ScrollReveal>

        {/* Value Proposition */}
        <ScrollReveal delay={500}>
          <div className="text-center">
            <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 p-8">
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <CheckCircle className="w-8 h-8 text-neon-green" />
                  <h3 className="text-2xl font-bold text-white">The WattByte Advantage</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-electric-blue mb-2">675MW+</div>
                    <div className="text-sm text-slate-300">Deal Experience</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-neon-green mb-2">2.0-2.5x</div>
                    <div className="text-sm text-slate-300">Target MOIC</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-electric-yellow mb-2">$25M</div>
                    <div className="text-sm text-slate-300">Fund I Target</div>
                  </div>
                </div>
                
                <p className="text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
                  We transform power infrastructure challenges into profitable opportunities through 
                  strategic land acquisition, advanced analytics, and proven execution capabilities.
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
