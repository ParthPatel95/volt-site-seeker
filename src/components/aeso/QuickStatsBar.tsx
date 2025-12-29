import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Gauge, 
  ArrowLeftRight, 
  Wind, 
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface QuickStatsBarProps {
  className?: string;
}

interface StatsData {
  ail_mw: number;
  reserve_margin_percent: number | null;
  grid_stress_score: number | null;
  intertie_bc_flow: number | null;
  intertie_sask_flow: number | null;
  intertie_montana_flow: number | null;
  renewable_penetration: number | null;
  price_spike_probability: number | null;
  pool_price: number;
  generation_wind: number | null;
  generation_solar: number | null;
  generation_gas: number | null;
}

export function QuickStatsBar({ className }: QuickStatsBarProps) {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select(`
          ail_mw, reserve_margin_percent, grid_stress_score,
          intertie_bc_flow, intertie_sask_flow, intertie_montana_flow,
          renewable_penetration, price_spike_probability, pool_price,
          generation_wind, generation_solar, generation_gas
        `)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setStats(data);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  // Calculate fallback values for derived metrics
  const totalGen = (stats.generation_wind || 0) + (stats.generation_solar || 0) + (stats.generation_gas || 0);
  const renewablePercent = stats.renewable_penetration ?? 
    (totalGen > 0 ? ((stats.generation_wind || 0) + (stats.generation_solar || 0)) / totalGen * 100 : 0);
  
  const reserveMargin = stats.reserve_margin_percent ?? 15;
  
  const stress = stats.grid_stress_score || 0;
  let spikeProb = stats.price_spike_probability;
  if (spikeProb === null || spikeProb === undefined) {
    spikeProb = 10;
    if (stats.pool_price > 100) spikeProb += 30;
    else if (stats.pool_price > 50) spikeProb += 15;
    if (stress > 70) spikeProb += 40;
    else if (stress > 40) spikeProb += 20;
    if (reserveMargin < 10) spikeProb += 20;
    else if (reserveMargin < 15) spikeProb += 10;
    spikeProb = Math.min(spikeProb, 95);
  }

  const gridStatus = (() => {
    if (stress > 70) return { label: 'Critical', color: 'text-destructive bg-destructive/10' };
    if (stress > 40) return { label: 'Warning', color: 'text-amber-500 bg-amber-500/10' };
    return { label: 'Healthy', color: 'text-emerald-500 bg-emerald-500/10' };
  })();

  const formatFlow = (flow: number | null, name: string) => {
    if (flow === null) return null;
    const direction = flow >= 0 ? '↑' : '↓';
    return `${name}: ${direction}${Math.abs(flow).toFixed(0)}`;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 bg-muted/30 border-t border-border overflow-x-auto text-[11px]",
      className
    )}>
      {/* Demand */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Activity className="w-3.5 h-3.5 text-primary" />
        <span className="text-muted-foreground">Demand:</span>
        <span className="font-mono font-semibold">{((stats.ail_mw || 0) / 1000).toFixed(1)}K MW</span>
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Reserve Margin */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Gauge className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-muted-foreground">Reserve:</span>
        <span className={cn(
          "font-mono font-semibold",
          reserveMargin < 10 ? "text-destructive" :
          reserveMargin < 15 ? "text-amber-500" : "text-emerald-500"
        )}>
          {reserveMargin.toFixed(1)}%
        </span>
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Grid Status */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Zap className={cn("w-3.5 h-3.5", gridStatus.color.split(' ')[0])} />
        <span className="text-muted-foreground">Grid:</span>
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", gridStatus.color)}>
          {gridStatus.label}
        </Badge>
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Interties */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <ArrowLeftRight className="w-3.5 h-3.5 text-purple-500" />
        <span className={cn(
          "font-mono text-[10px]",
          (stats.intertie_bc_flow || 0) < 0 ? "text-blue-500" : "text-emerald-500"
        )}>
          BC:{(stats.intertie_bc_flow || 0) >= 0 ? '+' : ''}{(stats.intertie_bc_flow || 0).toFixed(0)}
        </span>
        <span className={cn(
          "font-mono text-[10px]",
          (stats.intertie_sask_flow || 0) < 0 ? "text-blue-500" : "text-emerald-500"
        )}>
          SK:{(stats.intertie_sask_flow || 0) >= 0 ? '+' : ''}{(stats.intertie_sask_flow || 0).toFixed(0)}
        </span>
        <span className={cn(
          "font-mono text-[10px]",
          (stats.intertie_montana_flow || 0) < 0 ? "text-blue-500" : "text-emerald-500"
        )}>
          MT:{(stats.intertie_montana_flow || 0) >= 0 ? '+' : ''}{(stats.intertie_montana_flow || 0).toFixed(0)}
        </span>
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Renewable */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Wind className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-muted-foreground">Renewable:</span>
        <span className="font-mono font-semibold text-emerald-500">
          {renewablePercent.toFixed(1)}%
        </span>
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Spike Risk */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <AlertTriangle className={cn(
          "w-3.5 h-3.5",
          spikeProb > 50 ? "text-destructive" :
          spikeProb > 25 ? "text-amber-500" : "text-emerald-500"
        )} />
        <span className="text-muted-foreground">Spike Risk:</span>
        <span className={cn(
          "font-mono font-semibold",
          spikeProb > 50 ? "text-destructive" :
          spikeProb > 25 ? "text-amber-500" : "text-emerald-500"
        )}>
          {spikeProb.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
