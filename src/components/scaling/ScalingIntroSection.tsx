import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { TrendingUp, Target, Building2, Globe, Clock, BookOpen, Calculator } from "lucide-react";
import { ScalingGrowthWheel } from "./ScalingGrowthWheel";
import { GrowthReadinessAssessment } from "./GrowthReadinessAssessment";
import { Button } from "@/components/ui/button";

export const ScalingIntroSection = () => {
  const scalingPillars = [
    {
      icon: Target,
      title: "Strategic Planning",
      description: "Long-term vision and roadmap development"
    },
    {
      icon: Building2,
      title: "Infrastructure",
      description: "Physical and technical expansion"
    },
    {
      icon: TrendingUp,
      title: "Capital Growth",
      description: "Funding and investment strategies"
    },
    {
      icon: Globe,
      title: "Geographic Reach",
      description: "Multi-market presence and diversification"
    }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="scaling-intro" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 bg-watt-success/10 text-watt-success rounded-full text-sm font-medium mb-4">
              Module 12: Scaling & Growth
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Scaling Your Mining Operation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Master the strategies and frameworks for taking your mining operation from megawatts 
              to hundreds of megawatts while maintaining efficiency and profitability.
            </p>
          </div>

          {/* Course Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Clock className="w-4 h-4 text-watt-success" />
              <span className="text-sm font-medium text-foreground">~46 min read</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <BookOpen className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-foreground">7 sections</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Calculator className="w-4 h-4 text-watt-coinbase" />
              <span className="text-sm font-medium text-foreground">4 interactive tools</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-foreground">$500K+/MW insight</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Growth Wheel & Quick Jump */}
        <ScrollReveal delay={50}>
          <div className="grid lg:grid-cols-2 gap-12 mb-16 items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">The Four Pillars of Scaling</h2>
              <p className="text-muted-foreground mb-6">
                Successful scaling requires mastery across four interconnected areas. Click any pillar 
                to jump directly to that section.
              </p>
              <ScalingGrowthWheel />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Quick Jump to Tools</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3"
                  onClick={() => scrollToSection('capacity-planning')}
                >
                  <Calculator className="w-4 h-4 mr-2 text-watt-success" />
                  <div className="text-left">
                    <div className="font-medium">Capacity Calculator</div>
                    <div className="text-xs text-muted-foreground">Plan your expansion</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3"
                  onClick={() => scrollToSection('site-expansion')}
                >
                  <Building2 className="w-4 h-4 mr-2 text-watt-bitcoin" />
                  <div className="text-left">
                    <div className="font-medium">ROI Estimator</div>
                    <div className="text-xs text-muted-foreground">Compare approaches</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3"
                  onClick={() => scrollToSection('capital-raising')}
                >
                  <TrendingUp className="w-4 h-4 mr-2 text-watt-coinbase" />
                  <div className="text-left">
                    <div className="font-medium">Funding Strategy</div>
                    <div className="text-xs text-muted-foreground">Structure capital</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto py-3"
                  onClick={() => scrollToSection('mergers-acquisitions')}
                >
                  <Target className="w-4 h-4 mr-2 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">M&A Valuation</div>
                    <div className="text-xs text-muted-foreground">Value targets</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {scalingPillars.map((pillar, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-watt-success/10 rounded-lg flex items-center justify-center mb-4">
                  <pillar.icon className="w-6 h-6 text-watt-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm">{pillar.description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-gradient-to-r from-watt-success/10 to-watt-blue/10 rounded-2xl p-8 md:p-12 mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  The Growth Imperative
                </h2>
                <p className="text-muted-foreground mb-6">
                  In Bitcoin mining, scale is often the difference between survival and success. 
                  Larger operations benefit from economies of scale in power procurement, 
                  equipment purchasing, and operational efficiency.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-watt-success rounded-full"></div>
                    <span className="text-foreground">Lower per-MW operating costs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-watt-success rounded-full"></div>
                    <span className="text-foreground">Better power rate negotiations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-watt-success rounded-full"></div>
                    <span className="text-foreground">Bulk equipment discounts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-watt-success rounded-full"></div>
                    <span className="text-foreground">Diversified risk profile</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-6 text-center shadow-md border border-border">
                  <div className="text-3xl font-bold text-watt-success mb-2">15-25%</div>
                  <div className="text-sm text-muted-foreground">Cost reduction at 100MW+</div>
                </div>
                <div className="bg-card rounded-xl p-6 text-center shadow-md border border-border">
                  <div className="text-3xl font-bold text-watt-bitcoin mb-2">2-3x</div>
                  <div className="text-sm text-muted-foreground">Typical growth target</div>
                </div>
                <div className="bg-card rounded-xl p-6 text-center shadow-md border border-border">
                  <div className="text-3xl font-bold text-watt-coinbase mb-2">18-24</div>
                  <div className="text-sm text-muted-foreground">Months expansion cycle</div>
                </div>
                <div className="bg-card rounded-xl p-6 text-center shadow-md border border-border">
                  <div className="text-3xl font-bold text-foreground mb-2">$500K+</div>
                  <div className="text-sm text-muted-foreground">Per MW capital cost</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Growth Readiness Assessment */}
        <ScrollReveal delay={300}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              Assess Your Growth Readiness
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
              Before diving into the course, evaluate your current position and readiness for scaling.
            </p>
            <GrowthReadinessAssessment />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
