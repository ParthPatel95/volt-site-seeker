import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RateSourceBadge } from '@/components/ui/rate-source-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingDown, TrendingUp, AlertTriangle, Zap, BarChart3, ArrowDown } from 'lucide-react';
import type { MonthlyResult, AnnualSummary } from '@/hooks/usePowerModelCalculator';

interface Props {
  monthly: MonthlyResult[];
  annual: AnnualSummary | null;
  targetUptime?: number;
  fixedPriceCAD?: number;
  cadUsdRate?: number;
  capacityMW?: number;
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

export function PowerModelChargeBreakdown({ monthly, annual, targetUptime = 95, fixedPriceCAD = 0, cadUsdRate = 0.7334, capacityMW = 0 }: Props) {
  if (!monthly.length) return null;

  const maxCost = Math.max(...monthly.map(m => m.totalAmountDue));
  const minCost = Math.min(...monthly.map(m => m.totalAmountDue));
  const showCapacity = capacityMW > 0;

  return (
    <div className="space-y-6">
      {/* Per-kWh Cost Breakdown */}
      {annual && annual.totalKWh > 0 && (() => {
        const kwh = annual.totalKWh;
        const c = (v: number) => (v / kwh * 100); // to cents/kWh
        const isFixed = fixedPriceCAD > 0;
        const rows = [
          { label: `Energy Price${isFixed ? ' (Fixed Contract)' : ' (Avg Pool)'}`, cents: c(annual.totalPoolEnergy), badge: isFixed ? 'Fixed' : 'Floating' },
          { label: 'Operating Reserve (12.5%)', cents: c(annual.totalOperatingReserve) },
          { label: 'FortisAlberta Demand', cents: c(annual.totalFortisDemand) },
          { label: 'Regional Billing Capacity', cents: c(annual.totalRegionalBillingCapacity) },
          { label: 'POD Charges (Sub + Tiered)', cents: c(annual.totalPodCharges) },
          { label: 'Fortis Distribution', cents: c(annual.totalFortisDistribution) },
          { label: 'Bulk Metered Energy', cents: c(annual.totalBulkMeteredEnergy) },
          { label: 'Regional Metered Energy', cents: c(annual.totalRegionalMeteredEnergy) },
          { label: 'Rider F', cents: c(annual.totalRiderF) },
          { label: 'Retailer Fee', cents: c(annual.totalRetailerFee) },
          { label: 'Other (TCR + Voltage + System)', cents: c(annual.totalTCR + annual.totalVoltageControl + annual.totalSystemSupport) },
          { label: 'GST (5%)', cents: c(annual.totalGST) },
        ];
        const totalCents = annual.avgPerKwhCAD * 100;
        const maxCents = Math.max(...rows.map(r => r.cents));

        return (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">All-in Rate Breakdown (cents/kWh)</CardTitle>
                <Badge variant={isFixed ? 'info' : 'success'} size="sm">
                  {isFixed ? `Fixed @ $${fixedPriceCAD}/MWh` : 'Floating Pool Price'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {rows.map(row => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-48 shrink-0 truncate" title={row.label}>{row.label}</span>
                    <div className="flex-1 h-4 rounded bg-muted/40 overflow-hidden">
                      <div
                        className={`h-full rounded transition-all ${row.label.startsWith('Energy') ? 'bg-primary' : 'bg-primary/40'}`}
                        style={{ width: `${maxCents > 0 ? (row.cents / maxCents) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-medium w-16 text-right tabular-nums">{row.cents.toFixed(2)}¢</span>
                    <span className="text-xs font-mono text-muted-foreground w-16 text-right tabular-nums">{(row.cents * cadUsdRate).toFixed(2)}¢</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <span className="text-xs font-semibold w-48 shrink-0">All-in Total</span>
                  <div className="flex-1" />
                  <span className="text-sm font-bold font-mono w-16 text-right tabular-nums">{totalCents.toFixed(2)}¢</span>
                  <span className="text-xs font-mono font-semibold text-muted-foreground w-16 text-right tabular-nums">{(totalCents * cadUsdRate).toFixed(2)}¢</span>
                </div>
                {isFixed && annual && annual.totalOverContractCredits > 0 && (() => {
                  const effectiveCents = annual.effectivePerKwhCAD * 100;
                  const creditCents = (annual.totalOverContractCredits / kwh) * 100;
                  return (
                    <>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-xs w-48 shrink-0 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <ArrowDown className="w-3 h-3" /> Over-Contract Credits
                        </span>
                        <div className="flex-1" />
                        <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 w-16 text-right tabular-nums">-{creditCents.toFixed(2)}¢</span>
                        <span className="text-xs font-mono text-emerald-600/70 dark:text-emerald-400/70 w-16 text-right tabular-nums">-{(creditCents * cadUsdRate).toFixed(2)}¢</span>
                      </div>
                      <div className="flex items-center gap-3 pt-2 border-t border-emerald-500/30">
                        <span className="text-xs font-bold w-48 shrink-0 text-emerald-700 dark:text-emerald-300">Effective Rate</span>
                        <div className="flex-1" />
                        <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300 w-16 text-right tabular-nums">{effectiveCents.toFixed(2)}¢</span>
                        <span className="text-xs font-mono font-semibold text-emerald-600/70 dark:text-emerald-400/70 w-16 text-right tabular-nums">{(effectiveCents * cadUsdRate).toFixed(2)}¢</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        );
      })()}
      {(() => {
        const totalBudgetHours = monthly.reduce((s, m) => s + Math.floor(m.totalHours * (1 - targetUptime / 100)), 0);
        const used12CP = monthly.reduce((s, m) => s + m.curtailed12CP + m.curtailedOverlap, 0);
        const usedPrice = monthly.reduce((s, m) => s + m.curtailedPrice, 0);
        const usedTotal = used12CP + usedPrice;
        const pct12CP = totalBudgetHours > 0 ? (used12CP / totalBudgetHours) * 100 : 0;
        const pctPrice = totalBudgetHours > 0 ? (usedPrice / totalBudgetHours) * 100 : 0;
        const unusedPct = Math.max(0, 100 - pct12CP - pctPrice);

        return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Downtime Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Annual Budget</span>
                  <span className="font-semibold">{totalBudgetHours}h ({(100 - targetUptime).toFixed(0)}% of total)</span>
                </div>
                {/* Visual bar */}
                <div className="h-4 rounded-full overflow-hidden bg-muted/50 flex">
                  {pct12CP > 0 && (
                    <div className="bg-blue-500 h-full transition-all" style={{ width: `${pct12CP}%` }} />
                  )}
                  {pctPrice > 0 && (
                    <div className="bg-orange-500 h-full transition-all" style={{ width: `${pctPrice}%` }} />
                  )}
                  {unusedPct > 0 && (
                    <div className="bg-muted h-full transition-all" style={{ width: `${unusedPct}%` }} />
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span>12CP: {used12CP}h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-orange-500" />
                    <span>Price: {usedPrice}h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-muted" />
                    <span>Unused: {totalBudgetHours - usedTotal}h</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

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
                  <TableHead className="sticky left-0 bg-muted/30 z-10">Month</TableHead>
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
                  {/* Energy columns group */}
                  <TableHead className="text-right border-l border-border/50">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 ml-auto">
                          <Zap className="h-3 w-3" /> MWh (Actual)
                        </TooltipTrigger>
                        <TooltipContent>After curtailment shutdowns</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  {showCapacity && (
                    <TableHead className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-1 ml-auto">
                            MWh (Full)
                          </TooltipTrigger>
                          <TooltipContent>At 100% capacity — no curtailment</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  )}
                  {/* Cost columns group */}
                  <TableHead className="text-right border-l border-border/50">DTS</TableHead>
                  <TableHead className="text-right">Energy</TableHead>
                  <TableHead className="text-right">Total (CAD)</TableHead>
                  {/* Rate columns group */}
                  <TableHead className="text-right border-l border-border/50">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 ml-auto">
                          <BarChart3 className="h-3 w-3" /> ¢/kWh
                        </TooltipTrigger>
                        <TooltipContent>All-in rate with curtailment optimization</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  {showCapacity && (
                    <TableHead className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-1 ml-auto">
                            ¢/kWh (Full)
                          </TooltipTrigger>
                          <TooltipContent>All-in rate at 100% capacity — same total cost spread over more kWh</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  )}
                  {fixedPriceCAD > 0 && <TableHead className="text-right border-l border-border/50">Curtail Savings</TableHead>}
                  {fixedPriceCAD > 0 && <TableHead className="text-right">Over-Contract Credit</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.map((m, i) => {
                  const isHighest = m.totalAmountDue === maxCost;
                  const isLowest = m.totalAmountDue === minCost;
                  const belowTarget = m.uptimePercent < targetUptime - 0.5;
                  const fullMWh = showCapacity ? m.totalHours * capacityMW : 0;
                  const avoided = fullMWh - m.mwh;
                  const pct = fullMWh > 0 ? (avoided / fullMWh) * 100 : 0;
                  const fullKWh = fullMWh * 1000;
                  const noCurtailCentsPerKwh = fullKWh > 0 ? (m.totalAmountDue / fullKWh) * 100 : 0;
                  const actualCents = m.perKwhCAD * 100;
                  const rateDelta = actualCents - noCurtailCentsPerKwh;
                  
                  return (
                    <TableRow 
                      key={m.month} 
                      className={`${belowTarget ? 'bg-amber-500/[0.03]' : i % 2 === 0 ? 'bg-muted/[0.03]' : ''} hover:bg-muted/20 transition-colors`}
                    >
                      <TableCell className="font-medium sticky left-0 bg-background z-10">
                        <div className="flex items-center gap-1.5">
                          {m.month.slice(0, 3)}
                          {isHighest && <TrendingUp className="h-3 w-3 text-red-500" />}
                          {isLowest && <TrendingDown className="h-3 w-3 text-emerald-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{m.totalHours}</TableCell>
                      <TableCell className="text-right tabular-nums">{m.runningHours}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium tabular-nums ${getUptimeBadgeStyle(m.uptimePercent, targetUptime)}`}>
                          {m.uptimePercent.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {m.curtailedHours}h
                      </TableCell>
                      {/* Energy group */}
                      <TableCell className="text-right tabular-nums font-medium border-l border-border/50">
                        {m.mwh.toLocaleString()}
                      </TableCell>
                      {showCapacity && (
                        <TableCell className="text-right tabular-nums">
                          <div className="text-muted-foreground">{fullMWh.toLocaleString()}</div>
                          {avoided > 0 && (
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              -{avoided.toLocaleString()} <span className="opacity-70">({pct.toFixed(1)}%)</span>
                            </div>
                          )}
                        </TableCell>
                      )}
                      {/* Cost group */}
                      <TableCell className="text-right tabular-nums text-muted-foreground border-l border-border/50">{fmtShort(m.totalDTSCharges)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{fmtShort(m.totalEnergyCharges)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{fmt(m.totalAmountDue)}</TableCell>
                      {/* Rate group */}
                      <TableCell className="text-right tabular-nums font-semibold border-l border-border/50">
                        {actualCents.toFixed(2)}
                      </TableCell>
                      {showCapacity && (
                        <TableCell className="text-right tabular-nums">
                          <div className="text-muted-foreground">{noCurtailCentsPerKwh.toFixed(2)}</div>
                          {rateDelta > 0.01 && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400">
                              +{rateDelta.toFixed(2)}¢
                            </div>
                          )}
                        </TableCell>
                      )}
                      {fixedPriceCAD > 0 && (
                        <TableCell className="text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400 border-l border-border/50">
                          {m.curtailmentSavings > 0 ? '+' : ''}{fmtShort(m.curtailmentSavings)}
                        </TableCell>
                      )}
                      {fixedPriceCAD > 0 && (
                        <TableCell className="text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                          {m.overContractCredits > 0 ? '+' : ''}{fmtShort(m.overContractCredits)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
              {annual && (
                <TableFooter>
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell className="sticky left-0 bg-muted/50 z-10">ANNUAL</TableCell>
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
                    {/* Energy group footer */}
                    <TableCell className="text-right tabular-nums border-l border-border/50">{annual.totalMWh.toLocaleString()}</TableCell>
                    {showCapacity && (() => {
                      const fullMWh = annual.totalHours * capacityMW;
                      const avoided = fullMWh - annual.totalMWh;
                      const pct = fullMWh > 0 ? (avoided / fullMWh) * 100 : 0;
                      return (
                        <TableCell className="text-right tabular-nums">
                          <div>{fullMWh.toLocaleString()}</div>
                          {avoided > 0 && (
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              -{avoided.toLocaleString()} <span className="opacity-70">({pct.toFixed(1)}%)</span>
                            </div>
                          )}
                        </TableCell>
                      );
                    })()}
                    {/* Cost group footer */}
                    <TableCell className="text-right tabular-nums border-l border-border/50">{fmtShort(annual.totalDTSCharges)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtShort(annual.totalEnergyCharges)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(annual.totalAmountDue)}</TableCell>
                    {/* Rate group footer */}
                    <TableCell className="text-right tabular-nums border-l border-border/50">
                      {(annual.avgPerKwhCAD * 100).toFixed(2)}
                    </TableCell>
                    {showCapacity && (() => {
                      const fullKWh = annual.totalHours * capacityMW * 1000;
                      const noCurtailRate = fullKWh > 0 ? (annual.totalAmountDue / fullKWh) * 100 : 0;
                      const delta = (annual.avgPerKwhCAD * 100) - noCurtailRate;
                      return (
                        <TableCell className="text-right tabular-nums">
                          <div>{noCurtailRate.toFixed(2)}</div>
                          {delta > 0.01 && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                              +{delta.toFixed(2)}¢
                            </div>
                          )}
                        </TableCell>
                      );
                    })()}
                    {fixedPriceCAD > 0 && (
                      <TableCell className="text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400 border-l border-border/50">
                        {annual.curtailmentSavings > 0 ? '+' : ''}{fmtShort(annual.curtailmentSavings)}
                      </TableCell>
                    )}
                    {fixedPriceCAD > 0 && (
                      <TableCell className="text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                        {annual.totalOverContractCredits > 0 ? '+' : ''}{fmtShort(annual.totalOverContractCredits)}
                      </TableCell>
                    )}
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
                  <p><strong>12CP:</strong> Peak demand avoidance. <strong>Price:</strong> Pool price above breakeven. <strong>Overlap:</strong> Hours matching both 12CP and price criteria. Downtime is budget-capped to guarantee {targetUptime}% minimum uptime.</p>
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
