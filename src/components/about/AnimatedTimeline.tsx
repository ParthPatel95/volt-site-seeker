import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LottieAnimation } from '@/components/ui/LottieAnimation';

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  lottieUrl: string;
  color: 'bitcoin' | 'trust' | 'success';
}

const timelineData: TimelineItem[] = [
  {
    date: 'Jan 2023',
    title: 'Founded on Opportunity',
    description: 'Identified the massive power-to-data center arbitrage opportunity, combining stranded energy assets with digital infrastructure demand.',
    lottieUrl: 'https://assets9.lottiefiles.com/packages/lf20_touohxv0.json',
    color: 'bitcoin',
  },
  {
    date: '675MW+',
    title: 'Proven Track Record',
    description: 'Our team brought 675MW+ of combined deal experience and 275MW+ of transactions led before founding WattByte.',
    lottieUrl: 'https://assets4.lottiefiles.com/packages/lf20_xlmz9xwm.json',
    color: 'trust',
  },
  {
    date: '6 Countries',
    title: 'Global Expansion',
    description: 'Rapidly expanded from North America to 6 countries with 1,429MW global pipeline across strategic markets.',
    lottieUrl: 'https://assets1.lottiefiles.com/packages/lf20_bq485nmk.json',
    color: 'success',
  },
];

const colorClasses = {
  bitcoin: {
    text: 'text-watt-bitcoin',
    bg: 'bg-watt-bitcoin',
    bgLight: 'bg-watt-bitcoin/10',
    border: 'border-watt-bitcoin',
  },
  trust: {
    text: 'text-watt-trust',
    bg: 'bg-watt-trust',
    bgLight: 'bg-watt-trust/10',
    border: 'border-watt-trust',
  },
  success: {
    text: 'text-watt-success',
    bg: 'bg-watt-success',
    bgLight: 'bg-watt-success/10',
    border: 'border-watt-success',
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
      
      // Calculate progress through the timeline section
      const start = rect.top - windowHeight;
      const end = rect.bottom;
      const current = -start;
      const total = end - start;
      const newProgress = Math.min(Math.max(current / total, 0), 1);
      setProgress(newProgress);
    };

    // Observer for individual items
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
    <section className="relative py-16 md:py-20 px-6 bg-watt-light">
      <div className="max-w-7xl mx-auto" ref={timelineRef}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
            Our Story
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
            From opportunity to global infrastructure company
          </p>
        </div>

        {/* Timeline container */}
        <div className="relative">
          {/* Vertical progress line - desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 -translate-x-1/2">
            <div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-watt-bitcoin via-watt-trust to-watt-success transition-all duration-300"
              style={{ height: `${progress * 100}%` }}
            />
          </div>

          {/* Timeline items */}
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
                  {/* Content card */}
                  <div
                    className={`flex-1 transition-all duration-700 ${
                      isVisible
                        ? 'opacity-100 translate-x-0'
                        : isEven
                        ? 'opacity-0 -translate-x-12'
                        : 'opacity-0 translate-x-12'
                    }`}
                  >
                    <Card className={`p-8 bg-white border-l-4 ${colors.border} shadow-institutional hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                      <div className={`${colors.text} text-4xl font-bold mb-4`}>
                        {item.date}
                      </div>
                      <h3 className="text-xl font-bold text-watt-navy mb-3">
                        {item.title}
                      </h3>
                      <p className="text-watt-navy/70">{item.description}</p>
                    </Card>
                  </div>

                  {/* Center node with Lottie */}
                  <div
                    className={`relative z-10 flex-shrink-0 transition-all duration-500 ${
                      isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    }`}
                  >
                    <div className={`w-20 h-20 ${colors.bgLight} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                      <LottieAnimation
                        src={item.lottieUrl}
                        className="w-12 h-12"
                        loop={true}
                        playOnView={true}
                      />
                    </div>
                  </div>

                  {/* Spacer for desktop layout */}
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
