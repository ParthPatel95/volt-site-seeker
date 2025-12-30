import React from 'react';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BitcoinQuoteProps {
  quote: string;
  author: string;
  role?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

export const BitcoinQuote: React.FC<BitcoinQuoteProps> = ({
  quote,
  author,
  role,
  theme = 'light',
  className,
}) => {
  const isDark = theme === 'dark';
  
  return (
    <blockquote className={cn(
      'relative rounded-2xl p-6 md:p-8 border-l-4',
      isDark 
        ? 'bg-white/5 border-[hsl(var(--watt-bitcoin))]'
        : 'bg-muted/50 border-[hsl(var(--watt-bitcoin))]',
      className
    )}>
      <Quote className={cn(
        'absolute top-4 right-4 w-8 h-8 opacity-20',
        isDark ? 'text-white' : 'text-foreground'
      )} />
      
      <p className={cn(
        'text-lg md:text-xl italic leading-relaxed mb-4',
        isDark ? 'text-white/90' : 'text-foreground'
      )}>
        "{quote}"
      </p>
      
      <footer className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
          'bg-[hsl(var(--watt-bitcoin)/0.2)] text-[hsl(var(--watt-bitcoin))]'
        )}>
          {author.charAt(0)}
        </div>
        <div>
          <cite className={cn(
            'font-semibold not-italic block',
            isDark ? 'text-white' : 'text-foreground'
          )}>
            {author}
          </cite>
          {role && (
            <span className={cn(
              'text-sm',
              isDark ? 'text-white/60' : 'text-muted-foreground'
            )}>
              {role}
            </span>
          )}
        </div>
      </footer>
    </blockquote>
  );
};

export default BitcoinQuote;
