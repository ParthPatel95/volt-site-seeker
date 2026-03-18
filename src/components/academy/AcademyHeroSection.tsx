import { BookOpen, GraduationCap, Layers, Sparkles, Play, ChevronRight, ChevronDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TOTAL_MODULES, TOTAL_LESSONS, TOTAL_HOURS } from "@/constants/curriculum-data";

// Animated Counter Component
const AnimatedCounter = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);
  
  return <span>{count}</span>;
};

export const AcademyHeroSection = () => {
  const stats = [
    { icon: Layers, value: TOTAL_MODULES, label: "Modules", isAnimated: true },
    { icon: BookOpen, value: TOTAL_LESSONS, label: "Lessons", isAnimated: true },
    { icon: Clock, value: TOTAL_HOURS, label: "Hours", suffix: "+", isAnimated: true },
    { icon: GraduationCap, value: "Free", label: "Forever", isAnimated: false },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-muted/80 via-background to-background overflow-hidden pt-24 md:pt-32">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/3 rounded-full translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Free Educational Platform</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            WattByte{" "}
            <span className="text-primary">Academy</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto"
          >
            Master Bitcoin mining, datacenter operations, and energy market optimization 
            with comprehensive, industry-verified content.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button 
              size="lg" 
              className="px-8 group"
              onClick={() => scrollToSection('curriculum')}
            >
              <Play className="w-4 h-4 mr-2" />
              Browse Modules
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.href = '/bitcoin'}
            >
              Start with Bitcoin 101
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center gap-8 md:gap-12"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label} 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.isAnimated ? (
                    <>
                      <AnimatedCounter target={stat.value as number} duration={2000} />
                      {'suffix' in stat && stat.suffix}
                    </>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <button 
          onClick={() => scrollToSection('curriculum')}
          className="flex flex-col items-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <span className="text-xs mb-1">Explore Curriculum</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </motion.div>
    </section>
  );
};
