import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Settings, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export const RiskCTASection = () => {
  const nextSteps = [
    {
      icon: Settings,
      title: "Operations & Maintenance",
      description: "Learn to run a world-class mining operation",
      link: "/operations",
      color: "watt-blue"
    },
    {
      icon: DollarSign,
      title: "Mining Economics",
      description: "Master the financial drivers of mining",
      link: "/mining-economics",
      color: "watt-success"
    },
    {
      icon: BookOpen,
      title: "Full Academy",
      description: "Explore all learning paths and modules",
      link: "/academy",
      color: "watt-purple"
    }
  ];

  return (
    <section id="cta" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="bg-gradient-to-br from-watt-navy via-watt-navy to-watt-navy/90 rounded-3xl p-8 md:p-12 text-center">
            <span className="inline-block px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium mb-6">
              Module Complete
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Risk Management Mastered
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              You now have frameworks for identifying, assessing, and mitigating the key risks 
              in Bitcoin mining. Apply these principles to build a resilient operation that 
              survives market cycles.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {nextSteps.map((step, index) => (
                <Link key={step.title} to={step.link}>
                  <div className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-6 transition-all group h-full">
                    <div className={`w-12 h-12 bg-${step.color}/20 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <step.icon className={`w-6 h-6 text-${step.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-white/70 mb-4">{step.description}</p>
                    <span className="text-sm text-watt-bitcoin group-hover:text-watt-bitcoin/80 flex items-center justify-center gap-1">
                      Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/wattfund">
                <Button size="lg" className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white">
                  Learn About WattFund
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/academy">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Back to Academy
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
