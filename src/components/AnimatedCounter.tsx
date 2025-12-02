import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '' }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const endTime = startTime + duration;
          const hasDecimal = end % 1 !== 0;

          const updateCount = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuad = 1 - Math.pow(1 - progress, 3);
            const currentCount = hasDecimal 
              ? parseFloat((easeOutQuad * end).toFixed(1))
              : Math.floor(easeOutQuad * end);
            
            setCount(currentCount);

            if (now < endTime) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={countRef}>
      {prefix}{count}{suffix}
    </span>
  );
};
