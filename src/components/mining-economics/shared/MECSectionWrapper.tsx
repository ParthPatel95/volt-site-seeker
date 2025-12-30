import React from 'react';
import { cn } from '@/lib/utils';

interface MECSectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  theme?: 'light' | 'dark' | 'gradient' | 'accent';
  className?: string;
}

export const MECSectionWrapper: React.FC<MECSectionWrapperProps> = ({
  children,
  id,
  theme = 'light',
  className,
}) => {
  const themeClasses = {
    light: 'bg-background',
    dark: 'bg-[hsl(var(--watt-navy))]',
    gradient: 'bg-gradient-to-b from-muted/50 via-background to-muted/30',
    accent: 'bg-gradient-to-br from-[hsl(var(--watt-success)/0.05)] via-background to-[hsl(var(--watt-bitcoin)/0.05)]',
  };

  return (
    <section
      id={id}
      className={cn(
        'relative py-16 md:py-24 lg:py-32 overflow-hidden',
        themeClasses[theme],
        className
      )}
    >
      {/* Subtle background pattern */}
      {theme === 'dark' && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--watt-success)) 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, hsl(var(--watt-bitcoin)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>
      )}
      
      {theme === 'gradient' && (
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(135deg, hsl(var(--watt-success)) 0%, transparent 50%, hsl(var(--watt-bitcoin)) 100%)`,
          }} />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {children}
      </div>
    </section>
  );
};

export default MECSectionWrapper;
