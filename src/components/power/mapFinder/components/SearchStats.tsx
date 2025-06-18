
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3X3 } from 'lucide-react';
import { SearchStats as SearchStatsType } from '../types';

interface SearchStatsProps {
  searchStats: SearchStatsType;
  totalCells: number;
}

export function SearchStats({ searchStats, totalCells }: SearchStatsProps) {
  if (totalCells === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Grid3X3 className="w-5 h-5" />
          <span>Grid Search Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {searchStats.totalCells}
            </div>
            <div className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium">
              Total Grid Cells
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {searchStats.searchedCells}
            </div>
            <div className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">
              Searched Cells
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {searchStats.totalSubstations}
            </div>
            <div className="text-xs text-purple-600/80 dark:text-purple-400/80 font-medium">
              Total Substations
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(searchStats.totalSubstations / Math.max(searchStats.searchedCells, 1) * 100) / 100}
            </div>
            <div className="text-xs text-orange-600/80 dark:text-orange-400/80 font-medium">
              Avg per Cell
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
