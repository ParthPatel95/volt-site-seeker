import { useEffect, useState, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState(stats.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

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

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

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
        <div className="absolute inset-0 bg-gradient-to-r from-watt-navy/95 via-watt-navy/80 to-watt-navy/40" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-watt-bitcoin/30 rounded-full animate-float"
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
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/20 border border-watt-bitcoin/40">
              <BookOpen className="w-4 h-4 text-watt-bitcoin" />
              <span className="text-sm font-medium text-watt-bitcoin">Educational Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              AESO <span className="text-watt-bitcoin">101</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 max-w-lg">
              Master Alberta's Electric System Operator — the engine behind Canada's most competitive power market
            </p>

            <p className="text-lg text-white/70 max-w-lg">
              Learn how pool pricing, 12CP savings programs, and grid operations create unique opportunities 
              for WattByte's 135MW Alberta Heartland project.
            </p>

            {/* What You'll Learn */}
            <div className="pt-4">
              <p className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">What You'll Learn</p>
              <div className="flex flex-wrap gap-3">
                {learnTopics.map((topic, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm transition-all duration-500 hover:bg-watt-bitcoin/20 hover:border-watt-bitcoin/40 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${600 + i * 100}ms` }}
                  >
                    <topic.icon className="w-4 h-4 text-watt-bitcoin" />
                    <span className="text-sm font-medium text-white">{topic.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Stats */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div 
                  key={i}
                  className={`p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-500 hover:bg-white/15 hover:scale-105 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${400 + i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-watt-bitcoin/20">
                      <stat.icon className="w-5 h-5 text-watt-bitcoin" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {formatCounter(i)}
                    <span className="text-lg text-white/70 ml-1">{stat.suffix}</span>
                  </div>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Alberta Map Icon */}
            <div className="mt-6 p-4 rounded-xl bg-watt-bitcoin/10 border border-watt-bitcoin/30 text-center">
              <p className="text-sm text-white/70">
                🍁 Alberta, Canada — North America's only fully deregulated wholesale electricity market
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
