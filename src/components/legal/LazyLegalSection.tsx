import { useEffect, useRef, useState, ReactNode, memo } from 'react';

interface LazyLegalSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

/**
 * Lazy-loads legal content sections using IntersectionObserver
 * Only renders children when the section comes into viewport
 */
export const LazyLegalSection = memo(({ children, id, className = '' }: LazyLegalSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          // Once loaded, disconnect observer for this section
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Load 200px before entering viewport
        threshold: 0
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasLoaded]);

  return (
    <section 
      ref={sectionRef} 
      id={id} 
      className={`mb-10 ${className}`}
    >
      {isVisible ? (
        children
      ) : (
        // Skeleton placeholder
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted/60 rounded w-full" />
          <div className="h-4 bg-muted/60 rounded w-5/6" />
          <div className="h-4 bg-muted/60 rounded w-4/5" />
        </div>
      )}
    </section>
  );
});

LazyLegalSection.displayName = 'LazyLegalSection';
