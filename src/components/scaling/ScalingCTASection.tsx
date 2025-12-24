import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { ArrowRight, BookOpen, TrendingUp, Building2, CheckCircle, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ScalingCTASection = () => {
  const navigate = useNavigate();

  const completedTopics = [
    "Growth readiness assessment",
    "Capacity planning & requirements",
    "Site expansion strategies",
    "Multi-site management",
    "Capital raising & funding",
    "Partnership models",
    "M&A strategies & valuation"
  ];

  const nextSteps = [
    {
      icon: BookOpen,
      title: "Risk Management 101",
      description: "Learn to identify and mitigate risks in scaling operations",
      route: "/risk-management",
      color: "bg-watt-bitcoin"
    },
    {
      icon: TrendingUp,
      title: "Mining Economics 101",
      description: "Deep dive into the financial drivers of mining profitability",
      route: "/mining-economics",
      color: "bg-watt-success"
    },
    {
      icon: Building2,
      title: "Operations & Maintenance",
      description: "Master the operational aspects of running mining facilities",
      route: "/operations",
      color: "bg-watt-blue"
    }
  ];

  return (
    <section id="scaling-cta" className="py-20 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy">
      <div className="container mx-auto px-4">
        {/* Course Completion */}
        <ScrollReveal>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-watt-success rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Course Complete!</h2>
                <p className="text-white/70">You've covered all 7 sections of Scaling & Growth 101</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {completedTopics.map((topic, index) => (
                <div key={index} className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-watt-success flex-shrink-0" />
                  <span className="text-sm">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Scale Your Operation?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Continue your learning journey with these related modules or explore WattByte's 
              enterprise solutions.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {nextSteps.map((step, index) => (
              <button
                key={index}
                onClick={() => navigate(step.route)}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left hover:bg-white/20 transition-all duration-300 border border-white/10 group"
              >
                <div className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center mb-4`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-watt-success transition-colors">
                  {step.title}
                </h3>
                <p className="text-white/60 text-sm mb-4">{step.description}</p>
                <div className="flex items-center gap-2 text-watt-success text-sm font-medium">
                  Start Module
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="bg-gradient-to-r from-watt-success to-watt-success/80 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Partner With WattByte
                </h3>
                <p className="text-white/90 mb-6">
                  Whether you're looking to scale through our hosting services, explore joint 
                  ventures, or invest in our infrastructure fund, WattByte has solutions for 
                  every growth stage.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate("/hosting")}
                    className="px-6 py-3 bg-white text-watt-success font-semibold rounded-lg hover:bg-white/90 transition-colors"
                  >
                    Hosting Services
                  </button>
                  <button
                    onClick={() => navigate("/wattfund")}
                    className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                  >
                    WattFund
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">1,429MW</div>
                  <div className="text-sm text-white/80">Global Pipeline</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">6</div>
                  <div className="text-sm text-white/80">Countries</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">135MW</div>
                  <div className="text-sm text-white/80">Under Development</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">675MW+</div>
                  <div className="text-sm text-white/80">Deal Experience</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/academy")}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Academy
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
