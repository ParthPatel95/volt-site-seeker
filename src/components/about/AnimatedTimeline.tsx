import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Rocket, TrendingUp, Globe } from 'lucide-react';

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'bitcoin' | 'trust' | 'success';
}

const timelineData: TimelineItem[] = [
  {
    date: 'Jan 2023',
    title: 'Founded on Opportunity',
    description: 'Identified the massive power-to-data center arbitrage opportunity, combining stranded energy assets with digital infrastructure demand.',
    icon: <Rocket className="w-6 h-6" />,
    color: 'bitcoin',
  },
  {
    date: '675MW+',
    title: 'Proven Track Record',
    description: 'Our team brought 675MW+ of combined deal experience and 275MW+ of transactions led before founding WattByte.',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'trust',
  },
  {
    date: '6 Countries',
    title: 'Global Expansion',
    description: 'Rapidly expanded from North America to 6 countries with 1,429MW global pipeline across strategic markets.',
    icon: <Globe className="w-6 h-6" />,
    color: 'success',
  },
];

const colorClasses = {
  bitcoin: {
    text: 'text-[hsl(var(--watt-bitcoin))]',
    bg: 'bg-[hsl(var(--watt-bitcoin))]',
    bgLight: 'bg-[hsl(var(--watt-bitcoin)/0.1)]',
    border: 'border-[hsl(var(--watt-bitcoin))]',
  },
  trust: {
    text: 'text-[hsl(var(--watt-trust))]',
    bg: 'bg-[hsl(var(--watt-trust))]',
    bgLight: 'bg-[hsl(var(--watt-trust)/0.1)]',
    border: 'border-[hsl(var(--watt-trust))]',
  },
  success: {
    text: 'text-[hsl(var(--watt-success))]',
    bg: 'bg-[hsl(var(--watt-success))]',
    bgLight: 'bg-[hsl(var(--watt-success)/0.1)]',
    border: 'border-[hsl(var(--watt-success))]',
  },
};

export const AnimatedTimeline: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const start = rect.top - windowHeight;
      const end = rect.bottom;
      const current = -start;
      const total = end - start;
      const newProgress = Math.min(Math.max(current / total, 0), 1);
      setProgress(newProgress);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3 }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <section className="relative py-16 md:py-20 px-6 bg-muted">
      <div className="max-w-7xl mx-auto" ref={timelineRef}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Our Story
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From opportunity to global infrastructure company
          </p>
        </div>

        <div className="relative">
          {/* Vertical progress line - desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2">
            <div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-[hsl(var(--watt-bitcoin))] via-[hsl(var(--watt-trust))] to-[hsl(var(--watt-success))] transition-all duration-300"
              style={{ height: `${progress * 100}%` }}
            />
          </div>

          <div className="space-y-12 md:space-y-24">
            {timelineData.map((item, index) => {
              const colors = colorClasses[item.color];
              const isVisible = visibleItems.has(index);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  ref={(el) => (itemRefs.current[index] = el)}
                  data-index={index}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div
                    className={`flex-1 transition-all duration-700 ${
                      isVisible
                        ? 'opacity-100 translate-x-0'
                        : isEven
                        ? 'opacity-0 -translate-x-12'
                        : 'opacity-0 translate-x-12'
                    }`}
                  >
                    <Card className={`p-8 bg-card border-l-4 ${colors.border} shadow-institutional hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                      <div className={`${colors.text} text-4xl font-bold mb-4`}>
                        {item.date}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </Card>
                  </div>

                  <div
                    className={`relative z-10 flex-shrink-0 transition-all duration-500 ${
                      isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    }`}
                  >
                    <div className={`w-20 h-20 ${colors.bgLight} rounded-full flex items-center justify-center border-4 border-white shadow-lg ${colors.text}`}>
                      {item.icon}
                    </div>
                  </div>

                  <div className="hidden md:block flex-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedTimeline;
