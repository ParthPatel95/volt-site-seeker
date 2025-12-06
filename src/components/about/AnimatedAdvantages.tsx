import React, { useEffect, useRef, useState } from 'react';
import { LottieAnimation } from '@/components/ui/LottieAnimation';

interface Advantage {
  title: string;
  description: string;
  color: 'trust' | 'bitcoin' | 'success';
  lottieUrl: string;
  size?: 'large' | 'normal';
}

const advantages: Advantage[] = [
  {
    title: 'AI-Powered Intelligence',
    description: 'VoltScout proprietary platform for stranded asset discovery with 97% accuracy',
    color: 'trust',
    lottieUrl: 'https://assets3.lottiefiles.com/packages/lf20_fcfjwiyb.json',
    size: 'large',
  },
  {
    title: 'Deep Operator Experience',
    description: '675MW+ track record with proven infrastructure development',
    color: 'bitcoin',
    lottieUrl: 'https://assets2.lottiefiles.com/packages/lf20_v1yudlrx.json',
  },
  {
    title: 'Global Network',
    description: 'LP relationships across Asia, MENA, and emerging markets',
    color: 'success',
    lottieUrl: 'https://assets1.lottiefiles.com/packages/lf20_bq485nmk.json',
  },
  {
    title: 'Fast Execution',
    description: 'Established relationships with utilities and regulators',
    color: 'trust',
    lottieUrl: 'https://assets9.lottiefiles.com/packages/lf20_touohxv0.json',
  },
  {
    title: 'Dual Revenue Streams',
    description: 'Flexible operations between BTC mining and AI/HPC hosting',
    color: 'bitcoin',
    lottieUrl: 'https://assets4.lottiefiles.com/packages/lf20_kyu0xqpq.json',
  },
];

const colorClasses = {
  trust: {
    bg: 'bg-watt-trust/10',
    text: 'text-watt-trust',
    border: 'border-watt-trust/30',
    gradient: 'from-watt-trust/20 to-transparent',
  },
  bitcoin: {
    bg: 'bg-watt-bitcoin/10',
    text: 'text-watt-bitcoin',
    border: 'border-watt-bitcoin/30',
    gradient: 'from-watt-bitcoin/20 to-transparent',
  },
  success: {
    bg: 'bg-watt-success/10',
    text: 'text-watt-success',
    border: 'border-watt-success/30',
    gradient: 'from-watt-success/20 to-transparent',
  },
};

export const AnimatedAdvantages: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
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
      { threshold: 0.2 }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Spiral animation order
  const spiralOrder = [0, 1, 3, 4, 2];

  return (
    <section className="relative py-16 md:py-20 px-6 bg-watt-light overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-watt-navy">
            Competitive Advantages
          </h2>
          <p className="text-lg text-watt-navy/70 max-w-2xl mx-auto">
            Why WattByte wins in the digital infrastructure market
          </p>
        </div>

        {/* Bento grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {advantages.map((advantage, index) => {
            const colors = colorClasses[advantage.color];
            const isVisible = visibleItems.has(index);
            const spiralIndex = spiralOrder.indexOf(index);
            const isLarge = index === 0;

            return (
              <div
                key={index}
                ref={(el) => (itemRefs.current[index] = el)}
                data-index={index}
                className={`
                  relative overflow-hidden rounded-2xl
                  bg-white/80 backdrop-blur-sm
                  border ${colors.border}
                  shadow-institutional hover:shadow-xl
                  transition-all duration-700 ease-out
                  hover:-translate-y-1
                  ${isLarge ? 'md:col-span-2 md:row-span-1' : ''}
                  ${isVisible 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                  }
                `}
                style={{
                  transitionDelay: `${spiralIndex * 100}ms`,
                }}
              >
                {/* Glassmorphism gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-50 pointer-events-none`} />
                
                {/* Animated border gradient */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                  <div className={`absolute inset-0 rounded-2xl border-2 ${colors.border} animate-pulse`} />
                </div>

                <div className={`relative z-10 p-6 ${isLarge ? 'md:p-8' : ''} flex flex-col h-full`}>
                  {/* Lottie icon */}
                  <div className={`${isLarge ? 'w-16 h-16' : 'w-12 h-12'} mb-4`}>
                    <LottieAnimation
                      src={advantage.lottieUrl}
                      className="w-full h-full"
                      loop={true}
                      playOnView={true}
                    />
                  </div>

                  <h3 className={`font-bold text-watt-navy mb-2 ${isLarge ? 'text-xl' : 'text-lg'}`}>
                    {advantage.title}
                  </h3>
                  
                  <p className={`text-watt-navy/70 leading-relaxed ${isLarge ? 'text-base' : 'text-sm'}`}>
                    {advantage.description}
                  </p>

                  {/* Decorative corner accent */}
                  <div className={`absolute bottom-0 right-0 w-24 h-24 ${colors.bg} rounded-tl-full opacity-50`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AnimatedAdvantages;
