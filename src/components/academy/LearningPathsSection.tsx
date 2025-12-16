import { Bitcoin, Server, Zap, ArrowRight, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { useNavigate } from "react-router-dom";

const learningPaths = [
  {
    id: "bitcoin-fundamentals",
    title: "Bitcoin Fundamentals",
    description: "Start from zero and understand Bitcoin, blockchain technology, mining economics, and the global adoption landscape.",
    icon: Bitcoin,
    color: "watt-bitcoin",
    bgGradient: "from-watt-bitcoin/20 to-watt-bitcoin/5",
    borderColor: "border-watt-bitcoin/30",
    lessons: 13,
    duration: "~60 min",
    topics: ["What is Bitcoin", "How It Works", "Wallets", "Mining Basics", "Economics", "Global Adoption"],
    route: "/bitcoin",
  },
  {
    id: "mining-operations",
    title: "Mining Operations",
    description: "Deep dive into datacenter design, cooling systems, hardware specifications, and operational best practices.",
    icon: Server,
    color: "watt-blue",
    bgGradient: "from-watt-blue/20 to-watt-blue/5",
    borderColor: "border-watt-blue/30",
    lessons: 22,
    duration: "~90 min",
    topics: ["Facility Design", "Cooling Systems", "Electrical Infrastructure", "Hardware", "Hydro Cooling"],
    route: "/datacenters",
  },
  {
    id: "energy-markets",
    title: "Energy & Markets",
    description: "Master Alberta's energy market, AESO operations, Rate 65 advantages, and electricity cost optimization strategies.",
    icon: Zap,
    color: "watt-success",
    bgGradient: "from-watt-success/20 to-watt-success/5",
    borderColor: "border-watt-success/30",
    lessons: 12,
    duration: "~45 min",
    topics: ["AESO Basics", "Pool Pricing", "Rate 65", "12CP Optimization", "Grid Operations"],
    route: "/aeso-101",
  },
];

export const LearningPathsSection = () => {
  const navigate = useNavigate();

  return (
    <section id="learning-paths" className="py-20 bg-watt-light">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-watt-navy mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Three curated journeys designed for different goals. Start with fundamentals 
              or jump straight to advanced topics based on your experience.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {learningPaths.map((path, index) => (
            <ScrollReveal key={path.id} delay={index * 100}>
              <div 
                className={`relative h-full p-6 rounded-2xl bg-gradient-to-b ${path.bgGradient} border ${path.borderColor} hover:shadow-lg transition-all duration-300 group cursor-pointer`}
                onClick={() => navigate(path.route)}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-${path.color}/10 flex items-center justify-center mb-4`}>
                  <path.icon className={`w-7 h-7 text-${path.color}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-watt-navy mb-2">{path.title}</h3>
                
                {/* Description */}
                <p className="text-watt-navy/70 text-sm mb-4">{path.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-watt-navy/60">
                    <BookOpen className="w-4 h-4" />
                    <span>{path.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-watt-navy/60">
                    <Clock className="w-4 h-4" />
                    <span>{path.duration}</span>
                  </div>
                </div>

                {/* Topics Preview */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {path.topics.slice(0, 4).map((topic) => (
                    <span 
                      key={topic}
                      className="px-2 py-1 rounded-md bg-white/50 text-xs text-watt-navy/70"
                    >
                      {topic}
                    </span>
                  ))}
                  {path.topics.length > 4 && (
                    <span className="px-2 py-1 rounded-md bg-white/50 text-xs text-watt-navy/50">
                      +{path.topics.length - 4} more
                    </span>
                  )}
                </div>

                {/* CTA */}
                <Button 
                  className={`w-full bg-${path.color} hover:bg-${path.color}/90 text-white group-hover:translate-x-0`}
                >
                  Start Path
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
