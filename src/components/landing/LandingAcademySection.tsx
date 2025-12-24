import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  Bitcoin, 
  Server, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';

const categories = [
  { id: 'all', label: 'All', count: 10 },
  { id: 'fundamentals', label: 'Fundamentals', count: 3 },
  { id: 'operations', label: 'Operations', count: 4 },
  { id: 'advanced', label: 'Advanced', count: 2 },
  { id: 'masterclass', label: 'Masterclass', count: 1 },
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
    color: 'bg-watt-bitcoin/10 text-watt-bitcoin',
    borderColor: 'hover:border-watt-bitcoin/30',
    link: '/bitcoin',
  },
  {
    id: 'mining',
    title: 'Mining Infrastructure',
    description: 'Design and build efficient Bitcoin mining facilities from the ground up.',
    lessons: 10,
    difficulty: 'Intermediate',
    category: 'operations',
    icon: Server,
    color: 'bg-watt-blue/10 text-watt-blue',
    borderColor: 'hover:border-watt-blue/30',
    link: '/mining-infrastructure',
  },
  {
    id: 'alberta',
    title: 'Alberta Energy Market',
    description: 'Navigate the unique opportunities in Alberta\'s deregulated power market.',
    lessons: 10,
    difficulty: 'Beginner',
    category: 'fundamentals',
    icon: Zap,
    color: 'bg-watt-success/10 text-watt-success',
    borderColor: 'hover:border-watt-success/30',
    link: '/alberta-energy',
  },
  {
    id: 'masterclass',
    title: 'Strategic Operations',
    description: '6-track executive program covering site selection to scaling operations.',
    lessons: 6,
    difficulty: 'Advanced',
    category: 'masterclass',
    icon: GraduationCap,
    color: 'bg-watt-purple/10 text-watt-purple',
    borderColor: 'hover:border-watt-purple/30',
    link: '/strategic-operations',
    isTrack: true,
  },
];

const stats = [
  { label: 'Modules', value: 10, icon: BookOpen },
  { label: 'Lessons', value: 98, icon: CheckCircle },
  { label: 'Active Learners', value: '500+', icon: Users },
];

const AnimatedCounter = ({ value, suffix = '' }: { value: number | string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value.replace(/\D/g, '')) || 0;
  
  React.useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [numericValue]);
  
  if (typeof value === 'string' && value.includes('+')) {
    return <>{count}+{suffix}</>;
  }
  return <>{count}{suffix}</>;
};

export const LandingAcademySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const filteredModules = activeCategory === 'all' 
    ? featuredModules 
    : featuredModules.filter(m => m.category === activeCategory);

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-watt-light to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-watt-bitcoin/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-watt-blue/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-watt-bitcoin/10 text-watt-bitcoin rounded-full text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              Free Educational Platform
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-watt-navy mb-4">
              WattByte Academy
            </h2>
            <p className="text-lg text-watt-navy/70">
              Master Bitcoin mining and energy infrastructure with 10 comprehensive modules. 
              Free forever, no signup required.
            </p>
          </div>
        </ScrollReveal>

        {/* Category Pills */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-watt-navy text-white shadow-lg scale-105'
                    : 'bg-white text-watt-navy/70 hover:bg-watt-navy/5 border border-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Featured Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {filteredModules.map((module, index) => (
            <ScrollReveal key={module.id} delay={0.1 + index * 0.05}>
              <Link to={module.link}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`h-full bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${module.borderColor} group`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <module.icon className="w-6 h-6" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold text-watt-navy mb-2 group-hover:text-watt-blue transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-watt-navy/60 mb-4 line-clamp-2">
                    {module.description}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-watt-navy/50">
                      {module.isTrack ? `${module.lessons} Tracks` : `${module.lessons} Lessons`}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      module.difficulty === 'Beginner' 
                        ? 'bg-green-100 text-green-700'
                        : module.difficulty === 'Intermediate'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {module.difficulty}
                    </span>
                  </div>
                  
                  {/* Hover arrow */}
                  <div className="mt-4 flex items-center gap-1 text-watt-blue opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Start learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats Row */}
        <ScrollReveal delay={0.2}>
          <div className="bg-watt-navy rounded-2xl p-6 sm:p-8 mb-12 sm:mb-16">
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-watt-bitcoin" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                    {typeof stat.value === 'number' ? (
                      <AnimatedCounter value={stat.value} />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal delay={0.3}>
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white px-8">
                <Link to="/academy">
                  Explore Full Academy
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-watt-navy text-watt-navy hover:bg-watt-navy/5">
                <Link to="/bitcoin">
                  Start with Bitcoin 101
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-watt-navy/50">
              No signup required • 100% free • Self-paced learning
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LandingAcademySection;
