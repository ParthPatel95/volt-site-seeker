import React from 'react';
import { motion } from 'framer-motion';

interface DCESectionWrapperProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'gradient' | 'accent';
  className?: string;
  id?: string;
}

export const DCESectionWrapper: React.FC<DCESectionWrapperProps> = ({
  children,
  theme = 'light',
  className = '',
  id,
}) => {
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[hsl(var(--watt-navy))] text-white';
      case 'gradient':
        return 'bg-gradient-to-br from-[hsl(var(--watt-navy))] via-[hsl(var(--watt-navy)/0.95)] to-[hsl(var(--watt-navy)/0.9)] text-white';
      case 'accent':
        return 'bg-gradient-to-br from-[hsl(var(--watt-bitcoin)/0.05)] via-background to-[hsl(var(--watt-bitcoin)/0.02)] text-foreground';
      case 'light':
      default:
        return 'bg-background text-foreground';
    }
  };

  return (
    <section
      id={id}
      className={`relative py-16 md:py-24 lg:py-32 overflow-hidden scroll-mt-20 ${getThemeClasses()} ${className}`}
    >
      {/* Subtle pattern overlay for dark themes */}
      {(theme === 'dark' || theme === 'gradient') && (
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
      )}
      
      {/* Accent glow for accent theme */}
      {theme === 'accent' && (
        <>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[hsl(var(--watt-bitcoin)/0.08)] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[hsl(var(--watt-bitcoin)/0.05)] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
        </>
      )}
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {children}
      </div>
    </section>
  );
};

export default DCESectionWrapper;
