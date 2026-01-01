import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Cpu, 
  Zap, 
  Power, 
  Gauge,
  Moon,
  WifiOff,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FleetStats {
  total: number;
  mining: number;
  sleeping: number;
  offline: number;
  error: number;
  totalHashrateTh: number;
  totalPowerKw: number;
  avgEfficiency: number;
  healthPercent: number;
}

interface FleetStatsHeaderProps {
  stats: FleetStats;
  loading?: boolean;
}

export function FleetStatsHeader({ stats, loading = false }: FleetStatsHeaderProps) {
  const getHealthColor = (percent: number) => {
    if (percent >= 90) return 'text-emerald-500';
    if (percent >= 70) return 'text-yellow-500';
    return 'text-destructive';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {/* Total Miners */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Miners</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                loading && "animate-pulse"
              )}>
                {stats.total}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-500">
              <Activity className="w-3 h-3" />
              {stats.mining}
            </span>
            <span className="flex items-center gap-1 text-blue-500">
              <Moon className="w-3 h-3" />
              {stats.sleeping}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <WifiOff className="w-3 h-3" />
              {stats.offline}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Hashrate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Hashrate</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={cn(
                  "text-2xl font-bold",
                  loading && "animate-pulse"
                )}>
                  {stats.totalHashrateTh >= 1000 
                    ? (stats.totalHashrateTh / 1000).toFixed(1) 
                    : stats.totalHashrateTh.toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats.totalHashrateTh >= 1000 ? 'PH/s' : 'TH/s'}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Power */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Power</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={cn(
                  "text-2xl font-bold",
                  loading && "animate-pulse"
                )}>
                  {stats.totalPowerKw >= 1000 
                    ? (stats.totalPowerKw / 1000).toFixed(1) 
                    : stats.totalPowerKw.toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats.totalPowerKw >= 1000 ? 'MW' : 'kW'}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-orange-500/10">
              <Power className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Efficiency */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Avg Efficiency</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={cn(
                  "text-2xl font-bold",
                  loading && "animate-pulse"
                )}>
                  {stats.avgEfficiency > 0 ? stats.avgEfficiency.toFixed(1) : '--'}
                </span>
                <span className="text-sm text-muted-foreground">J/TH</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-500/10">
              <Gauge className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Health */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Fleet Health</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={cn(
                  "text-2xl font-bold",
                  getHealthColor(stats.healthPercent),
                  loading && "animate-pulse"
                )}>
                  {stats.healthPercent.toFixed(0)}
                </span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className={cn(
              "p-2.5 rounded-lg",
              stats.healthPercent >= 90 ? "bg-emerald-500/10" :
              stats.healthPercent >= 70 ? "bg-yellow-500/10" : "bg-destructive/10"
            )}>
              <Activity className={cn(
                "w-5 h-5",
                getHealthColor(stats.healthPercent)
              )} />
            </div>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-muted rounded-full h-1.5 mt-3">
            <div 
              className={cn(
                "h-1.5 rounded-full transition-all",
                stats.healthPercent >= 90 ? "bg-emerald-500" :
                stats.healthPercent >= 70 ? "bg-yellow-500" : "bg-destructive"
              )}
              style={{ width: `${Math.min(100, stats.healthPercent)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      <Card className={cn(
        stats.error > 0 && "border-destructive/50 bg-destructive/5"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Errors</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={cn(
                  "text-2xl font-bold",
                  stats.error > 0 ? "text-destructive" : "text-muted-foreground",
                  loading && "animate-pulse"
                )}>
                  {stats.error}
                </span>
              </div>
            </div>
            <div className={cn(
              "p-2.5 rounded-lg",
              stats.error > 0 ? "bg-destructive/10" : "bg-muted"
            )}>
              <AlertTriangle className={cn(
                "w-5 h-5",
                stats.error > 0 ? "text-destructive" : "text-muted-foreground"
              )} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
