import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Lightbulb, AlertTriangle, Info, CheckCircle, Zap } from 'lucide-react';

type InsightVariant = 'insight' | 'warning' | 'info' | 'success' | 'pro-tip';

interface AESOKeyInsightProps {
  children: ReactNode;
  variant?: InsightVariant;
  title?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

const variantConfig: Record<InsightVariant, { 
  icon: typeof Lightbulb; 
  color: string; 
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  defaultTitle: string;
}> = {
  insight: {
    icon: Lightbulb,
    color: 'hsl(var(--watt-bitcoin))',
    bgLight: 'bg-[hsl(var(--watt-bitcoin)/0.05)]',
    bgDark: 'bg-[hsl(var(--watt-bitcoin)/0.1)]',
    borderLight: 'border-[hsl(var(--watt-bitcoin)/0.2)]',
    borderDark: 'border-[hsl(var(--watt-bitcoin)/0.3)]',
    defaultTitle: 'Key Insight',
  },
  warning: {
    icon: AlertTriangle,
    color: 'hsl(45, 93%, 47%)',
    bgLight: 'bg-amber-50',
    bgDark: 'bg-amber-500/10',
    borderLight: 'border-amber-200',
    borderDark: 'border-amber-500/30',
    defaultTitle: 'Important Note',
  },
  info: {
    icon: Info,
    color: 'hsl(var(--watt-trust))',
    bgLight: 'bg-[hsl(var(--watt-trust)/0.05)]',
    bgDark: 'bg-[hsl(var(--watt-trust)/0.1)]',
    borderLight: 'border-[hsl(var(--watt-trust)/0.2)]',
    borderDark: 'border-[hsl(var(--watt-trust)/0.3)]',
    defaultTitle: 'Did You Know?',
  },
  success: {
    icon: CheckCircle,
    color: 'hsl(var(--watt-success))',
    bgLight: 'bg-[hsl(var(--watt-success)/0.05)]',
    bgDark: 'bg-[hsl(var(--watt-success)/0.1)]',
    borderLight: 'border-[hsl(var(--watt-success)/0.2)]',
    borderDark: 'border-[hsl(var(--watt-success)/0.3)]',
    defaultTitle: 'Best Practice',
  },
  'pro-tip': {
    icon: Zap,
    color: 'hsl(var(--watt-bitcoin))',
    bgLight: 'bg-gradient-to-r from-[hsl(var(--watt-bitcoin)/0.08)] to-[hsl(var(--watt-bitcoin)/0.03)]',
    bgDark: 'bg-gradient-to-r from-[hsl(var(--watt-bitcoin)/0.15)] to-[hsl(var(--watt-bitcoin)/0.05)]',
    borderLight: 'border-[hsl(var(--watt-bitcoin)/0.25)]',
    borderDark: 'border-[hsl(var(--watt-bitcoin)/0.35)]',
    defaultTitle: 'Pro Tip',
  },
};

export function AESOKeyInsight({
  children,
  variant = 'insight',
  title,
  theme = 'light',
  className = '',
}: AESOKeyInsightProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`
        rounded-xl p-5 border
        ${isDark ? config.bgDark : config.bgLight}
        ${isDark ? config.borderDark : config.borderLight}
        ${className}
      `}
    >
      <div className="flex items-start gap-4">
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon 
            className="w-5 h-5" 
            style={{ color: config.color }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 
            className="font-bold mb-2"
            style={{ color: config.color }}
          >
            {title || config.defaultTitle}
          </h4>
          <div className={`text-base leading-relaxed ${isDark ? 'text-white/80' : 'text-foreground/80'}`}>
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
