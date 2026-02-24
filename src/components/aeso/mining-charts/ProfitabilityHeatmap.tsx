import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Grid3X3 } from 'lucide-react';

interface HourlyRecord {
  hour: string;
  avg_pool_price: number;
}

interface Props {
  historicalData: HourlyRecord[];
  hourlyRevenuePerMW_USD: number;
  poolFee: number;
  cadToUsd: number;
  transmissionAdder: number;
  capacityMW: number;
}

export function ProfitabilityHeatmap({ historicalData, hourlyRevenuePerMW_USD, poolFee, cadToUsd, transmissionAdder, capacityMW }: Props) {
  const { grid, months, minMargin, maxMargin } = useMemo(() => {
    const map = new Map<string, { totalMargin: number; count: number }>();
    const monthSet = new Set<string>();

    historicalData.forEach((record) => {
      const d = new Date(record.hour);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const hourOfDay = d.getHours();
      const key = `${monthKey}|${hourOfDay}`;

      monthSet.add(monthKey);

      const allInCostUSD = (record.avg_pool_price + transmissionAdder) * cadToUsd;
      const revenueUSD = hourlyRevenuePerMW_USD * (1 - poolFee / 100);
      const netMargin = revenueUSD - allInCostUSD;

      const existing = map.get(key) || { totalMargin: 0, count: 0 };
      existing.totalMargin += netMargin;
      existing.count++;
      map.set(key, existing);
    });

    const months = Array.from(monthSet).sort();
    const grid: { month: string; hour: number; avgMargin: number; count: number }[] = [];
    let min = 0, max = 0;

    months.forEach((month) => {
      for (let h = 0; h < 24; h++) {
        const key = `${month}|${h}`;
        const cell = map.get(key);
        const avgMargin = cell ? cell.totalMargin / cell.count : 0;
        if (avgMargin < min) min = avgMargin;
        if (avgMargin > max) max = avgMargin;
        grid.push({ month, hour: h, avgMargin, count: cell?.count || 0 });
      }
    });

    return { grid, months, minMargin: min, maxMargin: max };
  }, [historicalData, hourlyRevenuePerMW_USD, poolFee, cadToUsd, transmissionAdder]);

  const getColor = (margin: number) => {
    if (margin > 0) {
      const intensity = Math.min(margin / (maxMargin || 1), 1);
      return `hsl(142, ${60 + intensity * 30}%, ${85 - intensity * 45}%)`;
    }
    const intensity = Math.min(Math.abs(margin) / (Math.abs(minMargin) || 1), 1);
    return `hsl(0, ${60 + intensity * 30}%, ${85 - intensity * 35}%)`;
  };

  // Show max ~24 months for readability
  const displayMonths = months.slice(-24);
  const displayGrid = grid.filter(g => displayMonths.includes(g.month));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Grid3X3 className="w-4 h-4" />
          Profitability Heatmap — Month × Hour
        </CardTitle>
        <CardDescription>Average net margin per MWh by month and hour-of-day (green = profit, red = loss)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex ml-16">
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground">{h}</div>
              ))}
            </div>
            {/* Grid rows */}
            {displayMonths.map((month) => (
              <div key={month} className="flex items-center">
                <div className="w-16 text-[10px] text-muted-foreground text-right pr-2 flex-shrink-0">
                  {month}
                </div>
                <div className="flex flex-1">
                  {Array.from({ length: 24 }, (_, h) => {
                    const cell = displayGrid.find(g => g.month === month && g.hour === h);
                    const margin = cell?.avgMargin || 0;
                    return (
                      <Tooltip key={h}>
                        <TooltipTrigger asChild>
                          <div
                            className="flex-1 aspect-square min-h-[12px] border border-background/50 cursor-crosshair"
                            style={{ backgroundColor: cell?.count ? getColor(margin) : 'hsl(var(--muted))' }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          <p>{month} · Hour {h}:00</p>
                          <p className="font-mono">${margin.toFixed(2)}/MWh avg margin</p>
                          <p className="text-muted-foreground">{cell?.count || 0} data points</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-[10px] text-muted-foreground">Loss</span>
              <div className="flex h-3 w-32 rounded overflow-hidden">
                {[...Array(10)].map((_, i) => {
                  const frac = i / 9;
                  const margin = minMargin + frac * (maxMargin - minMargin);
                  return <div key={i} className="flex-1" style={{ backgroundColor: getColor(margin) }} />;
                })}
              </div>
              <span className="text-[10px] text-muted-foreground">Profit</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
