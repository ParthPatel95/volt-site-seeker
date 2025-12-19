import { BookOpen, GraduationCap, Layers, Clock, Sparkles, Play, ChevronRight, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAllModulesProgress } from "@/hooks/useProgressTracking";
import { motion } from "framer-motion";
import { useMemo } from "react";

const stats = [
  { icon: BookOpen, value: "118", label: "Lessons" },
  { icon: Layers, value: "12", label: "Modules" },
  { icon: Clock, value: "~12h", label: "Total Time" },
  { icon: GraduationCap, value: "Free", label: "Access" },
];

// Animated floating particles
const FloatingParticle = ({ delay, duration, x, y, size }: { delay: number; duration: number; x: number; y: number; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-watt-bitcoin/30"
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -30, 0],
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

export const AcademyHeroSection = () => {
  const { allProgress, getModuleProgress } = useAllModulesProgress();
  
  // Calculate personalized stats
  const personalStats = useMemo(() => {
    const moduleIds = ['bitcoin', 'datacenters', 'aeso', 'hydro', 'electrical', 'noise', 'immersion', 'site-selection', 'mining-economics', 'operations', 'risk-management', 'scaling-growth'];
    const moduleTotals = [12, 10, 10, 12, 12, 10, 10, 9, 8, 8, 8, 8];
    
    let started = 0;
    let completed = 0;
    let totalProgress = 0;
    let totalLessonsCompleted = 0;
    
    moduleIds.forEach((id, index) => {
      const progress = getModuleProgress(id, moduleTotals[index]);
      if (progress.isComplete) {
        completed++;
        started++;
        totalLessonsCompleted += moduleTotals[index];
      } else if (progress.isStarted) {
        started++;
        totalLessonsCompleted += Math.round((progress.percentage / 100) * moduleTotals[index]);
      }
      totalProgress += progress.percentage;
    });
    
    return {
      started,
      completed,
      avgProgress: Math.round(totalProgress / moduleIds.length),
      lessonsCompleted: totalLessonsCompleted,
      hasProgress: started > 0,
    };
  }, [getModuleProgress]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-b from-watt-navy via-watt-navy/95 to-watt-navy/90">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingParticle delay={0} duration={4} x={10} y={20} size={8} />
        <FloatingParticle delay={1} duration={5} x={25} y={60} size={6} />
        <FloatingParticle delay={2} duration={4.5} x={40} y={30} size={10} />
        <FloatingParticle delay={0.5} duration={6} x={60} y={70} size={8} />
        <FloatingParticle delay={1.5} duration={5} x={75} y={40} size={6} />
        <FloatingParticle delay={2.5} duration={4} x={85} y={20} size={12} />
        <FloatingParticle delay={3} duration={5.5} x={15} y={80} size={8} />
        <FloatingParticle delay={1} duration={6} x={90} y={60} size={10} />
      </div>

      {/* Gradient Orbs - Enhanced */}
      <motion.div 
        className="absolute top-20 left-1/4 w-96 h-96 bg-watt-bitcoin/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-1/4 w-80 h-80 bg-watt-blue/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.25, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div 
        className="absolute top-1/2 right-10 w-64 h-64 bg-watt-success/15 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Dynamic Greeting for Returning Users */}
          {personalStats.hasProgress && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <span className="text-white/60 text-lg">
                {getGreeting()}! You're <span className="text-watt-bitcoin font-semibold">{personalStats.avgProgress}%</span> through your journey
              </span>
            </motion.div>
          )}

          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-watt-bitcoin" />
            <span className="text-sm font-medium text-watt-bitcoin">Free Educational Platform</span>
          </motion.div>

          {/* Title - Enhanced */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          >
            WattByte{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-watt-bitcoin via-watt-bitcoin/90 to-watt-bitcoin/70 bg-clip-text text-transparent">
                Academy
              </span>
              <motion.span
                className="absolute -right-8 -top-2"
                animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 text-watt-bitcoin" />
              </motion.span>
            </span>
          </motion.h1>

          {/* Subtitle - Enhanced */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Master Bitcoin mining, datacenter operations, and energy market optimization 
            with our comprehensive curriculum designed for investors and operators.
          </motion.p>

          {/* CTA Buttons - Enhanced */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            {personalStats.hasProgress ? (
              <Button 
                size="lg" 
                className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8 group"
                onClick={() => scrollToSection('quick-start')}
              >
                <Play className="w-4 h-4 mr-2" />
                Continue Learning
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8 group"
                onClick={() => scrollToSection('learning-paths')}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Learning
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
            <Button 
              size="lg" 
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={() => scrollToSection('curriculum')}
            >
              View Full Curriculum
            </Button>
          </motion.div>

          {/* Stats - Enhanced with animations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-default"
              >
                <stat.icon className="w-5 h-5 text-watt-bitcoin mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 flex items-center justify-center gap-6 text-white/40 text-sm"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>5,000+ learners</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Industry-verified content</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Updated regularly</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-watt-light to-transparent" />
    </section>
  );
};
