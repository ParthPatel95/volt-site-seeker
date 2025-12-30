import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MECSectionHeaderProps {
  badge: string;
  badgeIcon?: LucideIcon;
  title: string;
  description: string;
  theme?: 'light' | 'dark';
  align?: 'left' | 'center';
  accentColor?: 'success' | 'bitcoin' | 'purple';
}

export const MECSectionHeader: React.FC<MECSectionHeaderProps> = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  theme = 'light',
  align = 'center',
  accentColor = 'success',
}) => {
  const isDark = theme === 'dark';
  
  const accentColorMap = {
    success: 'var(--watt-success)',
    bitcoin: 'var(--watt-bitcoin)',
    purple: 'var(--watt-purple)',
  };

  const accent = accentColorMap[accentColor];
  
  return (
    <div className={cn(
      'mb-12 md:mb-16',
      align === 'center' && 'text-center'
    )}>
      {/* Badge */}
      <div 
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 transition-all duration-300',
          isDark 
            ? 'border'
            : 'border'
        )}
        style={{
          backgroundColor: isDark ? `hsl(${accent} / 0.2)` : `hsl(${accent} / 0.1)`,
          borderColor: isDark ? `hsl(${accent} / 0.3)` : `hsl(${accent} / 0.2)`,
        }}
      >
        {BadgeIcon && (
          <BadgeIcon 
            className="w-4 h-4"
            style={{ color: `hsl(${accent})` }}
          />
        )}
        <span 
          className="text-sm font-medium"
          style={{ color: `hsl(${accent})` }}
        >
          {badge}
        </span>
      </div>
      
      {/* Title */}
      <h2 className={cn(
        'text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight',
        isDark ? 'text-white' : 'text-foreground'
      )}>
        {title}
      </h2>
      
      {/* Description */}
      <p className={cn(
        'text-lg md:text-xl max-w-3xl leading-relaxed',
        align === 'center' && 'mx-auto',
        isDark ? 'text-white/70' : 'text-muted-foreground'
      )}>
        {description}
      </p>
    </div>
  );
};

export default MECSectionHeader;
