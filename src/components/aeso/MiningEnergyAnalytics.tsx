import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bitcoin, Cpu, Activity, Zap, TrendingUp, TrendingDown, DollarSign, Gauge, Flame, BarChart3 } from 'lucide-react';
import { useBitcoinNetworkStats } from '@/hooks/useBitcoinNetworkStats';

// Industry standard: Antminer S21 Pro = 15 J/TH
const MINER_EFFICIENCY_J_PER_TH = 15;
const TH_PER_MW = 1e6 / MINER_EFFICIENCY_J_PER_TH; // ~66,667 TH/s per MW

interface MiningEnergyAnalyticsProps {
  currentAesoPrice: number; // CAD/MWh
  cadToUsd?: number;
}

function MetricCell({ icon: Icon, label, value, sub, className = '' }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-0.5 ${className}`}>
      <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
        <Icon className="w-3 h-3 shrink-0" /> {label}
      </p>
      <p className="text-sm sm:text-base lg:text-lg font-bold text-foreground truncate">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}

export function MiningEnergyAnalytics({ currentAesoPrice, cadToUsd = 0.73 }: MiningEnergyAnalyticsProps) {
  const { stats, loading } = useBitcoinNetworkStats();

  // === Core calculations ===
  const energyCostUsd = currentAesoPrice * cadToUsd;
  const dailyRevPerMW = stats.hashPrice * TH_PER_MW;
  const hourlyRevPerMWh = dailyRevPerMW / 24;

  // Break-even: max energy price where margin = 0
  const breakEvenUsdPerMWh = hourlyRevPerMWh;
  const breakEvenCadPerMWh = breakEvenUsdPerMWh / cadToUsd;

  // Net profit per MWh
  const netProfitPerMWh = hourlyRevPerMWh - energyCostUsd;

  // Cost to mine 1 BTC
  const dailyBtcForOneMW = stats.price > 0 ? (stats.hashPrice * TH_PER_MW) / stats.price : 0;
  const costToMine1BTC = dailyBtcForOneMW > 0
    ? (energyCostUsd * 24) / dailyBtcForOneMW
    : Infinity;

  // Sats per kWh
  const satsPerKwh = dailyBtcForOneMW > 0
    ? (dailyBtcForOneMW * 1e8) / (24 * 1000)
    : 0;

  // Energy cost ratio (% of revenue going to energy)
  const energyCostRatio = hourlyRevPerMWh > 0
    ? (energyCostUsd / hourlyRevPerMWh) * 100
    : 100;

  // Mining margin
  const miningMargin = 100 - Math.min(energyCostRatio, 100);
  const isProfitable = miningMargin > 0;

  // Daily revenue per MW deployed
  const dailyRevPerMWFormatted = dailyRevPerMW > 1000
    ? `$${(dailyRevPerMW / 1000).toFixed(1)}k`
    : `$${dailyRevPerMW.toFixed(0)}`;

  const DataBadge = ({ source }: { source: 'live' | 'cached' | 'fallback' }) => {
    const styles = {
      live: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      cached: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      fallback: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    };
    return (
      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${styles[source]}`}>
        {source === 'live' ? '● LIVE' : source === 'cached' ? '● CACHED' : '● FALLBACK'}
      </Badge>
    );
  };

  return (
    <Card className="group relative overflow-hidden border hover:border-primary/40 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-card to-card/80">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
              <Bitcoin className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Mining & Energy Analytics</CardTitle>
              <p className="text-[11px] text-muted-foreground">BTC Mining × AESO Energy Cross-Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DataBadge source={stats.dataSource} />
            <Badge variant="outline" className="text-[9px]">S21 Pro · 15 J/TH</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 pt-0">
        {/* Row 1: Core BTC Network Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCell
            icon={Bitcoin}
            label="BTC Price"
            value={`$${stats.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            sub="Coinbase Spot"
          />
          <MetricCell
            icon={Cpu}
            label="Hash Rate"
            value={stats.hashrateFormatted}
            sub="mempool.space"
          />
          <MetricCell
            icon={Activity}
            label="Hash Price"
            value={stats.hashPriceFormatted}
            sub="Revenue per TH/s/day"
          />
          <MetricCell
            icon={Gauge}
            label="Difficulty"
            value={stats.difficulty > 1e12
              ? `${(stats.difficulty / 1e12).toFixed(1)}T`
              : `${(stats.difficulty / 1e9).toFixed(1)}B`}
            sub="Network difficulty"
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Row 2: Energy-Mining Cross Analytics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCell
            icon={Zap}
            label="Mining Rev/MWh"
            value={`$${hourlyRevPerMWh.toFixed(2)}`}
            sub="USD per MWh equivalent"
          />
          <MetricCell
            icon={DollarSign}
            label="Energy Cost"
            value={`$${energyCostUsd.toFixed(2)}/MWh`}
            sub={`C$${currentAesoPrice.toFixed(2)} AESO Pool`}
          />
          <MetricCell
            icon={isProfitable ? TrendingUp : TrendingDown}
            label="Net Profit/MWh"
            value={`${netProfitPerMWh >= 0 ? '+' : ''}$${netProfitPerMWh.toFixed(2)}`}
            sub="Revenue minus energy"
            className={isProfitable ? 'text-green-600 dark:text-green-400' : ''}
          />
          <MetricCell
            icon={BarChart3}
            label="Break-even Price"
            value={`$${breakEvenUsdPerMWh.toFixed(2)}/MWh`}
            sub={`C$${breakEvenCadPerMWh.toFixed(2)} max`}
          />
        </div>

        {/* Row 3: Profitability Margin Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Energy Cost Ratio</span>
            <span className={`font-bold ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isProfitable ? 'PROFITABLE' : 'UNPROFITABLE'} · {miningMargin > 0 ? '+' : ''}{miningMargin.toFixed(1)}% margin
            </span>
          </div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-4 rounded-full overflow-hidden flex bg-muted cursor-default">
                  <div
                    className="bg-red-500 dark:bg-red-600 h-full transition-all duration-500"
                    style={{ width: `${Math.min(energyCostRatio, 100)}%` }}
                  />
                  {isProfitable && (
                    <div className="bg-green-500 dark:bg-green-600 h-full flex-1 transition-all duration-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p>Energy costs consume {energyCostRatio.toFixed(1)}% of mining revenue</p>
                <p className="text-muted-foreground">{isProfitable ? `${miningMargin.toFixed(1)}% remains as profit` : 'Mining is unprofitable at this energy price'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>0% (free energy)</span>
            <span>100% (break-even)</span>
          </div>
        </div>

        {/* Row 4: Key Ratios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Flame className="w-3 h-3" /> Cost to Mine 1 BTC
            </p>
            <p className="text-sm font-bold text-foreground">
              {costToMine1BTC < Infinity && costToMine1BTC > 0
                ? `$${costToMine1BTC.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : '—'}
            </p>
            <p className="text-[9px] text-muted-foreground">Energy cost only</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" /> Sats per kWh
            </p>
            <p className="text-sm font-bold text-foreground">
              {satsPerKwh > 0 ? satsPerKwh.toFixed(1) : '—'} sats
            </p>
            <p className="text-[9px] text-muted-foreground">Mining yield per kWh</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Daily Rev/MW
            </p>
            <p className="text-sm font-bold text-foreground">{dailyRevPerMWFormatted}</p>
            <p className="text-[9px] text-muted-foreground">Per MW deployed</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Activity className="w-3 h-3" /> Energy Cost %
            </p>
            <p className="text-sm font-bold text-foreground">{energyCostRatio.toFixed(1)}%</p>
            <p className="text-[9px] text-muted-foreground">Of mining revenue</p>
          </div>
        </div>

        {/* Row 5: Network Footer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
          <span>Block <span className="font-semibold text-foreground">{stats.blockHeight.toLocaleString()}</span></span>
          <span>Reward <span className="font-semibold text-foreground">{stats.blockReward} BTC</span></span>
          <span>Halving <span className="font-semibold text-foreground">~{stats.nextHalvingDays}d</span></span>
          <span className="ml-auto text-[10px]">
            Updated {stats.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
