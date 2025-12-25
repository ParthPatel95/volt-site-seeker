import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Clock } from 'lucide-react';
import { format } from 'date-fns';

type TimeRange = '1H' | '4H' | '24H' | '48H' | '72H' | '1W';

interface TimeRangeSelectorProps {
  activeRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  aiPredictionCount?: number;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1H', label: '1H' },
  { value: '4H', label: '4H' },
  { value: '24H', label: '1D' },
  { value: '48H', label: '2D' },
  { value: '72H', label: '3D' },
  { value: '1W', label: '1W' },
];

export function TimeRangeSelector({
  activeRange,
  onRangeChange,
  aiPredictionCount = 0
}: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20">
      {/* Time Range Buttons */}
      <div className="flex items-center gap-0.5 bg-background rounded-md p-0.5 border border-border">
        {TIME_RANGES.map((range) => (
          <Button
            key={range.value}
            variant={activeRange === range.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onRangeChange(range.value)}
            className={`h-6 px-2.5 text-[10px] font-medium ${
              activeRange === range.value 
                ? '' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        {/* AI Predictions Count */}
        {aiPredictionCount > 0 && (
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-emerald-500" />
            <span>{aiPredictionCount} predictions</span>
          </div>
        )}
        
        <div className="h-3 w-px bg-border" />
        
        {/* Timestamp */}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{format(new Date(), 'HH:mm:ss')} UTC</span>
        </div>
        
        {/* Live indicator */}
        <div className="flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>Live</span>
        </div>
      </div>
    </div>
  );
}
