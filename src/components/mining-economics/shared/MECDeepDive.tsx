import React, { useState } from 'react';
import { LucideIcon, ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MECDeepDiveProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  className?: string;
}

export const MECDeepDive: React.FC<MECDeepDiveProps> = ({
  title,
  children,
  icon: Icon = BookOpen,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden transition-all duration-300',
        isOpen 
          ? 'border-[hsl(var(--watt-success)/0.3)] bg-[hsl(var(--watt-success)/0.05)]'
          : 'border-border bg-muted/30 hover:bg-muted/50',
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              backgroundColor: isOpen ? 'hsl(var(--watt-success) / 0.2)' : 'hsl(var(--muted))',
            }}
          >
            <Icon 
              className="w-4 h-4"
              style={{ color: isOpen ? 'hsl(var(--watt-success))' : 'hsl(var(--muted-foreground))' }}
            />
          </div>
          <span className={cn(
            'font-semibold transition-colors',
            isOpen ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown 
            className="w-5 h-5"
            style={{ color: isOpen ? 'hsl(var(--watt-success))' : 'hsl(var(--muted-foreground))' }}
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-4 pb-4 pt-0">
              <div className="pl-11 text-sm text-muted-foreground leading-relaxed">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Step by Step Component
interface Step {
  number: number | string;
  title: string;
  description: string;
}

interface MECStepByStepProps {
  steps: Step[];
  className?: string;
}

export const MECStepByStep: React.FC<MECStepByStepProps> = ({
  steps,
  className,
}) => {
  return (
    <div className={cn('grid md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {steps.map((step, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.4 }}
          viewport={{ once: true }}
          className="bg-background/60 rounded-xl p-4 text-center border border-border/50 hover:border-[hsl(var(--watt-success)/0.3)] transition-colors"
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-3 text-white"
            style={{ backgroundColor: 'hsl(var(--watt-success))' }}
          >
            {step.number}
          </div>
          <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

// Process Flow Component
interface ProcessStep {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  color: 'success' | 'bitcoin' | 'purple' | 'red' | 'blue';
}

interface MECProcessFlowProps {
  steps: ProcessStep[];
  connectorSymbol?: string;
  className?: string;
}

const colorMap = {
  success: { bg: 'hsl(var(--watt-success) / 0.2)', text: 'hsl(var(--watt-success))' },
  bitcoin: { bg: 'hsl(var(--watt-bitcoin) / 0.2)', text: 'hsl(var(--watt-bitcoin))' },
  purple: { bg: 'hsl(var(--watt-purple) / 0.2)', text: 'hsl(var(--watt-purple))' },
  red: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
  blue: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
};

export const MECProcessFlow: React.FC<MECProcessFlowProps> = ({
  steps,
  connectorSymbol = '→',
  className,
}) => {
  return (
    <div className={cn('flex flex-col md:flex-row items-center justify-center gap-4', className)}>
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.15, duration: 0.4 }}
            viewport={{ once: true }}
            className="rounded-xl p-4 min-w-[140px] text-center"
            style={{ backgroundColor: colorMap[step.color].bg }}
          >
            <step.icon 
              className="w-6 h-6 mx-auto mb-1"
              style={{ color: colorMap[step.color].text }}
            />
            <div className="text-lg font-bold text-foreground">{step.label}</div>
            {step.sublabel && (
              <div className="text-xs text-muted-foreground">{step.sublabel}</div>
            )}
          </motion.div>
          
          {idx < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: idx * 0.15 + 0.1, duration: 0.3 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-muted-foreground hidden md:block"
            >
              {connectorSymbol}
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MECDeepDive;
