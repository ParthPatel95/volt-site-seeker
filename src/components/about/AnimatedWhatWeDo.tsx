import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Zap, Cpu, Bitcoin } from 'lucide-react';

interface CoreArea {
  title: string;
  description: string;
  badge: string;
  stats: string[];
  icon: React.ReactNode;
}

const coreAreas: CoreArea[] = [
  {
    title: 'Power Infrastructure',
    description: 'Acquiring and developing strategic power assets with focus on stranded and underutilized energy sources',
    badge: 'Core Focus',
    stats: ['1,429MW Pipeline', '135MW Under Development'],
    icon: <Zap className="w-10 h-10" />,
  },
  {
    title: 'AI/HPC Hosting',
    description: 'Purpose-built facilities for artificial intelligence and high-performance computing workloads',
    badge: 'Growth Driver',
    stats: ['Purpose-Built Facilities', 'Flexible Infrastructure'],
    icon: <Cpu className="w-10 h-10" />,
  },
  {
    title: 'Bitcoin Mining',
    description: 'Energy-efficient infrastructure optimized for digital asset generation and blockchain operations',
    badge: 'Core Revenue',
    stats: ['Energy-Optimized', 'Dual-Revenue Model'],
    icon: <Bitcoin className="w-10 h-10" />,
  },
];

export const AnimatedWhatWeDo: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section className="relative py-16 md:py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
            What We Do
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
            WattByte acquires and develops strategic power infrastructure with AI-powered site intelligence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {coreAreas.map((area, index) => {
            const isVisible = visibleCards.has(index);
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                data-index={index}
                className={`transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Card 
                  className="p-8 bg-white border-gray-200 shadow-institutional hover:shadow-xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setMousePosition(null)}
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                >
                  {/* Spotlight effect */}
                  {mousePosition && (
                    <div
                      className="absolute pointer-events-none w-64 h-64 bg-watt-trust/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        left: mousePosition.x - 128,
                        top: mousePosition.y - 128,
                      }}
                    />
                  )}

                  <Badge className="mb-4 bg-watt-bitcoin/10 text-watt-bitcoin border-none relative z-10">
                    {area.badge}
                  </Badge>

                  {/* Icon */}
                  <div className="w-20 h-20 mb-4 relative z-10 bg-watt-trust/10 rounded-xl flex items-center justify-center text-watt-trust">
                    {area.icon}
                  </div>

                  <h3 className="text-xl font-bold text-watt-navy mb-3 relative z-10">
                    {area.title}
                  </h3>
                  
                  <p className="text-watt-navy/70 leading-relaxed mb-4 relative z-10">
                    {area.description}
                  </p>

                  {/* Stats */}
                  <ul className="space-y-2 relative z-10">
                    {area.stats.map((stat, i) => (
                      <li key={i} className="flex items-center text-sm text-watt-navy/70">
                        <div className="w-1.5 h-1.5 bg-watt-trust rounded-full mr-2" />
                        {stat}
                      </li>
                    ))}
                  </ul>

                  {/* Expand indicator */}
                  <div className={`flex items-center justify-center mt-4 text-watt-trust transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>

                  {/* Expanded content */}
                  <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-40 mt-4 pt-4 border-t border-gray-100' : 'max-h-0'}`}>
                    <p className="text-sm text-watt-navy/60">
                      Our team combines decades of experience in power infrastructure with cutting-edge technology to deliver exceptional results.
                    </p>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AnimatedWhatWeDo;
