import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';

interface AESODeepDiveProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export function AESODeepDive({
  title,
  children,
  defaultOpen = false,
  theme = 'light',
  className = '',
}: AESODeepDiveProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`
        rounded-xl border overflow-hidden
        ${isDark 
          ? 'bg-white/5 border-white/10' 
          : 'bg-[hsl(var(--watt-trust)/0.03)] border-[hsl(var(--watt-trust)/0.15)]'
        }
        ${className}
      `}
    >
      {/* Header - clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between p-5 text-left transition-colors
          ${isDark 
            ? 'hover:bg-white/5' 
            : 'hover:bg-[hsl(var(--watt-trust)/0.05)]'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${isDark 
              ? 'bg-[hsl(var(--watt-trust)/0.2)]' 
              : 'bg-[hsl(var(--watt-trust)/0.1)]'
            }
          `}>
            <BookOpen className="w-5 h-5 text-[hsl(var(--watt-trust))]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[hsl(var(--watt-trust))] uppercase tracking-wider">
              Deep Dive
            </span>
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
              {title}
            </h4>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`w-5 h-5 ${isDark ? 'text-white/50' : 'text-muted-foreground'}`} />
        </motion.div>
      </button>

      {/* Content - expandable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={`
              px-5 pb-5 border-t
              ${isDark ? 'border-white/10' : 'border-[hsl(var(--watt-trust)/0.1)]'}
            `}>
              <div className={`pt-5 text-base leading-relaxed ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Step-by-step breakdown variant
interface AESOStepByStepProps {
  title: string;
  steps: {
    title: string;
    description: string;
  }[];
  theme?: 'light' | 'dark';
  className?: string;
}

export function AESOStepByStep({
  title,
  steps,
  theme = 'light',
  className = '',
}: AESOStepByStepProps) {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`
        rounded-xl p-6 border
        ${isDark 
          ? 'bg-white/5 border-white/10' 
          : 'bg-card border-border'
        }
        ${className}
      `}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${isDark 
            ? 'bg-[hsl(var(--watt-bitcoin)/0.2)]' 
            : 'bg-[hsl(var(--watt-bitcoin)/0.1)]'
          }
        `}>
          <BookOpen className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
        </div>
        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
          {title}
        </h4>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex gap-4"
          >
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${isDark 
                ? 'bg-[hsl(var(--watt-bitcoin)/0.2)] text-[hsl(var(--watt-bitcoin))]' 
                : 'bg-[hsl(var(--watt-bitcoin)/0.1)] text-[hsl(var(--watt-bitcoin))]'
              }
            `}>
              {index + 1}
            </div>
            <div className="flex-1 pt-1">
              <h5 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-foreground'}`}>
                {step.title}
              </h5>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-muted-foreground'}`}>
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
