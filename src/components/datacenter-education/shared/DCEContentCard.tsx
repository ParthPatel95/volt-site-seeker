import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface DCEContentCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'glass' | 'dark';
  className?: string;
  header?: {
    icon?: LucideIcon;
    iconColor?: string;
    title: string;
    subtitle?: string;
  };
  delay?: number;
  hover?: boolean;
}

export const DCEContentCard: React.FC<DCEContentCardProps> = ({
  children,
  variant = 'default',
  className = '',
  header,
  delay = 0,
  hover = true,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-card shadow-lg shadow-black/5 border border-border/50';
      case 'bordered':
        return 'bg-card/50 border-2 border-border';
      case 'glass':
        return 'bg-white/5 backdrop-blur-md border border-white/10';
      case 'dark':
        return 'bg-[hsl(var(--watt-navy)/0.8)] border border-white/10 text-white';
      case 'default':
      default:
        return 'bg-card border border-border';
    }
  };

  const hoverClasses = hover 
    ? 'transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(var(--watt-bitcoin)/0.1)] hover:-translate-y-1 hover:border-[hsl(var(--watt-bitcoin)/0.3)]' 
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl p-4 sm:p-6 md:p-8 ${getVariantClasses()} ${hoverClasses} ${className}`}
    >
      {header && (
        <div className="flex items-start gap-4 mb-6">
          {header.icon && (
            <div 
              className={`p-3 rounded-xl ${header.iconColor || 'bg-[hsl(var(--watt-bitcoin)/0.1)]'}`}
            >
              <header.icon className={`w-6 h-6 ${header.iconColor?.includes('text-') ? '' : 'text-[hsl(var(--watt-bitcoin))]'}`} />
            </div>
          )}
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-1 ${variant === 'dark' || variant === 'glass' ? 'text-white' : 'text-foreground'}`}>
              {header.title}
            </h3>
            {header.subtitle && (
              <p className={`text-sm ${variant === 'dark' || variant === 'glass' ? 'text-white/60' : 'text-muted-foreground'}`}>
                {header.subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  );
};

interface DCEStatCardProps {
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  value: string | number;
  label: string;
  sublabel?: string;
  theme?: 'light' | 'dark';
  delay?: number;
}

export const DCEStatCard: React.FC<DCEStatCardProps> = ({
  icon: Icon,
  iconColor = 'text-[hsl(var(--watt-bitcoin))]',
  iconBg = 'bg-[hsl(var(--watt-bitcoin)/0.1)]',
  value,
  label,
  sublabel,
  theme = 'light',
  delay = 0,
}) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1
        ${isDark 
          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[hsl(var(--watt-bitcoin)/0.3)]' 
          : 'bg-card border-border hover:shadow-lg hover:border-[hsl(var(--watt-bitcoin)/0.3)]'
        }`}
    >
      {Icon && (
        <div className={`inline-flex p-3 rounded-xl mb-4 ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      )}
      <div className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-foreground'}`}>
        {value}
      </div>
      <div className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-foreground'}`}>
        {label}
      </div>
      {sublabel && (
        <div className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
          {sublabel}
        </div>
      )}
    </motion.div>
  );
};

export default DCEContentCard;
