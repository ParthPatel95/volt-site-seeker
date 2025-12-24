import { BookOpen, GraduationCap, Layers, Sparkles, Play, ChevronRight, ChevronDown, Zap, Award, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Updated module data - 10 modules
const moduleData = [
  { id: "bitcoin", lessons: 12 },
  { id: "datacenters", lessons: 10 },
  { id: "aeso", lessons: 10 },
  { id: "hydro", lessons: 12 },
  { id: "electrical", lessons: 12 },
  { id: "noise", lessons: 10 },
  { id: "immersion", lessons: 10 },
  { id: "site-selection", lessons: 9 },
  { id: "mining-economics", lessons: 8 },
  { id: "operations", lessons: 5 },
];

const TOTAL_LESSONS = moduleData.reduce((sum, m) => sum + m.lessons, 0);
const TOTAL_MODULES = moduleData.length;

// Floating Particle Component
const FloatingParticle = ({ delay, size, left, duration }: { delay: number; size: number; left: string; duration: number }) => (
  <motion.div
    className="absolute rounded-full bg-watt-bitcoin/30"
    style={{ width: size, height: size, left }}
    initial={{ y: "100vh", opacity: 0 }}
    animate={{ 
      y: "-100vh", 
      opacity: [0, 0.6, 0.6, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  />
);

// Animated Counter Component
const AnimatedCounter = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
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

// Orbiting Icon Component
const OrbitingIcon = ({ 
  icon: Icon, 
  delay, 
  radius, 
  duration,
  size = 40
}: { 
  icon: React.ElementType; 
  delay: number; 
  radius: number; 
  duration: number;
  size?: number;
}) => (
  <motion.div
    className="absolute"
    style={{
      width: size,
      height: size,
    }}
    animate={{
      rotate: 360,
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  >
    <motion.div
      className="absolute bg-slate-800/70 rounded-xl border border-white/20 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        transform: `translateX(${radius}px)`,
      }}
      animate={{
        rotate: -360,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <Icon className="w-5 h-5 text-watt-bitcoin" />
    </motion.div>
  </motion.div>
);

export const AcademyHeroSection = () => {
  const stats = [
    { icon: Layers, value: TOTAL_MODULES, label: "Modules", isAnimated: true },
    { icon: BookOpen, value: TOTAL_LESSONS, label: "Lessons", isAnimated: true },
    { icon: GraduationCap, value: "Free", label: "Forever", isAnimated: false },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100svh] flex items-center bg-gradient-to-b from-watt-navy via-watt-navy to-watt-navy overflow-hidden pt-16">
      {/* Animated Background Layers */}
      <div className="absolute inset-0">
        {/* Radial gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-watt-bitcoin/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-watt-blue/15 via-transparent to-transparent" />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Subtle Gradient Accents (no blur) */}
        <motion.div 
          className="absolute top-20 left-1/4 w-64 h-64 bg-watt-bitcoin/5 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-40 right-1/3 w-48 h-48 bg-watt-blue/5 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 10,
            delay: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-10 w-32 h-32 bg-watt-trust/5 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 6,
            delay: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <FloatingParticle delay={0} size={6} left="10%" duration={15} />
        <FloatingParticle delay={2} size={4} left="20%" duration={18} />
        <FloatingParticle delay={4} size={8} left="35%" duration={20} />
        <FloatingParticle delay={1} size={5} left="50%" duration={16} />
        <FloatingParticle delay={3} size={7} left="65%" duration={22} />
        <FloatingParticle delay={5} size={4} left="80%" duration={17} />
        <FloatingParticle delay={2.5} size={6} left="90%" duration={19} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/10 border border-watt-bitcoin/30 mb-6">
                <Sparkles className="w-4 h-4 text-watt-bitcoin" />
                <span className="text-sm font-medium text-watt-bitcoin">Free Educational Platform</span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              WattByte{" "}
              <span className="bg-gradient-to-r from-watt-bitcoin via-watt-bitcoin to-amber-400 bg-clip-text text-transparent">
                Academy
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/70 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Master Bitcoin mining, datacenter operations, and energy market optimization 
              with comprehensive, industry-verified content.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
            >
              <Button 
                size="lg" 
                className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8 group shadow-lg shadow-watt-bitcoin/25"
                onClick={() => scrollToSection('curriculum')}
              >
                <Play className="w-4 h-4 mr-2" />
                Browse Modules
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                className="bg-slate-800/70 border border-white/20 text-white hover:bg-slate-700/70"
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
              className="flex justify-center lg:justify-start gap-8 md:gap-12"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.label} 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-watt-bitcoin/10 border border-watt-bitcoin/30 flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="w-5 h-5 text-watt-bitcoin" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {stat.isAnimated ? (
                      <AnimatedCounter target={stat.value as number} duration={2000} />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-sm text-white/50">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Side - Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center relative"
          >
            {/* Central Glowing Ring */}
            <div className="relative w-80 h-80">
              {/* Outer Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-watt-bitcoin/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Middle Ring */}
              <motion.div
                className="absolute inset-8 rounded-full border border-watt-blue/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner Ring */}
              <motion.div
                className="absolute inset-16 rounded-full border border-watt-trust/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />

              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-28 h-28 rounded-2xl bg-gradient-to-br from-watt-bitcoin to-watt-bitcoin/80 flex items-center justify-center shadow-2xl shadow-watt-bitcoin/40"
                  animate={{
                    boxShadow: [
                      "0 25px 50px -12px rgba(247, 147, 26, 0.4)",
                      "0 25px 50px -12px rgba(247, 147, 26, 0.6)",
                      "0 25px 50px -12px rgba(247, 147, 26, 0.4)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <GraduationCap className="w-14 h-14 text-white" />
                </motion.div>
              </div>

              {/* Orbiting Icons */}
              <div className="absolute inset-0 flex items-center justify-center">
                <OrbitingIcon icon={BookOpen} delay={0} radius={140} duration={20} />
                <OrbitingIcon icon={Zap} delay={0} radius={140} duration={20} size={36} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(90deg)' }}>
                <OrbitingIcon icon={Layers} delay={0} radius={140} duration={20} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(180deg)' }}>
                <OrbitingIcon icon={Award} delay={0} radius={140} duration={20} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(270deg)' }}>
                <OrbitingIcon icon={Target} delay={0} radius={140} duration={20} />
              </div>
            </div>

            {/* Floating Cards */}
            <motion.div
              className="absolute top-10 right-0 bg-slate-800/70 rounded-xl border border-white/20 p-4 shadow-xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-watt-bitcoin/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-watt-bitcoin" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Industry Expert</div>
                  <div className="text-white/50 text-xs">Verified Content</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-10 left-0 bg-slate-800/70 rounded-xl border border-white/20 p-4 shadow-xl"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-watt-trust/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-watt-trust" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Certificate Ready</div>
                  <div className="text-white/50 text-xs">Track Progress</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <button 
          onClick={() => scrollToSection('curriculum')}
          className="flex flex-col items-center text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="text-xs mb-1">Explore Curriculum</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </motion.div>

    </section>
  );
};
