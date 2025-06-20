
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { SearchStats } from './UltimateFinderTypes';

interface UltimateFinderSearchStatsProps {
  searchStats: SearchStats;
  selectedCity: string;
}

export function UltimateFinderSearchStats({ searchStats, selectedCity }: UltimateFinderSearchStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Search Results Overview
          {selectedCity !== 'All Cities' && (
            <Badge variant="outline" className="ml-2">
              {selectedCity}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{searchStats.total_found}</div>
            <div className="text-sm text-blue-800 dark:text-blue-200">Total Found</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{searchStats.regulatory_sources}</div>
            <div className="text-sm text-green-800 dark:text-green-200">Regulatory</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{searchStats.satellite_detections}</div>
            <div className="text-sm text-purple-800 dark:text-purple-200">Satellite AI</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{searchStats.validated_locations}</div>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">Validated</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{searchStats.high_confidence}</div>
            <div className="text-sm text-orange-800 dark:text-orange-200">High Confidence</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
