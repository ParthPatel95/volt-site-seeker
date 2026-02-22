import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Clock, Zap, TrendingUp, BarChart3, Banknote, PiggyBank, PowerOff, ArrowDown, ArrowUp } from 'lucide-react';
import type { AnnualSummary } from '@/hooks/usePowerModelCalculator';

interface Props {
  annual: AnnualSummary | null;
  breakeven: number;
  hostingRateCAD?: number;
  totalShutdownHours?: number;
  totalShutdownSavings?: number;
  curtailmentSavings?: number;
  fixedPriceCAD?: number;
  cadUsdRate?: number;
}

export function PowerModelSummaryCards({ annual, breakeven, hostingRateCAD, totalShutdownHours, totalShutdownSavings, curtailmentSavings, fixedPriceCAD, cadUsdRate = 0.7334 }: Props) {
  if (!annual) return null;

  const annualRevenue = hostingRateCAD ? annual.totalKWh * hostingRateCAD : 0;
  const netMargin = annualRevenue - annual.totalAmountDue;
  const marginPct = annualRevenue > 0 ? (netMargin / annualRevenue) * 100 : 0;
  const isFixedPrice = (fixedPriceCAD ?? 0) > 0;

  const usd = (cad: number) => cad * cadUsdRate;
  const fmtM = (v: number) => `$${(v / 1_000_000).toFixed(2)}M`;

  // Energy vs Adders split for all-in rate
  const energyCentsPerKwh = annual.totalKWh > 0 ? (annual.totalPoolEnergy / annual.totalKWh) * 100 : 0;
  const totalCentsPerKwh = annual.avgPerKwhCAD * 100;
  const addersCentsPerKwh = totalCentsPerKwh - energyCentsPerKwh;
  const energyPct = totalCentsPerKwh > 0 ? (energyCentsPerKwh / totalCentsPerKwh) * 100 : 0;


  return (
    <div className="space-y-3">
      {/* Row 1: Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Annual Cost */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Total Annual Cost</span>
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">CA{fmtM(annual.totalAmountDue)}</p>
            <p className="text-sm text-white/60 mt-1">US{fmtM(usd(annual.totalAmountDue))}</p>
            {/* Monthly mini trend */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1 text-[10px] text-white/50">
                <span>{(annual.totalAmountDue / 12 / 1000).toFixed(0)}k avg/mo</span>
                <span className="mx-1">·</span>
                <span>{annual.totalMWh.toLocaleString()} MWh consumed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All-in Rate */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">All-in Rate</span>
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{totalCentsPerKwh.toFixed(2)}¢<span className="text-lg font-normal text-white/60">/kWh</span></p>
            <p className="text-sm text-white/60 mt-1">{(totalCentsPerKwh * cadUsdRate).toFixed(2)}¢/kWh USD</p>
            {/* After credits effective rate (fixed price only) */}
            {isFixedPrice && annual.totalOverContractCredits > 0 && (
              <p className="text-sm font-semibold text-emerald-300 mt-1">
                <ArrowDown className="w-3 h-3 inline mr-1" />
                After Credits: {(annual.effectivePerKwhCAD * 100).toFixed(2)}¢/kWh
              </p>
            )}
            {/* Energy vs Adders split bar */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/10 flex">
                  <div className="h-full bg-emerald-400 transition-all" style={{ width: `${energyPct}%` }} />
                  <div className="h-full bg-amber-400 transition-all" style={{ width: `${100 - energyPct}%` }} />
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-white/50">
                <span>Energy: {energyCentsPerKwh.toFixed(1)}¢</span>
                <span>Adders: {addersCentsPerKwh.toFixed(1)}¢</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Margin or Breakeven */}
        {hostingRateCAD ? (
          <Card className={`overflow-hidden border-0 text-white ${netMargin >= 0 ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-700 dark:to-emerald-900' : 'bg-gradient-to-br from-red-600 to-red-800 dark:from-red-700 dark:to-red-900'}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Net Margin</span>
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${netMargin >= 0 ? 'bg-white/20' : 'bg-white/20'}`}>
                  {netMargin >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(marginPct).toFixed(1)}%
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">CA{fmtM(netMargin)}</p>
              <p className="text-sm text-white/60 mt-1">US{fmtM(usd(netMargin))}</p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-[10px] text-white/50">
                  Revenue: CA{fmtM(annualRevenue)} · Cost: CA{fmtM(annual.totalAmountDue)}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-600 to-purple-800 dark:from-purple-700 dark:to-purple-900 text-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Breakeven Price</span>
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">CA${breakeven.toFixed(0)}<span className="text-lg font-normal text-white/60">/MWh</span></p>
              <p className="text-sm text-white/60 mt-1">US${usd(breakeven).toFixed(0)}/MWh</p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-[10px] text-white/50">
                  Curtail when pool price exceeds this threshold
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Row 2: Compact stat ribbon */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <div className="flex items-center divide-x divide-border overflow-x-auto">
            <StatItem icon={<Zap className="w-3.5 h-3.5 text-emerald-500" />} label="Consumption" value={`${(annual.totalMWh / 1000).toFixed(0)} GWh`} sub={`${annual.totalMWh.toLocaleString()} MWh`} />
            <StatItem icon={<Clock className="w-3.5 h-3.5 text-amber-500" />} label="Uptime" value={`${annual.avgUptimePercent.toFixed(1)}%`} sub={`${annual.totalRunningHours.toLocaleString()} / ${annual.totalHours.toLocaleString()} hrs`} />
            {totalShutdownHours !== undefined && (
              <StatItem icon={<PowerOff className="w-3.5 h-3.5 text-red-500" />} label="Curtailed" value={`${totalShutdownHours.toLocaleString()} hrs`} sub={`Saved: CA$${((totalShutdownSavings || 0) / 1000).toFixed(0)}k`} />
            )}
            {hostingRateCAD ? (
              <StatItem icon={<BarChart3 className="w-3.5 h-3.5 text-purple-500" />} label="Breakeven" value={`CA$${breakeven.toFixed(0)}/MWh`} sub={`US$${usd(breakeven).toFixed(0)}/MWh`} />
            ) : null}
            {(fixedPriceCAD && fixedPriceCAD > 0 && curtailmentSavings !== undefined) ? (
              <StatItem icon={<PiggyBank className="w-3.5 h-3.5 text-emerald-500" />} label="Curtail Savings" value={`CA${fmtM(curtailmentSavings)}`} sub={`vs fixed $${fixedPriceCAD}/MWh`} highlight={curtailmentSavings >= 0} />
            ) : null}
            {isFixedPrice && annual.totalOverContractCredits > 0 ? (
              <StatItem icon={<DollarSign className="w-3.5 h-3.5 text-emerald-500" />} label="Over-Contract Credits" value={`CA${fmtM(annual.totalOverContractCredits)}`} sub={`Pool above $${fixedPriceCAD}/MWh`} highlight />
            ) : null}
            {hostingRateCAD ? (
              <StatItem icon={<Banknote className="w-3.5 h-3.5 text-emerald-500" />} label="Revenue" value={`CA${fmtM(annualRevenue)}`} sub={`US${fmtM(usd(annualRevenue))}`} />
            ) : null}
            </div>
            {/* Scroll hint gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none sm:hidden" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatItem({ icon, label, value, sub, highlight }: { icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className="flex-1 min-w-[140px] px-4 py-3 flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">{label}</p>
        <p className="text-sm font-bold text-foreground truncate">{value}</p>
        <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
      </div>
    </div>
  );
}
