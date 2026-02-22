import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, AlertCircle, Lightbulb, TrendingUp, AlertTriangle, Shield, CheckCircle2, BarChart3, Brain, Zap, Target, Activity, Gauge } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Line, Area, ReferenceLine,
  PieChart, Pie, Cell,
} from 'recharts';
import type { FacilityParams, TariffOverrides, AnnualSummary, MonthlyResult } from '@/hooks/usePowerModelCalculator';

interface Props {
  params: FacilityParams;
  tariffOverrides: TariffOverrides;
  annual: AnnualSummary | null;
  monthly: MonthlyResult[];
  breakeven: number;
  autoTrigger?: boolean;
}

interface ParsedSection {
  title: string;
  type: 'summary' | 'drivers' | 'optimization' | 'risk' | 'recommendation' | 'general';
  items: string[];
}

function parseAIResponse(text: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = text.split('\n');
  let currentSection: ParsedSection | null = null;

  const classifySection = (title: string): ParsedSection['type'] => {
    const lower = title.toLowerCase();
    if (lower.includes('summary') || lower.includes('overview') || lower.includes('executive')) return 'summary';
    if (lower.includes('driver') || lower.includes('cost') || lower.includes('factor')) return 'drivers';
    if (lower.includes('optim') || lower.includes('opportunit') || lower.includes('saving') || lower.includes('recommend')) return 'optimization';
    if (lower.includes('risk') || lower.includes('concern') || lower.includes('warning') || lower.includes('caution')) return 'risk';
    if (lower.includes('action') || lower.includes('next step') || lower.includes('conclusion')) return 'recommendation';
    return 'general';
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      if (currentSection && currentSection.items.length > 0) sections.push(currentSection);
      const title = trimmed.replace(/^#{2,3}\s*/, '');
      currentSection = { title, type: classifySection(title), items: [] };
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**') && !currentSection) {
      if (currentSection && currentSection.items.length > 0) sections.push(currentSection);
      const title = trimmed.slice(2, -2);
      currentSection = { title, type: classifySection(title), items: [] };
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const item = trimmed.replace(/^[-*•]\s*/, '');
      if (currentSection) {
        currentSection.items.push(item);
      } else {
        currentSection = { title: 'Key Insights', type: 'summary', items: [item] };
      }
    } else {
      if (currentSection) {
        currentSection.items.push(trimmed);
      } else {
        currentSection = { title: 'Executive Summary', type: 'summary', items: [trimmed] };
      }
    }
  }
  if (currentSection && currentSection.items.length > 0) sections.push(currentSection);
  return sections;
}

function extractQuickStats(text: string): { label: string; value: string }[] {
  const stats: { label: string; value: string }[] = [];
  const patterns = [
    { regex: /(\d+\.?\d*)\s*[¢c]\/kWh/i, label: 'All-in Rate' },
    { regex: /\$(\d+\.?\d*)[Mm]/i, label: 'Annual Cost', prefix: '$', suffix: 'M' },
    { regex: /margin.*?(\d+\.?\d*)%/i, label: 'Margin' },
    { regex: /breakeven.*?\$(\d+\.?\d*)/i, label: 'Breakeven', prefix: '$' },
    { regex: /save.*?\$(\d+\.?\d*)[kK]/i, label: 'Savings', prefix: '$', suffix: 'K' },
  ];
  for (const p of patterns) {
    const m = text.match(p.regex);
    if (m) {
      const val = (p as any).prefix ? `${(p as any).prefix}${m[1]}${(p as any).suffix || ''}` : `${m[1]}${(p as any).suffix || '¢/kWh'}`;
      stats.push({ label: p.label, value: val });
      if (stats.length >= 4) break;
    }
  }
  return stats;
}

const LOADING_STAGES = [
  { label: 'Reading cost data...', icon: BarChart3, duration: 2000 },
  { label: 'Analyzing patterns...', icon: Brain, duration: 3000 },
  { label: 'Identifying optimizations...', icon: Target, duration: 2000 },
  { label: 'Generating insights...', icon: Sparkles, duration: 5000 },
];

const sectionConfig: Record<ParsedSection['type'], { icon: React.ReactNode; gradient: string; border: string; bg: string; iconBg: string }> = {
  summary: {
    icon: <Lightbulb className="w-5 h-5" />,
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/5',
    iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  drivers: {
    icon: <TrendingUp className="w-4 h-4" />,
    gradient: 'from-amber-500/10 to-transparent',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/5',
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  optimization: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    gradient: 'from-blue-500/10 to-transparent',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/5',
    iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  risk: {
    icon: <AlertTriangle className="w-4 h-4" />,
    gradient: 'from-red-500/10 to-transparent',
    border: 'border-red-500/40',
    bg: 'bg-red-500/5',
    iconBg: 'bg-red-500/15 text-red-600 dark:text-red-400',
  },
  recommendation: {
    icon: <Shield className="w-4 h-4" />,
    gradient: 'from-primary/10 to-transparent',
    border: 'border-primary/40',
    bg: 'bg-primary/5',
    iconBg: 'bg-primary/15 text-primary',
  },
  general: {
    icon: <Lightbulb className="w-4 h-4" />,
    gradient: 'from-muted/50 to-transparent',
    border: 'border-border',
    bg: 'bg-muted/20',
    iconBg: 'bg-muted text-muted-foreground',
  },
};

// ===== VISUAL PANEL COMPONENTS =====

const CHART_COLORS = [
  'hsl(220, 70%, 55%)', // DTS Blue
  'hsl(35, 85%, 55%)',  // Energy Amber
  'hsl(160, 60%, 45%)', // Fortis Green
  'hsl(0, 65%, 55%)',   // GST Red
  'hsl(270, 60%, 55%)', // Operating Reserve Purple
  'hsl(190, 70%, 45%)', // Misc Teal
];

function CostWaterfallChart({ annual }: { annual: AnnualSummary }) {
  const data = useMemo(() => {
    const total = annual.totalAmountDue;
    const items = [
      { name: 'Energy', value: annual.totalPoolEnergy, fill: 'hsl(35, 85%, 55%)' },
      { name: 'Op Reserve', value: annual.totalOperatingReserve, fill: 'hsl(270, 60%, 55%)' },
      { name: 'Bulk 12CP', value: annual.totalBulkCoincidentDemandFull - (annual.totalBulkCoincidentDemandFull - (annual.totalDTSCharges - annual.totalRegionalBillingCapacity - annual.totalRegionalMeteredEnergy - annual.totalPodCharges - annual.totalBulkMeteredEnergy - annual.totalTCR - annual.totalVoltageControl - annual.totalSystemSupport)), fill: 'hsl(220, 70%, 55%)' },
      { name: 'Regional', value: annual.totalRegionalBillingCapacity + annual.totalRegionalMeteredEnergy, fill: 'hsl(200, 65%, 50%)' },
      { name: 'POD', value: annual.totalPodCharges, fill: 'hsl(240, 55%, 60%)' },
      { name: 'Fortis', value: annual.totalFortisCharges, fill: 'hsl(160, 60%, 45%)' },
      { name: 'Riders/Fees', value: annual.totalRetailerFee + annual.totalRiderF + annual.totalTCR + annual.totalVoltageControl + annual.totalSystemSupport, fill: 'hsl(190, 70%, 45%)' },
      { name: 'GST', value: annual.totalGST, fill: 'hsl(0, 65%, 55%)' },
    ].filter(d => d.value > 0);

    return items.map(d => ({
      ...d,
      value: Math.round(d.value),
      pct: ((d.value / total) * 100).toFixed(1),
    }));
  }, [annual]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Cost Waterfall — Where the Money Goes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} layout="vertical" margin={{ left: 60, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis type="number" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={55} />
            <Tooltip
              formatter={(v: number) => [`$${v.toLocaleString()}`, 'Cost']}
              contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {data.map((d, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
              {d.name}: {d.pct}%
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlyRateTrendChart({ monthly, breakeven, params }: { monthly: MonthlyResult[]; breakeven: number; params: FacilityParams }) {
  const data = useMemo(() => {
    const hostingRateCAD_centsKwh = (params.hostingRateUSD / params.cadUsdRate) * 100;
    const breakevenCentsKwh = breakeven / 10; // $/MWh -> ¢/kWh
    return monthly.map(m => ({
      month: m.month.slice(0, 3),
      rate: +(m.perKwhCAD * 100).toFixed(2),
      poolPrice: +(m.avgPoolPriceRunning / 10).toFixed(2), // $/MWh -> ¢/kWh
      breakeven: +breakevenCentsKwh.toFixed(2),
      hosting: +hostingRateCAD_centsKwh.toFixed(2),
    }));
  }, [monthly, breakeven, params]);

  const rates = data.map(d => d.rate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Monthly All-in Rate Trend (¢/kWh)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={data} margin={{ left: 5, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[Math.floor(minRate * 0.8), Math.ceil(maxRate * 1.2)]} />
            <Tooltip contentStyle={{ fontSize: 11, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Area type="monotone" dataKey="rate" fill="hsl(220, 70%, 55%)" fillOpacity={0.1} stroke="none" />
            <Line type="monotone" dataKey="rate" stroke="hsl(220, 70%, 55%)" strokeWidth={2.5} dot={{ r: 3 }} name="All-in Rate" />
            <Line type="monotone" dataKey="poolPrice" stroke="hsl(35, 85%, 55%)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Pool Price" />
            <ReferenceLine y={data[0]?.breakeven} stroke="hsl(0, 65%, 55%)" strokeDasharray="6 3" label={{ value: 'Breakeven', fontSize: 9, fill: 'hsl(0, 65%, 55%)' }} />
            <ReferenceLine y={data[0]?.hosting} stroke="hsl(160, 60%, 45%)" strokeDasharray="6 3" label={{ value: 'Hosting Rate', fontSize: 9, fill: 'hsl(160, 60%, 45%)' }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CostComponentDonut({ annual }: { annual: AnnualSummary }) {
  const data = useMemo(() => {
    const items = [
      { name: 'DTS', value: annual.totalDTSCharges, color: 'hsl(220, 70%, 55%)' },
      { name: 'Energy', value: annual.totalEnergyCharges, color: 'hsl(35, 85%, 55%)' },
      { name: 'Fortis', value: annual.totalFortisCharges, color: 'hsl(160, 60%, 45%)' },
      { name: 'GST', value: annual.totalGST, color: 'hsl(0, 65%, 55%)' },
    ];
    return items;
  }, [annual]);

  const allInRate = (annual.avgPerKwhCAD * 100).toFixed(2);
  const perKwhBreakdown = useMemo(() => {
    const kwh = annual.totalKWh || 1;
    return [
      { label: 'DTS', value: (annual.totalDTSCharges / kwh * 100).toFixed(2) },
      { label: 'Energy', value: (annual.totalEnergyCharges / kwh * 100).toFixed(2) },
      { label: 'Fortis', value: (annual.totalFortisCharges / kwh * 100).toFixed(2) },
      { label: 'GST', value: (annual.totalGST / kwh * 100).toFixed(2) },
    ];
  }, [annual]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Cost Component Split
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative w-[160px] h-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 10, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-lg font-bold text-foreground">{allInRate}</span>
                <span className="block text-[9px] text-muted-foreground">¢/kWh</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 min-w-0">
            {perKwhBreakdown.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: data[i]?.color }} />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground truncate">{item.label}</p>
                  <p className="text-xs font-semibold text-foreground">{item.value}¢/kWh</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EfficiencyScorecard({ annual, monthly, params, breakeven }: { annual: AnnualSummary; monthly: MonthlyResult[]; params: FacilityParams; breakeven: number }) {
  const metrics = useMemo(() => {
    const uptimeTarget = params.targetUptimePercent || 95;
    const uptimeActual = annual.avgUptimePercent;
    const uptimeScore = Math.min(100, (uptimeActual / uptimeTarget) * 100);

    // 12CP savings: compare full 12CP charge vs actual
    const twelveCPFull = annual.totalBulkCoincidentDemandFull;
    const twelveCPActual = twelveCPFull - (annual.totalBulkCoincidentDemandFull - annual.totalDTSCharges + annual.totalRegionalBillingCapacity + annual.totalRegionalMeteredEnergy + annual.totalPodCharges + annual.totalBulkMeteredEnergy + annual.totalTCR + annual.totalVoltageControl + annual.totalSystemSupport);
    const twelveCPSavingsEst = annual.curtailmentSavings;
    const twelveCPPct = twelveCPFull > 0 ? Math.min(100, (twelveCPSavingsEst / twelveCPFull) * 100) : 0;

    // Price curtailment ROI
    const totalCurtailedHrs = monthly.reduce((s, m) => s + m.curtailedPrice, 0);
    const priceCurtailROI = totalCurtailedHrs > 0 ? annual.totalPriceCurtailmentSavings / totalCurtailedHrs : 0;

    // Rate vs benchmark (Rate 65 ~ 9¢/kWh Alberta typical)
    const allInCents = annual.avgPerKwhCAD * 100;
    const benchmark = 9.0; // Rate 65 benchmark
    const rateScore = Math.min(100, Math.max(0, ((benchmark - allInCents) / benchmark) * 100 + 50));

    return [
      { label: 'Uptime Efficiency', value: uptimeScore, detail: `${uptimeActual.toFixed(1)}% of ${uptimeTarget}% target`, color: uptimeScore >= 95 ? 'hsl(160, 60%, 45%)' : uptimeScore >= 85 ? 'hsl(35, 85%, 55%)' : 'hsl(0, 65%, 55%)' },
      { label: '12CP Avoidance Value', value: twelveCPPct, detail: `$${twelveCPSavingsEst.toLocaleString(undefined, { maximumFractionDigits: 0 })} estimated savings`, color: twelveCPPct >= 30 ? 'hsl(160, 60%, 45%)' : 'hsl(35, 85%, 55%)' },
      { label: 'Price Curtailment ROI', value: Math.min(100, priceCurtailROI / 5 * 100), detail: `$${priceCurtailROI.toFixed(0)}/hr avoided (${totalCurtailedHrs} hrs)`, color: priceCurtailROI > 300 ? 'hsl(160, 60%, 45%)' : 'hsl(35, 85%, 55%)' },
      { label: 'Rate vs Benchmark', value: rateScore, detail: `${allInCents.toFixed(2)}¢ vs ~${benchmark}¢ Rate 65`, color: allInCents < benchmark ? 'hsl(160, 60%, 45%)' : 'hsl(0, 65%, 55%)' },
    ];
  }, [annual, monthly, params, breakeven]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          Efficiency Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((m, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-foreground">{m.label}</span>
              <span className="text-[10px] text-muted-foreground">{m.detail}</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(2, m.value)}%`, backgroundColor: m.color }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RiskHeatmap({ monthly }: { monthly: MonthlyResult[] }) {
  const data = useMemo(() => {
    // Pool price volatility per month
    const avgPoolPrices = monthly.map(m => m.avgPoolPriceRunning);
    const overallAvg = avgPoolPrices.reduce((s, v) => s + v, 0) / avgPoolPrices.length || 1;

    return monthly.map(m => {
      // Volatility: deviation from mean
      const volRatio = Math.abs(m.avgPoolPriceRunning - overallAvg) / overallAvg;
      const volLevel: 'low' | 'med' | 'high' = volRatio < 0.15 ? 'low' : volRatio < 0.35 ? 'med' : 'high';

      // Cost intensity: per-kWh rate relative to annual average
      const avgRate = monthly.reduce((s, x) => s + x.perKwhCAD, 0) / monthly.length;
      const costRatio = avgRate > 0 ? m.perKwhCAD / avgRate : 1;
      const costLevel: 'low' | 'med' | 'high' = costRatio < 0.9 ? 'low' : costRatio < 1.1 ? 'med' : 'high';

      // Curtailment pressure: curtailed hours as % of total
      const curtPct = m.totalHours > 0 ? m.curtailedHours / m.totalHours : 0;
      const curtLevel: 'low' | 'med' | 'high' = curtPct < 0.03 ? 'low' : curtPct < 0.08 ? 'med' : 'high';

      return {
        month: m.month.slice(0, 3),
        volatility: volLevel,
        cost: costLevel,
        curtailment: curtLevel,
      };
    });
  }, [monthly]);

  const levelColor = (level: 'low' | 'med' | 'high') =>
    level === 'low' ? 'bg-emerald-500/60' : level === 'med' ? 'bg-amber-500/60' : 'bg-red-500/60';

  const rows = [
    { label: 'Price Volatility', key: 'volatility' as const },
    { label: 'Cost Intensity', key: 'cost' as const },
    { label: 'Curtailment', key: 'curtailment' as const },
  ];

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" />
          Risk Heatmap — Seasonal Patterns
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Header row */}
            <div className="grid gap-1" style={{ gridTemplateColumns: '100px repeat(12, 1fr)' }}>
              <div />
              {data.map((d, i) => (
                <div key={i} className="text-center text-[9px] font-medium text-muted-foreground pb-1">{d.month}</div>
              ))}
            </div>
            {/* Data rows */}
            {rows.map((row) => (
              <div key={row.key} className="grid gap-1 mb-1" style={{ gridTemplateColumns: '100px repeat(12, 1fr)' }}>
                <div className="text-[10px] text-muted-foreground flex items-center">{row.label}</div>
                {data.map((d, i) => (
                  <div key={i} className={`h-6 rounded-sm ${levelColor(d[row.key])} transition-colors`} title={`${d.month} ${row.label}: ${d[row.key]}`} />
                ))}
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/20">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-500/60" /><span className="text-[9px] text-muted-foreground">Low</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-amber-500/60" /><span className="text-[9px] text-muted-foreground">Medium</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-500/60" /><span className="text-[9px] text-muted-foreground">High</span></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PowerModelAIAnalysis({ params, tariffOverrides, annual, monthly, breakeven, autoTrigger }: Props) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  const generateAnalysis = useCallback(async () => {
    if (!annual) return;
    setLoading(true);
    setAnalysis(null);
    setLoadingStage(0);

    const stageTimers: NodeJS.Timeout[] = [];
    let elapsed = 0;
    for (let i = 1; i < LOADING_STAGES.length; i++) {
      elapsed += LOADING_STAGES[i - 1].duration;
      stageTimers.push(setTimeout(() => setLoadingStage(i), elapsed));
    }

    try {
      const { data, error } = await supabase.functions.invoke('dashboard-ai-assistant', {
        body: {
          action: 'power-model-analysis',
          powerModelData: {
            params, tariffOverrides, annual,
            monthly: monthly.map(m => ({
              month: m.month, totalHours: m.totalHours, runningHours: m.runningHours,
              curtailedHours: m.curtailedHours, uptimePercent: m.uptimePercent, mwh: m.mwh,
              avgPoolPriceRunning: m.avgPoolPriceRunning, totalDTSCharges: m.totalDTSCharges,
              totalEnergyCharges: m.totalEnergyCharges, totalFortisCharges: m.totalFortisCharges,
              totalAmountDue: m.totalAmountDue, perKwhCAD: m.perKwhCAD, perKwhUSD: m.perKwhUSD,
              curtailmentSavings: m.curtailmentSavings, overContractCredits: m.overContractCredits,
            })),
            breakeven,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalysis(data.response);
    } catch (err: any) {
      const msg = err.message || 'Unknown error';
      if (msg.includes('Rate limit') || msg.includes('429')) {
        toast({ title: 'Rate limited', description: 'Please wait a moment and try again.', variant: 'destructive' });
      } else if (msg.includes('credits') || msg.includes('402')) {
        toast({ title: 'AI credits exhausted', description: 'Add credits to continue using AI analysis.', variant: 'destructive' });
      } else {
        toast({ title: 'Analysis failed', description: msg, variant: 'destructive' });
      }
    } finally {
      stageTimers.forEach(clearTimeout);
      setLoading(false);
    }
  }, [annual, params, tariffOverrides, monthly, breakeven, toast]);

  useEffect(() => {
    if (autoTrigger && annual && !hasAutoTriggered && !analysis && !loading) {
      setHasAutoTriggered(true);
      generateAnalysis();
    }
  }, [autoTrigger, annual, hasAutoTriggered, analysis, loading, generateAnalysis]);

  const parsedSections = analysis ? parseAIResponse(analysis) : [];
  const summarySection = parsedSections.find(s => s.type === 'summary');
  const gridSections = parsedSections.filter(s => s.type !== 'summary' && s.type !== 'recommendation');
  const recommendationSection = parsedSections.find(s => s.type === 'recommendation');
  const quickStats = useMemo(() => analysis ? extractQuickStats(analysis) : [], [analysis]);

  const hasVisualData = !!annual && monthly.length > 0;

  return (
    <Card className="overflow-hidden border-border/60">
      {/* Header */}
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/8 via-primary/3 to-transparent border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                AI Cost Intelligence
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">Gemini 2.0</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {monthly.length > 0 ? `Analyzing ${monthly.length} months of cost data` : 'Load data to begin analysis'}
              </p>
            </div>
          </div>
          <Button onClick={generateAnalysis} disabled={loading || !annual} size="sm" variant={analysis ? 'outline' : 'default'} className="text-xs h-8">
            {loading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Analyzing...</> : <><Sparkles className="w-3 h-3 mr-1" />{analysis ? 'Regenerate' : 'Generate Analysis'}</>}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* ===== VISUAL PANELS (render immediately from data, no AI needed) ===== */}
        {hasVisualData && (
          <div className="space-y-4 mb-6">
            {/* Row 1: Waterfall + Rate Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CostWaterfallChart annual={annual!} />
              <MonthlyRateTrendChart monthly={monthly} breakeven={breakeven} params={params} />
            </div>

            {/* Row 2: Donut + Scorecard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CostComponentDonut annual={annual!} />
              <EfficiencyScorecard annual={annual!} monthly={monthly} params={params} breakeven={breakeven} />
            </div>

            {/* Row 3: Risk Heatmap */}
            <RiskHeatmap monthly={monthly} />

            <div className="border-t border-border/30" />
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="text-center py-10 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mx-auto border border-primary/10">
              <Sparkles className="w-7 h-7 text-primary/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">AI Analysis Ready</p>
              <p className="text-xs text-muted-foreground mt-1">Will auto-generate when data loads, or click Generate</p>
            </div>
          </div>
        )}

        {/* Multi-Step Loading */}
        {loading && (
          <div className="py-10 space-y-6">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-pulse" />
                <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
                  <Brain className="w-7 h-7 text-primary animate-pulse" />
                </div>
              </div>
            </div>
            <div className="space-y-3 max-w-sm mx-auto">
              {LOADING_STAGES.map((stage, i) => {
                const StageIcon = stage.icon;
                const isActive = i === loadingStage;
                const isDone = i < loadingStage;
                return (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${isActive ? 'opacity-100' : isDone ? 'opacity-50' : 'opacity-25'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-emerald-500/15' : isActive ? 'bg-primary/15' : 'bg-muted/50'}`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <StageIcon className={`w-4 h-4 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />}
                    </div>
                    <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {analysis && parsedSections.length > 0 && (
          <div className="space-y-5">
            {/* Quick Stats Pills */}
            {quickStats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quickStats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                    <span className="text-xs font-bold text-foreground">{stat.value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <BarChart3 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Data</span>
                  <span className="text-xs font-bold text-foreground">{monthly.length} months</span>
                </div>
              </div>
            )}

            {/* Executive Summary Hero */}
            {summarySection && (
              <div className="rounded-xl overflow-hidden border border-emerald-500/30">
                <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/15 shrink-0 mt-0.5">
                      <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground mb-2">{summarySection.title}</h3>
                      <div className="space-y-2">
                        {summarySection.items.map((item, j) => (
                          <p key={j} className="text-sm leading-relaxed text-muted-foreground"
                             dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2-Column Insight Grid */}
            {gridSections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gridSections.map((section, i) => {
                  const config = sectionConfig[section.type];
                  return (
                    <div key={i} className={`rounded-xl border-l-4 ${config.border} ${config.bg} p-4 transition-all hover:shadow-sm`}>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`p-1.5 rounded-lg ${config.iconBg}`}>
                          {config.icon}
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
                      </div>
                      <div className="space-y-2 pl-1">
                        {section.items.map((item, j) => (
                          <div key={j} className="flex items-start gap-2 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30 mt-2 shrink-0" />
                            <p className="text-xs leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors"
                               dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recommendation Banner */}
            {recommendationSection && (
              <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/15 shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">{recommendationSection.title}</h4>
                    <div className="space-y-1.5">
                      {recommendationSection.items.map((item, j) => (
                        <p key={j} className="text-xs leading-relaxed text-muted-foreground"
                           dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="pt-3 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Analysis based on your input parameters and historical AESO data. Not financial advice.
              </p>
            </div>
          </div>
        )}

        {analysis && parsedSections.length === 0 && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {analysis}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
