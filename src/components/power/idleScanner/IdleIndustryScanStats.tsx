
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Factory, Zap, MapPin, Eye, FileText, FileSpreadsheet } from 'lucide-react';
import { IdleIndustryScanStats as ScanStats } from './types';

interface IdleIndustryScanStatsProps {
  stats: ScanStats;
}

export function IdleIndustryScanStats({ stats }: IdleIndustryScanStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Sites Found */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Factory className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sites Scanned</p>
              <p className="text-2xl font-bold">{stats.industrialSitesScanned}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Satellite Images Analyzed */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Eye className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Images Analyzed</p>
              <p className="text-2xl font-bold">{stats.satelliteImagesAnalyzed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ML Analysis Success Rate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ML Success Rate</p>
              <p className="text-2xl font-bold">{(stats.mlAnalysisSuccessRate * 100).toFixed(0)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Time */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processing Time</p>
              <p className="text-2xl font-bold">{stats.processingTimeMinutes.toFixed(1)}m</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
