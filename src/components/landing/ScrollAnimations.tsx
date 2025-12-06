import { useEffect, useRef, ReactNode } from 'react';
import './landing-animations.css';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  className?: string;
}

export const ScrollReveal = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}: ScrollRevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayMs = delay * 1000; // Convert seconds to milliseconds
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-in');
            }, delayMs);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    // Fallback: ensure visibility after max wait time
    const fallbackTimeout = setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.classList.add('animate-in');
      }
    }, delayMs + 3000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
    };
  }, [delay]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up': return 'translate-y-8 opacity-0';
      case 'down': return '-translate-y-8 opacity-0';
      case 'left': return 'translate-x-8 opacity-0';
      case 'right': return '-translate-x-8 opacity-0';
      case 'fade': return 'opacity-0';
      default: return 'translate-y-8 opacity-0';
    }
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-out ${getInitialTransform()} ${className}`}
      style={{
        transitionDelay: `${delay * 1000}ms`
      }}
    >
      {children}
    </div>
  );
};

interface ParallaxElementProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxElement = ({ 
  children, 
  speed = 0.5,
  className = '' 
}: ParallaxElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;
        elementRef.current.style.transform = `translate3d(0, ${rate}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export const SmoothScroll = () => {
  useEffect(() => {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          const targetElement = document.querySelector(href);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });

    return () => {
      smoothScrollLinks.forEach(link => {
        link.removeEventListener('click', () => {});
      });
    };
  }, []);

  return null;
};
