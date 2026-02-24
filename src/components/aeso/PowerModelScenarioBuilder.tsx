import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Layers, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnnualSummary, MonthlyResult } from '@/hooks/usePowerModelCalculator';

interface Props {
  annual: AnnualSummary | null;
  monthly: MonthlyResult[];
  cadUsdRate: number;
  fixedPriceCAD: number;
  capacityMW: number;
}

interface ToggleState {
  poolEnergy: boolean;
  operatingReserve: boolean;
  dtsTransmission: boolean;
  riderF: boolean;
  retailerFee: boolean;
  fortisDistribution: boolean;
  gst: boolean;
  // Optimization
  twelveCPAvoidance: boolean;
  priceCurtailment: boolean;
}

const DEFAULT_TOGGLES: ToggleState = {
  poolEnergy: true,
  operatingReserve: true,
  dtsTransmission: true,
  riderF: true,
  retailerFee: true,
  fortisDistribution: true,
  gst: true,
  twelveCPAvoidance: false,
  priceCurtailment: false,
};

function computeScenarioTotal(annual: AnnualSummary, toggles: ToggleState): number {
  let total = 0;

  if (toggles.poolEnergy) total += annual.totalPoolEnergy;
  if (toggles.operatingReserve) total += annual.totalOperatingReserve;
  if (toggles.dtsTransmission) {
    total += annual.totalBulkMeteredEnergy
      + annual.totalRegionalBillingCapacity
      + annual.totalRegionalMeteredEnergy
      + annual.totalPodCharges
      + annual.totalTCR
      + annual.totalVoltageControl
      + annual.totalSystemSupport;
    // Add bulk coincident demand (full charge before 12CP)
    if (!toggles.twelveCPAvoidance) {
      total += annual.totalBulkCoincidentDemandFull;
    }
  }
  if (toggles.riderF) total += annual.totalRiderF;
  if (toggles.retailerFee) total += annual.totalRetailerFee;
  if (toggles.fortisDistribution) {
    total += annual.totalFortisDemand + annual.totalFortisDistribution;
  }

  // Optimization deductions
  if (toggles.priceCurtailment) {
    total -= annual.totalPriceCurtailmentSavings;
  }

  // GST on the subtotal
  if (toggles.gst) {
    total *= 1.05;
  }

  return total;
}

function buildScenarioLabel(toggles: ToggleState): string {
  const parts: string[] = [];
  if (toggles.poolEnergy) parts.push('Energy');
  if (toggles.operatingReserve) parts.push('OR');
  if (toggles.dtsTransmission) parts.push('DTS');
  if (toggles.riderF || toggles.retailerFee) parts.push('Fees');
  if (toggles.fortisDistribution) parts.push('Fortis');
  if (toggles.gst) parts.push('GST');
  if (toggles.twelveCPAvoidance) parts.push('12CP');
  if (toggles.priceCurtailment) parts.push('Curtailment');
  return parts.join(' + ') || 'None';
}

interface PresetScenario {
  label: string;
  toggles: ToggleState;
}

const PRESETS: PresetScenario[] = [
  {
    label: 'Energy Only',
    toggles: { ...DEFAULT_TOGGLES, operatingReserve: false, dtsTransmission: false, riderF: false, retailerFee: false, fortisDistribution: false, gst: false },
  },
  {
    label: 'Energy + OR',
    toggles: { ...DEFAULT_TOGGLES, dtsTransmission: false, riderF: false, retailerFee: false, fortisDistribution: false, gst: false },
  },
  {
    label: 'Energy + OR + DTS',
    toggles: { ...DEFAULT_TOGGLES, riderF: false, retailerFee: false, fortisDistribution: false, gst: false },
  },
  {
    label: 'Full Rate 65 (no GST)',
    toggles: { ...DEFAULT_TOGGLES, gst: false },
  },
  {
    label: 'Full Rate 65',
    toggles: { ...DEFAULT_TOGGLES },
  },
  {
    label: 'Full + 12CP Avoidance',
    toggles: { ...DEFAULT_TOGGLES, twelveCPAvoidance: true },
  },
  {
    label: 'Full + Curtailment',
    toggles: { ...DEFAULT_TOGGLES, priceCurtailment: true },
  },
  {
    label: 'Full + Both Optimizations',
    toggles: { ...DEFAULT_TOGGLES, twelveCPAvoidance: true, priceCurtailment: true },
  },
];

export function PowerModelScenarioBuilder({ annual, monthly, cadUsdRate, fixedPriceCAD, capacityMW }: Props) {
  const [toggles, setToggles] = useState<ToggleState>(DEFAULT_TOGGLES);

  const toggle = (key: keyof ToggleState) => {
    if (key === 'poolEnergy') return; // Always on
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPreset = (preset: PresetScenario) => {
    setToggles(preset.toggles);
  };

  const results = useMemo(() => {
    if (!annual) return null;

    const totalKWh = annual.totalKWh;
    if (totalKWh <= 0) return null;

    const currentTotal = computeScenarioTotal(annual, toggles);
    const currentCentsKWh = (currentTotal / totalKWh) * 100;
    const currentCentsKWhUSD = currentCentsKWh * cadUsdRate;
    const fullStackTotal = computeScenarioTotal(annual, DEFAULT_TOGGLES);

    // Compute presets for quick compare
    const presetResults = PRESETS.map((preset) => {
      const total = computeScenarioTotal(annual, preset.toggles);
      const centsKWh = (total / totalKWh) * 100;
      return { ...preset, total, centsKWh };
    });

    // Compute progressive deltas
    const withDeltas = presetResults.map((p, i) => ({
      ...p,
      delta: i > 0 ? p.centsKWh - presetResults[i - 1].centsKWh : 0,
    }));

    return {
      currentTotal,
      currentCentsKWh,
      currentCentsKWhUSD,
      fullStackTotal,
      scenarioLabel: buildScenarioLabel(toggles),
      presets: withDeltas,
    };
  }, [annual, toggles, cadUsdRate]);

  if (!annual || !results) return null;

  const costComponents: { key: keyof ToggleState; label: string; description: string; locked?: boolean }[] = [
    { key: 'poolEnergy', label: 'Pool Energy', description: 'Baseline energy cost', locked: true },
    { key: 'operatingReserve', label: 'Operating Reserve', description: `${(8.13).toFixed(1)}% surcharge on pool price` },
    { key: 'dtsTransmission', label: 'DTS Transmission', description: 'Bulk, Regional, POD, TCR, Voltage, Support' },
    { key: 'riderF', label: 'Rider F (Balancing Pool)', description: '$1.26/MWh' },
    { key: 'retailerFee', label: 'Retailer Fee', description: '$0.25/MWh self-retailer admin' },
    { key: 'fortisDistribution', label: 'FortisAlberta Distribution', description: 'Demand + volumetric delivery' },
    { key: 'gst', label: 'GST (5%)', description: 'Federal goods & services tax' },
  ];

  const optimizations: { key: keyof ToggleState; label: string; description: string }[] = [
    { key: 'twelveCPAvoidance', label: '12CP Avoidance', description: 'Eliminates Bulk Coincident Demand charge' },
    { key: 'priceCurtailment', label: 'Price Curtailment', description: 'Avoids highest-cost energy hours' },
  ];

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">All-In Price Scenario Builder</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle cost components to compare scenarios</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {annual.totalKWh > 0 ? `${(annual.totalMWh).toLocaleString(undefined, { maximumFractionDigits: 0 })} MWh` : '—'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Toggle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cost Components */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cost Components</h4>
            <div className="space-y-2">
              {costComponents.map((item) => (
                <label
                  key={item.key}
                  className={cn(
                    'flex items-start gap-2.5 p-2 rounded-md border transition-colors cursor-pointer',
                    toggles[item.key]
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-muted/30 border-border/50 opacity-60',
                    item.locked && 'cursor-default'
                  )}
                >
                  <Checkbox
                    checked={toggles[item.key]}
                    onCheckedChange={() => toggle(item.key)}
                    disabled={item.locked}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium">{item.label}</span>
                    <p className="text-[10px] text-muted-foreground leading-tight">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Optimization Programs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Optimization Programs</h4>
            <div className="space-y-2">
              {optimizations.map((item) => (
                <label
                  key={item.key}
                  className={cn(
                    'flex items-start gap-2.5 p-2 rounded-md border transition-colors cursor-pointer',
                    toggles[item.key]
                      ? 'bg-data-positive/5 border-data-positive/30'
                      : 'bg-muted/30 border-border/50'
                  )}
                >
                  <Checkbox
                    checked={toggles[item.key]}
                    onCheckedChange={() => toggle(item.key)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium">{item.label}</span>
                    <p className="text-[10px] text-muted-foreground leading-tight">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Preset Quick Apply */}
            <div className="pt-3 border-t border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Presets</h4>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      'px-2 py-1 rounded text-[10px] font-medium border transition-colors',
                      buildScenarioLabel(toggles) === buildScenarioLabel(preset.toggles)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:border-border'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="border-t border-border/50 pt-4 space-y-4">
          {/* Current Scenario Summary */}
          <div className="rounded-lg bg-muted/30 border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Scenario:</span>
              <Badge variant="info" size="sm">{results.scenarioLabel}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground">All-In Price (CAD)</p>
                <p className="text-xl font-bold text-foreground">{results.currentCentsKWh.toFixed(2)}<span className="text-xs font-normal text-muted-foreground ml-1">¢/kWh</span></p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">All-In Price (USD)</p>
                <p className="text-xl font-bold text-foreground">{results.currentCentsKWhUSD.toFixed(2)}<span className="text-xs font-normal text-muted-foreground ml-1">¢/kWh</span></p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Annual Total</p>
                <p className="text-xl font-bold text-foreground">
                  ${(results.currentTotal / 1e6).toFixed(2)}<span className="text-xs font-normal text-muted-foreground ml-1">M</span>
                </p>
              </div>
            </div>

            {/* Comparison bar vs full stack */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>vs Full Rate 65</span>
                <span>{((results.currentTotal / results.fullStackTotal) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (results.currentTotal / results.fullStackTotal) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Compare Table */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Progressive Comparison</h4>
            <div className="space-y-0.5">
              {results.presets.map((preset, i) => {
                const isActive = buildScenarioLabel(toggles) === buildScenarioLabel(preset.toggles);
                return (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-1.5 rounded text-xs transition-colors',
                      isActive
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted/50 border border-transparent'
                    )}
                  >
                    <span className={cn('font-medium', isActive && 'text-primary')}>{preset.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums">{preset.centsKWh.toFixed(2)} ¢/kWh</span>
                      {i > 0 && (
                        <span className={cn(
                          'flex items-center gap-0.5 font-mono tabular-nums text-[10px] min-w-[60px] justify-end',
                          preset.delta > 0 ? 'text-data-negative' : preset.delta < 0 ? 'text-data-positive' : 'text-muted-foreground'
                        )}>
                          {preset.delta > 0 ? <TrendingUp className="w-3 h-3" /> : preset.delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {preset.delta > 0 ? '+' : ''}{preset.delta.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
