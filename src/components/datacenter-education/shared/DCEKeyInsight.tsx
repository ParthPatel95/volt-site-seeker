import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, Info, CheckCircle, Zap, LucideIcon } from 'lucide-react';

type InsightVariant = 'insight' | 'warning' | 'info' | 'success' | 'pro-tip';

interface DCEKeyInsightProps {
  variant?: InsightVariant;
  title?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  delay?: number;
}

const variantConfig: Record<InsightVariant, {
  icon: LucideIcon;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  defaultTitle: string;
}> = {
  insight: {
    icon: Lightbulb,
    bgColor: 'bg-[hsl(var(--watt-bitcoin)/0.05)]',
    borderColor: 'border-[hsl(var(--watt-bitcoin)/0.2)]',
    iconBg: 'bg-[hsl(var(--watt-bitcoin)/0.15)]',
    iconColor: 'text-[hsl(var(--watt-bitcoin))]',
    titleColor: 'text-[hsl(var(--watt-bitcoin))]',
    defaultTitle: 'Key Insight',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/5',
    borderColor: 'border-amber-500/20',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-600',
    defaultTitle: 'Important',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-500/5',
    borderColor: 'border-blue-500/20',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-600',
    defaultTitle: 'Did You Know?',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-500/5',
    borderColor: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-600',
    defaultTitle: 'Best Practice',
  },
  'pro-tip': {
    icon: Zap,
    bgColor: 'bg-purple-500/5',
    borderColor: 'border-purple-500/20',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-500',
    titleColor: 'text-purple-600',
    defaultTitle: 'Pro Tip',
  },
};

export const DCEKeyInsight: React.FC<DCEKeyInsightProps> = ({
  variant = 'insight',
  title,
  children,
  icon,
  className = '',
  delay = 0,
}) => {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-r-xl p-5 md:p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className={`${config.iconBg} p-2.5 rounded-lg shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold mb-2 ${config.titleColor}`}>
            {displayTitle}
          </h4>
          <div className="text-foreground/80 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DCEKeyInsight;
