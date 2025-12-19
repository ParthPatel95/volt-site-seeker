import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Award, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface Section {
  id: string;
  title: string;
  anchor: string;
}

interface ProgressTrackerProps {
  moduleTitle: string;
  sections: Section[];
  completedSections: string[];
  onToggleSection: (sectionId: string) => void;
  onReset: () => void;
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  moduleTitle,
  sections,
  completedSections,
  onToggleSection,
  onReset,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const completedCount = completedSections.length;
  const totalSections = sections.length;
  const percentage = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;
  const isComplete = completedCount === totalSections;

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className={cn(
      'bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden',
      className
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Award className="w-6 h-6 text-yellow-500" />
            </motion.div>
          ) : (
            <div className="relative w-6 h-6">
              <svg className="w-6 h-6 -rotate-90">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${percentage * 0.628} 62.8`}
                  className="text-primary"
                />
              </svg>
            </div>
          )}
          <div className="text-left">
            <h3 className="font-semibold text-foreground text-sm">{moduleTitle}</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount}/{totalSections} complete ({percentage}%)
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className={cn('h-full', isComplete ? 'bg-yellow-500' : 'bg-primary')}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Section list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-1 max-h-[300px] overflow-y-auto">
              {sections.map((section, index) => {
                const isCompleted = completedSections.includes(section.id);
                return (
                  <div
                    key={section.id}
                    className="flex items-center gap-2 group"
                  >
                    <button
                      onClick={() => onToggleSection(section.id)}
                      className={cn(
                        'flex-shrink-0 p-0.5 rounded transition-colors',
                        isCompleted ? 'text-green-500' : 'text-muted-foreground hover:text-primary'
                      )}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => scrollToSection(section.anchor)}
                      className={cn(
                        'text-left text-sm truncate flex-1 transition-colors',
                        isCompleted
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground hover:text-primary'
                      )}
                    >
                      {index + 1}. {section.title}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer actions */}
            <div className="p-3 border-t border-border flex justify-between items-center">
              <button
                onClick={onReset}
                className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Progress
              </button>
              {isComplete && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-medium text-yellow-600 dark:text-yellow-400"
                >
                  🎉 Module Complete!
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
