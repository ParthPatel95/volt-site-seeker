import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Shield, 
  Wind, 
  Sun, 
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketPulseProps {
  gridStress: number;
  reserveMargin: number;
  windGeneration: number;
  solarGeneration: number;
  totalDemand: number;
  netInterchange: number;
  loading?: boolean;
}

export function MarketPulse({
  gridStress,
  reserveMargin,
  windGeneration,
  solarGeneration,
  totalDemand,
  netInterchange,
  loading
}: MarketPulseProps) {
  const getStressLevel = (stress: number) => {
    if (stress >= 80) return { label: 'Critical', variant: 'error' as const };
    if (stress >= 60) return { label: 'High', variant: 'warning' as const };
    if (stress >= 40) return { label: 'Moderate', variant: 'info' as const };
    return { label: 'Low', variant: 'success' as const };
  };

  const getReserveStatus = (margin: number) => {
    if (margin >= 20) return { 
      label: 'Healthy', 
      variant: 'success' as const,
      icon: CheckCircle2
    };
    if (margin >= 10) return { 
      label: 'Adequate', 
      variant: 'warning' as const,
      icon: Shield
    };
    return { 
      label: 'Tight', 
      variant: 'error' as const,
      icon: AlertTriangle
    };
  };

  const stressInfo = getStressLevel(gridStress);
  const reserveInfo = getReserveStatus(reserveMargin);
  const ReserveIcon = reserveInfo.icon;

  const renewablePercent = totalDemand > 0 
    ? ((windGeneration + solarGeneration) / totalDemand) * 100 
    : 0;

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold">Market Pulse</CardTitle>
          </div>
          <Badge variant="muted" className="text-[10px] font-mono">
            LIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Grid Stress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Grid Stress</span>
            <Badge variant={stressInfo.variant} className="text-xs font-mono">
              {stressInfo.label}
            </Badge>
          </div>
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                gridStress >= 80 ? "bg-data-negative" :
                gridStress >= 60 ? "bg-data-warning" :
                gridStress >= 40 ? "bg-primary" : "bg-data-positive"
              )}
              style={{ width: `${gridStress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>0</span>
            <span>{gridStress.toFixed(0)}/100</span>
          </div>
        </div>

        {/* Reserve Margin */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Reserve Margin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ReserveIcon className={cn(
                "w-3.5 h-3.5",
                reserveInfo.variant === 'success' && "text-data-positive",
                reserveInfo.variant === 'warning' && "text-data-warning",
                reserveInfo.variant === 'error' && "text-data-negative"
              )} />
              <span className="text-sm font-bold font-mono">
                {reserveMargin.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                reserveMargin >= 20 ? "bg-data-positive" :
                reserveMargin >= 10 ? "bg-data-warning" : "bg-data-negative"
              )}
              style={{ width: `${Math.min(reserveMargin, 100)}%` }}
            />
          </div>
        </div>

        {/* Renewable Generation */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wind className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Wind</span>
            </div>
            <p className="text-lg font-bold font-mono">
              {windGeneration.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-1">MW</span>
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sun className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Solar</span>
            </div>
            <p className="text-lg font-bold font-mono">
              {solarGeneration.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground ml-1">MW</span>
            </p>
          </div>
        </div>

        {/* Renewable Mix */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-data-positive/5 border border-data-positive/20">
          <span className="text-xs text-muted-foreground">Renewable Mix</span>
          <span className="text-sm font-bold font-mono text-data-positive">
            {renewablePercent.toFixed(1)}%
          </span>
        </div>

        {/* Net Interchange */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Net Interchange</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {netInterchange > 0 ? (
                <>
                  <ArrowLeft className="w-3.5 h-3.5 text-primary" />
                  <span>Import</span>
                </>
              ) : netInterchange < 0 ? (
                <>
                  <ArrowRight className="w-3.5 h-3.5 text-data-positive" />
                  <span>Export</span>
                </>
              ) : (
                <span>Balanced</span>
              )}
            </div>
          </div>
          <p className={cn(
            "text-xl font-bold font-mono text-center",
            netInterchange > 0 ? "text-primary" :
            netInterchange < 0 ? "text-data-positive" : "text-foreground"
          )}>
            {netInterchange > 0 ? '+' : ''}{netInterchange.toLocaleString()} MW
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
