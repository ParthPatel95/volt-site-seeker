import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Zap, DollarSign, TrendingDown } from 'lucide-react';
import type { AnnualSummary } from '@/hooks/usePowerModelCalculator';

interface Props {
  annual: AnnualSummary | null;
  cadUsdRate: number;
}

export function PowerModelStrategyComparison({ annual, cadUsdRate }: Props) {
  if (!annual || annual.totalKWh === 0) return null;

  const kwh = annual.totalKWh;
  const optimizedCost = annual.totalAmountDue;
  const full12CPCharge = annual.totalBulkCoincidentDemandFull;
  const priceCurtailSavings = annual.totalPriceCurtailmentSavings;
  const gstRate = annual.totalGST / annual.totalPreGST;

  const baseCostPreGST = annual.totalPreGST + full12CPCharge + priceCurtailSavings;
  const baseCost = baseCostPreGST * (1 + gstRate);
  const with12CPCostPreGST = baseCostPreGST - full12CPCharge;
  const with12CPCost = with12CPCostPreGST * (1 + gstRate);
  const withBothCost = optimizedCost;

  const totalSavings = baseCost - withBothCost;
  const totalSavingsPct = baseCost > 0 ? ((totalSavings / baseCost) * 100) : 0;

  const fmtM = (d: number) => `$${(d / 1_000_000).toFixed(2)}M`;
  const fmtK = (d: number) => `$${(d / 1_000).toFixed(0)}k`;

  const steps = [
    {
      label: 'No Curtailment',
      sub: 'Full exposure',
      cost: baseCost,
      rate: (baseCost / kwh * 100).toFixed(2),
      icon: <DollarSign className="w-4 h-4" />,
      color: 'from-red-500/10 to-red-500/5',
      borderColor: 'border-red-500/30',
      iconBg: 'bg-red-500/10 text-red-500',
    },
    {
      label: '+ 12CP Avoidance',
      sub: 'Peak demand avoided',
      cost: with12CPCost,
      rate: (with12CPCost / kwh * 100).toFixed(2),
      savings: baseCost - with12CPCost,
      icon: <Shield className="w-4 h-4" />,
      color: 'from-blue-500/10 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/10 text-blue-500',
    },
    {
      label: '+ Price Curtailment',
      sub: 'Fully optimized',
      cost: withBothCost,
      rate: (withBothCost / kwh * 100).toFixed(2),
      savings: baseCost - withBothCost,
      icon: <Zap className="w-4 h-4" />,
      color: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
      highlight: true,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Optimization Funnel</CardTitle>
          <Badge variant="outline" className="text-[10px] gap-1">
            <TrendingDown className="w-3 h-3 text-emerald-500" />
            Save {fmtK(totalSavings)} ({totalSavingsPct.toFixed(1)}%)
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Horizontal funnel */}
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              {i > 0 && (
                <div className="hidden md:flex items-center justify-center px-1">
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-5 h-5 text-emerald-500" />
                    {step.savings && (
                      <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 whitespace-nowrap">
                        -{fmtK(step.savings - (steps[i - 1]?.savings || 0))}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {i > 0 && (
                <div className="md:hidden flex items-center justify-center py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-px h-4 bg-emerald-500/40" />
                    <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ↓ -{fmtK(step.savings ? step.savings - (steps[i - 1]?.savings || 0) : 0)}
                    </span>
                    <div className="w-px h-4 bg-emerald-500/40" />
                  </div>
                </div>
              )}
              <div
                className={`flex-1 p-4 rounded-xl border bg-gradient-to-br ${step.color} ${step.borderColor} transition-all ${step.highlight ? 'ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5' : ''}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${step.iconBg}`}>
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground">{step.sub}</p>
                  </div>
                  {step.highlight && (
                    <Badge variant="success" size="sm" className="text-[9px] ml-auto">Optimal</Badge>
                  )}
                </div>
                <p className="text-xl font-bold font-mono text-foreground">{fmtM(step.cost)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.rate}¢/kWh</p>
                {step.savings !== undefined && step.savings > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Total savings: {fmtK(step.savings)}
                    </p>
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
