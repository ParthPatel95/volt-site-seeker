import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Shield, Zap, ArrowDown } from 'lucide-react';
import type { AnnualSummary } from '@/hooks/usePowerModelCalculator';

interface Props {
  annual: AnnualSummary | null;
  cadUsdRate: number;
  fixedPriceCAD?: number;
}

export function PowerModelCostProgression({ annual, cadUsdRate, fixedPriceCAD = 0 }: Props) {
  if (!annual || annual.totalKWh === 0) return null;

  const kwh = annual.totalKWh;
  const isFixed = fixedPriceCAD > 0;

  // Scenario costs (annual CAD)
  const optimizedCost = annual.totalAmountDue; // Current: with 12CP avoidance + price curtailment
  const full12CPCharge = annual.totalBulkCoincidentDemandFull;
  const priceCurtailSavings = annual.totalPriceCurtailmentSavings;

  // Recalculate GST impact for added 12CP charge
  const gstRate = annual.totalGST / annual.totalPreGST; // derive actual GST rate

  // Base = optimized + full 12CP charge + price curtailment savings (what you'd pay with NO optimization)
  const baseCostPreGST = annual.totalPreGST + full12CPCharge + priceCurtailSavings;
  const baseCost = baseCostPreGST * (1 + gstRate);

  // With 12CP only = base - 12CP charge (but still paying high-price hours)
  const with12CPCostPreGST = baseCostPreGST - full12CPCharge;
  const with12CPCost = with12CPCostPreGST * (1 + gstRate);

  // With price curtailment only = base - price savings (but still paying full 12CP)
  const withPriceCostPreGST = baseCostPreGST - priceCurtailSavings;
  const withPriceCost = withPriceCostPreGST * (1 + gstRate);

  // Fully optimized = current totalAmountDue
  const fullyOptimizedCost = optimizedCost;

  const scenarios = [
    {
      label: 'Base All-in Rate',
      subtitle: 'No optimization programs',
      cost: baseCost,
      savings: 0,
      icon: null,
      highlight: false,
    },
    {
      label: 'With 12CP Avoidance',
      subtitle: 'Avoid monthly coincident peak hours',
      cost: with12CPCost,
      savings: baseCost - with12CPCost,
      icon: <Shield className="h-3.5 w-3.5 text-blue-500" />,
      highlight: false,
    },
    {
      label: 'With Price Curtailment',
      subtitle: isFixed ? 'Curtail during high pool price hours' : 'Curtail hours above breakeven',
      cost: withPriceCost,
      savings: baseCost - withPriceCost,
      icon: <TrendingDown className="h-3.5 w-3.5 text-amber-500" />,
      highlight: false,
    },
    {
      label: '12CP + Price Curtailment',
      subtitle: 'Both programs combined',
      cost: fullyOptimizedCost,
      savings: baseCost - fullyOptimizedCost,
      icon: <Zap className="h-3.5 w-3.5 text-emerald-500" />,
      highlight: true,
    },
  ];

  const fmtCents = (dollars: number) => ((dollars / kwh) * 100).toFixed(2);
  const fmtAnnual = (dollars: number) => {
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
    if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}k`;
    return `$${dollars.toFixed(0)}`;
  };
  const fmtSavings = (dollars: number) => {
    if (dollars >= 1_000_000) return `-$${(dollars / 1_000_000).toFixed(2)}M`;
    if (dollars >= 1_000) return `-$${(dollars / 1_000).toFixed(0)}k`;
    return `-$${dollars.toFixed(0)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Scenario Comparison — Rate 65 All-in Cost</CardTitle>
          <Badge variant={isFixed ? 'info' : 'success'} size="sm">
            {isFixed ? `Fixed @ $${fixedPriceCAD}/MWh` : 'Floating Pool Price'}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          How each optimization program reduces your effective rate (AESO Rate DTS + FortisAlberta Rate 65)
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Scenario</TableHead>
                <TableHead className="text-right">¢/kWh (CAD)</TableHead>
                <TableHead className="text-right">¢/kWh (USD)</TableHead>
                <TableHead className="text-right">Annual (CAD)</TableHead>
                <TableHead className="text-right">Annual (USD)</TableHead>
                <TableHead className="text-right">Savings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((scenario) => {
                const centsCAD = parseFloat(fmtCents(scenario.cost));
                const centsUSD = parseFloat((centsCAD * cadUsdRate).toFixed(2));
                return (
                  <TableRow
                    key={scenario.label}
                    className={scenario.highlight ? 'font-semibold bg-emerald-500/5' : ''}
                  >
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        {scenario.icon}
                        <div>
                          <div className="flex items-center gap-1.5">
                            {scenario.label}
                            {scenario.highlight && (
                              <Badge variant="success" size="sm" className="text-[10px]">Optimized</Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-normal">{scenario.subtitle}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-mono text-xs">
                      {fmtCents(scenario.cost)}¢
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-mono text-xs">
                      {(centsCAD * cadUsdRate).toFixed(2)}¢
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs">
                      CA{fmtAnnual(scenario.cost)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs">
                      US{fmtAnnual(scenario.cost * cadUsdRate)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs">
                      {scenario.savings > 0 ? (
                        <span className="text-emerald-600 flex items-center justify-end gap-0.5">
                          <ArrowDown className="h-3 w-3" />
                          {fmtSavings(scenario.savings)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {/* Visual savings bar */}
        <div className="px-4 pb-3 pt-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
            <span>Total savings from optimization:</span>
            <span className="font-semibold text-emerald-600">
              {fmtSavings(baseCost - fullyOptimizedCost)} CAD/yr
              ({((1 - fullyOptimizedCost / baseCost) * 100).toFixed(1)}% reduction)
            </span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${baseCost > 0 ? ((baseCost - fullyOptimizedCost) / baseCost) * 100 : 0}%` }}
            />
            <div
              className="bg-muted-foreground/20 h-full"
              style={{ width: `${baseCost > 0 ? (fullyOptimizedCost / baseCost) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
              Savings ({((1 - fullyOptimizedCost / baseCost) * 100).toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-muted-foreground/20 inline-block" />
              Optimized Cost ({(fullyOptimizedCost / baseCost * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
