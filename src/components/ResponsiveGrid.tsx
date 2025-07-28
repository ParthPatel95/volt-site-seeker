import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: string;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 }, 
  gap = "gap-4 sm:gap-6",
  className = ""
}: ResponsiveGridProps) {
  const gridClasses = [
    'grid',
    gap,
    // Default columns
    cols.default && `grid-cols-${cols.default}`,
    // Responsive columns
    cols.xs && `xs:grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(gridClasses)}>
      {children}
    </div>
  );
}

// Pre-configured responsive grids for common use cases
export function ResponsiveCardGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ default: 1, sm: 2, lg: 3, xl: 4 }}
      gap="gap-4 sm:gap-6"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function ResponsiveMetricsGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ default: 1, sm: 2, lg: 4 }}
      gap="gap-4"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

export function ResponsiveContentGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ResponsiveGrid 
      cols={{ default: 1, lg: 2 }}
      gap="gap-6"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}