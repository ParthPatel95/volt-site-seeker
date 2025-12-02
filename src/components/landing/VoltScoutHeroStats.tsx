import { useEffect, useRef, useState } from 'react';

interface StatProps {
  value: string;
  label: string;
  delay?: number;
}

const AnimatedStat = ({ value, label, delay = 0 }: StatProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Extract number from value string
          const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
          if (isNaN(numericValue)) return;

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
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  const formatValue = (num: number) => {
    if (value.includes('k+')) return `${(num / 1000).toFixed(0)}k+`;
    if (value.includes('%')) return `${num}%`;
    return num.toString();
  };

  return (
    <div 
      ref={elementRef}
      className="flex flex-col items-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-watt-bitcoin mb-1">
        {hasAnimated ? formatValue(count) : value}
      </div>
      <div className="text-xs sm:text-sm text-watt-navy/60 font-medium">
        {label}
      </div>
    </div>
  );
};

export const VoltScoutHeroStats = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 mt-6 px-4">
      <AnimatedStat value="50k+" label="Substations Analyzed" delay={100} />
      <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
      <AnimatedStat value="97%" label="Predictive Accuracy" delay={200} />
      <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
      <AnimatedStat value="2" label="Live Markets" delay={300} />
    </div>
  );
};
