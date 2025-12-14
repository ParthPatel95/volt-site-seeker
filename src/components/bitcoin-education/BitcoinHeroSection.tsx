import React, { useState, useEffect, useRef } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Bitcoin, ChevronDown, TrendingUp, Globe, Shield, Coins } from 'lucide-react';

const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number | null = null;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <div ref={countRef}>{prefix}{count.toLocaleString()}{suffix}</div>;
};

const BitcoinHeroSection: React.FC = () => {
  return (
    <section className="relative py-28 md:py-36 px-4 sm:px-6 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-bitcoin/20 overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-watt-bitcoin/10 via-transparent to-transparent opacity-50" />
      
      {/* Bitcoin pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-white">
          <Bitcoin className="w-24 h-24" />
        </div>
        <div className="absolute top-40 right-20 text-white">
          <Bitcoin className="w-16 h-16" />
        </div>
        <div className="absolute bottom-20 left-1/4 text-white">
          <Bitcoin className="w-20 h-20" />
        </div>
        <div className="absolute bottom-40 right-1/3 text-white">
          <Bitcoin className="w-12 h-12" />
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <ScrollReveal direction="up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/20 border border-watt-bitcoin/40 mb-6 backdrop-blur-sm">
            <Bitcoin className="w-4 h-4 text-watt-bitcoin" />
            <span className="text-sm font-medium text-watt-bitcoin">Education Center</span>
          </div>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={0.1}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Understanding <span className="text-watt-bitcoin">Bitcoin</span>
          </h1>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={0.2}>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-12">
            A comprehensive guide to the world's first decentralized digital currency, 
            from its origins to its potential to reshape global finance
          </p>
        </ScrollReveal>

        {/* Key Stats */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-watt-bitcoin mr-2" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                $<AnimatedCounter end={1} suffix=".9T+" />
              </div>
              <div className="text-white/60 text-xs">Market Cap</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-watt-bitcoin mr-2" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                <AnimatedCounter end={16} suffix="+" />
              </div>
              <div className="text-white/60 text-xs">Years Active</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Coins className="w-5 h-5 text-watt-bitcoin mr-2" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                <AnimatedCounter end={21} suffix="M" />
              </div>
              <div className="text-white/60 text-xs">Max Supply</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Globe className="w-5 h-5 text-watt-bitcoin mr-2" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                <AnimatedCounter end={200} suffix="+" />
              </div>
              <div className="text-white/60 text-xs">Countries</div>
            </div>
          </div>
        </ScrollReveal>

        {/* Scroll Indicator */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="flex justify-center">
            <div className="animate-bounce">
              <ChevronDown className="w-8 h-8 text-white/50" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default BitcoinHeroSection;
