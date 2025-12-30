import React from 'react';
import { Lightbulb, AlertTriangle, Info, CheckCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type InsightType = 'insight' | 'warning' | 'info' | 'success';

interface BitcoinKeyInsightProps {
  type?: InsightType;
  title?: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  className?: string;
}

const insightConfig: Record<InsightType, { icon: LucideIcon; lightBg: string; darkBg: string; iconColor: string; borderColor: string }> = {
  insight: {
    icon: Lightbulb,
    lightBg: 'bg-[hsl(var(--watt-bitcoin)/0.08)]',
    darkBg: 'bg-[hsl(var(--watt-bitcoin)/0.15)]',
    iconColor: 'text-[hsl(var(--watt-bitcoin))]',
    borderColor: 'border-[hsl(var(--watt-bitcoin)/0.2)]',
  },
  warning: {
    icon: AlertTriangle,
    lightBg: 'bg-amber-50',
    darkBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
  },
  info: {
    icon: Info,
    lightBg: 'bg-[hsl(var(--watt-trust)/0.08)]',
    darkBg: 'bg-[hsl(var(--watt-trust)/0.15)]',
    iconColor: 'text-[hsl(var(--watt-trust))]',
    borderColor: 'border-[hsl(var(--watt-trust)/0.2)]',
  },
  success: {
    icon: CheckCircle,
    lightBg: 'bg-[hsl(var(--watt-success)/0.08)]',
    darkBg: 'bg-[hsl(var(--watt-success)/0.15)]',
    iconColor: 'text-[hsl(var(--watt-success))]',
    borderColor: 'border-[hsl(var(--watt-success)/0.2)]',
  },
};

export const BitcoinKeyInsight: React.FC<BitcoinKeyInsightProps> = ({
  type = 'insight',
  title,
  children,
  theme = 'light',
  className,
}) => {
  const config = insightConfig[type];
  const isDark = theme === 'dark';
  const Icon = config.icon;
  
  const defaultTitles: Record<InsightType, string> = {
    insight: 'Key Insight',
    warning: 'Important',
    info: 'Did You Know?',
    success: 'Key Takeaway',
  };
  
  return (
    <div className={cn(
      'rounded-2xl p-6 border',
      isDark ? config.darkBg : config.lightBg,
      config.borderColor,
      className
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          'p-2 rounded-lg shrink-0',
          isDark ? 'bg-white/10' : 'bg-white'
        )}>
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>
        <div className="flex-1">
          <h4 className={cn(
            'font-bold mb-2',
            isDark ? 'text-white' : 'text-foreground'
          )}>
            {title || defaultTitles[type]}
          </h4>
          <div className={cn(
            'text-sm leading-relaxed',
            isDark ? 'text-white/80' : 'text-muted-foreground'
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinKeyInsight;
