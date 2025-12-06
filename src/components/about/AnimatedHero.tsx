import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { LottieAnimation } from '@/components/ui/LottieAnimation';
import '@/components/landing/landing-animations.css';

interface AnimatedHeroProps {
  className?: string;
}

// Typing effect hook
const useTypingEffect = (text: string, speed: number = 50, startDelay: number = 500) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let index = 0;

    const startTyping = () => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
        timeout = setTimeout(startTyping, speed);
      } else {
        setIsComplete(true);
      }
    };

    const delayTimeout = setTimeout(startTyping, startDelay);

    return () => {
      clearTimeout(timeout);
      clearTimeout(delayTimeout);
    };
  }, [text, speed, startDelay]);

  return { displayedText, isComplete };
};

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({ className = '' }) => {
  const { displayedText, isComplete } = useTypingEffect('Building Digital Infrastructure at Scale', 40, 800);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    setShowParticles(true);
  }, []);

  return (
    <section className={`relative py-20 md:py-32 px-6 bg-gradient-to-br from-watt-navy via-watt-navy/95 to-watt-navy overflow-hidden ${className}`}>
      {/* Animated particle background */}
      <div className="absolute inset-0 overflow-hidden">
        {showParticles && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-watt-bitcoin/20 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Background Lottie Animation */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <LottieAnimation
          src="https://assets3.lottiefiles.com/packages/lf20_w51pcehl.json"
          className="w-full h-full"
          loop={true}
          autoplay={true}
          speed={0.5}
        />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-watt-navy/80 via-transparent to-watt-navy/50 pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <Badge className="mb-6 bg-watt-bitcoin text-white border-none px-4 py-2 text-sm font-semibold animate-fade-in hover:scale-105 transition-transform cursor-default">
          Digital Infrastructure Company
        </Badge>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white animate-fade-in">
          About WattByte
        </h1>

        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-6 min-h-[2em]">
          {displayedText}
          {!isComplete && (
            <span className="inline-block w-0.5 h-6 bg-watt-bitcoin ml-1 animate-pulse" />
          )}
        </p>

        <p className="text-lg text-white/70 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '1.5s' }}>
          WattByte transforms stranded power assets into revenue-generating digital infrastructure, powering the future of AI, high-performance computing, and Bitcoin mining operations.
        </p>

        {/* Scroll indicator */}
        <div className="mt-12">
          <LottieAnimation
            src="https://assets2.lottiefiles.com/packages/lf20_xyadoh9h.json"
            className="w-12 h-12 mx-auto opacity-60"
            loop={true}
            autoplay={true}
          />
        </div>
      </div>
    </section>
  );
};

export default AnimatedHero;
