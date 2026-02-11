import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Clock, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import type { AnnualSummary } from '@/hooks/usePowerModelCalculator';

interface Props {
  annual: AnnualSummary | null;
  breakeven: number;
}

export function PowerModelSummaryCards({ annual, breakeven }: Props) {
  if (!annual) return null;

  const cards = [
    {
      label: 'Total Annual Cost',
      value: `CA$${(annual.totalAmountDue / 1_000_000).toFixed(2)}M`,
      sub: `US$${((annual.totalAmountDue * annual.avgPerKwhUSD / (annual.avgPerKwhCAD || 1)) / 1_000_000).toFixed(2)}M`,
      icon: DollarSign,
      color: 'from-primary to-primary/80',
    },
    {
      label: 'All-in Rate',
      value: `${(annual.avgPerKwhCAD * 100).toFixed(2)}¢/kWh`,
      sub: `CA$${(annual.avgPerKwhCAD * 1000).toFixed(2)}/MWh`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Total Consumption',
      value: `${(annual.totalMWh / 1000).toFixed(0)} GWh`,
      sub: `${annual.totalMWh.toLocaleString()} MWh`,
      icon: Zap,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Avg Uptime',
      value: `${annual.avgUptimePercent.toFixed(1)}%`,
      sub: `${annual.totalRunningHours.toLocaleString()} / ${annual.totalHours.toLocaleString()} hrs`,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Breakeven Pool Price',
      value: `CA$${breakeven.toFixed(2)}/MWh`,
      sub: `Avg running: CA$${annual.avgPoolPriceRunning.toFixed(2)}/MWh`,
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-md bg-gradient-to-br ${c.color}`}>
                <c.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-lg font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
