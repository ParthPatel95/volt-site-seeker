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
    if (percent >= 90) return 'text-data-positive';
    if (percent >= 70) return 'text-data-warning';
    return 'text-data-negative';
  };

  const getHealthBg = (percent: number) => {
    if (percent >= 90) return 'bg-data-positive';
    if (percent >= 70) return 'bg-data-warning';
    return 'bg-data-negative';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Miners */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Miners</p>
            <div className="p-1.5 rounded-md bg-primary/10">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className={cn(
            "text-2xl font-bold font-mono",
            loading && "animate-pulse"
          )}>
            {stats.total}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1 text-data-positive">
              <Activity className="w-3 h-3" />
              {stats.mining}
            </span>
            <span className="flex items-center gap-1 text-primary">
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
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Hashrate</p>
            <div className="p-1.5 rounded-md bg-data-positive/10">
              <Zap className="w-4 h-4 text-data-positive" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-2xl font-bold font-mono",
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
        </CardContent>
      </Card>

      {/* Total Power */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Power</p>
            <div className="p-1.5 rounded-md bg-data-warning/10">
              <Power className="w-4 h-4 text-data-warning" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-2xl font-bold font-mono",
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
        </CardContent>
      </Card>

      {/* Efficiency */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Efficiency</p>
            <div className="p-1.5 rounded-md bg-primary/10">
              <Gauge className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-2xl font-bold font-mono",
              loading && "animate-pulse"
            )}>
              {stats.avgEfficiency > 0 ? stats.avgEfficiency.toFixed(1) : '--'}
            </span>
            <span className="text-sm text-muted-foreground">J/TH</span>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Health */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Health</p>
            <div className={cn(
              "p-1.5 rounded-md",
              stats.healthPercent >= 90 ? "bg-data-positive/10" :
              stats.healthPercent >= 70 ? "bg-data-warning/10" : "bg-data-negative/10"
            )}>
              <Activity className={cn("w-4 h-4", getHealthColor(stats.healthPercent))} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-2xl font-bold font-mono",
              getHealthColor(stats.healthPercent),
              loading && "animate-pulse"
            )}>
              {stats.healthPercent.toFixed(0)}
            </span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1 mt-2">
            <div 
              className={cn("h-1 rounded-full transition-all", getHealthBg(stats.healthPercent))}
              style={{ width: `${Math.min(100, stats.healthPercent)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      <Card className={cn(stats.error > 0 && "border-data-negative/50")}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Errors</p>
            <div className={cn(
              "p-1.5 rounded-md",
              stats.error > 0 ? "bg-data-negative/10" : "bg-muted"
            )}>
              <AlertTriangle className={cn(
                "w-4 h-4",
                stats.error > 0 ? "text-data-negative" : "text-muted-foreground"
              )} />
            </div>
          </div>
          <span className={cn(
            "text-2xl font-bold font-mono",
            stats.error > 0 ? "text-data-negative" : "text-muted-foreground",
            loading && "animate-pulse"
          )}>
            {stats.error}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
