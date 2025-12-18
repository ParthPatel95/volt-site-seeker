import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Wrench, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export const OperationsCTASection = () => {
  const nextSteps = [
    {
      icon: Wrench,
      title: "Mining Economics",
      description: "Understand the financial drivers of mining profitability",
      link: "/mining-economics",
      color: "watt-bitcoin"
    },
    {
      icon: TrendingUp,
      title: "Site Selection",
      description: "Learn how to identify and evaluate mining sites",
      link: "/site-selection",
      color: "watt-blue"
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
              Operations Excellence Achieved
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              You now understand the systems, processes, and best practices needed to run 
              a world-class mining operation. Apply these principles to maximize uptime 
              and profitability.
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
              <Link to="/hosting">
                <Button size="lg" className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white">
                  Explore Hosting Services
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
