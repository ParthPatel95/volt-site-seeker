import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  progress?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'default' | 'large';
  onClick?: () => void;
}

const variantStyles = {
  default: {
    gradient: 'from-primary/10 via-primary/5 to-transparent',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    progressColor: 'bg-primary',
  },
  success: {
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    progressColor: 'bg-emerald-500',
  },
  warning: {
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    progressColor: 'bg-amber-500',
  },
  danger: {
    gradient: 'from-red-500/10 via-red-500/5 to-transparent',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-500',
    progressColor: 'bg-red-500',
  },
  info: {
    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    progressColor: 'bg-blue-500',
  },
  purple: {
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    progressColor: 'bg-purple-500',
  },
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  progress,
  variant = 'default',
  size = 'default',
  onClick
}: KPICardProps) {
  const styles = variantStyles[variant];
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden cursor-default",
          "border border-border/50 hover:border-border",
          "transition-all duration-300",
          onClick && "cursor-pointer hover:shadow-lg",
          size === 'large' ? "p-6" : "p-4"
        )}
        onClick={onClick}
      >
        {/* Gradient Background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br",
          styles.gradient
        )} />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className={cn(
              "rounded-lg p-2",
              styles.iconBg
            )}>
              <Icon className={cn("w-5 h-5", styles.iconColor)} />
            </div>
            
            {trend && trendValue && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          
          {/* Value */}
          <div className="space-y-1">
            <h3 className={cn(
              "font-bold text-foreground",
              size === 'large' ? "text-3xl" : "text-2xl"
            )}>
              {value}
            </h3>
            <p className="text-sm text-muted-foreground">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/80">{subtitle}</p>
            )}
          </div>
          
          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="mt-4">
              <Progress 
                value={progress} 
                className="h-1.5 bg-muted/50"
              />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
