
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Grid3X3 } from 'lucide-react';

interface ProgressOverlayProps {
  searching: boolean;
  analyzing: boolean;
  progress: number;
  searchStats: {
    totalCells: number;
    searchedCells: number;
    totalSubstations: number;
  };
}

export function ProgressOverlay({
  searching,
  analyzing,
  progress,
  searchStats
}: ProgressOverlayProps) {
  if (!searching && !analyzing) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
      <Card className="p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
        <div className="space-y-3 sm:space-y-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            <span className="font-medium text-sm sm:text-base">
              {searching ? 'Searching Grid Cells...' : 'Analyzing Capacity...'}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="text-xs sm:text-sm text-gray-600">
            {searching && (
              <div className="space-y-1">
                <div>Grid: {searchStats.searchedCells}/{searchStats.totalCells} cells</div>
                <div>Found: {searchStats.totalSubstations} substations</div>
              </div>
            )}
            {analyzing && (
              <div>
                Analyzing capacity for discovered substations...
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
