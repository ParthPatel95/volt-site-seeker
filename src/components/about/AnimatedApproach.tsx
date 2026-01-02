import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Search, BarChart3, Handshake, Wrench, TrendingUp } from 'lucide-react';

interface ApproachStep {
  title: string;
  description: string;
  step: string;
  icon: React.ReactNode;
}

const approachSteps: ApproachStep[] = [
  {
    step: '01',
    title: 'Identify',
    description: 'AI-powered site discovery with VoltScout platform',
    icon: <Search className="w-8 h-8" />,
  },
  {
    step: '02',
    title: 'Analyze',
    description: 'Deep due diligence on stranded power assets',
    icon: <BarChart3 className="w-8 h-8" />,
  },
  {
    step: '03',
    title: 'Acquire',
    description: 'Strategic power infrastructure acquisition',
    icon: <Handshake className="w-8 h-8" />,
  },
  {
    step: '04',
    title: 'Develop',
    description: 'Transform to data center-ready sites',
    icon: <Wrench className="w-8 h-8" />,
  },
  {
    step: '05',
    title: 'Optimize',
    description: 'Maximize value through AI/HPC/BTC operations',
    icon: <TrendingUp className="w-8 h-8" />,
  },
];

export const AnimatedApproach: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.5 }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-16 md:py-20 px-6 bg-muted overflow-hidden">
      <div className="max-w-7xl mx-auto" ref={containerRef}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Our Approach
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A proven methodology for transforming stranded power into digital infrastructure
          </p>
        </div>

        {/* Progress indicator */}
        <div className="hidden md:flex justify-center mb-12">
          <div className="flex items-center gap-2">
            {approachSteps.map((_, index) => (
              <React.Fragment key={index}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    visibleItems.has(index)
                      ? 'bg-watt-trust text-white scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < approachSteps.length - 1 && (
                  <div
                    className={`w-16 h-1 rounded transition-all duration-500 ${
                      visibleItems.has(index + 1)
                        ? 'bg-watt-trust'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Approach cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {approachSteps.map((step, index) => {
            const isVisible = visibleItems.has(index);
            
            return (
              <div
                key={index}
                ref={(el) => (itemRefs.current[index] = el)}
                data-index={index}
                className={`transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card className="p-6 bg-card border-border shadow-institutional hover:shadow-lg hover:-translate-y-2 transition-all duration-300 relative group h-full">
                  {/* Step number watermark */}
                  <div className="absolute top-4 right-4 text-6xl font-bold text-foreground/5 group-hover:text-secondary/10 transition-colors">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 mb-4 relative z-10 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-foreground mb-2 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                    {step.description}
                  </p>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-watt-trust/0 to-watt-trust/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Card>

                {/* Connector arrow (desktop only) */}
                {index < approachSteps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <div
                      className={`w-6 h-6 flex items-center justify-center transition-all duration-500 ${
                        visibleItems.has(index + 1)
                          ? 'text-watt-trust scale-100'
                          : 'text-gray-300 scale-75'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AnimatedApproach;
