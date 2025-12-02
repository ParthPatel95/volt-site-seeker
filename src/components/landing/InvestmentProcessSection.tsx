import { Card, CardContent } from '@/components/ui/card';
import { Mail, FileText, Search, PenTool, Rocket, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

export const InvestmentProcessSection = () => {
  const steps = [
    {
      icon: Mail,
      title: "Initial Inquiry",
      description: "Contact our investor relations team to express interest and schedule an introductory call."
    },
    {
      icon: FileText,
      title: "Documentation Review",
      description: "Receive comprehensive fund materials including PPM, financial projections, and portfolio overview."
    },
    {
      icon: Search,
      title: "Due Diligence",
      description: "Deep-dive meetings with fund managers, site visits to portfolio assets, and financial analysis."
    },
    {
      icon: PenTool,
      title: "Investment Commitment",
      description: "Execute subscription documents and complete investor onboarding procedures."
    },
    {
      icon: Rocket,
      title: "Capital Deployment",
      description: "Receive regular capital calls, quarterly reporting, and ongoing portfolio updates."
    }
  ];

  return (
    <section className="relative z-10 py-16 md:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-4">
              <span className="text-sm font-medium text-watt-bitcoin">Investment Process</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-watt-navy">
              How To Invest
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-3xl mx-auto">
              A streamlined five-step process from initial inquiry to active investment
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Desktop Timeline */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-watt-trust via-watt-bitcoin to-watt-success transform -translate-y-1/2" style={{ top: '80px' }} />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative">
            {steps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 100} direction="up">
                <div className="relative">
                  <Card className="bg-white border-gray-200 shadow-institutional hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-watt-trust to-watt-bitcoin flex items-center justify-center mx-auto mb-4 relative z-10">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="mb-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-watt-light text-watt-navy font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-watt-navy mb-2">
                        {step.title}
                      </h3>
                      <p className="text-watt-navy/70 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Arrow between steps (mobile) */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center my-4">
                      <ArrowRight className="w-6 h-6 text-watt-trust rotate-90" />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
