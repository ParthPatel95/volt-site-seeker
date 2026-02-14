import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

  // Build cumulative cost layers
  const energyCost = annual.totalPoolEnergy;
  const orCost = annual.totalOperatingReserve;
  const transmissionCost = annual.totalBulkMeteredEnergy + annual.totalRegionalBillingCapacity +
    annual.totalRegionalMeteredEnergy + annual.totalPodCharges +
    annual.totalTCR + annual.totalVoltageControl + annual.totalSystemSupport;
  const distributionCost = annual.totalFortisDemand + annual.totalFortisDistribution;
  const ridersCost = annual.totalRiderF + annual.totalRetailerFee;
  const gstCost = annual.totalGST;

  const layers = [
    { label: `Energy${isFixed ? ` (Fixed $${fixedPriceCAD}/MWh)` : ' (Avg Pool)'}`, cumulative: energyCost, badge: isFixed ? 'Fixed' : 'Floating' },
    { label: '+ Operating Reserve (12.5%)', cumulative: energyCost + orCost },
    { label: '+ Transmission (DTS)', cumulative: energyCost + orCost + transmissionCost },
    { label: '+ Distribution (Fortis)', cumulative: energyCost + orCost + transmissionCost + distributionCost },
    { label: '+ Riders & Fees', cumulative: energyCost + orCost + transmissionCost + distributionCost + ridersCost },
    { label: '+ GST (5%)', cumulative: energyCost + orCost + transmissionCost + distributionCost + ridersCost + gstCost },
  ];

  const fmtCents = (dollars: number) => ((dollars / kwh) * 100).toFixed(2);
  const fmtAnnual = (dollars: number) => {
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
    if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}k`;
    return `$${dollars.toFixed(0)}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Cost Progression — All-in Rate Buildup</CardTitle>
          <Badge variant={isFixed ? 'info' : 'success'} size="sm">
            {isFixed ? `Fixed @ $${fixedPriceCAD}/MWh` : 'Floating Pool Price'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Component</TableHead>
                <TableHead className="text-right">¢/kWh (CAD)</TableHead>
                <TableHead className="text-right">¢/kWh (USD)</TableHead>
                <TableHead className="text-right">Annual (CAD)</TableHead>
                <TableHead className="text-right">Annual (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {layers.map((layer, i) => {
                const centsCAD = parseFloat(fmtCents(layer.cumulative));
                const centsUSD = parseFloat((centsCAD * cadUsdRate).toFixed(2));
                const finalRow = i === layers.length - 1;
                return (
                  <TableRow key={layer.label} className={finalRow ? 'font-semibold bg-muted/20' : ''}>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        {layer.label}
                        {layer.badge && (
                          <Badge variant={layer.badge === 'Fixed' ? 'info' : 'success'} size="sm" className="text-[10px]">
                            {layer.badge}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-mono text-xs">{fmtCents(layer.cumulative)}¢</TableCell>
                    <TableCell className="text-right tabular-nums font-mono text-xs">{(centsCAD * cadUsdRate).toFixed(2)}¢</TableCell>
                    <TableCell className="text-right tabular-nums text-xs">CA{fmtAnnual(layer.cumulative)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs">US{fmtAnnual(layer.cumulative * cadUsdRate)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {/* Visual progression bar */}
        <div className="px-4 pb-3 pt-2">
          <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
            {(() => {
              const total = layers[layers.length - 1].cumulative;
              const segments = [
                { value: energyCost, color: 'bg-primary' },
                { value: orCost, color: 'bg-blue-500' },
                { value: transmissionCost, color: 'bg-amber-500' },
                { value: distributionCost, color: 'bg-orange-500' },
                { value: ridersCost, color: 'bg-purple-500' },
                { value: gstCost, color: 'bg-muted-foreground/50' },
              ];
              return segments.map((seg, i) => (
                <div key={i} className={`${seg.color} h-full`} style={{ width: `${total > 0 ? (seg.value / total) * 100 : 0}%` }} />
              ));
            })()}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary inline-block" />Energy</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />OR</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />Transmission</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" />Distribution</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-purple-500 inline-block" />Riders</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-muted-foreground/50 inline-block" />GST</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
