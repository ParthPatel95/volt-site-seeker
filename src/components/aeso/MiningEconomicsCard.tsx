import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, Cpu, TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react';
import { useBitcoinNetworkStats } from '@/hooks/useBitcoinNetworkStats';

// Industry standard: Antminer S21 Pro = 15 J/TH
const MINER_EFFICIENCY_J_PER_TH = 15;
const TH_PER_MW = 1e6 / MINER_EFFICIENCY_J_PER_TH; // ~66,667 TH/s per MW

interface MiningEconomicsCardProps {
  currentAesoPrice: number; // CAD/MWh
  cadToUsd?: number; // exchange rate, default 0.73
}

export function MiningEconomicsCard({ currentAesoPrice, cadToUsd = 0.73 }: MiningEconomicsCardProps) {
  const { stats, loading } = useBitcoinNetworkStats();

  // Mining revenue per MWh (USD)
  const dailyMiningRevenue_per_MW = stats.hashPrice * TH_PER_MW;
  const hourlyMiningRevenue_per_MWh = dailyMiningRevenue_per_MW / 24;

  // Energy cost in USD/MWh
  const energyCostUsd = currentAesoPrice * cadToUsd;

  // Mining margin
  const miningMargin = hourlyMiningRevenue_per_MWh > 0
    ? ((hourlyMiningRevenue_per_MWh - energyCostUsd) / hourlyMiningRevenue_per_MWh) * 100
    : 0;

  const isProfitable = miningMargin > 0;

  const DataBadge = ({ source }: { source: 'live' | 'cached' | 'fallback' }) => {
    const styles = {
      live: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      cached: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      fallback: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    };
    return (
      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${styles[source]}`}>
        {source === 'live' ? 'LIVE' : source === 'cached' ? 'CACHED' : 'FALLBACK'}
      </Badge>
    );
  };

  return (
    <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-card to-card/50">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="relative pb-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
              <Bitcoin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Mining Economics</CardTitle>
              <p className="text-xs text-muted-foreground">BTC Mining vs AESO Energy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DataBadge source={stats.dataSource} />
            <Badge variant="outline" className="text-[10px]">S21 Pro · 15 J/TH</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4 p-6 pt-0">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Bitcoin className="w-3 h-3" /> BTC Price
            </p>
            <p className="text-lg sm:text-xl font-bold text-foreground">
              ${stats.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-muted-foreground">Coinbase Spot</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Cpu className="w-3 h-3" /> Hash Rate
            </p>
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {stats.hashrateFormatted}
            </p>
            <p className="text-[10px] text-muted-foreground">mempool.space</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Activity className="w-3 h-3" /> Hash Price
            </p>
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {stats.hashPriceFormatted}
            </p>
            <p className="text-[10px] text-muted-foreground">Revenue per TH/s/day</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" /> Mining Rev/MWh
            </p>
            <p className="text-lg sm:text-xl font-bold text-foreground">
              ${hourlyMiningRevenue_per_MWh.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground">USD/MWh equivalent</p>
          </div>
        </div>

        {/* Profitability Indicator */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${
          isProfitable 
            ? 'bg-green-500/5 border-green-500/20' 
            : 'bg-red-500/5 border-red-500/20'
        }`}>
          <div className="flex items-center gap-2">
            {isProfitable ? (
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <div>
              <p className={`text-sm font-semibold ${
                isProfitable 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {isProfitable ? 'Mining Profitable' : 'Mining Unprofitable'}
              </p>
              <p className="text-xs text-muted-foreground">
                Energy: ${energyCostUsd.toFixed(2)}/MWh · Revenue: ${hourlyMiningRevenue_per_MWh.toFixed(2)}/MWh
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-xl font-bold ${
              isProfitable 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-red-700 dark:text-red-400'
            }`}>
              {miningMargin > 0 ? '+' : ''}{miningMargin.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground">Margin</p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Block Height</p>
            <p className="text-sm font-semibold text-foreground">{stats.blockHeight.toLocaleString()}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Block Reward</p>
            <p className="text-sm font-semibold text-foreground">{stats.blockReward} BTC</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Next Halving</p>
            <p className="text-sm font-semibold text-foreground">~{stats.nextHalvingDays}d</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
