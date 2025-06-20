
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Factory, Zap, MapPin, Eye, FileText, FileSpreadsheet } from 'lucide-react';
import { IdleIndustrySite, IdleIndustryScanStats as ScanStats } from './types';

interface IdleIndustryScanStatsProps {
  scanStats: ScanStats;
  results: IdleIndustrySite[];
  onExportCsv: () => void;
  onExportPdf: () => void;
}

export function IdleIndustryScanStats({ 
  scanStats, 
  results, 
  onExportCsv, 
  onExportPdf 
}: IdleIndustryScanStatsProps) {
  const highIdleSites = results.filter(site => site.idleScore >= 60);
  const totalFreeMW = results.reduce((sum, site) => sum + site.estimatedFreeMW, 0);
  const avgIdleScore = results.reduce((sum, site) => sum + site.idleScore, 0) / results.length;

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
              <p className="text-sm text-muted-foreground">Total Sites</p>
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Idle Sites */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Eye className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Idle (≥60)</p>
              <p className="text-2xl font-bold">{highIdleSites.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Free MW */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Free MW</p>
              <p className="text-2xl font-bold">{totalFreeMW.toFixed(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Idle Score */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Idle Score</p>
              <p className="text-2xl font-bold">{avgIdleScore.toFixed(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan Statistics */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Scan Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Industrial Sites Scanned</p>
              <p className="font-semibold">{scanStats.industrialSitesScanned}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Satellite Images Analyzed</p>
              <p className="font-semibold">{scanStats.satelliteImagesAnalyzed}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ML Analysis Success Rate</p>
              <p className="font-semibold">{(scanStats.mlAnalysisSuccessRate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Processing Time</p>
              <p className="font-semibold">{scanStats.processingTimeMinutes.toFixed(1)} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Export Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onExportCsv} variant="outline" className="flex-1">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
            <Button onClick={onExportPdf} variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Generate PDF Report
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            CSV includes all site data. PDF generates an opportunity brief for top 10 sites.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
