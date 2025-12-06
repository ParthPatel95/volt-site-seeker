import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LottieAnimation } from '@/components/ui/LottieAnimation';
import { ArrowRight } from 'lucide-react';
import '@/components/landing/landing-animations.css';

interface AnimatedCTAProps {
  onContactClick: () => void;
}

export const AnimatedCTA: React.FC<AnimatedCTAProps> = ({ onContactClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative py-16 md:py-24 px-6 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-watt-bitcoin/30 rounded-full animate-float-particle"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Side Lottie decorations */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
        <LottieAnimation
          src="https://assets6.lottiefiles.com/packages/lf20_xlkxtmul.json"
          className="w-32 h-32"
          loop={true}
          autoplay={true}
          speed={0.5}
        />
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
        <LottieAnimation
          src="https://assets4.lottiefiles.com/packages/lf20_kyu0xqpq.json"
          className="w-32 h-32"
          loop={true}
          autoplay={true}
          speed={0.5}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
          Join Our Mission
        </h2>
        
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Partner with WattByte to build the digital infrastructure powering tomorrow's AI, HPC, and Bitcoin mining operations.
        </p>

        <div className="flex justify-center">
          <Button
            onClick={onContactClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative inline-flex items-center justify-center px-10 py-5 bg-watt-bitcoin text-white font-semibold rounded-xl hover:bg-watt-bitcoin/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-watt-bitcoin/30 text-lg h-auto overflow-hidden"
          >
            {/* Ripple effect background */}
            <span className="absolute inset-0 w-full h-full">
              <span className={`absolute inset-0 bg-white/20 rounded-xl transition-transform duration-500 ${isHovered ? 'scale-100' : 'scale-0'}`} style={{ transformOrigin: 'center' }} />
            </span>
            
            <span className="relative z-10 flex items-center gap-2">
              Get in Touch
              <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
            </span>

            {/* Rocket animation on hover */}
            <span className={`absolute right-2 transition-all duration-500 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              <LottieAnimation
                src="https://assets9.lottiefiles.com/packages/lf20_touohxv0.json"
                className="w-8 h-8"
                loop={true}
                autoplay={true}
              />
            </span>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-watt-success rounded-full animate-pulse" />
            <span className="text-sm">1,429MW Pipeline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-watt-trust rounded-full animate-pulse" />
            <span className="text-sm">6 Countries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-watt-bitcoin rounded-full animate-pulse" />
            <span className="text-sm">675MW+ Experience</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedCTA;
