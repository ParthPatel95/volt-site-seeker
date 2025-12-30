import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BitcoinContentCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: LucideIcon;
  iconColor?: string;
  theme?: 'light' | 'dark';
  className?: string;
  hover?: boolean;
}

export const BitcoinContentCard: React.FC<BitcoinContentCardProps> = ({
  children,
  title,
  icon: Icon,
  iconColor = 'text-[hsl(var(--watt-bitcoin))]',
  theme = 'light',
  className,
  hover = true,
}) => {
  const isDark = theme === 'dark';
  
  return (
    <div className={cn(
      'rounded-2xl p-6 md:p-8 transition-all duration-300',
      isDark 
        ? 'bg-white/5 border border-white/10 backdrop-blur-sm'
        : 'bg-card border border-border shadow-sm',
      hover && (isDark 
        ? 'hover:bg-white/10 hover:border-white/20'
        : 'hover:shadow-lg hover:border-[hsl(var(--watt-bitcoin)/0.3)]'),
      className
    )}>
      {(Icon || title) && (
        <div className="flex items-start gap-4 mb-4">
          {Icon && (
            <div className={cn(
              'p-3 rounded-xl shrink-0',
              isDark 
                ? 'bg-[hsl(var(--watt-bitcoin)/0.2)]'
                : 'bg-[hsl(var(--watt-bitcoin)/0.1)]'
            )}>
              <Icon className={cn('w-6 h-6', iconColor)} />
            </div>
          )}
          {title && (
            <h3 className={cn(
              'text-xl font-bold pt-2',
              isDark ? 'text-white' : 'text-foreground'
            )}>
              {title}
            </h3>
          )}
        </div>
      )}
      <div className={cn(
        isDark ? 'text-white/80' : 'text-muted-foreground'
      )}>
        {children}
      </div>
    </div>
  );
};

export default BitcoinContentCard;
