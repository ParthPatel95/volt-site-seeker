import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Snowflake, Sun, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthlyResult {
  month: string;
  avgPrice: number;
  hoursProfitable: number;
  hoursCurtailed: number;
  totalHours: number;
  netProfit: number;
}

interface Props {
  monthlyResults: MonthlyResult[];
}

type Season = 'winter' | 'summer' | 'shoulder';

function getSeason(monthStr: string): Season {
  const m = parseInt(monthStr.split('-')[1]);
  if (m >= 11 || m <= 2) return 'winter';
  if (m >= 6 && m <= 8) return 'summer';
  return 'shoulder';
}

const SEASON_CONFIG = {
  winter: { label: 'Winter', months: 'Nov–Feb', icon: Snowflake, color: 'text-blue-500' },
  summer: { label: 'Summer', months: 'Jun–Aug', icon: Sun, color: 'text-amber-500' },
  shoulder: { label: 'Shoulder', months: 'Mar–May / Sep–Oct', icon: Leaf, color: 'text-emerald-500' },
} as const;

export function SeasonalAnalysis({ monthlyResults }: Props) {
  const seasons = useMemo(() => {
    const grouped: Record<Season, MonthlyResult[]> = { winter: [], summer: [], shoulder: [] };
    monthlyResults.forEach((m) => grouped[getSeason(m.month)].push(m));

    return (['winter', 'summer', 'shoulder'] as Season[]).map((season) => {
      const results = grouped[season];
      if (results.length === 0) return { season, avgPrice: 0, profitablePercent: 0, totalProfit: 0, months: 0, strategy: 'N/A' };

      const totalHours = results.reduce((s, r) => s + r.totalHours, 0);
      const profitableHours = results.reduce((s, r) => s + r.hoursProfitable, 0);
      const avgPrice = results.reduce((s, r) => s + r.avgPrice * r.totalHours, 0) / totalHours;
      const totalProfit = results.reduce((s, r) => s + r.netProfit, 0);
      const profitablePercent = totalHours > 0 ? (profitableHours / totalHours) * 100 : 0;

      const strategy = profitablePercent > 80 ? 'Full Operation' :
        profitablePercent > 50 ? 'Selective Curtailment' : 'Heavy Curtailment';

      return { season, avgPrice, profitablePercent, totalProfit, months: results.length, strategy };
    });
  }, [monthlyResults]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Seasonal Pattern Analysis</CardTitle>
        <CardDescription>Profitability breakdown by Alberta energy season</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {seasons.map((s) => {
            const config = SEASON_CONFIG[s.season];
            const Icon = config.icon;
            return (
              <div key={s.season} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-5 h-5', config.color)} />
                  <div>
                    <p className="font-semibold text-foreground">{config.label}</p>
                    <p className="text-xs text-muted-foreground">{config.months}</p>
                  </div>
                </div>
                {s.months > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Pool Price</p>
                        <p className="font-mono font-semibold">${s.avgPrice.toFixed(1)}/MWh</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Hours Profitable</p>
                        <p className={cn('font-mono font-semibold', s.profitablePercent > 60 ? 'text-primary' : 'text-destructive')}>
                          {s.profitablePercent.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Net Profit</p>
                        <p className={cn('font-mono font-semibold', s.totalProfit >= 0 ? 'text-primary' : 'text-destructive')}>
                          ${(s.totalProfit / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Strategy</p>
                        <Badge variant={s.profitablePercent > 80 ? 'default' : 'secondary'} className="text-[10px]">
                          {s.strategy}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No data for this season</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
