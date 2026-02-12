import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RateSourceBadge } from '@/components/ui/rate-source-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import type { MonthlyResult, AnnualSummary } from '@/hooks/usePowerModelCalculator';

interface Props {
  monthly: MonthlyResult[];
  annual: AnnualSummary | null;
  targetUptime?: number;
}

const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return fmt(n);
};

function getUptimeBadgeStyle(uptime: number, target: number) {
  if (uptime >= target) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
  if (uptime >= target - 3) return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
  return 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30';
}

export function PowerModelChargeBreakdown({ monthly, annual, targetUptime = 95 }: Props) {
  if (!monthly.length) return null;

  const maxCost = Math.max(...monthly.map(m => m.totalAmountDue));
  const minCost = Math.min(...monthly.map(m => m.totalAmountDue));

  return (
    <div className="space-y-6">
      {/* Uptime Explanation Banner */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="py-3 px-4">
          <div className="flex items-start gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-foreground">Uptime Guarantee</span>
              <span className="text-muted-foreground ml-1">
                The {targetUptime}% target is a <strong>guaranteed minimum floor</strong>. Total downtime (12CP avoidance + price curtailment) 
                is capped to a monthly budget of {(100 - targetUptime).toFixed(0)}% of hours. 12CP gets priority; remaining budget goes to 
                curtailing the most expensive hours above breakeven.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Monthly Cost Summary</CardTitle>
              <Badge variant="outline" className="text-xs font-normal">
                Target: {targetUptime}% uptime
              </Badge>
            </div>
            <RateSourceBadge
              source="AUC Decision 30427-D01-2025"
              effectiveDate="2026-01-01"
              sourceUrl="https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/"
              lastVerified="2026-02-01"
              variant="compact"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Running</TableHead>
                  <TableHead className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 ml-auto">
                          Uptime <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Actual uptime after all curtailments. Target is {targetUptime}% (ceiling). 12CP avoidance and price shutdowns may reduce this.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-right">Curtailed</TableHead>
                  <TableHead className="text-right">MWh</TableHead>
                  <TableHead className="text-right">DTS</TableHead>
                  <TableHead className="text-right">Energy</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">¢/kWh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.map((m) => {
                  const isHighest = m.totalAmountDue === maxCost;
                  const isLowest = m.totalAmountDue === minCost;
                  const belowTarget = m.uptimePercent < targetUptime - 0.5;
                  
                  return (
                    <TableRow 
                      key={m.month} 
                      className={belowTarget ? 'bg-amber-500/[0.03]' : ''}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                          {m.month.slice(0, 3)}
                          {isHighest && <TrendingUp className="h-3 w-3 text-red-500" />}
                          {isLowest && <TrendingDown className="h-3 w-3 text-emerald-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{m.totalHours}</TableCell>
                      <TableCell className="text-right tabular-nums">{m.runningHours}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium tabular-nums ${getUptimeBadgeStyle(m.uptimePercent, targetUptime)}`}>
                          {m.uptimePercent.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {m.curtailedHours}h
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{m.mwh.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtShort(m.totalDTSCharges)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtShort(m.totalEnergyCharges)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{fmt(m.totalAmountDue)}</TableCell>
                      <TableCell className="text-right tabular-nums">{(m.perKwhCAD * 100).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              {annual && (
                <TableFooter>
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>ANNUAL</TableCell>
                    <TableCell className="text-right tabular-nums">{annual.totalHours}</TableCell>
                    <TableCell className="text-right tabular-nums">{annual.totalRunningHours}</TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-semibold tabular-nums ${getUptimeBadgeStyle(annual.avgUptimePercent, targetUptime)}`}>
                        {annual.avgUptimePercent.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {monthly.reduce((s, m) => s + m.curtailedHours, 0)}h
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{annual.totalMWh.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtShort(annual.totalDTSCharges)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtShort(annual.totalEnergyCharges)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(annual.totalAmountDue)}</TableCell>
                    <TableCell className="text-right tabular-nums">{(annual.avgPerKwhCAD * 100).toFixed(2)}</TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Curtailment Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Curtailment Analysis</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>12CP:</strong> Peak demand avoidance. <strong>Price:</strong> Pool price above breakeven. <strong>Uptime Cap:</strong> Extra curtailment to enforce {targetUptime}% ceiling. <strong>Overlap:</strong> Hours matching both 12CP and price criteria.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Running</TableHead>
                  <TableHead className="text-right">Curtailed</TableHead>
                  <TableHead className="text-right">12CP</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Uptime Cap</TableHead>
                  <TableHead className="text-right">Overlap</TableHead>
                  <TableHead className="text-right">Avg Pool (Run)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell className="font-medium">{m.month.slice(0, 3)}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.totalHours}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.runningHours}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{m.curtailedHours}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.curtailed12CP > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400">{m.curtailed12CP}</span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.curtailedPrice > 0 ? (
                        <span className="text-orange-600 dark:text-orange-400">{m.curtailedPrice}</span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.curtailedUptimeCap > 0 ? (
                        <span className="text-purple-600 dark:text-purple-400">{m.curtailedUptimeCap}</span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.curtailedOverlap > 0 ? (
                        <span className="text-muted-foreground">{m.curtailedOverlap}</span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(m.avgPoolPriceRunning)}/MWh</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed DTS Charge Breakdown */}
      {monthly.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rate DTS Charge Components (Monthly Average)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {(() => {
                const avg = (fn: (m: MonthlyResult) => number) =>
                  monthly.reduce((s, m) => s + fn(m), 0) / monthly.length;
                const rows = [
                  { label: '(1)(a) Coincident Metered Demand', value: avg(m => m.bulkCoincidentDemand), note: '12CP avoided = $0' },
                  { label: '(1)(b) Bulk Metered Energy', value: avg(m => m.bulkMeteredEnergy) },
                  { label: '(2)(a) Regional Billing Capacity', value: avg(m => m.regionalBillingCapacity) },
                  { label: '(2)(b) Regional Metered Energy', value: avg(m => m.regionalMeteredEnergy) },
                  { label: '(3)(a) POD Substation', value: avg(m => m.podSubstation) },
                  { label: '(3)(b-e) POD Tiered Charges', value: avg(m => m.podTiered) },
                  { label: '(4) Operating Reserve', value: avg(m => m.operatingReserve), estimate: true },
                  { label: '(5) TCR', value: avg(m => m.tcr), estimate: true },
                  { label: '(6) Voltage Control', value: avg(m => m.voltageControl) },
                  { label: '(7) System Support', value: avg(m => m.systemSupport) },
                  { label: 'FortisAlberta Demand Charge', value: avg(m => m.fortisDemandCharge), note: 'Rate 65' },
                  { label: 'FortisAlberta Distribution', value: avg(m => m.fortisDistribution), note: 'Rate 65' },
                ];
                return rows.map(r => (
                  <div key={r.label} className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">
                      {r.label}
                      {r.note && <span className="ml-2 text-xs text-primary">({r.note})</span>}
                      {'estimate' in r && r.estimate && (
                        <Badge variant="warning" size="sm" className="ml-2">Estimate</Badge>
                      )}
                    </span>
                    <span className="font-medium">{fmt(r.value)}</span>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
