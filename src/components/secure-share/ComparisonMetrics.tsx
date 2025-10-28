import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonMetricsProps {
  currentValue: number;
  previousValue: number;
  formatter?: (value: number) => string;
  label?: string;
}

export function ComparisonMetrics({ 
  currentValue, 
  previousValue, 
  formatter = (val) => val.toString(),
  label = "vs previous period"
}: ComparisonMetricsProps) {
  const percentChange = previousValue === 0 
    ? 100 
    : ((currentValue - previousValue) / previousValue) * 100;
  
  const isPositive = percentChange > 0;
  const isNeutral = percentChange === 0;
  
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        "flex items-center gap-1 font-medium",
        isNeutral && "text-muted-foreground",
        isPositive && "text-green-600 dark:text-green-500",
        !isPositive && !isNeutral && "text-red-600 dark:text-red-500"
      )}>
        <Icon className="h-4 w-4" />
        <span>{Math.abs(percentChange).toFixed(1)}%</span>
      </div>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}
