
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';

interface SearchStatsProps {
  searchStats: {
    totalCells: number;
    searchedCells: number;
    totalSubstations: number;
  };
  totalCells: number;
}

export function SearchStats({ searchStats, totalCells }: SearchStatsProps) {
  const searchProgress = totalCells > 0 ? (searchStats.searchedCells / totalCells) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <BarChart3 className="w-5 h-5" />
          <span>Search Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {searchStats.totalCells}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Cells</div>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {searchStats.searchedCells}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Searched</div>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {searchStats.totalSubstations}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Substations</div>
          </div>
          
          <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
            <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {searchProgress.toFixed(1)}%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Progress</div>
          </div>
        </div>
        
        {searchStats.searchedCells > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Active Search
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Grid-based Discovery
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
