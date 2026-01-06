import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TISectionHeaderProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  description?: string;
  theme?: 'light' | 'dark';
  accentColor?: 'purple' | 'bitcoin' | 'success';
}

const accentColors = {
  purple: 'hsl(var(--watt-purple))',
  bitcoin: 'hsl(var(--watt-bitcoin))',
  success: 'hsl(var(--watt-success))',
};

export const TISectionHeader: React.FC<TISectionHeaderProps> = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  theme = 'light',
  accentColor = 'purple',
}) => {
  const isDark = theme === 'dark';
  const accent = accentColors[accentColor];

  return (
    <div className="text-center mb-12 md:mb-16">
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4",
            isDark
              ? "bg-white/10 text-white/90"
              : "bg-muted text-foreground"
          )}
          style={{ borderLeft: `3px solid ${accent}` }}
        >
          {BadgeIcon && <BadgeIcon className="w-4 h-4" style={{ color: accent }} />}
          {badge}
        </motion.div>
      )}
      
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={cn(
          "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4",
          isDark ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </motion.h2>
      
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn(
            "text-lg max-w-3xl mx-auto",
            isDark ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};

export default TISectionHeader;
