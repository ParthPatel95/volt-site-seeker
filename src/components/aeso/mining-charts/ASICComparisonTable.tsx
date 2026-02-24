import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Cpu } from 'lucide-react';
import { ASIC_SPECS, BLOCKS_PER_DAY } from '@/constants/mining-data';
import { cn } from '@/lib/utils';

interface Props {
  networkHashTH: number;
  blockReward: number;
  btcPrice: number;
  poolFee: number;
  cadToUsd: number;
  transmissionAdder: number;
}

export function ASICComparisonTable({ networkHashTH, blockReward, btcPrice, poolFee, cadToUsd, transmissionAdder }: Props) {
  const miners = useMemo(() => {
    const dailyBtcPerTH = (BLOCKS_PER_DAY * blockReward) / networkHashTH;

    return Object.entries(ASIC_SPECS).map(([key, spec]) => {
      const TH_PER_MW = 1_000_000 / spec.efficiency;
      const dailyBtcPerMW = dailyBtcPerTH * TH_PER_MW;
      const dailyRevenuePerMW = dailyBtcPerMW * btcPrice * (1 - poolFee / 100);

      const hourlyRevenuePerMW = dailyRevenuePerMW / 24;
      const grossRevenue = hourlyRevenuePerMW;
      const breakEvenCAD = (grossRevenue / cadToUsd) - transmissionAdder;

      return {
        key,
        name: spec.name,
        hashrate: spec.hashrate,
        power: spec.power,
        efficiency: spec.efficiency,
        thPerMW: TH_PER_MW,
        dailyBtcPerMW,
        dailyRevenuePerMW: Math.round(dailyRevenuePerMW),
        breakEvenCAD: Math.round(breakEvenCAD),
      };
    }).sort((a, b) => b.breakEvenCAD - a.breakEvenCAD);
  }, [networkHashTH, blockReward, btcPrice, poolFee, cadToUsd, transmissionAdder]);

  const bestKey = miners[0]?.key;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          ASIC Efficiency Comparison
        </CardTitle>
        <CardDescription>All miners ranked by break-even tolerance under current BTC conditions</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miner</TableHead>
              <TableHead className="text-right">TH/s</TableHead>
              <TableHead className="text-right">J/TH</TableHead>
              <TableHead className="text-right">TH/MW</TableHead>
              <TableHead className="text-right">BTC/MW/day</TableHead>
              <TableHead className="text-right">Revenue/MW/day</TableHead>
              <TableHead className="text-right">Break-even</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {miners.map((m) => (
              <TableRow key={m.key} className={cn(m.key === bestKey && 'bg-primary/5')}>
                <TableCell className="font-medium">
                  {m.name}
                  {m.key === bestKey && <Badge className="ml-2 text-[10px]" variant="default">Best</Badge>}
                </TableCell>
                <TableCell className="text-right font-mono">{m.hashrate}</TableCell>
                <TableCell className="text-right font-mono">{m.efficiency}</TableCell>
                <TableCell className="text-right font-mono">{(m.thPerMW / 1000).toFixed(1)}K</TableCell>
                <TableCell className="text-right font-mono">{m.dailyBtcPerMW.toFixed(6)}</TableCell>
                <TableCell className="text-right font-mono">${m.dailyRevenuePerMW.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono font-semibold">${m.breakEvenCAD}/MWh</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
