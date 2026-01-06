import React from 'react';
import { LucideIcon, Quote, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TIQuoteProps {
  quote: string;
  author?: string;
  role?: string;
  theme?: 'light' | 'dark';
}

export const TIQuote: React.FC<TIQuoteProps> = ({
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
      <Quote
        className="absolute top-4 left-4 w-8 h-8 opacity-20"
        style={{ color: 'hsl(var(--watt-purple))' }}
      />
      <p className={cn(
        "text-lg italic mb-4 pl-8",
        isDark ? "text-white/90" : "text-foreground"
      )}>
        "{quote}"
      </p>
      {author && (
        <footer className="pl-8">
          <cite className={cn("not-italic font-medium", isDark ? "text-white" : "text-foreground")}>
            {author}
          </cite>
          {role && (
            <span className={cn("text-sm ml-2", isDark ? "text-white/50" : "text-muted-foreground")}>
              — {role}
            </span>
          )}
        </footer>
      )}
    </motion.blockquote>
  );
};

interface TICalloutProps {
  title?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'info' | 'warning' | 'tip';
  theme?: 'light' | 'dark';
}

const variantStyles = {
  info: {
    color: 'hsl(var(--watt-purple))',
    lightBg: 'bg-[hsl(var(--watt-purple)/0.05)]',
    darkBg: 'bg-[hsl(var(--watt-purple)/0.1)]',
  },
  warning: {
    color: 'hsl(var(--watt-bitcoin))',
    lightBg: 'bg-amber-50',
    darkBg: 'bg-amber-500/10',
  },
  tip: {
    color: 'hsl(var(--watt-success))',
    lightBg: 'bg-green-50',
    darkBg: 'bg-green-500/10',
  },
};

export const TICallout: React.FC<TICalloutProps> = ({
  title,
  children,
  icon: CustomIcon,
  variant = 'info',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const styles = variantStyles[variant];
  const Icon = CustomIcon || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-xl p-5 border",
        isDark ? styles.darkBg : styles.lightBg,
        isDark ? "border-white/10" : "border-transparent"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: styles.color }} />
        <div>
          {title && (
            <h5 className={cn("font-semibold mb-1", isDark ? "text-white" : "text-foreground")}>{title}</h5>
          )}
          <div className={cn("text-sm", isDark ? "text-white/70" : "text-muted-foreground")}>{children}</div>
        </div>
      </div>
    </motion.div>
  );
};
