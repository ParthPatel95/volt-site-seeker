import React from 'react';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MECQuoteProps {
  children: React.ReactNode;
  author?: string;
  role?: string;
  className?: string;
}

export const MECQuote: React.FC<MECQuoteProps> = ({
  children,
  author,
  role,
  className,
}) => {
  return (
    <motion.blockquote
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={cn(
        'relative pl-6 py-4 border-l-4 my-6',
        className
      )}
      style={{ borderColor: 'hsl(var(--watt-success))' }}
    >
      <Quote 
        className="absolute -left-3 -top-2 w-6 h-6 opacity-20"
        style={{ color: 'hsl(var(--watt-success))' }}
      />
      <p className="text-lg italic text-foreground leading-relaxed mb-2">
        "{children}"
      </p>
      {author && (
        <footer className="text-sm text-muted-foreground">
          <cite className="not-italic">
            — <strong style={{ color: 'hsl(var(--watt-success))' }}>{author}</strong>
            {role && <span>, {role}</span>}
          </cite>
        </footer>
      )}
    </motion.blockquote>
  );
};

// Callout Box - For highlighting important formulas or concepts
interface MECCalloutProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'formula' | 'definition' | 'example';
  className?: string;
}

export const MECCallout: React.FC<MECCalloutProps> = ({
  children,
  title,
  variant = 'definition',
  className,
}) => {
  const variantStyles = {
    formula: {
      bg: 'hsl(var(--watt-purple) / 0.1)',
      border: 'hsl(var(--watt-purple) / 0.2)',
      title: 'hsl(var(--watt-purple))',
    },
    definition: {
      bg: 'hsl(var(--watt-success) / 0.1)',
      border: 'hsl(var(--watt-success) / 0.2)',
      title: 'hsl(var(--watt-success))',
    },
    example: {
      bg: 'hsl(var(--watt-bitcoin) / 0.1)',
      border: 'hsl(var(--watt-bitcoin) / 0.2)',
      title: 'hsl(var(--watt-bitcoin))',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'rounded-xl p-4 border',
        className
      )}
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.border,
      }}
    >
      {title && (
        <div 
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: styles.title }}
        >
          {title}
        </div>
      )}
      <div className={cn(
        variant === 'formula' ? 'font-mono text-sm text-center' : 'text-sm',
        'text-foreground'
      )}>
        {children}
      </div>
    </div>
  );
};

export default MECQuote;
