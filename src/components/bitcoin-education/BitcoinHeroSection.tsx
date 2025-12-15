import React, { useState, useEffect, useRef } from 'react';
import { ScrollReveal } from '@/components/landing/ScrollAnimations';
import { Bitcoin, TrendingUp, Clock, Coins, Zap, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }: { 
  end: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
}) => {
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

  return <span ref={countRef}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Floating particle component
const FloatingParticle = ({ delay, size, left, top }: { 
  delay: number; 
  size: number; 
  left: string; 
  top: string; 
}) => (
  <div
    className="absolute rounded-full bg-watt-bitcoin/20 blur-sm"
    style={{
      width: size,
      height: size,
      left,
      top,
      animation: `float ${8 + delay}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  />
);

// Stats item component
const StatItem = ({ icon: Icon, value, label, prefix = '', suffix = '' }: {
  icon: React.ElementType;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}) => (
  <div className="flex flex-col items-center px-4 py-3 md:px-8 md:py-4">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 md:w-5 md:h-5 text-watt-bitcoin" />
      <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
        <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
      </span>
    </div>
    <span className="text-xs md:text-sm text-white/60">{label}</span>
  </div>
);

const BitcoinHeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] md:min-h-[85vh] flex flex-col overflow-hidden">
      {/* Immersive Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-watt-navy via-watt-navy to-watt-navy/90" />
      
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-watt-bitcoin/15 via-watt-bitcoin/5 to-transparent" />
      
      {/* Secondary gradient for visual interest */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-watt-blue/10 via-transparent to-transparent opacity-50" />
      
      {/* Animated grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingParticle delay={0} size={80} left="10%" top="20%" />
        <FloatingParticle delay={2} size={60} left="80%" top="15%" />
        <FloatingParticle delay={4} size={100} left="70%" top="60%" />
        <FloatingParticle delay={1} size={50} left="20%" top="70%" />
        <FloatingParticle delay={3} size={70} left="85%" top="40%" />
        <FloatingParticle delay={5} size={40} left="5%" top="50%" />
      </div>
      
      {/* Floating Bitcoin icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute text-watt-bitcoin/10"
          style={{ 
            left: '75%', 
            top: '20%',
            animation: 'float 10s ease-in-out infinite',
          }}
        >
          <Bitcoin className="w-32 h-32 md:w-48 md:h-48" />
        </div>
        <div 
          className="absolute text-watt-bitcoin/5"
          style={{ 
            left: '60%', 
            top: '55%',
            animation: 'float 12s ease-in-out infinite',
            animationDelay: '2s',
          }}
        >
          <Bitcoin className="w-24 h-24 md:w-32 md:h-32" />
        </div>
        <div 
          className="absolute text-white/5 hidden md:block"
          style={{ 
            left: '85%', 
            top: '65%',
            animation: 'float 8s ease-in-out infinite',
            animationDelay: '4s',
          }}
        >
          <Bitcoin className="w-20 h-20" />
        </div>
      </div>
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content - Text */}
            <div className="text-left">
              <ScrollReveal direction="up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-watt-bitcoin/20 border border-watt-bitcoin/40 mb-6 backdrop-blur-sm">
                  <Bitcoin className="w-4 h-4 text-watt-bitcoin" />
                  <span className="text-sm font-medium text-watt-bitcoin">Education Center</span>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={0.1}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
                  The Future of{' '}
                  <span className="text-watt-bitcoin relative">
                    Digital Money
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-watt-bitcoin/30" viewBox="0 0 200 12" preserveAspectRatio="none">
                      <path d="M0 6 Q50 0 100 6 T200 6" stroke="currentColor" strokeWidth="3" fill="none" />
                    </svg>
                  </span>
                </h1>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={0.2}>
                <p className="text-lg md:text-xl text-white/70 mb-8 max-w-xl leading-relaxed">
                  Bitcoin is the world's first decentralized digital currency, 
                  offering a revolutionary new paradigm for storing, transferring, 
                  and preserving value across borders without intermediaries.
                </p>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    asChild
                    size="lg"
                    className="bg-watt-bitcoin hover:bg-watt-bitcoin/90 text-white font-semibold px-8 py-6 text-lg group"
                  >
                    <Link to="/hosting">
                      Explore Bitcoin Mining
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 hover:text-white font-medium px-8 py-6 text-lg"
                  >
                    <Link to="/#pipeline">
                      View Our Infrastructure
                    </Link>
                  </Button>
                </div>
              </ScrollReveal>
            </div>
            
            {/* Right Content - Visual Element */}
            <div className="hidden lg:flex items-center justify-center">
              <ScrollReveal direction="up" delay={0.2}>
                <div className="relative">
                  {/* Glowing ring effect */}
                  <div className="absolute inset-0 rounded-full bg-watt-bitcoin/20 blur-3xl scale-150" />
                  
                  {/* Main Bitcoin icon with glow */}
                  <div className="relative bg-gradient-to-br from-watt-bitcoin to-watt-bitcoin/80 rounded-full p-12 shadow-2xl shadow-watt-bitcoin/30">
                    <Bitcoin className="w-32 h-32 text-white" />
                  </div>
                  
                  {/* Orbiting elements */}
                  <div 
                    className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20"
                    style={{ animation: 'pulse 3s ease-in-out infinite' }}
                  >
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div 
                    className="absolute -bottom-2 -left-6 bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20"
                    style={{ animation: 'pulse 3s ease-in-out infinite', animationDelay: '1s' }}
                  >
                    <Zap className="w-6 h-6 text-watt-bitcoin" />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-10">
        <ScrollReveal direction="up" delay={0.5}>
          <div className="animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/40" />
          </div>
        </ScrollReveal>
      </div>

      {/* Floating Stats Bar */}
      <div className="relative z-10 mt-auto">
        <ScrollReveal direction="up" delay={0.4}>
          <div className="bg-white/5 backdrop-blur-xl border-t border-white/10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
                <StatItem 
                  icon={TrendingUp} 
                  value={1} 
                  prefix="$" 
                  suffix=".9T+" 
                  label="Market Cap" 
                />
                <StatItem 
                  icon={Clock} 
                  value={16} 
                  suffix="+ Years" 
                  label="Since 2009" 
                />
                <StatItem 
                  icon={Coins} 
                  value={21} 
                  suffix="M" 
                  label="Max Supply" 
                />
                <StatItem 
                  icon={Zap} 
                  value={700} 
                  suffix="+ EH/s" 
                  label="Network Hashrate" 
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
      
      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </section>
  );
};

export default BitcoinHeroSection;
