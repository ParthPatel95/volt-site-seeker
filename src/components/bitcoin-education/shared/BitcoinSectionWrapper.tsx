import React from 'react';
import { cn } from '@/lib/utils';

type SectionTheme = 'light' | 'dark' | 'gradient';

interface BitcoinSectionWrapperProps {
  children: React.ReactNode;
  theme?: SectionTheme;
  className?: string;
  id?: string;
}

const themeClasses: Record<SectionTheme, string> = {
  light: 'bg-card',
  dark: 'bg-gradient-to-br from-[hsl(var(--watt-navy))] via-[hsl(var(--watt-navy)/0.95)] to-[hsl(var(--watt-bitcoin)/0.1)]',
  gradient: 'bg-gradient-to-b from-background to-muted/30',
};

export const BitcoinSectionWrapper: React.FC<BitcoinSectionWrapperProps> = ({
  children,
  theme = 'light',
  className,
  id,
}) => {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-24 lg:py-32',
        themeClasses[theme],
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {children}
      </div>
    </section>
  );
};

export default BitcoinSectionWrapper;
