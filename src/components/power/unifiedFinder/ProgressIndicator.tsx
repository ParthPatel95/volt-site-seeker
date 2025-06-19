
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  searching: boolean;
  analyzing: boolean;
  progress: number;
}

export function ProgressIndicator({ searching, analyzing, progress }: ProgressIndicatorProps) {
  if (!searching && !analyzing) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          {searching ? 'Searching for substations...' : 'Analyzing capacity...'}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
