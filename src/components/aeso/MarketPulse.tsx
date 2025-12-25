import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Shield, 
  Wind, 
  Sun, 
  Gauge,
  ArrowRight,
  ArrowLeft,
  Zap,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface MarketPulseProps {
  gridStress: number; // 0-100
  reserveMargin: number; // percentage
  windGeneration: number; // MW
  solarGeneration: number; // MW
  totalDemand: number; // MW
  netInterchange: number; // MW (positive = importing, negative = exporting)
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
  const getStressLevel = (stress: number): { label: string; color: string; bgColor: string } => {
    if (stress >= 80) return { label: 'Critical', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500' };
    if (stress >= 60) return { label: 'High', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500' };
    if (stress >= 40) return { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500' };
    return { label: 'Low', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500' };
  };

  const getReserveStatus = (margin: number): { label: string; color: string; icon: React.ReactNode } => {
    if (margin >= 20) return { 
      label: 'Healthy', 
      color: 'text-green-600 dark:text-green-400', 
      icon: <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
    };
    if (margin >= 10) return { 
      label: 'Adequate', 
      color: 'text-yellow-600 dark:text-yellow-400',
      icon: <Gauge className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
    };
    return { 
      label: 'Tight', 
      color: 'text-red-600 dark:text-red-400',
      icon: <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
    };
  };

  const stressInfo = getStressLevel(gridStress);
  const reserveInfo = getReserveStatus(reserveMargin);

  const renewablePercent = totalDemand > 0 
    ? ((windGeneration + solarGeneration) / totalDemand) * 100 
    : 0;

  if (loading) {
    return (
      <Card className="border hover:border-primary/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 animate-pulse">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold">Market Pulse</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-base font-semibold">Market Pulse</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Real-time
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Grid Stress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Grid Stress</span>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${stressInfo.color} border-current`}
            >
              {stressInfo.label}
            </Badge>
          </div>
          <div className="relative">
            <Progress value={gridStress} className="h-2" />
            <div 
              className={`absolute top-0 h-2 rounded-full transition-all duration-500 ${stressInfo.bgColor}`}
              style={{ width: `${gridStress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{gridStress.toFixed(0)}/100</p>
        </div>

        {/* Reserve Margin Gauge */}
        <div className="p-3 rounded-lg bg-muted/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Reserve Margin</span>
            </div>
            <div className="flex items-center gap-1.5">
              {reserveInfo.icon}
              <span className={`text-sm font-bold ${reserveInfo.color}`}>
                {reserveMargin.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  reserveMargin >= 20 ? 'bg-green-500' :
                  reserveMargin >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(reserveMargin, 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-16 text-right">{reserveInfo.label}</span>
          </div>
        </div>

        {/* Renewable Generation */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs text-muted-foreground">Wind</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {windGeneration.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">MW</span>
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs text-muted-foreground">Solar</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {solarGeneration.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">MW</span>
            </p>
          </div>
        </div>

        {/* Renewable Percentage */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <span className="text-xs text-muted-foreground">Renewable Mix</span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {renewablePercent.toFixed(1)}% of demand
          </span>
        </div>

        {/* Interchange Flow */}
        <div className="p-3 rounded-lg bg-muted/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Net Interchange</span>
            <div className="flex items-center gap-1.5">
              {netInterchange > 0 ? (
                <>
                  <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-muted-foreground">Importing</span>
                </>
              ) : netInterchange < 0 ? (
                <>
                  <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-muted-foreground">Exporting</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Balanced</span>
              )}
            </div>
          </div>
          <p className={`text-xl font-bold text-center ${
            netInterchange > 0 ? 'text-blue-600 dark:text-blue-400' :
            netInterchange < 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'
          }`}>
            {netInterchange > 0 ? '+' : ''}{netInterchange.toLocaleString()} MW
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
