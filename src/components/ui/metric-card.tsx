import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  status?: 'live' | 'delayed' | 'offline';
  icon?: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  trend,
  status,
  icon,
  className,
  accentColor = 'hsl(var(--primary))'
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'down':
        return <TrendingDown className="w-3.5 h-3.5" />;
      default:
        return <Minus className="w-3.5 h-3.5" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up':
        return 'text-data-positive';
      case 'down':
        return 'text-data-negative';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div
      className={cn(
        'relative bg-card border border-border rounded-xl p-4 sm:p-5 transition-all duration-200 hover:shadow-md-soft hover:border-border/80 group overflow-hidden',
        className
      )}
    >
      {/* Accent Bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* Status Indicator */}
      {status && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              status === 'live' && 'bg-data-positive animate-pulse',
              status === 'delayed' && 'bg-data-warning',
              status === 'offline' && 'bg-data-negative'
            )}
          />
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            {status}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-muted-foreground truncate">
            {title}
          </p>

          {/* Value */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-muted-foreground font-medium">
                {unit}
              </span>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div className={cn('flex items-center gap-1 mt-1', getTrendColor())}>
              {getTrendIcon()}
              <span className="text-xs font-medium tabular-nums">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground ml-0.5">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
