import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RateSourceBadge } from '@/components/ui/rate-source-badge';
import type { MonthlyResult, AnnualSummary } from '@/hooks/usePowerModelCalculator';

interface Props {
  monthly: MonthlyResult[];
  annual: AnnualSummary | null;
}

const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function PowerModelChargeBreakdown({ monthly, annual }: Props) {
  if (!monthly.length) return null;

  return (
    <div className="space-y-6">
      {/* Monthly Summary Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">Monthly Cost Summary</CardTitle>
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
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Running</TableHead>
                  <TableHead className="text-right">Uptime</TableHead>
                  <TableHead className="text-right">MWh</TableHead>
                  <TableHead className="text-right">DTS Charges</TableHead>
                  <TableHead className="text-right">Energy Charges</TableHead>
                  <TableHead className="text-right">Pre-GST</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">¢/kWh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell className="font-medium">{m.month}</TableCell>
                    <TableCell className="text-right">{m.totalHours}</TableCell>
                    <TableCell className="text-right">{m.runningHours}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={m.uptimePercent >= 90 ? 'default' : 'secondary'} className="text-xs">
                        {m.uptimePercent.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{m.mwh.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{fmt(m.totalDTSCharges)}</TableCell>
                    <TableCell className="text-right">{fmt(m.totalEnergyCharges)}</TableCell>
                    <TableCell className="text-right">{fmt(m.totalPreGST)}</TableCell>
                    <TableCell className="text-right font-medium">{fmt(m.totalAmountDue)}</TableCell>
                    <TableCell className="text-right">{(m.perKwhCAD * 100).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {annual && (
                <TableFooter>
                  <TableRow className="font-bold">
                    <TableCell>ANNUAL TOTAL</TableCell>
                    <TableCell className="text-right">{annual.totalHours}</TableCell>
                    <TableCell className="text-right">{annual.totalRunningHours}</TableCell>
                    <TableCell className="text-right">
                      <Badge className="text-xs">{annual.avgUptimePercent.toFixed(1)}%</Badge>
                    </TableCell>
                    <TableCell className="text-right">{annual.totalMWh.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{fmt(annual.totalDTSCharges)}</TableCell>
                    <TableCell className="text-right">{fmt(annual.totalEnergyCharges)}</TableCell>
                    <TableCell className="text-right">{fmt(annual.totalPreGST)}</TableCell>
                    <TableCell className="text-right">{fmt(annual.totalAmountDue)}</TableCell>
                    <TableCell className="text-right">{(annual.avgPerKwhCAD * 100).toFixed(2)}</TableCell>
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
          <CardTitle className="text-base">Curtailment Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Running</TableHead>
                  <TableHead className="text-right">Curtailed</TableHead>
                  <TableHead className="text-right">12CP Only</TableHead>
                  <TableHead className="text-right">Price Only</TableHead>
                  <TableHead className="text-right">Uptime Cap</TableHead>
                  <TableHead className="text-right">Overlap</TableHead>
                  <TableHead className="text-right">Avg Pool (Running)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell className="font-medium">{m.month}</TableCell>
                    <TableCell className="text-right">{m.totalHours}</TableCell>
                    <TableCell className="text-right">{m.runningHours}</TableCell>
                    <TableCell className="text-right">{m.curtailedHours}</TableCell>
                    <TableCell className="text-right">{m.curtailed12CP}</TableCell>
                    <TableCell className="text-right">{m.curtailedPrice}</TableCell>
                    <TableCell className="text-right">{m.curtailedUptimeCap}</TableCell>
                    <TableCell className="text-right">{m.curtailedOverlap}</TableCell>
                    <TableCell className="text-right">{fmt(m.avgPoolPriceRunning)}/MWh</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed DTS Charge Breakdown for selected month */}
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
