import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface DCESectionHeaderProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  title: string;
  description?: string;
  theme?: 'light' | 'dark';
  align?: 'left' | 'center';
  className?: string;
}

export const DCESectionHeader: React.FC<DCESectionHeaderProps> = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  theme = 'light',
  align = 'center',
  className = '',
}) => {
  const alignmentClasses = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`max-w-4xl ${alignmentClasses} mb-12 md:mb-16 ${className}`}
    >
      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6
            ${isDark 
              ? 'bg-[hsl(var(--watt-bitcoin)/0.2)] text-[hsl(var(--watt-bitcoin))] border border-[hsl(var(--watt-bitcoin)/0.3)]' 
              : 'bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))] border border-[hsl(var(--watt-bitcoin)/0.2)]'
            }`}
        >
          {BadgeIcon && <BadgeIcon className="w-4 h-4" />}
          {badge}
        </motion.div>
      )}
      
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 md:mb-6
          ${isDark ? 'text-white' : 'text-foreground'}`}
      >
        {title}
      </motion.h2>
      
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`text-lg md:text-xl leading-relaxed max-w-3xl ${align === 'center' ? 'mx-auto' : ''}
            ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
};

export default DCESectionHeader;
