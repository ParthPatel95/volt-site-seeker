import React from 'react';
import { LucideIcon, Lightbulb, AlertTriangle, Info, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MECKeyInsightProps {
  children: React.ReactNode;
  variant?: 'insight' | 'warning' | 'info' | 'success' | 'pro-tip';
  title?: string;
  icon?: LucideIcon;
  className?: string;
  animate?: boolean;
}

const variantConfig = {
  insight: {
    icon: Lightbulb,
    bgColor: 'hsl(var(--watt-success) / 0.1)',
    borderColor: 'hsl(var(--watt-success) / 0.2)',
    iconColor: 'hsl(var(--watt-success))',
    titleColor: 'hsl(var(--watt-success))',
    defaultTitle: 'Key Insight',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'hsl(var(--watt-bitcoin) / 0.1)',
    borderColor: 'hsl(var(--watt-bitcoin) / 0.2)',
    iconColor: 'hsl(var(--watt-bitcoin))',
    titleColor: 'hsl(var(--watt-bitcoin))',
    defaultTitle: 'Important',
  },
  info: {
    icon: Info,
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    iconColor: '#3b82f6',
    titleColor: '#3b82f6',
    defaultTitle: 'Did You Know?',
  },
  success: {
    icon: CheckCircle2,
    bgColor: 'hsl(var(--watt-success) / 0.1)',
    borderColor: 'hsl(var(--watt-success) / 0.2)',
    iconColor: 'hsl(var(--watt-success))',
    titleColor: 'hsl(var(--watt-success))',
    defaultTitle: 'Best Practice',
  },
  'pro-tip': {
    icon: Zap,
    bgColor: 'hsl(var(--watt-purple) / 0.1)',
    borderColor: 'hsl(var(--watt-purple) / 0.2)',
    iconColor: 'hsl(var(--watt-purple))',
    titleColor: 'hsl(var(--watt-purple))',
    defaultTitle: 'Pro Tip',
  },
};

export const MECKeyInsight: React.FC<MECKeyInsightProps> = ({
  children,
  variant = 'insight',
  title,
  icon,
  className,
  animate = true,
}) => {
  const config = variantConfig[variant];
  const IconComponent = icon || config.icon;
  const displayTitle = title || config.defaultTitle;

  const content = (
    <div
      className={cn(
        'rounded-xl p-6 border transition-all duration-300',
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      <h4 
        className="font-bold mb-3 flex items-center gap-2"
        style={{ color: config.titleColor }}
      >
        <IconComponent 
          className="w-5 h-5"
          style={{ color: config.iconColor }}
        />
        {displayTitle}
      </h4>
      <div className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

// Inline insight for use within paragraphs
interface MECInlineInsightProps {
  children: React.ReactNode;
  color?: 'success' | 'bitcoin' | 'purple';
}

export const MECInlineInsight: React.FC<MECInlineInsightProps> = ({
  children,
  color = 'bitcoin',
}) => {
  const colorMap = {
    success: 'hsl(var(--watt-success))',
    bitcoin: 'hsl(var(--watt-bitcoin))',
    purple: 'hsl(var(--watt-purple))',
  };

  return (
    <strong style={{ color: colorMap[color] }}>{children}</strong>
  );
};

export default MECKeyInsight;
