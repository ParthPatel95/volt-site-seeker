import { motion } from "framer-motion";
import { GraduationCap, Clock, Award, Users, Target, MapPin, ShieldAlert, TrendingUp, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StrategicFoundationsIntro = () => {
  const tracks = [
    {
      number: 1,
      title: "Foundation & Site Development",
      description: "Power infrastructure, energy markets, and site selection fundamentals",
      icon: MapPin,
      color: "from-purple-500 to-violet-600",
      duration: "25 min"
    },
    {
      number: 2,
      title: "Due Diligence & Risk Assessment",
      description: "Comprehensive risk evaluation and site scoring frameworks",
      icon: ShieldAlert,
      color: "from-orange-500 to-amber-600",
      duration: "20 min"
    },
    {
      number: 3,
      title: "Project Execution & Operations",
      description: "Development timelines, insurance, and crisis management",
      icon: Zap,
      color: "from-blue-500 to-cyan-600",
      duration: "15 min"
    },
    {
      number: 4,
      title: "Scaling Your Operation",
      description: "Capacity planning, multi-site strategy, and portfolio management",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      duration: "25 min"
    },
    {
      number: 5,
      title: "Capital & Strategic Growth",
      description: "Fundraising, partnerships, M&A, and exit strategies",
      icon: Award,
      color: "from-pink-500 to-rose-600",
      duration: "20 min"
    }
  ];

  const stats = [
    { icon: Clock, value: "~2 hours", label: "Total Duration" },
    { icon: GraduationCap, value: "5 Tracks", label: "Learning Paths" },
    { icon: Target, value: "35+", label: "Interactive Tools" },
    { icon: Users, value: "500+", label: "Graduates" }
  ];

  const learningOutcomes = [
    "Evaluate and score potential mining sites using professional frameworks",
    "Identify, assess, and mitigate operational and market risks",
    "Build scalable infrastructure with proper capacity planning",
    "Structure deals, raise capital, and navigate M&A transactions",
    "Manage a multi-site portfolio with geographic diversification"
  ];

  return (
    <section id="intro" className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-green-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-purple-500/20 mb-6">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-foreground">Strategic Operations Masterclass</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-orange-400 to-green-400 bg-clip-text text-transparent">
              Master the Complete Lifecycle
            </span>
            <br />
            <span className="text-foreground">of Bitcoin Mining Development</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            From identifying your first site to managing a multi-site portfolio. 
            This comprehensive masterclass integrates site selection, risk management, 
            and scaling strategies into one unified learning experience.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card/50 backdrop-blur border border-border rounded-xl p-4"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* The 5 Tracks Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Your Learning Journey</h2>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-orange-500 to-green-500 opacity-30 -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {tracks.map((track, index) => (
                <motion.div
                  key={track.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-card border border-border rounded-xl p-5 h-full hover:border-primary/50 transition-all group">
                    {/* Track Number Badge */}
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r ${track.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {track.number}
                    </div>
                    
                    <div className="pt-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${track.color} bg-opacity-10 flex items-center justify-center mb-3 mx-auto`}>
                        <track.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="font-semibold text-foreground text-center mb-2 group-hover:text-primary transition-colors">
                        {track.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground text-center mb-3">
                        {track.description}
                      </p>
                      
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{track.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow Between Tracks */}
                  {index < tracks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Learning Outcomes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6">What You'll Learn</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {learningOutcomes.map((outcome, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{outcome}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Button size="lg" className="gap-2">
                Start Track 1
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
