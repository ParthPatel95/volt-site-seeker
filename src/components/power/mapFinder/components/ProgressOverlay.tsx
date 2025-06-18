
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
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
      <Card className="p-6 min-w-[300px]">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Grid3X3 className="w-5 h-5 animate-pulse" />
            <span className="font-medium">
              {searching ? 'Searching Grid Cells...' : 'Analyzing Capacity...'}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="text-sm text-gray-600">
            {searching && (
              <div>
                Grid: {searchStats.searchedCells}/{searchStats.totalCells} cells
                <br />
                Found: {searchStats.totalSubstations} substations
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
