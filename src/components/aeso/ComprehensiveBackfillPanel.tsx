import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  CloudDownload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Calendar,
  Thermometer,
  Zap,
  Wind,
  TrendingUp,
  StopCircle
} from 'lucide-react';
import { useComprehensiveBackfill } from '@/hooks/useComprehensiveBackfill';

interface CoverageItemProps {
  label: string;
  icon: React.ReactNode;
  coverage: number;
  color: string;
}

function CoverageItem({ label, icon, coverage, color }: CoverageItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-muted-foreground">{coverage}%</span>
        </div>
        <Progress value={coverage} className="h-2" />
      </div>
    </div>
  );
}

export function ComprehensiveBackfillPanel() {
  const {
    status,
    progress,
    loading,
    fetchStatus,
    startBackfill,
    stopBackfill,
    percentComplete
  } = useComprehensiveBackfill();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const getPhaseLabel = (phase: string | null) => {
    switch (phase) {
      case 'prices': return 'Pool Prices';
      case 'weather': return 'Weather Data';
      case 'demand': return 'Demand (AIL)';
      case 'generation': return 'Generation Mix';
      case 'all': return 'All Data Types';
      default: return '';
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              8-Year Historical Data Collection
            </CardTitle>
            <CardDescription className="mt-1">
              Collect comprehensive AESO market data from January 2018 to present (~70,000 hourly records)
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            2018 - Present
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data Coverage */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Current Data Coverage
              </h4>
              
              <div className="space-y-3">
                <CoverageItem 
                  label="Weather (Temp, Wind, Cloud)"
                  icon={<Thermometer className="w-4 h-4 text-blue-600" />}
                  coverage={status.coverage.weather}
                  color="bg-blue-100 dark:bg-blue-900/30"
                />
                <CoverageItem 
                  label="Demand (AIL MW)"
                  icon={<Zap className="w-4 h-4 text-amber-600" />}
                  coverage={status.coverage.demand}
                  color="bg-amber-100 dark:bg-amber-900/30"
                />
                <CoverageItem 
                  label="Generation Mix"
                  icon={<Wind className="w-4 h-4 text-green-600" />}
                  coverage={status.coverage.generation}
                  color="bg-green-100 dark:bg-green-900/30"
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Collection Status
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-2xl font-bold">{status.totalRecords.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Current Records</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-2xl font-bold">{status.estimatedRecordsNeeded.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Target (8 Years)</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 col-span-2">
                  <p className="text-sm">
                    <span className="font-medium">Date Range:</span>{' '}
                    {status.dateRange.start ? new Date(status.dateRange.start).toLocaleDateString() : 'N/A'}
                    {' → '}
                    {status.dateRange.end ? new Date(status.dateRange.end).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {status.targetRange.start} to {status.targetRange.end}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backfill Progress */}
        {progress.isRunning && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="font-medium">
                  Backfilling {getPhaseLabel(progress.currentPhase)}...
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={stopBackfill}
                className="gap-1"
              >
                <StopCircle className="w-3 h-3" />
                Stop
              </Button>
            </div>
            
            <Progress value={percentComplete} className="h-3" />
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {progress.completedMonths} / {progress.totalMonths} months processed
              </span>
              <span>{progress.estimatedTimeRemaining}</span>
            </div>
            
            <p className="text-sm">
              {progress.recordsProcessed.toLocaleString()} records processed
            </p>

            {progress.errors.length > 0 && (
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                {progress.errors.length} warning(s) - check console for details
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => fetchStatus()}
            variant="outline"
            disabled={loading || progress.isRunning}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh Status
          </Button>

          <Button
            onClick={() => startBackfill('all')}
            disabled={progress.isRunning}
            className="gap-2"
          >
            <CloudDownload className="w-4 h-4" />
            Start 8-Year Backfill
          </Button>

          <div className="flex gap-2 border-l pl-3 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startBackfill('prices')}
              disabled={progress.isRunning}
              className="gap-1"
            >
              <TrendingUp className="w-3 h-3" />
              Prices Only
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startBackfill('weather')}
              disabled={progress.isRunning}
              className="gap-1"
            >
              <Thermometer className="w-3 h-3" />
              Weather Only
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startBackfill('demand')}
              disabled={progress.isRunning}
              className="gap-1"
            >
              <Zap className="w-3 h-3" />
              Demand Only
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startBackfill('generation')}
              disabled={progress.isRunning}
              className="gap-1"
            >
              <Wind className="w-3 h-3" />
              Generation Only
            </Button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <p className="font-medium mb-1">Data Sources:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Pool Prices: AESO Historical Pool Price API (2001-Present)</li>
            <li>Weather: Open-Meteo Archive API (1940-Present) - Calgary & Edmonton</li>
            <li>Demand (AIL): AESO Alberta Internal Load API</li>
            <li>Generation: AESO Current Supply Demand API</li>
          </ul>
          <p className="mt-2 text-amber-600 dark:text-amber-400">
            ⏱️ Estimated time for full 8-year backfill: ~30-45 minutes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
