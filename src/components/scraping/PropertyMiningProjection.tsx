import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Bitcoin, Zap, DollarSign, Clock } from 'lucide-react';
import { useBitcoinNetworkStats } from '@/hooks/useBitcoinNetworkStats';

interface PropertyMiningProjectionProps {
  powerCapacityMw?: number | null;
  electricityRate?: number | null; // $/kWh
  askingPrice?: number | null;
}

export function PropertyMiningProjection({
  powerCapacityMw,
  electricityRate,
  askingPrice,
}: PropertyMiningProjectionProps) {
  const { stats, loading } = useBitcoinNetworkStats();

  const projection = useMemo(() => {
    if (!powerCapacityMw || powerCapacityMw <= 0) return null;

    const mw = powerCapacityMw;
    const rate = electricityRate || 0.05; // Default 5¢/kWh if unknown
    const kw = mw * 1000;

    // Assume modern S21 class miners: ~17.5 J/TH, 200 TH/s per unit
    const minerEfficiency = 17.5; // J/TH
    const minerHashrate = 200; // TH/s
    const minerPower = (minerHashrate * minerEfficiency) / 1000; // kW per miner ~3.5kW

    // How many miners fit in available power (leave 10% for cooling/infra)
    const usablePowerKw = kw * 0.9;
    const minerCount = Math.floor(usablePowerKw / minerPower);
    const totalHashrateTH = minerCount * minerHashrate;
    const totalHashratePH = totalHashrateTH / 1000;

    // Revenue calc using live network stats
    const dailyBtc = stats.dailyBtcPerPH * totalHashratePH;
    const dailyRevenue = dailyBtc * stats.price;
    const monthlyRevenue = dailyRevenue * 30;

    // Costs
    const dailyPowerCost = usablePowerKw * 24 * rate;
    const monthlyPowerCost = dailyPowerCost * 30;

    // Profit
    const dailyProfit = dailyRevenue - dailyPowerCost;
    const monthlyProfit = monthlyRevenue - monthlyPowerCost;
    const annualProfit = monthlyProfit * 12;

    // ROI on property
    const roiMonths = askingPrice && monthlyProfit > 0
      ? Math.ceil(askingPrice / monthlyProfit)
      : null;

    return {
      minerCount,
      totalHashratePH,
      dailyBtc,
      dailyRevenue,
      monthlyRevenue,
      monthlyPowerCost,
      monthlyProfit,
      annualProfit,
      roiMonths,
      electricityRate: rate,
      isLive: stats.isLive,
    };
  }, [powerCapacityMw, electricityRate, askingPrice, stats]);

  if (!projection) {
    return null;
  }

  const isProfitable = projection.monthlyProfit > 0;

  return (
    <Card className="border-border bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bitcoin className="w-4 h-4 text-[hsl(var(--chart-4))]" />
          Live Mining Profitability Projection
          {loading ? (
            <Badge variant="outline" className="text-xs">Loading...</Badge>
          ) : (
            <Badge variant={projection.isLive ? 'default' : 'secondary'} className="text-xs">
              {projection.isLive ? '● Live' : '○ Estimated'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Key metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-background rounded-lg p-2 text-center border border-border">
            <Zap className="w-3 h-3 mx-auto text-[hsl(var(--chart-4))]" />
            <p className="text-lg font-bold text-foreground">{projection.minerCount.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">S21 Miners</p>
          </div>
          <div className="bg-background rounded-lg p-2 text-center border border-border">
            <TrendingUp className="w-3 h-3 mx-auto text-[hsl(var(--data-positive))]" />
            <p className="text-lg font-bold text-foreground">{projection.totalHashratePH.toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">PH/s Total</p>
          </div>
          <div className="bg-background rounded-lg p-2 text-center border border-border">
            <Bitcoin className="w-3 h-3 mx-auto text-[hsl(var(--chart-4))]" />
            <p className="text-lg font-bold text-foreground">{projection.dailyBtc.toFixed(4)}</p>
            <p className="text-[10px] text-muted-foreground">BTC/Day</p>
          </div>
          <div className="bg-background rounded-lg p-2 text-center border border-border">
            <DollarSign className="w-3 h-3 mx-auto text-[hsl(var(--data-positive))]" />
            <p className={`text-lg font-bold ${isProfitable ? 'text-[hsl(var(--data-positive))]' : 'text-[hsl(var(--data-negative))]'}`}>
              ${Math.abs(projection.monthlyProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isProfitable ? 'Monthly Profit' : 'Monthly Loss'}
            </p>
          </div>
        </div>

        {/* P&L breakdown */}
        <div className="text-xs space-y-1 bg-muted/50 rounded-lg p-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monthly Revenue</span>
            <span className="font-medium text-[hsl(var(--data-positive))]">
              +${projection.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Power Cost ({(projection.electricityRate * 100).toFixed(1)}¢/kWh)
            </span>
            <span className="font-medium text-[hsl(var(--data-negative))]">
              -${projection.monthlyPowerCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-1">
            <span className="font-medium text-foreground">Net Monthly</span>
            <span className={`font-bold ${isProfitable ? 'text-[hsl(var(--data-positive))]' : 'text-[hsl(var(--data-negative))]'}`}>
              ${projection.monthlyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Annual Projection</span>
            <span className="font-medium text-foreground">
              ${projection.annualProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          {projection.roiMonths && (
            <div className="flex justify-between items-center pt-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Property ROI
              </span>
              <Badge variant={projection.roiMonths <= 24 ? 'default' : 'secondary'} className="text-xs">
                {projection.roiMonths <= 12
                  ? `${projection.roiMonths} months`
                  : `${(projection.roiMonths / 12).toFixed(1)} years`}
              </Badge>
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground">
          Based on BTC ${stats.price.toLocaleString()} · {stats.hashrateFormatted} network · {stats.hashPriceFormatted}
        </p>
      </CardContent>
    </Card>
  );
}
