import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlowStep {
  title: string;
  description: string;
  icon: LucideIcon;
  duration?: string;
  status?: 'complete' | 'active' | 'upcoming';
}

interface ProcessFlowchartProps {
  title: string;
  subtitle?: string;
  steps: FlowStep[];
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

export const ProcessFlowchart: React.FC<ProcessFlowchartProps> = ({
  title,
  subtitle,
  steps,
  className,
  variant = 'vertical',
}) => {
  return (
    <div className={cn('bg-card rounded-xl border border-border p-6 md:p-8', className)}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {variant === 'vertical' ? (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const statusColors = {
                complete: 'bg-emerald-500/10 border-emerald-500 text-emerald-600',
                active: 'bg-primary/10 border-primary text-primary',
                upcoming: 'bg-muted border-border text-muted-foreground',
              };
              const status = step.status || 'upcoming';

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start gap-4 pl-2"
                >
                  <div className={cn(
                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0',
                    statusColors[status]
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">Step {index + 1}</span>
                      {step.duration && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {step.duration}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground mt-0.5">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-1 min-w-[140px] text-center p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  {step.duration && (
                    <span className="text-xs text-muted-foreground mt-1 block">{step.duration}</span>
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="flex items-center pt-8">
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProcessFlowchart;
