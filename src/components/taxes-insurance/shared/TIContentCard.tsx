import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TIContentCardProps {
  children: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark';
  borderColor?: string;
}

export const TIContentCard: React.FC<TIContentCardProps> = ({
  children,
  className,
  theme = 'light',
  borderColor,
}) => {
  const isDark = theme === 'dark';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "rounded-xl p-6 transition-all duration-300",
        isDark
          ? "bg-white/5 border border-white/10 hover:border-white/20"
          : "bg-card border border-border hover:border-primary/30",
        className
      )}
      style={borderColor ? { borderLeftColor: borderColor, borderLeftWidth: '3px' } : undefined}
    >
      {children}
    </motion.div>
  );
};

interface TIStatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  sublabel?: string;
  theme?: 'light' | 'dark';
  accentColor?: string;
}

export const TIStatCard: React.FC<TIStatCardProps> = ({
  icon: Icon,
  value,
  label,
  sublabel,
  theme = 'light',
  accentColor = 'hsl(var(--watt-purple))',
}) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "p-5 rounded-xl text-center transition-all duration-300",
        isDark
          ? "bg-white/5 border border-white/10 hover:bg-white/10"
          : "bg-card border border-border hover:shadow-lg"
      )}
    >
      <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: accentColor }} />
      <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'hsl(var(--watt-bitcoin))' }}>
        {value}
      </div>
      <div className={cn("font-medium", isDark ? "text-white" : "text-foreground")}>{label}</div>
      {sublabel && (
        <div className={cn("text-sm mt-1", isDark ? "text-white/50" : "text-muted-foreground")}>{sublabel}</div>
      )}
    </motion.div>
  );
};

interface TIMetricDisplayProps {
  metrics: Array<{
    label: string;
    value: string;
    change?: string;
    isPositive?: boolean;
  }>;
  theme?: 'light' | 'dark';
}

export const TIMetricDisplay: React.FC<TIMetricDisplayProps> = ({ metrics, theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className={cn(
            "p-4 rounded-lg text-center",
            isDark ? "bg-white/5" : "bg-muted"
          )}
        >
          <div className={cn("text-sm mb-1", isDark ? "text-white/60" : "text-muted-foreground")}>
            {metric.label}
          </div>
          <div className={cn("text-xl font-bold", isDark ? "text-white" : "text-foreground")}>
            {metric.value}
          </div>
          {metric.change && (
            <div className={cn("text-xs mt-1", metric.isPositive ? "text-green-500" : "text-red-500")}>
              {metric.change}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
