import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

interface EPStepByStepProps {
  steps: Step[];
  theme?: 'light' | 'dark';
}

export const EPStepByStep = ({ steps, theme = 'light' }: EPStepByStepProps) => {
  const isDark = theme === 'dark';
  
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              isDark 
                ? "bg-primary text-primary-foreground" 
                : "bg-primary text-primary-foreground"
            )}>
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-0.5 flex-1 mt-2",
                isDark ? "bg-white/20" : "bg-border"
              )} />
            )}
          </div>
          <div className="pb-6">
            <h4 className={cn(
              "font-semibold mb-1",
              isDark ? "text-white" : "text-foreground"
            )}>
              {step.title}
            </h4>
            <p className={cn(
              "text-sm",
              isDark ? "text-white/70" : "text-muted-foreground"
            )}>
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
