import { useEffect, useRef, useState } from 'react';
import { Zap, Globe, DollarSign, Plug } from 'lucide-react';

interface Stat {
  icon: React.ElementType;
  value: string;
  label: string;
  animateValue?: number;
  suffix?: string;
}

const stats: Stat[] = [
  { icon: Zap, value: '675', label: 'MW+ Pipeline', suffix: 'MW+', animateValue: 675 },
  { icon: Globe, value: '6', label: 'Countries', animateValue: 6 },
  { icon: DollarSign, value: '200', label: 'M+ Deals', suffix: 'M+', animateValue: 200 },
  { icon: Plug, value: '99.99', label: '% Uptime Target', suffix: '%', animateValue: 99.99 },
];

export const AnimatedStats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<number[]>(stats.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    stats.forEach((stat, index) => {
      if (!stat.animateValue) return;
      
      const duration = 2000;
      const steps = 60;
      const increment = stat.animateValue / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.min(increment * currentStep, stat.animateValue);
        
        setAnimatedValues(prev => {
          const updated = [...prev];
          updated[index] = newValue;
          return updated;
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    });
  }, [isVisible]);

  return (
    <div ref={sectionRef} className="mt-8 sm:mt-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const displayValue = stat.animateValue
            ? animatedValues[index].toFixed(stat.suffix === '%' ? 2 : 0)
            : stat.value;

          return (
            <div
              key={index}
              className="group relative bg-white/80 backdrop-blur-sm border border-watt-navy/10 rounded-xl p-4 sm:p-6 hover:border-watt-bitcoin/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-watt-bitcoin animate-node-pulse" />
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-watt-navy">
                  {displayValue}{stat.suffix || ''}
                </div>
                <div className="text-xs sm:text-sm text-watt-navy/70 font-medium">
                  {stat.label}
                </div>
              </div>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-watt-bitcoin/0 to-watt-trust/0 group-hover:from-watt-bitcoin/5 group-hover:to-watt-trust/5 transition-all duration-300 pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
