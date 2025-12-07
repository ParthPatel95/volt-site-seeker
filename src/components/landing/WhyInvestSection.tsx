import { Card, CardContent } from '@/components/ui/card';
import { Users, Cpu, Globe, Target, Building2 } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

export const WhyInvestSection = () => {
  const advantages = [
    {
      icon: Users,
      title: "Experienced Team",
      description: "675MW+ track record in power infrastructure development with proven exits in data center conversions."
    },
    {
      icon: Cpu,
      title: "Proprietary Technology",
      description: "VoltScout AI-powered platform identifies and underwrites opportunities 10x faster than traditional methods."
    },
    {
      icon: Globe,
      title: "Diversified Portfolio",
      description: "Multi-geography, multi-asset strategy spanning natural gas, hydro, solar, and hybrid power infrastructure."
    },
    {
      icon: Target,
      title: "Clear Exit Strategy",
      description: "Structured 2-year holds with defined exit paths to hyperscalers, data center operators, and strategic buyers."
    },
    {
      icon: Building2,
      title: "Real Asset Security",
      description: "Tangible infrastructure with intrinsic value, operating cash flows, and multiple use-case optionality."
    }
  ];

  return (
    <section className="relative z-10 py-16 md:py-20 px-4 sm:px-6 bg-watt-light">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-success/10 border border-watt-success/30 mb-4">
              <span className="text-sm font-medium text-watt-success">Competitive Advantages</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-watt-navy">
              Why Invest With WattFund
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              Proven expertise, proprietary technology, and strategic positioning in high-growth markets
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.slice(0, 3).map((advantage, index) => (
            <ScrollReveal key={index} delay={index * 0.1} direction="up">
              <Card className="bg-white border-gray-200 shadow-institutional h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-watt-trust/20 to-watt-trust/5 flex items-center justify-center mb-4">
                    <advantage.icon className="w-6 h-6 text-watt-trust" />
                  </div>
                  <h3 className="text-lg font-bold text-watt-navy mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-watt-navy/70 text-sm leading-relaxed">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
          {advantages.slice(3).map((advantage, index) => (
            <ScrollReveal key={index + 3} delay={(index + 3) * 0.1} direction="up">
              <Card className="bg-white border-gray-200 shadow-institutional h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-watt-trust/20 to-watt-trust/5 flex items-center justify-center mb-4">
                    <advantage.icon className="w-6 h-6 text-watt-trust" />
                  </div>
                  <h3 className="text-lg font-bold text-watt-navy mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-watt-navy/70 text-sm leading-relaxed">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
