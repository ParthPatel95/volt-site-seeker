import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { AESO_ISO_FEES, withGST, formatCAD } from '@/constants/energization-fees';

interface Props {
  monthlyDTS: { total: number; monthlyMWh: number };
  poolParticipation: number;
}

export function AnnualProjectionTable({ monthlyDTS, poolParticipation }: Props) {
  const projections = useMemo(() => {
    const annualDTS = monthlyDTS.total * 12;
    const annualTrading = withGST(AESO_ISO_FEES.energyMarketTradingCharge.perMWh * monthlyDTS.monthlyMWh * 12);
    const annualPoolFee = withGST(poolParticipation);

    let cumulative = 0;
    return Array.from({ length: 5 }, (_, i) => {
      const year = i + 1;
      const yearTotal = annualDTS + annualTrading + annualPoolFee;
      cumulative += yearTotal;
      return {
        year: `Year ${year}`,
        dts: annualDTS,
        trading: annualTrading,
        poolFee: annualPoolFee,
        total: yearTotal,
        cumulative,
      };
    });
  }, [monthlyDTS, poolParticipation]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          5-Year Cost Projection
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          Projected annual costs using current 2026 tariff rates
          <Badge variant="outline" className="text-[10px]">Assumes constant rates — for planning only</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">DTS Charges</TableHead>
              <TableHead className="text-right">Trading Charges</TableHead>
              <TableHead className="text-right">Pool Fee</TableHead>
              <TableHead className="text-right">Annual Total</TableHead>
              <TableHead className="text-right">Cumulative</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projections.map((p) => (
              <TableRow key={p.year}>
                <TableCell className="font-medium">{p.year}</TableCell>
                <TableCell className="text-right font-mono">{formatCAD(p.dts)}</TableCell>
                <TableCell className="text-right font-mono">{formatCAD(p.trading)}</TableCell>
                <TableCell className="text-right font-mono">{formatCAD(p.poolFee)}</TableCell>
                <TableCell className="text-right font-mono font-semibold">{formatCAD(p.total)}</TableCell>
                <TableCell className="text-right font-mono text-primary font-bold">{formatCAD(p.cumulative)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
