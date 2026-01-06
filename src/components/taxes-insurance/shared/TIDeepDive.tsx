import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TIDeepDiveProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  theme?: 'light' | 'dark';
}

export const TIDeepDive: React.FC<TIDeepDiveProps> = ({
  title,
  children,
  icon: Icon,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "rounded-xl overflow-hidden border",
        isDark ? "bg-white/5 border-white/10" : "bg-card border-border"
      )}
    >
      <div className={cn(
        "px-5 py-4 flex items-center gap-3 border-b",
        isDark ? "bg-white/5 border-white/10" : "bg-muted border-border"
      )}>
        {Icon && <Icon className="w-5 h-5" style={{ color: 'hsl(var(--watt-purple))' }} />}
        <h4 className={cn("font-semibold", isDark ? "text-white" : "text-foreground")}>{title}</h4>
      </div>
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );
};

interface Step {
  title: string;
  description: string;
  icon?: LucideIcon;
}

interface TIStepByStepProps {
  steps: Step[];
  theme?: 'light' | 'dark';
}

export const TIStepByStep: React.FC<TIStepByStepProps> = ({ steps, theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-4">
      {steps.map((step, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-start gap-4"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
            style={{ backgroundColor: 'hsl(var(--watt-purple))' }}
          >
            {idx + 1}
          </div>
          <div>
            <h5 className={cn("font-medium mb-1", isDark ? "text-white" : "text-foreground")}>{step.title}</h5>
            <p className={cn("text-sm", isDark ? "text-white/60" : "text-muted-foreground")}>{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface ProcessStep {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  color: 'purple' | 'bitcoin' | 'success' | 'red';
}

interface TIProcessFlowProps {
  steps: ProcessStep[];
  connectorSymbol?: string;
  theme?: 'light' | 'dark';
}

const colorMap = {
  purple: 'hsl(var(--watt-purple))',
  bitcoin: 'hsl(var(--watt-bitcoin))',
  success: 'hsl(var(--watt-success))',
  red: 'hsl(0, 84%, 60%)',
};

export const TIProcessFlow: React.FC<TIProcessFlowProps> = ({
  steps,
  connectorSymbol = '→',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "flex flex-col items-center p-4 rounded-xl min-w-[100px]",
              isDark ? "bg-white/5" : "bg-muted"
            )}
          >
            <step.icon className="w-8 h-8 mb-2" style={{ color: colorMap[step.color] }} />
            <span className={cn("font-medium text-sm", isDark ? "text-white" : "text-foreground")}>{step.label}</span>
            {step.sublabel && (
              <span className={cn("text-xs mt-1", isDark ? "text-white/50" : "text-muted-foreground")}>{step.sublabel}</span>
            )}
          </motion.div>
          {idx < steps.length - 1 && (
            <span className={cn("text-2xl font-bold", isDark ? "text-white/30" : "text-muted-foreground")}>
              {connectorSymbol}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
