import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RateSourceBadge } from '@/components/ui/rate-source-badge';
import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, ReferenceLine,
} from 'recharts';
import type { MonthlyResult } from '@/hooks/usePowerModelCalculator';

interface Props {
  monthly: MonthlyResult[];
  breakeven: number;
  hourlyPrices: number[];
}

const COLORS = {
  dts: 'hsl(220, 70%, 55%)',
  energy: 'hsl(150, 60%, 45%)',
  fortis: 'hsl(35, 80%, 55%)',
  gst: 'hsl(0, 0%, 60%)',
  total: 'hsl(270, 60%, 55%)',
  cp12: 'hsl(0, 65%, 55%)',
  price: 'hsl(45, 80%, 50%)',
  overlap: 'hsl(280, 50%, 55%)',
  uptime: 'hsl(150, 60%, 45%)',
};

const PIE_COLORS = [
  'hsl(220, 70%, 55%)', 'hsl(220, 50%, 70%)', 'hsl(200, 60%, 50%)',
  'hsl(150, 60%, 45%)', 'hsl(35, 80%, 55%)', 'hsl(0, 65%, 55%)',
  'hsl(270, 60%, 55%)', 'hsl(0, 0%, 60%)',
];

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}k`;
const fmtFull = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function PowerModelCharts({ monthly, breakeven, hourlyPrices }: Props) {
  if (!monthly.length) return null;

  const costTrend = monthly.map(m => ({
    month: m.month.slice(0, 3),
    DTS: m.totalDTSCharges,
    Energy: m.totalEnergyCharges,
    FortisAlberta: m.totalFortisCharges,
    GST: m.gst,
    Total: m.totalAmountDue,
  }));

  const annualTotals = monthly.reduce((acc, m) => {
    acc.bulk += m.bulkMeteredEnergy + m.bulkCoincidentDemand;
    acc.regional += m.regionalBillingCapacity + m.regionalMeteredEnergy;
    acc.pod += m.podSubstation + m.podTiered;
    acc.or += m.operatingReserve;
    acc.pool += m.poolEnergy;
    acc.riderF += m.riderF + m.retailerFee;
    acc.fortis += m.totalFortisCharges;
    acc.gst += m.gst;
    return acc;
  }, { bulk: 0, regional: 0, pod: 0, or: 0, pool: 0, riderF: 0, fortis: 0, gst: 0 });

  const pieData = [
    { name: 'Bulk System', value: annualTotals.bulk },
    { name: 'Regional System', value: annualTotals.regional },
    { name: 'POD Charges', value: annualTotals.pod },
    { name: 'Operating Reserve', value: annualTotals.or },
    { name: 'Pool Energy', value: annualTotals.pool },
    { name: 'Rider F + Retailer', value: annualTotals.riderF },
    { name: 'FortisAlberta', value: annualTotals.fortis },
    { name: 'GST', value: annualTotals.gst },
  ].filter(d => d.value > 0);

  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  const curtailmentData = monthly.map(m => ({
    month: m.month.slice(0, 3),
    '12CP': m.curtailed12CP,
    Price: m.curtailedPrice,
    'Uptime Cap': m.curtailedUptimeCap,
    Overlap: m.curtailedOverlap,
    'Uptime %': m.uptimePercent,
  }));

  const bins = [0, 25, 50, 75, 100, 125, 150, 200, 300, 500, 1000];
  const histData = bins.map((min, i) => {
    const max = i < bins.length - 1 ? bins[i + 1] : Infinity;
    const label = max === Infinity ? `$${min}+` : `$${min}-${max}`;
    const count = hourlyPrices.filter(p => p >= min && p < max).length;
    return { range: label, hours: count, min };
  }).filter(d => d.hours > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Monthly Cost Trend - with area fill */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-sm">Monthly Cost Trend</CardTitle>
              <CardDescription className="text-xs">DTS + Energy + FortisAlberta + GST breakdown</CardDescription>
            </div>
            <RateSourceBadge source="AESO Rate DTS + aeso_training_data" effectiveDate="2026-01-01" lastVerified="2026-02-01" variant="compact" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={costTrend}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number) => fmtFull(v)}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="DTS" stackId="cost" fill={COLORS.dts} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Energy" stackId="cost" fill={COLORS.energy} />
              <Bar dataKey="FortisAlberta" stackId="cost" fill={COLORS.fortis} />
              <Bar dataKey="GST" stackId="cost" fill={COLORS.gst} radius={[2, 2, 0, 0]} />
              <Area type="monotone" dataKey="Total" fill="url(#totalGradient)" stroke="none" />
              <Line type="monotone" dataKey="Total" stroke={COLORS.total} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.total }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Component Pie with center label */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Annual Cost Breakdown</CardTitle>
          <CardDescription className="text-xs">By charge component</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={{ strokeWidth: 1 }}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${fmtFull(v)} (${((v / pieTotal) * 100).toFixed(1)}%)`, 'Amount']} />
              {/* Center label */}
              <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-sm font-bold">
                {fmtFull(pieTotal)}
              </text>
              <text x="50%" y="56%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground text-[10px]">
                Total Annual
              </text>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Curtailment Efficiency */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Curtailment Efficiency</CardTitle>
          <CardDescription className="text-xs">Hours curtailed by reason</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={curtailmentData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="hrs" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="hrs" dataKey="12CP" stackId="curt" fill={COLORS.cp12} />
              <Bar yAxisId="hrs" dataKey="Price" stackId="curt" fill={COLORS.price} />
              <Bar yAxisId="hrs" dataKey="Uptime Cap" stackId="curt" fill="hsl(220, 70%, 55%)" />
              <Bar yAxisId="hrs" dataKey="Overlap" stackId="curt" fill={COLORS.overlap} />
              <Line yAxisId="pct" type="monotone" dataKey="Uptime %" stroke={COLORS.uptime} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pool Price Distribution */}
      {histData.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-sm">Pool Price Distribution</CardTitle>
                <CardDescription className="text-xs">Breakeven at CA${breakeven.toFixed(0)}/MWh</CardDescription>
              </div>
              <RateSourceBadge source="aeso_training_data pool_price" effectiveDate="2022-06-01" lastVerified="2026-02-01" variant="compact" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={histData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                <Tooltip />
                <Bar dataKey="hours" fill="hsl(220, 70%, 55%)" radius={[3, 3, 0, 0]} />
                {(() => {
                  const idx = histData.findIndex((d, i) => d.min <= breakeven && ((histData[i + 1]?.min ?? Infinity) > breakeven));
                  return idx >= 0 ? (
                    <ReferenceLine x={histData[idx].range} stroke="hsl(0, 65%, 55%)" strokeWidth={2} strokeDasharray="5 5" label={{ value: `Breakeven $${breakeven.toFixed(0)}`, position: 'top', fontSize: 10, fill: 'hsl(0, 65%, 55%)' }} />
                  ) : null;
                })()}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
