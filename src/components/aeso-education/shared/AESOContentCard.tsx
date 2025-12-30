import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface AESOContentCardProps {
  children: ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark';
  hover?: boolean;
  className?: string;
  delay?: number;
}

export function AESOContentCard({
  children,
  icon: Icon,
  iconColor = 'hsl(var(--watt-bitcoin))',
  title,
  subtitle,
  theme = 'light',
  hover = true,
  className = '',
  delay = 0,
}: AESOContentCardProps) {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`
        rounded-2xl p-6 md:p-8 border transition-all duration-300
        ${isDark 
          ? 'bg-white/5 border-white/10 backdrop-blur-sm' 
          : 'bg-card border-border shadow-sm'
        }
        ${hover 
          ? isDark 
            ? 'hover:bg-white/10 hover:border-white/20' 
            : 'hover:shadow-lg hover:border-[hsl(var(--watt-bitcoin)/0.3)]' 
          : ''
        }
        ${className}
      `}
    >
      {/* Header with icon */}
      {(Icon || title) && (
        <div className="flex items-start gap-4 mb-4">
          {Icon && (
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${iconColor}15` }}
            >
              <Icon 
                className="w-6 h-6" 
                style={{ color: iconColor }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-foreground'}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-sm ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={isDark ? 'text-white/70' : 'text-muted-foreground'}>
        {children}
      </div>
    </motion.div>
  );
}

// Variant for stats/metrics display
interface AESOStatCardProps {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  theme?: 'light' | 'dark';
  delay?: number;
}

export function AESOStatCard({
  value,
  label,
  description,
  icon: Icon,
  theme = 'light',
  delay = 0,
}: AESOStatCardProps) {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`
        rounded-2xl p-6 border text-center
        ${isDark 
          ? 'bg-white/5 border-white/10 backdrop-blur-sm' 
          : 'bg-card border-border shadow-sm'
        }
      `}
    >
      {Icon && (
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--watt-bitcoin)/0.1)] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
          </div>
        </div>
      )}
      <div className={`text-3xl md:text-4xl font-bold mb-1 ${isDark ? 'text-white' : 'text-foreground'}`}>
        {value}
      </div>
      <div className={`text-sm font-medium mb-1 ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
        {label}
      </div>
      {description && (
        <div className={`text-xs ${isDark ? 'text-white/50' : 'text-muted-foreground/70'}`}>
          {description}
        </div>
      )}
    </motion.div>
  );
}
