import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Shield, Zap, DollarSign } from 'lucide-react';
import type { AnnualSummary } from '@/hooks/usePowerModelCalculator';

interface Props {
  annual: AnnualSummary | null;
  cadUsdRate: number;
}

export function PowerModelStrategyComparison({ annual, cadUsdRate }: Props) {
  if (!annual || annual.totalKWh === 0) return null;

  const kwh = annual.totalKWh;

  // Scenario costs (annual CAD)
  const optimizedCost = annual.totalAmountDue; // With 12CP + price curtailment
  const full12CPCharge = annual.totalBulkCoincidentDemandFull;
  const priceCurtailSavings = annual.totalPriceCurtailmentSavings;
  const gstRate = annual.totalGST / annual.totalPreGST;

  // Base = no curtailment
  const baseCostPreGST = annual.totalPreGST + full12CPCharge + priceCurtailSavings;
  const baseCost = baseCostPreGST * (1 + gstRate);

  // With 12CP only = base - 12CP charge
  const with12CPCostPreGST = baseCostPreGST - full12CPCharge;
  const with12CPCost = with12CPCostPreGST * (1 + gstRate);

  // With both = current optimized cost
  const withBothCost = optimizedCost;

  const scenarios = [
    {
      label: 'No Curtailment',
      description: 'Pay full 12CP demand charge + all pool prices',
      cost: baseCost,
      savings: 0,
      icon: null,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-500/5',
    },
    {
      label: '12CP Only',
      description: 'Avoid only peak coincident demand hours',
      cost: with12CPCost,
      savings: baseCost - with12CPCost,
      icon: <Shield className="h-4 w-4" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/5',
    },
    {
      label: '12CP + Price Curtailment',
      description: 'Fully optimized: avoid peaks + high-price hours',
      cost: withBothCost,
      savings: baseCost - withBothCost,
      icon: <Zap className="h-4 w-4" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/5',
      highlight: true,
    },
  ];

  const maxSavings = Math.max(...scenarios.map(s => s.savings));

  const fmtAnnual = (dollars: number) => {
    return `$${(dollars / 1_000_000).toFixed(2)}M`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Strategy Comparison — Annual Dollar Impact</CardTitle>
        <p className="text-[11px] text-muted-foreground mt-1">
          See how different curtailment approaches reduce your total annual cost
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenarios.map((scenario) => (
            <div
              key={scenario.label}
              className={`p-4 rounded-lg border transition-all ${
                scenario.highlight
                  ? 'border-emerald-500 shadow-md'
                  : 'border-border'
              } ${scenario.bgColor}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {scenario.icon && (
                    <div className={scenario.color}>{scenario.icon}</div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{scenario.label}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {scenario.description}
                    </div>
                  </div>
                </div>
                {scenario.highlight && (
                  <Badge variant="success" size="sm" className="text-[10px]">
                    Optimal
                  </Badge>
                )}
              </div>

              {/* Cost section */}
              <div className="mb-3 pb-3 border-t border-border/30">
                <div className="text-[11px] text-muted-foreground mb-1">Annual Cost (CAD)</div>
                <div className="text-xl font-bold font-mono">
                  {fmtAnnual(scenario.cost)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {(scenario.cost / kwh * 100).toFixed(2)}¢/kWh
                </div>
              </div>

              {/* Savings bar */}
              {scenario.savings > 0 && (
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <div className="text-[11px] text-muted-foreground">Savings vs Base</div>
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {fmtAnnual(scenario.savings)}
                    </div>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all"
                      style={{
                        width: `${maxSavings > 0 ? (scenario.savings / maxSavings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {((scenario.savings / baseCost) * 100).toFixed(1)}% reduction
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom summary */}
        <div className="mt-4 pt-3 border-t border-border/30 bg-muted/20 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-3.5 w-3.5 text-foreground/60" />
            <span className="text-[11px] font-semibold text-foreground">
              Total Opportunity
            </span>
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {fmtAnnual(baseCost - withBothCost)} CAD/year
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            By implementing both 12CP avoidance and price curtailment, you can reduce your annual
            electricity cost by {((1 - withBothCost / baseCost) * 100).toFixed(1)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
