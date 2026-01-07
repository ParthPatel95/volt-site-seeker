import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LucideIcon, Quote } from 'lucide-react';

interface EPQuoteProps {
  quote: string;
  author?: string;
  role?: string;
  theme?: 'light' | 'dark';
}

export const EPQuote: React.FC<EPQuoteProps> = ({
  quote,
  author,
  role,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  return (
    <motion.blockquote
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "relative rounded-xl p-6 border-l-4",
        isDark
          ? "bg-white/5 border-[hsl(var(--watt-purple))]"
          : "bg-muted border-[hsl(var(--watt-purple))]"
      )}
    >
      <Quote className="absolute top-4 right-4 w-8 h-8 opacity-10" />
      <p className={cn(
        "text-lg italic mb-4",
        isDark ? "text-white/90" : "text-foreground"
      )}>
        "{quote}"
      </p>
      {(author || role) && (
        <footer className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>
          {author && <span className="font-medium">{author}</span>}
          {role && <span> — {role}</span>}
        </footer>
      )}
    </motion.blockquote>
  );
};

interface EPCalloutProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'default' | 'regulation' | 'timeline' | 'cost';
  theme?: 'light' | 'dark';
}

const variantStyles = {
  default: {
    iconColor: 'hsl(var(--watt-purple))',
    borderColor: 'hsl(var(--watt-purple))',
  },
  regulation: {
    iconColor: 'hsl(var(--watt-bitcoin))',
    borderColor: 'hsl(var(--watt-bitcoin))',
  },
  timeline: {
    iconColor: 'hsl(var(--watt-success))',
    borderColor: 'hsl(var(--watt-success))',
  },
  cost: {
    iconColor: 'hsl(0, 84%, 60%)',
    borderColor: 'hsl(0, 84%, 60%)',
  },
};

export const EPCallout: React.FC<EPCalloutProps> = ({
  title,
  children,
  icon: Icon,
  variant = 'default',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-xl p-5 border-l-4",
        isDark ? "bg-white/5" : "bg-muted/50"
      )}
      style={{ borderLeftColor: styles.borderColor }}
    >
      <div className="flex items-start gap-3">
        {Icon && <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: styles.iconColor }} />}
        <div>
          <h4 className={cn("font-semibold mb-2", isDark ? "text-white" : "text-foreground")}>{title}</h4>
          <div className={cn("text-sm", isDark ? "text-white/70" : "text-muted-foreground")}>{children}</div>
        </div>
      </div>
    </motion.div>
  );
};
