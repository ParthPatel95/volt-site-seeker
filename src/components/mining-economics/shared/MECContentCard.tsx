import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MECContentCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'glass' | 'dark';
  className?: string;
  headerIcon?: LucideIcon;
  headerTitle?: string;
  headerIconColor?: 'success' | 'bitcoin' | 'purple' | 'blue';
}

const iconColorMap = {
  success: 'hsl(var(--watt-success))',
  bitcoin: 'hsl(var(--watt-bitcoin))',
  purple: 'hsl(var(--watt-purple))',
  blue: '#3b82f6',
};

export const MECContentCard: React.FC<MECContentCardProps> = ({
  children,
  variant = 'default',
  className,
  headerIcon: HeaderIcon,
  headerTitle,
  headerIconColor = 'success',
}) => {
  const variantClasses = {
    default: 'bg-muted/50 rounded-xl',
    elevated: 'bg-background rounded-2xl shadow-lg border border-border',
    bordered: 'bg-background/50 rounded-xl border border-border',
    glass: 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl',
    dark: 'bg-[hsl(var(--watt-navy))] rounded-xl text-white',
  };

  return (
    <div className={cn(variantClasses[variant], 'p-6 md:p-8', className)}>
      {HeaderIcon && headerTitle && (
        <h3 className={cn(
          'text-xl font-bold mb-6 flex items-center gap-2',
          variant === 'dark' || variant === 'glass' ? 'text-white' : 'text-foreground'
        )}>
          <HeaderIcon 
            className="w-5 h-5"
            style={{ color: iconColorMap[headerIconColor] }}
          />
          {headerTitle}
        </h3>
      )}
      {children}
    </div>
  );
};

// Stat Card Component
interface MECStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: 'success' | 'bitcoin' | 'purple' | 'blue' | 'red';
  className?: string;
}

export const MECStatCard: React.FC<MECStatCardProps> = ({
  icon: Icon,
  value,
  label,
  color = 'success',
  className,
}) => {
  const colorMap = {
    success: { bg: 'hsl(var(--watt-success) / 0.1)', text: 'hsl(var(--watt-success))' },
    bitcoin: { bg: 'hsl(var(--watt-bitcoin) / 0.1)', text: 'hsl(var(--watt-bitcoin))' },
    purple: { bg: 'hsl(var(--watt-purple) / 0.1)', text: 'hsl(var(--watt-purple))' },
    blue: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
  };

  const colors = colorMap[color];

  return (
    <div 
      className={cn('rounded-xl p-4 text-center', className)}
      style={{ backgroundColor: colors.bg }}
    >
      <Icon 
        className="w-6 h-6 mx-auto mb-2"
        style={{ color: colors.text }}
      />
      <div 
        className="text-2xl font-bold"
        style={{ color: colors.text }}
      >
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

// Metric Display Card for dark backgrounds
interface MECMetricDisplayProps {
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
}

export const MECMetricDisplay: React.FC<MECMetricDisplayProps> = ({
  label,
  value,
  subValue,
  className,
}) => {
  return (
    <div className={cn(
      'bg-[hsl(var(--watt-navy))] rounded-xl p-4 text-center',
      className
    )}>
      <div className="text-sm text-white/60 mb-1">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {subValue && (
        <div className="text-sm mt-1" style={{ color: 'hsl(var(--watt-bitcoin))' }}>
          {subValue}
        </div>
      )}
    </div>
  );
};

export default MECContentCard;
