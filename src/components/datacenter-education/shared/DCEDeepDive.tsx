import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, LucideIcon } from 'lucide-react';

interface DCEDeepDiveProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const DCEDeepDive: React.FC<DCEDeepDiveProps> = ({
  title,
  icon: Icon = BookOpen,
  children,
  defaultOpen = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`border border-[hsl(var(--watt-bitcoin)/0.2)] rounded-xl overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-[hsl(var(--watt-bitcoin)/0.05)] hover:bg-[hsl(var(--watt-bitcoin)/0.08)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[hsl(var(--watt-bitcoin)/0.15)]">
            <Icon className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
          </div>
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-[hsl(var(--watt-bitcoin))]" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 md:p-6 bg-card border-t border-[hsl(var(--watt-bitcoin)/0.1)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface DCEStepByStepProps {
  steps: {
    number?: number;
    title: string;
    description: string;
    icon?: LucideIcon;
  }[];
  className?: string;
}

export const DCEStepByStep: React.FC<DCEStepByStepProps> = ({
  steps,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="flex items-start gap-4"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[hsl(var(--watt-bitcoin))] text-white flex items-center justify-center font-bold text-sm">
            {step.number ?? index + 1}
          </div>
          <div className="flex-1 pt-1">
            <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface DCEProcessFlowProps {
  items: {
    icon: LucideIcon;
    label: string;
    sublabel?: string;
    color?: string;
  }[];
  className?: string;
}

export const DCEProcessFlow: React.FC<DCEProcessFlowProps> = ({
  items,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 md:gap-4 ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className={`p-4 rounded-xl ${item.color || 'bg-[hsl(var(--watt-bitcoin)/0.1)]'}`}>
              <item.icon className={`w-6 h-6 ${item.color?.includes('text-') ? '' : 'text-[hsl(var(--watt-bitcoin))]'}`} />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-foreground">{item.label}</div>
              {item.sublabel && (
                <div className="text-xs text-muted-foreground">{item.sublabel}</div>
              )}
            </div>
          </motion.div>
          {index < items.length - 1 && (
            <div className="hidden md:block w-8 h-0.5 bg-[hsl(var(--watt-bitcoin)/0.3)]" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DCEDeepDive;
