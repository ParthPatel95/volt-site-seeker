import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BitcoinSectionHeaderProps {
  badge: string;
  badgeIcon?: LucideIcon;
  title: string;
  description: string;
  theme?: 'light' | 'dark';
  align?: 'left' | 'center';
}

export const BitcoinSectionHeader: React.FC<BitcoinSectionHeaderProps> = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  theme = 'light',
  align = 'center',
}) => {
  const isDark = theme === 'dark';
  
  return (
    <div className={cn(
      'mb-12 md:mb-16',
      align === 'center' && 'text-center'
    )}>
      {/* Badge */}
      <div className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6',
        isDark 
          ? 'bg-[hsl(var(--watt-bitcoin)/0.2)] border border-[hsl(var(--watt-bitcoin)/0.3)]'
          : 'bg-[hsl(var(--watt-bitcoin)/0.1)] border border-[hsl(var(--watt-bitcoin)/0.2)]'
      )}>
        {BadgeIcon && (
          <BadgeIcon className={cn(
            'w-4 h-4',
            isDark ? 'text-[hsl(var(--watt-bitcoin))]' : 'text-[hsl(var(--watt-bitcoin))]'
          )} />
        )}
        <span className={cn(
          'text-sm font-medium',
          isDark ? 'text-[hsl(var(--watt-bitcoin))]' : 'text-[hsl(var(--watt-bitcoin))]'
        )}>
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

export default BitcoinSectionHeader;
