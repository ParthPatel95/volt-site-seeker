import React from 'react';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SectionCompleteProps {
  sectionId: string;
  sectionTitle: string;
  isComplete: boolean;
  onToggle: () => void;
  nextSection?: {
    title: string;
    anchor: string;
  };
  className?: string;
}

export const SectionComplete: React.FC<SectionCompleteProps> = ({
  sectionTitle,
  isComplete,
  onToggle,
  nextSection,
  className,
}) => {
  const scrollToNext = () => {
    if (nextSection) {
      const element = document.getElementById(nextSection.anchor);
      if (element) {
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border transition-colors',
      isComplete
        ? 'bg-green-500/5 border-green-500/30'
        : 'bg-muted/30 border-border',
      className
    )}>
      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={isComplete}
        aria-label={isComplete ? `Mark ${sectionTitle} as incomplete` : `Mark ${sectionTitle} as complete`}
        className={cn(
          'flex items-center gap-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1',
          isComplete ? 'text-green-600 dark:text-green-400' : 'text-foreground hover:text-primary'
        )}
      >
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="incomplete"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Circle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="font-medium">
          {isComplete ? (
            <>✓ Completed: {sectionTitle}</>
          ) : (
            <>Mark "{sectionTitle}" as complete</>
          )}
        </span>
      </button>

      {nextSection && (
        <button
          onClick={scrollToNext}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Next: {nextSection.title}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
