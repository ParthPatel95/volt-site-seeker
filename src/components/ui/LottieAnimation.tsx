import React, { useEffect, useRef, useState } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

interface LottieAnimationProps {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  playOnHover?: boolean;
  playOnView?: boolean;
  speed?: number;
  style?: React.CSSProperties;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  src,
  className = '',
  loop = true,
  autoplay = true,
  playOnHover = false,
  playOnView = false,
  speed = 1,
  style,
}) => {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Fetch animation data
  useEffect(() => {
    const fetchAnimation = async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Failed to load Lottie animation:', error);
        setHasError(true);
      }
    };

    fetchAnimation();
  }, [src]);

  // Intersection Observer for playOnView
  useEffect(() => {
    if (!playOnView || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [playOnView]);

  // Control playback based on hover and view state
  useEffect(() => {
    if (!lottieRef.current || prefersReducedMotion) return;

    if (playOnHover) {
      if (isHovered) {
        lottieRef.current.play();
      } else {
        lottieRef.current.stop();
      }
    } else if (playOnView) {
      if (isInView) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isHovered, isInView, playOnHover, playOnView, prefersReducedMotion]);

  // Set animation speed
  useEffect(() => {
    if (lottieRef.current && speed !== 1) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed, animationData]);

  if (hasError || prefersReducedMotion) {
    return null; // Fallback: show nothing on error or reduced motion
  }

  if (!animationData) {
    return (
      <div 
        className={`animate-pulse bg-gray-200 rounded ${className}`} 
        style={style}
      />
    );
  }

  const shouldAutoplay = autoplay && !playOnHover && !playOnView;

  // Wrap Lottie rendering in try-catch to prevent crashes
  try {
    return (
      <div
        ref={containerRef}
        className={className}
        style={style}
        onMouseEnter={() => playOnHover && setIsHovered(true)}
        onMouseLeave={() => playOnHover && setIsHovered(false)}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={loop}
          autoplay={shouldAutoplay}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  } catch (error) {
    console.error('LottieAnimation render error:', error);
    return null;
  }
};

export default LottieAnimation;
