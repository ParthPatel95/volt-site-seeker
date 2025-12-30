import React, { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BitcoinDeepDiveProps {
  title: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
  defaultOpen?: boolean;
  className?: string;
}

export const BitcoinDeepDive: React.FC<BitcoinDeepDiveProps> = ({
  title,
  children,
  theme = 'light',
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isDark = theme === 'dark';
  
  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden',
      isDark 
        ? 'bg-white/5 border-white/10'
        : 'bg-muted/30 border-border',
      className
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-5 text-left transition-colors',
          isDark 
            ? 'hover:bg-white/5'
            : 'hover:bg-muted/50'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            isDark 
              ? 'bg-[hsl(var(--watt-bitcoin)/0.2)]'
              : 'bg-[hsl(var(--watt-bitcoin)/0.1)]'
          )}>
            <BookOpen className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
          </div>
          <span className={cn(
            'font-semibold',
            isDark ? 'text-white' : 'text-foreground'
          )}>
            {title}
          </span>
        </div>
        <ChevronDown className={cn(
          'w-5 h-5 transition-transform duration-300',
          isOpen && 'rotate-180',
          isDark ? 'text-white/60' : 'text-muted-foreground'
        )} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={cn(
              'p-5 pt-0 border-t',
              isDark ? 'border-white/10' : 'border-border'
            )}>
              <div className={cn(
                'pt-5 text-sm leading-relaxed space-y-4',
                isDark ? 'text-white/80' : 'text-muted-foreground'
              )}>
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BitcoinDeepDive;
