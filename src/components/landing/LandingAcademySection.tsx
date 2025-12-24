import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  Bitcoin, 
  Server, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Users,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const categories = [
  { id: 'all', label: 'All', count: 10, icon: Sparkles },
  { id: 'fundamentals', label: 'Fundamentals', count: 3, icon: BookOpen },
  { id: 'operations', label: 'Operations', count: 4, icon: Server },
  { id: 'advanced', label: 'Advanced', count: 2, icon: TrendingUp },
  { id: 'masterclass', label: 'Masterclass', count: 1, icon: Award },
];

const featuredModules = [
  {
    id: 'bitcoin',
    title: 'Bitcoin Fundamentals',
    description: 'Master the technology, economics, and mining mechanics of Bitcoin.',
    lessons: 12,
    difficulty: 'Beginner',
    category: 'fundamentals',
    icon: Bitcoin,
    gradient: 'from-watt-bitcoin via-orange-500 to-yellow-500',
    bgGlow: 'bg-watt-bitcoin/20',
    link: '/bitcoin',
    progress: 100,
  },
  {
    id: 'mining',
    title: 'Mining Infrastructure',
    description: 'Design and build efficient Bitcoin mining facilities from the ground up.',
    lessons: 10,
    difficulty: 'Intermediate',
    category: 'operations',
    icon: Server,
    gradient: 'from-watt-blue via-cyan-500 to-blue-400',
    bgGlow: 'bg-watt-blue/20',
    link: '/mining-infrastructure',
    progress: 85,
  },
  {
    id: 'alberta',
    title: 'Alberta Energy Market',
    description: 'Navigate the unique opportunities in Alberta\'s deregulated power market.',
    lessons: 10,
    difficulty: 'Beginner',
    category: 'fundamentals',
    icon: Zap,
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    bgGlow: 'bg-watt-success/20',
    link: '/alberta-energy',
    progress: 90,
  },
  {
    id: 'masterclass',
    title: 'Strategic Operations',
    description: '6-track executive program covering site selection to scaling operations.',
    lessons: 6,
    difficulty: 'Advanced',
    category: 'masterclass',
    icon: GraduationCap,
    gradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
    bgGlow: 'bg-watt-purple/20',
    link: '/strategic-operations',
    isTrack: true,
    progress: 75,
  },
];

const learningPath = [
  { step: 1, title: 'Foundations', icon: BookOpen, color: 'watt-bitcoin' },
  { step: 2, title: 'Technical', icon: Server, color: 'watt-blue' },
  { step: 3, title: 'Strategy', icon: Target, color: 'watt-success' },
  { step: 4, title: 'Mastery', icon: Award, color: 'watt-purple' },
];

const stats = [
  { label: 'Modules', value: 10, icon: BookOpen, color: 'watt-bitcoin' },
  { label: 'Lessons', value: 98, icon: CheckCircle, color: 'watt-blue' },
  { label: 'Active Learners', value: 500, suffix: '+', icon: Users, color: 'watt-success' },
];

// Animated counter with intersection observer
const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value, isVisible]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Circular progress ring
const ProgressRing = ({ progress, size = 48, strokeWidth = 3 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-white/10"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        strokeDasharray={circumference}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f7931a" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Floating particle component
const FloatingParticle = ({ delay, duration, size, left, top }: { delay: number; duration: number; size: number; left: string; top: string }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-br from-watt-bitcoin/30 to-watt-blue/30 blur-sm"
    style={{ width: size, height: size, left, top }}
    animate={{
      y: [-20, 20, -20],
      x: [-10, 10, -10],
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

export const LandingAcademySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  
  const filteredModules = activeCategory === 'all' 
    ? featuredModules 
    : featuredModules.filter(m => m.category === activeCategory);

  return (
    <section className="py-20 sm:py-28 md:py-32 bg-gradient-to-b from-watt-navy via-watt-navy to-slate-900 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <motion.div 
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-watt-bitcoin/10 rounded-full blur-[100px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-watt-blue/10 rounded-full blur-[100px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-watt-purple/10 rounded-full blur-[80px]"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating particles */}
        <FloatingParticle delay={0} duration={6} size={8} left="10%" top="20%" />
        <FloatingParticle delay={1} duration={8} size={6} left="80%" top="15%" />
        <FloatingParticle delay={2} duration={7} size={10} left="70%" top="60%" />
        <FloatingParticle delay={0.5} duration={9} size={5} left="20%" top="70%" />
        <FloatingParticle delay={1.5} duration={6} size={7} left="50%" top="30%" />
        <FloatingParticle delay={3} duration={8} size={4} left="90%" top="80%" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-[200px]"
          animate={{ top: ['-200px', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero Header with Glow */}
        <ScrollReveal>
          <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-watt-bitcoin/20 to-watt-blue/20 border border-watt-bitcoin/30 text-watt-bitcoin rounded-full text-sm font-medium mb-8 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              Free Educational Platform
              <span className="w-2 h-2 bg-watt-success rounded-full animate-pulse" />
            </motion.div>
            
            {/* Gradient title */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                WattByte{' '}
              </span>
              <span className="bg-gradient-to-r from-watt-bitcoin via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Academy
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto"
            >
              Master Bitcoin mining and energy infrastructure with{' '}
              <span className="text-watt-bitcoin font-semibold">10 comprehensive modules</span>. 
              Free forever, no signup required.
            </motion.p>
          </div>
        </ScrollReveal>

        {/* Learning Path Visualization */}
        <ScrollReveal delay={0.1}>
          <div className="mb-16 sm:mb-20">
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {learningPath.map((stage, index) => (
                <React.Fragment key={stage.step}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="relative group"
                  >
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-${stage.color}/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Node */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm group-hover:border-${stage.color}/50 transition-colors`}
                    >
                      <stage.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${stage.color} mb-1`} />
                      <span className="text-[10px] sm:text-xs text-white/60 font-medium">{stage.title}</span>
                      
                      {/* Pulse ring */}
                      <motion.div
                        className={`absolute inset-0 rounded-full border-2 border-${stage.color}/40`}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      />
                    </motion.div>
                    
                    {/* Step number */}
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-${stage.color} text-white text-xs font-bold flex items-center justify-center shadow-lg`}>
                      {stage.step}
                    </div>
                  </motion.div>
                  
                  {/* Connector line */}
                  {index < learningPath.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 + 0.1 * index }}
                      className="hidden sm:block w-12 md:w-20 h-0.5 bg-gradient-to-r from-white/30 to-white/10 origin-left"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Category Filter Pills */}
        <ScrollReveal delay={0.15}>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 sm:mb-16">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-watt-bitcoin to-orange-500 text-white shadow-lg shadow-watt-bitcoin/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-white/20'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeCategory === category.id 
                    ? 'bg-white/20' 
                    : 'bg-white/10'
                }`}>
                  {category.count}
                </span>
              </motion.button>
            ))}
          </div>
        </ScrollReveal>

        {/* Featured Modules Grid with 3D Cards */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-16 sm:mb-20"
          >
            {filteredModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                onMouseEnter={() => setHoveredModule(module.id)}
                onMouseLeave={() => setHoveredModule(null)}
                style={{ perspective: 1000 }}
              >
                <Link to={module.link}>
                  <motion.div
                    whileHover={{ 
                      rotateY: 5, 
                      rotateX: -5,
                      z: 50,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative h-full group"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Glow effect behind card */}
                    <motion.div
                      className={`absolute inset-0 ${module.bgGlow} rounded-2xl blur-2xl transition-opacity duration-500`}
                      animate={{ opacity: hoveredModule === module.id ? 0.6 : 0 }}
                    />
                    
                    {/* Card */}
                    <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 overflow-hidden group-hover:border-white/30 transition-all duration-500">
                      {/* Background gradient on hover */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                      />
                      
                      {/* Top section with icon and progress */}
                      <div className="relative flex items-start justify-between mb-4">
                        {/* Icon with gradient background */}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${module.gradient} flex items-center justify-center shadow-lg`}
                        >
                          <module.icon className="w-7 h-7 text-white" />
                          
                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: [-50, 100] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          />
                        </motion.div>
                        
                        {/* Progress ring */}
                        <div className="relative">
                          <ProgressRing progress={module.progress} size={44} strokeWidth={3} />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                            {module.progress}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-watt-bitcoin transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-white/50 mb-4 line-clamp-2 group-hover:text-white/70 transition-colors">
                        {module.description}
                      </p>
                      
                      {/* Meta row */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-white/40 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {module.isTrack ? `${module.lessons} Tracks` : `${module.lessons} Lessons`}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          module.difficulty === 'Beginner' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : module.difficulty === 'Intermediate'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {module.difficulty}
                        </span>
                      </div>
                      
                      {/* CTA */}
                      <motion.div 
                        className="flex items-center gap-2 text-watt-bitcoin"
                        initial={{ opacity: 0.7 }}
                        whileHover={{ opacity: 1, x: 5 }}
                      >
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">Start Learning</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Stats Section with Glass Cards */}
        <ScrollReveal delay={0.2}>
          <div className="relative mb-16 sm:mb-20">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-watt-bitcoin/10 via-watt-blue/10 to-watt-purple/10 rounded-3xl blur-3xl" />
            
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 sm:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    viewport={{ once: true }}
                    className="text-center relative group"
                  >
                    {/* Glow on hover */}
                    <motion.div
                      className={`absolute inset-0 bg-${stat.color}/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                    
                    <div className="relative">
                      {/* Icon with pulse */}
                      <motion.div 
                        className={`mx-auto w-16 h-16 rounded-2xl bg-${stat.color}/20 flex items-center justify-center mb-4 border border-${stat.color}/30`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <stat.icon className={`w-7 h-7 text-${stat.color}`} />
                      </motion.div>
                      
                      {/* Number with glow */}
                      <div className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
                        <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                      </div>
                      
                      <div className="text-sm text-white/50 font-medium uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal delay={0.3}>
          <div className="text-center">
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {['No Signup Required', '100% Free', 'Self-Paced'].map((badge, index) => (
                <motion.div
                  key={badge}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-2 text-white/50 text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-watt-success" />
                  {badge}
                </motion.div>
              ))}
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button asChild size="lg" className="bg-gradient-to-r from-watt-bitcoin to-orange-500 hover:from-watt-bitcoin/90 hover:to-orange-500/90 text-white px-8 py-6 text-lg shadow-lg shadow-watt-bitcoin/30 border-0">
                  <Link to="/academy" className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Explore Full Academy
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm">
                  <Link to="/bitcoin" className="flex items-center gap-2">
                    <Bitcoin className="w-5 h-5 text-watt-bitcoin" />
                    Start with Bitcoin 101
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LandingAcademySection;
