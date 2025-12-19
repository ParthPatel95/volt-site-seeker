import { Bitcoin, Server, Zap, ArrowRight, Clock, BookOpen, CheckCircle2, Sparkles, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/landing/ScrollAnimations";
import { useNavigate } from "react-router-dom";
import { useAllModulesProgress } from "@/hooks/useProgressTracking";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Explicit color classes to avoid Tailwind purge issues
const colorClasses = {
  "watt-bitcoin": {
    bg: "bg-watt-bitcoin",
    bgHover: "hover:bg-watt-bitcoin/90",
    bgLight: "bg-watt-bitcoin/10",
    text: "text-watt-bitcoin",
    gradient: "from-watt-bitcoin/20 via-watt-bitcoin/10 to-transparent",
    border: "border-watt-bitcoin/30",
    shadow: "shadow-watt-bitcoin/20",
  },
  "watt-blue": {
    bg: "bg-watt-blue",
    bgHover: "hover:bg-watt-blue/90",
    bgLight: "bg-watt-blue/10",
    text: "text-watt-blue",
    gradient: "from-watt-blue/20 via-watt-blue/10 to-transparent",
    border: "border-watt-blue/30",
    shadow: "shadow-watt-blue/20",
  },
  "watt-success": {
    bg: "bg-watt-success",
    bgHover: "hover:bg-watt-success/90",
    bgLight: "bg-watt-success/10",
    text: "text-watt-success",
    gradient: "from-watt-success/20 via-watt-success/10 to-transparent",
    border: "border-watt-success/30",
    shadow: "shadow-watt-success/20",
  },
} as const;

type ColorKey = keyof typeof colorClasses;

const learningPaths = [
  {
    id: "bitcoin-fundamentals",
    moduleId: "bitcoin",
    title: "Bitcoin Fundamentals",
    description: "Start from zero and understand Bitcoin, blockchain technology, mining economics, and the global adoption landscape.",
    icon: Bitcoin,
    color: "watt-bitcoin" as ColorKey,
    lessons: 12,
    duration: "~60 min",
    difficulty: "Beginner",
    topics: ["What is Bitcoin", "How It Works", "Wallets", "Mining Basics", "Economics", "Global Adoption"],
    route: "/bitcoin",
    popular: true,
  },
  {
    id: "mining-operations",
    moduleId: "datacenters",
    title: "Mining Operations",
    description: "Deep dive into datacenter design, cooling systems, hardware specifications, and operational best practices.",
    icon: Server,
    color: "watt-blue" as ColorKey,
    lessons: 22,
    duration: "~90 min",
    difficulty: "Intermediate",
    topics: ["Facility Design", "Cooling Systems", "Electrical Infrastructure", "Hardware", "Hydro Cooling"],
    route: "/datacenters",
  },
  {
    id: "energy-markets",
    moduleId: "aeso",
    title: "Energy & Markets",
    description: "Master Alberta's energy market, AESO operations, Rate 65 advantages, and electricity cost optimization strategies.",
    icon: Zap,
    color: "watt-success" as ColorKey,
    lessons: 10,
    duration: "~45 min",
    difficulty: "Beginner",
    topics: ["AESO Basics", "Pool Pricing", "Rate 65", "12CP Optimization", "Grid Operations"],
    route: "/aeso-101",
  },
];

const difficultyBadges = {
  Beginner: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
  Intermediate: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  Advanced: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
};

export const LearningPathsSection = () => {
  const navigate = useNavigate();
  const { getModuleProgress } = useAllModulesProgress();

  return (
    <section id="learning-paths" className="py-20 bg-watt-light relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-watt-bitcoin/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-watt-blue/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Curated Learning Paths</span>
            </motion.div>
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
          {learningPaths.map((path, index) => {
            const colors = colorClasses[path.color];
            const progress = getModuleProgress(path.moduleId, path.lessons);
            const diffBadge = difficultyBadges[path.difficulty as keyof typeof difficultyBadges];
            
            return (
              <ScrollReveal key={path.id} delay={index * 100}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "relative h-full rounded-2xl bg-white border shadow-lg overflow-hidden group cursor-pointer",
                    progress.isComplete && "ring-2 ring-green-500/30",
                    colors.border
                  )}
                  onClick={() => navigate(path.route)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(path.route)}
                  aria-label={`${path.title} - ${progress.isComplete ? 'Completed' : progress.isStarted ? `${progress.percentage}% complete` : 'Not started'}`}
                >
                  {/* Top Gradient Bar */}
                  <div className={cn("h-1.5 w-full bg-gradient-to-r", colors.gradient)} />

                  {/* Popular Badge */}
                  {path.popular && !progress.isComplete && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-xs font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      Popular
                    </div>
                  )}

                  {/* Completion badge */}
                  {progress.isComplete && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </div>
                  )}

                  <div className="p-6">
                    {/* Icon with background glow */}
                    <div className="relative mb-4">
                      <div className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                        colors.bgLight
                      )}>
                        <path.icon className={cn("w-8 h-8", colors.text)} />
                      </div>
                      <div className={cn(
                        "absolute inset-0 w-16 h-16 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity",
                        colors.bgLight
                      )} />
                    </div>

                    {/* Title & Difficulty */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-watt-navy group-hover:text-primary transition-colors">
                        {path.title}
                      </h3>
                    </div>
                    
                    {/* Difficulty Badge */}
                    <div className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-3",
                      diffBadge.bg, diffBadge.text
                    )}>
                      {path.difficulty}
                    </div>
                    
                    {/* Description */}
                    <p className="text-watt-navy/70 text-sm mb-4 line-clamp-2">{path.description}</p>

                    {/* Stats Row */}
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

                    {/* Progress bar (if started) */}
                    {progress.isStarted && !progress.isComplete && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-watt-navy/60">Progress</span>
                          <span className="font-medium text-watt-navy">{progress.percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className={cn("h-full rounded-full transition-all", colors.bg)}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Topics Preview */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {path.topics.slice(0, 3).map((topic) => (
                        <span 
                          key={topic}
                          className="px-2 py-1 rounded-md bg-muted/50 text-xs text-watt-navy/70"
                        >
                          {topic}
                        </span>
                      ))}
                      {path.topics.length > 3 && (
                        <span className="px-2 py-1 rounded-md bg-muted/50 text-xs text-watt-navy/50">
                          +{path.topics.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <Button 
                      className={cn("w-full group/btn", colors.bg, colors.bgHover, "text-white")}
                    >
                      {progress.isComplete ? 'Review Module' : progress.isStarted ? 'Continue Learning' : 'Start Path'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  {/* Bottom decoration */}
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                    colors.gradient
                  )} />
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <ScrollReveal delay={400}>
          <div className="text-center mt-12">
            <button
              onClick={() => document.getElementById('journey-map')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
            >
              <span>View all 12 modules</span>
              <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
