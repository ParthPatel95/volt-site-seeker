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
  Award,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

// Color configuration - explicit classes for Tailwind
const colorConfig = {
  bitcoin: {
    bg: 'bg-watt-bitcoin/10',
    border: 'border-l-watt-bitcoin',
    text: 'text-watt-bitcoin',
    iconBg: 'bg-watt-bitcoin/20',
  },
  blue: {
    bg: 'bg-watt-trust/10',
    border: 'border-l-watt-trust',
    text: 'text-watt-trust',
    iconBg: 'bg-watt-trust/20',
  },
  success: {
    bg: 'bg-watt-success/10',
    border: 'border-l-watt-success',
    text: 'text-watt-success',
    iconBg: 'bg-watt-success/20',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-l-purple-500',
    text: 'text-purple-500',
    iconBg: 'bg-purple-500/20',
  },
};

const categories = [
  { id: 'all', label: 'All', count: 10, icon: Sparkles },
  { id: 'fundamentals', label: 'Fundamentals', count: 3, icon: BookOpen },
  { id: 'operations', label: 'Operations', count: 4, icon: Server },
  { id: 'advanced', label: 'Advanced', count: 3, icon: Award },
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
    colorKey: 'bitcoin' as const,
    link: '/bitcoin',
  },
  {
    id: 'datacenters',
    title: 'Mining Infrastructure',
    description: 'Design and build efficient Bitcoin mining facilities from the ground up.',
    lessons: 10,
    difficulty: 'Intermediate',
    category: 'operations',
    icon: Server,
    colorKey: 'blue' as const,
    link: '/datacenters',
  },
  {
    id: 'alberta',
    title: 'Alberta Energy Market',
    description: "Navigate the unique opportunities in Alberta's deregulated power market.",
    lessons: 10,
    difficulty: 'Beginner',
    category: 'fundamentals',
    icon: Zap,
    colorKey: 'success' as const,
    link: '/aeso-101',
  },
  {
    id: 'masterclass',
    title: 'Strategic Operations',
    description: '6-track executive program covering site selection to scaling operations.',
    lessons: 6,
    difficulty: 'Advanced',
    category: 'advanced',
    icon: GraduationCap,
    colorKey: 'purple' as const,
    link: '/strategic-operations',
    isTrack: true,
  },
];

const learningPath = [
  { step: 1, title: 'Foundations', icon: BookOpen, colorKey: 'bitcoin' as const },
  { step: 2, title: 'Technical', icon: Server, colorKey: 'blue' as const },
  { step: 3, title: 'Strategy', icon: Zap, colorKey: 'success' as const },
  { step: 4, title: 'Mastery', icon: Award, colorKey: 'purple' as const },
];

const stats = [
  { label: 'Modules', value: 10, icon: BookOpen, colorKey: 'bitcoin' as const },
  { label: 'Lessons', value: 98, icon: CheckCircle, colorKey: 'blue' as const },
  { label: 'Active Learners', value: 500, suffix: '+', icon: Users, colorKey: 'success' as const },
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

export const LandingAcademySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const filteredModules = activeCategory === 'all' 
    ? featuredModules 
    : featuredModules.filter(m => m.category === activeCategory);

  return (
    <section className="py-20 sm:py-28 md:py-32 bg-gradient-to-b from-white to-watt-light relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--watt-navy)) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-watt-bitcoin/10 border border-watt-bitcoin/20 text-watt-bitcoin rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Free Educational Platform
              <span className="w-2 h-2 bg-watt-success rounded-full animate-pulse" />
            </div>
            
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-watt-navy">
              WattByte{' '}
              <span className="text-watt-bitcoin">Academy</span>
            </h2>
            
            <p className="text-base sm:text-lg text-watt-navy/70 max-w-2xl mx-auto">
              Master Bitcoin mining and energy infrastructure with{' '}
              <span className="text-watt-bitcoin font-semibold">10 comprehensive modules</span>. 
              Free forever, no signup required.
            </p>
          </div>
        </ScrollReveal>

        {/* Learning Path */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
              {learningPath.map((stage, index) => {
                const colors = colorConfig[stage.colorKey];
                return (
                  <div key={stage.step} className="contents">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="relative group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-2 border-gray-200 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-all ${colors.text}`}
                      >
                        <stage.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                        <span className="text-[10px] sm:text-xs text-watt-navy/60 font-medium">{stage.title}</span>
                      </motion.div>
                      
                      {/* Step number */}
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${colors.iconBg} ${colors.text} text-xs font-bold flex items-center justify-center border border-white`}>
                        {stage.step}
                      </div>
                    </motion.div>
                    
                    {/* Connector line */}
                    {index < learningPath.length - 1 && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 + 0.1 * index }}
                        className="hidden sm:block w-8 md:w-12 h-0.5 bg-gray-200 origin-left"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Category Filter */}
        <ScrollReveal delay={0.15}>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === category.id
                    ? 'bg-watt-bitcoin text-white shadow-md'
                    : 'bg-white text-watt-navy/70 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeCategory === category.id 
                    ? 'bg-white/20' 
                    : 'bg-gray-100'
                }`}>
                  {category.count}
                </span>
              </motion.button>
            ))}
          </div>
        </ScrollReveal>

        {/* Module Cards */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-12 sm:mb-16"
          >
            {filteredModules.map((module, index) => {
              const colors = colorConfig[module.colorKey];
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Link to={module.link} className="block h-full">
                    <div className={`h-full bg-white rounded-xl border border-gray-200 border-l-4 ${colors.border} p-5 hover:shadow-lg transition-all duration-300 group`}>
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg ${colors.iconBg} ${colors.text} flex items-center justify-center mb-4`}>
                        <module.icon className="w-6 h-6" />
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-lg font-semibold text-watt-navy mb-2 group-hover:text-watt-bitcoin transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-watt-navy/60 mb-4 line-clamp-2">
                        {module.description}
                      </p>
                      
                      {/* Meta */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-watt-navy/50 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {module.isTrack ? `${module.lessons} Tracks` : `${module.lessons} Lessons`}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          module.difficulty === 'Beginner' 
                            ? 'bg-watt-success/10 text-watt-success'
                            : module.difficulty === 'Intermediate'
                            ? 'bg-watt-trust/10 text-watt-trust'
                            : 'bg-purple-500/10 text-purple-500'
                        }`}>
                          {module.difficulty}
                        </span>
                      </div>
                      
                      {/* CTA */}
                      <div className="flex items-center gap-2 text-watt-bitcoin text-sm font-medium">
                        <Play className="w-4 h-4" />
                        <span>Start Learning</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Stats */}
        <ScrollReveal delay={0.2}>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-12 sm:mb-16 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {stats.map((stat, index) => {
                const colors = colorConfig[stat.colorKey];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className={`mx-auto w-14 h-14 rounded-xl ${colors.iconBg} ${colors.text} flex items-center justify-center mb-3`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    
                    <div className="text-3xl sm:text-4xl font-bold text-watt-navy mb-1">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                    </div>
                    
                    <div className="text-sm text-watt-navy/50 font-medium uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.3}>
          <div className="text-center">
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {['No Signup Required', '100% Free', 'Self-Paced'].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 text-watt-navy/60 text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-watt-success" />
                  {badge}
                </div>
              ))}
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8">
                <Link to="/academy" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Explore Full Academy
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="border-gray-200 text-watt-navy hover:bg-gray-50 px-8">
                <Link to="/bitcoin" className="flex items-center gap-2">
                  <Bitcoin className="w-5 h-5 text-watt-bitcoin" />
                  Start with Bitcoin 101
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LandingAcademySection;
