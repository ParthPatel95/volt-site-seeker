import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveContainer({ 
  children, 
  maxWidth = 'full', 
  padding = 'md',
  className = ""
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-7xl'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-4',
    md: 'p-2 sm:p-4 lg:p-6',
    lg: 'p-4 sm:p-6 lg:p-8'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

export function ResponsivePageContainer({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <ResponsiveContainer 
      maxWidth="full" 
      padding="md"
      className={cn("min-h-screen safe-area-pt safe-area-pb", className)}
    >
      {children}
    </ResponsiveContainer>
  );
}

export function ResponsiveSection({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <section className={cn("space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </section>
  );
}