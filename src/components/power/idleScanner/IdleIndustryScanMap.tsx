
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Zap, Factory, Eye } from 'lucide-react';
import { IdleIndustrySite, IdleIndustryScanFilters } from './types';

interface IdleIndustryScanMapProps {
  results: IdleIndustrySite[];
  filters: IdleIndustryScanFilters;
}

export function IdleIndustryScanMap({ results, filters }: IdleIndustryScanMapProps) {
  const filteredResults = results.filter(site => {
    return (
      site.idleScore >= filters.minIdleScore &&
      site.estimatedFreeMW >= filters.minFreeMW &&
      site.substationDistanceKm <= filters.maxSubstationDistance
    );
  });

  const getIdleScoreColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Interactive Map ({filteredResults.length} sites)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center min-h-[500px] flex flex-col items-center justify-center">
          <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Interactive Map Coming Soon</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            The interactive map will display all discovered idle industrial sites with color-coded pins based on idle scores.
          </p>
          
          {/* Map Legend */}
          <div className="bg-white dark:bg-slate-700 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Map Legend</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Critical Idle (80-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>High Idle (60-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Medium Idle (40-59)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Low Idle (0-39)</span>
              </div>
            </div>
          </div>

          {/* Sample Pins Preview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {filteredResults.slice(0, 4).map((site) => (
              <div key={site.id} className="bg-white dark:bg-slate-700 rounded-lg p-3 border">
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 ${getIdleScoreColor(site.idleScore)} rounded-full mt-1`}></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{site.name}</h4>
                    <p className="text-xs text-muted-foreground">{site.city}, {site.state}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {site.idleScore}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {site.estimatedFreeMW}MW
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
