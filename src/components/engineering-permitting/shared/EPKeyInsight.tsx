import React from 'react';
import { LucideIcon, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EPKeyInsightProps {
  title: string;
  children: React.ReactNode;
  type?: 'insight' | 'warning' | 'success';
  icon?: LucideIcon;
  theme?: 'light' | 'dark';
}

const typeStyles = {
  insight: {
    icon: Lightbulb,
    lightBg: 'bg-[hsl(var(--watt-purple)/0.1)]',
    lightBorder: 'border-[hsl(var(--watt-purple)/0.3)]',
    darkBg: 'bg-[hsl(var(--watt-purple)/0.15)]',
    darkBorder: 'border-[hsl(var(--watt-purple)/0.4)]',
    iconColor: 'hsl(var(--watt-purple))',
  },
  warning: {
    icon: AlertCircle,
    lightBg: 'bg-amber-50',
    lightBorder: 'border-amber-200',
    darkBg: 'bg-amber-500/10',
    darkBorder: 'border-amber-500/30',
    iconColor: 'hsl(var(--watt-bitcoin))',
  },
  success: {
    icon: CheckCircle,
    lightBg: 'bg-green-50',
    lightBorder: 'border-green-200',
    darkBg: 'bg-green-500/10',
    darkBorder: 'border-green-500/30',
    iconColor: 'hsl(var(--watt-success))',
  },
};

export const EPKeyInsight: React.FC<EPKeyInsightProps> = ({
  title,
  children,
  type = 'insight',
  icon,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const styles = typeStyles[type];
  const Icon = icon || styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "rounded-xl p-5 border-l-4",
        isDark ? styles.darkBg : styles.lightBg,
        isDark ? styles.darkBorder : styles.lightBorder
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: styles.iconColor }} />
        <div>
          <h4 className={cn("font-semibold mb-2", isDark ? "text-white" : "text-foreground")}>{title}</h4>
          <div className={cn("text-sm", isDark ? "text-white/70" : "text-muted-foreground")}>{children}</div>
        </div>
      </div>
    </motion.div>
  );
};

interface EPInlineInsightProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

export const EPInlineInsight: React.FC<EPInlineInsightProps> = ({ children, theme = 'light' }) => {
  const isDark = theme === 'dark';
  
  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-sm font-medium",
      isDark ? "bg-[hsl(var(--watt-purple)/0.2)] text-[hsl(var(--watt-purple))]" : "bg-[hsl(var(--watt-purple)/0.1)] text-[hsl(var(--watt-purple))]"
    )}>
      {children}
    </span>
  );
};
