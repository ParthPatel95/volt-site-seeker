import React from 'react';
import { Info, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CitedStatisticProps {
  /** The value to display prominently */
  value: string | number;
  /** Optional unit (e.g., "dBA", "%", "cal/cm²") */
  unit?: string;
  /** Description label */
  label?: string;
  /** Source name for citation */
  source: string;
  /** Source URL for reference */
  sourceUrl?: string;
  /** When the data was last verified */
  lastUpdated?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant for the value */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'bitcoin';
}

const CitedStatistic: React.FC<CitedStatisticProps> = ({
  value,
  unit,
  label,
  source,
  sourceUrl,
  lastUpdated = 'December 2024',
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const variantClasses = {
    default: 'text-foreground',
    success: 'text-watt-success',
    warning: 'text-amber-500',
    danger: 'text-destructive',
    bitcoin: 'text-watt-bitcoin',
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 cursor-help ${className}`}>
            <span className={`font-bold ${sizeClasses[size]} ${variantClasses[variant]}`}>
              {value}
              {unit && <span className="text-[0.7em] ml-0.5 font-medium">{unit}</span>}
            </span>
            <Info className="w-3 h-3 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs bg-card border border-border shadow-lg"
        >
          <div className="space-y-1.5">
            {label && (
              <p className="text-sm font-medium text-foreground">{label}</p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Source:</span>
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-watt-bitcoin hover:underline inline-flex items-center gap-0.5"
                >
                  {source}
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ) : (
                <span className="text-foreground">{source}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground/70">
              Last verified: {lastUpdated}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CitedStatistic;
