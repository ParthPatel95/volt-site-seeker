import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Clock, Zap, TrendingUp, BarChart3, Banknote, PiggyBank, PowerOff } from 'lucide-react';
import type { AnnualSummary } from '@/hooks/usePowerModelCalculator';

interface Props {
  annual: AnnualSummary | null;
  breakeven: number;
  hostingRateCAD?: number;
  totalShutdownHours?: number;
  totalShutdownSavings?: number;
  curtailmentSavings?: number;
  fixedPriceCAD?: number;
  cadUsdRate?: number;
}

export function PowerModelSummaryCards({ annual, breakeven, hostingRateCAD, totalShutdownHours, totalShutdownSavings, curtailmentSavings, fixedPriceCAD, cadUsdRate = 0.7334 }: Props) {
  if (!annual) return null;

  const annualRevenue = hostingRateCAD ? annual.totalKWh * hostingRateCAD : 0;
  const netMargin = annualRevenue - annual.totalAmountDue;
  const marginPct = annualRevenue > 0 ? (netMargin / annualRevenue) * 100 : 0;

  const usd = (cad: number) => cad * cadUsdRate;
  const fmtM = (v: number) => `$${(v / 1_000_000).toFixed(2)}M`;

  // Row 1: Primary KPIs (large cards)
  const primaryCards = [
    {
      label: 'Total Annual Cost',
      value: `CA${fmtM(annual.totalAmountDue)}`,
      sub: `US${fmtM(usd(annual.totalAmountDue))}`,
      icon: DollarSign,
      color: 'from-primary to-primary/80',
    },
    {
      label: 'All-in Rate',
      value: `${(annual.avgPerKwhCAD * 100).toFixed(2)}¢/kWh CAD`,
      sub: `${(annual.avgPerKwhCAD * 100 * cadUsdRate).toFixed(2)}¢/kWh USD`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
    },
    ...(hostingRateCAD ? [{
      label: 'Net Margin',
      value: `CA${fmtM(netMargin)}`,
      sub: `US${fmtM(usd(netMargin))} · ${marginPct.toFixed(1)}%`,
      icon: PiggyBank,
      color: netMargin >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600',
    }] : [{
      label: 'Breakeven Pool Price',
      value: `CA$${breakeven.toFixed(2)}/MWh`,
      sub: `US$${usd(breakeven).toFixed(2)}/MWh`,
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
    }]),
  ];

  // Row 2: Secondary KPIs (compact cards)
  const secondaryCards = [
    {
      label: 'Consumption',
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
    ...(totalShutdownHours !== undefined ? [{
      label: 'Curtailed Hours',
      value: `${totalShutdownHours.toLocaleString()}`,
      sub: `Savings: CA$${((totalShutdownSavings || 0) / 1000).toFixed(0)}k`,
      icon: PowerOff,
      color: 'from-red-500 to-red-600',
    }] : []),
    ...(hostingRateCAD ? [{
      label: 'Breakeven Price',
      value: `CA$${breakeven.toFixed(0)}/MWh`,
      sub: `US$${usd(breakeven).toFixed(0)}/MWh`,
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
    }] : []),
    ...((fixedPriceCAD && fixedPriceCAD > 0 && curtailmentSavings !== undefined) ? [{
      label: 'Curtailment Savings',
      value: `CA${fmtM(curtailmentSavings)}`,
      sub: `vs fixed $${fixedPriceCAD}/MWh`,
      icon: PiggyBank,
      color: curtailmentSavings >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600',
    }] : []),
    ...(hostingRateCAD ? [{
      label: 'Annual Revenue',
      value: `CA${fmtM(annualRevenue)}`,
      sub: `US${fmtM(usd(annualRevenue))}`,
      icon: Banknote,
      color: 'from-emerald-500 to-emerald-600',
    }] : []),
  ];

  return (
    <div className="space-y-3">
      {/* Row 1: Primary KPIs - Large */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {primaryCards.map((c) => (
          <Card key={c.label} className="overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${c.color}`}>
                  <c.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Secondary KPIs - Compact */}
      <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(secondaryCards.length, 4)} gap-3`}>
        {secondaryCards.map((c) => (
          <Card key={c.label} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`p-1 rounded-md bg-gradient-to-br ${c.color}`}>
                  <c.icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">{c.label}</span>
              </div>
              <p className="text-base font-bold text-foreground">{c.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
