import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RateSourceBadge } from '@/components/ui/rate-source-badge';
import type { MonthlyResult, FacilityParams, HourlyRecord } from '@/hooks/usePowerModelCalculator';

interface Props {
  baseCost: number;
  params: FacilityParams;
  monthly: MonthlyResult[];
}

const fmtDelta = (v: number) => {
  const sign = v >= 0 ? '+' : '';
  return `${sign}$${(v / 1000).toFixed(0)}k`;
};

const fmtPct = (v: number) => {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
};

const fmt = (v: number) => `$${(v / 1_000_000).toFixed(2)}M`;

export function PowerModelSensitivity({ baseCost, params, monthly }: Props) {
  if (!monthly.length || baseCost === 0) return null;

  const analysis = useMemo(() => {
    // Simple linear scaling for sensitivity — recalculates proportionally
    // This is an approximation; actual re-run would need hourly data
    const totalMWh = monthly.reduce((s, m) => s + m.mwh, 0);
    const totalKWh = totalMWh * 1000;
    const hostingRateCAD = params.hostingRateUSD / params.cadUsdRate;
    const baseRevenue = totalKWh * hostingRateCAD;
    const baseMargin = baseRevenue - baseCost;

    const variations = [-10, -5, 0, 5, 10];

    const capacitySens = variations.map(pct => {
      const factor = 1 + pct / 100;
      const newCost = baseCost * factor; // Cost scales roughly linearly with capacity
      const newRevenue = baseRevenue * factor;
      return { pct, cost: newCost, revenue: newRevenue, margin: newRevenue - newCost };
    });

    const hostingRateSens = variations.map(pct => {
      const factor = 1 + pct / 100;
      const newRevenue = totalKWh * hostingRateCAD * factor;
      return { pct, cost: baseCost, revenue: newRevenue, margin: newRevenue - baseCost };
    });

    const exchangeSens = variations.map(pct => {
      const factor = 1 + pct / 100;
      const newRate = params.cadUsdRate * factor;
      const newHostingCAD = params.hostingRateUSD / newRate;
      const newRevenue = totalKWh * newHostingCAD;
      return { pct, cost: baseCost, revenue: newRevenue, margin: newRevenue - baseCost };
    });

    return [
      {
        param: 'Capacity',
        base: `${params.contractedCapacityMW} MW`,
        rows: capacitySens,
      },
      {
        param: 'Hosting Rate',
        base: `US$${params.hostingRateUSD}/kWh`,
        rows: hostingRateSens,
      },
      {
        param: 'Exchange Rate',
        base: `${params.cadUsdRate} CAD/USD`,
        rows: exchangeSens,
      },
    ];
  }, [baseCost, params, monthly]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-sm">Sensitivity Analysis</CardTitle>
            <CardDescription className="text-xs">Impact of ±5% and ±10% parameter changes on net margin</CardDescription>
          </div>
          <RateSourceBadge source="Parametric re-calculation" effectiveDate="2025-01-01" variant="compact" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead className="text-right">-10%</TableHead>
                <TableHead className="text-right">-5%</TableHead>
                <TableHead className="text-right bg-muted/30">Base</TableHead>
                <TableHead className="text-right">+5%</TableHead>
                <TableHead className="text-right">+10%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.map(({ param, base, rows }) => {
                const baseMargin = rows[2].margin;
                return (
                  <TableRow key={param}>
                    <TableCell className="font-medium">
                      <div>{param}</div>
                      <div className="text-xs text-muted-foreground">{base}</div>
                    </TableCell>
                    {rows.map((r, i) => {
                      const delta = r.margin - baseMargin;
                      const isBase = i === 2;
                      return (
                        <TableCell key={r.pct} className={`text-right ${isBase ? 'bg-muted/30' : ''}`}>
                          <div className="text-sm font-medium">{fmt(r.margin)}</div>
                          {!isBase && (
                            <Badge variant={delta >= 0 ? 'default' : 'destructive'} className="text-xs mt-0.5">
                              {fmtDelta(delta)}
                            </Badge>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
