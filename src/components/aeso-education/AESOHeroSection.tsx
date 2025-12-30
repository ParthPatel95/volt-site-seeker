import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, DollarSign, Clock, BookOpen, PiggyBank, Activity, Wind } from 'lucide-react';
import aesoHeroImage from '@/assets/aeso-grid-hero.jpg';

const stats = [
  { value: '~16,000', suffix: 'MW', label: 'Peak Demand', icon: Zap },
  { value: '30+', suffix: 'Years', label: 'Deregulated', icon: Clock },
  { value: '$40-80', suffix: '/MWh', label: 'Avg Price Range', icon: DollarSign },
  { value: '135', suffix: 'MW', label: 'WattByte Project', icon: TrendingUp },
];

const learnTopics = [
  { icon: DollarSign, label: 'Pool Pricing' },
  { icon: PiggyBank, label: '12CP Savings' },
  { icon: Activity, label: 'Grid Operations' },
  { icon: Wind, label: 'Energy Trends' },
];

export const AESOHeroSection = () => {
  const [counters, setCounters] = useState(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          const duration = 2000;
          const steps = 60;
          const interval = duration / steps;
          const targetValues = [16000, 30, 60, 135];
          let step = 0;

          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setCounters(targetValues.map(target => Math.round(target * eased)));
            if (step >= steps) clearInterval(timer);
          }, interval);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  const formatCounter = (index: number) => {
    if (index === 0) return `~${counters[0].toLocaleString()}`;
    if (index === 1) return `${counters[1]}+`;
    if (index === 2) return `$40-${counters[2]}`;
    return counters[index].toString();
  };

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0">
        <img
          src={aesoHeroImage}
          alt="Alberta Power Grid Infrastructure"
          className="w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--watt-navy))]/95 via-[hsl(var(--watt-navy))]/80 to-[hsl(var(--watt-navy))]/40" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[hsl(var(--watt-bitcoin))]/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--watt-bitcoin))]/20 border border-[hsl(var(--watt-bitcoin))]/40"
            >
              <BookOpen className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
              <span className="text-sm font-medium text-[hsl(var(--watt-bitcoin))]">Educational Guide</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              AESO <span className="text-[hsl(var(--watt-bitcoin))]">101</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-white/80 max-w-lg"
            >
              Master Alberta's Electric System Operator — the engine behind Canada's most competitive power market
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-white/70 max-w-lg"
            >
              Learn how pool pricing, 12CP savings programs, and grid operations create unique opportunities 
              for WattByte's 135MW Alberta Heartland project.
            </motion.p>

            {/* What You'll Learn */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-4"
            >
              <p className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">What You'll Learn</p>
              <div className="flex flex-wrap gap-3">
                {learnTopics.map((topic, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    whileHover={{ scale: 1.05, backgroundColor: 'hsl(var(--watt-bitcoin) / 0.2)' }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm cursor-default"
                  >
                    <topic.icon className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
                    <span className="text-sm font-medium text-white">{topic.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-[hsl(var(--watt-bitcoin))]/20">
                      <stat.icon className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {formatCounter(i)}
                    <span className="text-lg text-white/70 ml-1">{stat.suffix}</span>
                  </div>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Alberta Map Note */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-6 p-4 rounded-xl bg-[hsl(var(--watt-bitcoin))]/10 border border-[hsl(var(--watt-bitcoin))]/30 text-center"
            >
              <p className="text-sm text-white/70">
                🍁 Alberta, Canada — North America's only fully deregulated wholesale electricity market
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
