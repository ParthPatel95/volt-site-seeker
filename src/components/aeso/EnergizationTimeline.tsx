import React, { useState, useMemo } from 'react';
import { format, addWeeks } from 'date-fns';
import { CalendarIcon, ExternalLink, Shield, DollarSign, Clock, ChevronDown, ChevronUp, Info, CheckCircle2, Zap, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AESO_CONNECTION_STAGES,
  AESO_ISO_FEES,
  AESO_FINANCIAL_SECURITY,
  AESO_PRUDENTIAL_POOL_PRICES,
  ALBERTA_DFOS,
  AESO_DATA_CENTRE_STAGING,
  withGST,
  formatCAD,
  type ConnectionStage,
} from '@/constants/energization-fees';
import { AESO_RATE_DTS_2026 } from '@/constants/tariff-rates';

function SourceBadge({ url, label }: { url: string; label: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
      <Badge variant="outline" className="text-xs gap-1 font-normal hover:bg-accent cursor-pointer text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        {label}
        <ExternalLink className="w-3 h-3" />
      </Badge>
    </a>
  );
}

/** Calculate monthly DTS charges using verified 2026 tariff constants */
function calculateMonthlyDTS(capacityMW: number, loadFactor: number, poolPrice: number, substationFraction: number) {
  const t = AESO_RATE_DTS_2026;
  const monthlyMWh = capacityMW * loadFactor * 730; // avg hours per month

  // Bulk System
  const bulkDemand = capacityMW * t.bulkSystem.coincidentDemand;
  const bulkEnergy = monthlyMWh * t.bulkSystem.meteredEnergy;

  // Regional System
  const regionalCapacity = capacityMW * t.regionalSystem.billingCapacity;
  const regionalEnergy = monthlyMWh * t.regionalSystem.meteredEnergy;

  // Point of Delivery
  const podSubstation = t.pointOfDelivery.substation * substationFraction;
  let podDemand = 0;
  let remainingMW = capacityMW;
  for (const tier of t.pointOfDelivery.tiers) {
    const tierMW = Math.min(remainingMW, tier.mw === Infinity ? remainingMW : tier.mw);
    podDemand += tierMW * tier.rate;
    remainingMW -= tierMW;
    if (remainingMW <= 0) break;
  }

  // Volumetric charges
  const operatingReserve = (poolPrice * t.operatingReserve.ratePercent / 100) * monthlyMWh;
  const tcr = monthlyMWh * t.tcr.meteredEnergy;
  const voltageControl = monthlyMWh * t.voltageControl.meteredEnergy;
  const systemSupport = capacityMW * t.systemSupport.highestDemand;
  const riderF = monthlyMWh * t.riderF.meteredEnergy;
  const retailerFee = monthlyMWh * t.retailerFee.meteredEnergy;

  const subtotal = bulkDemand + bulkEnergy + regionalCapacity + regionalEnergy + podSubstation + podDemand + operatingReserve + tcr + voltageControl + systemSupport + riderF + retailerFee;
  const gst = subtotal * t.gst;
  const total = subtotal + gst;

  return {
    bulkDemand, bulkEnergy, regionalCapacity, regionalEnergy,
    podSubstation, podDemand, operatingReserve, tcr, voltageControl,
    systemSupport, riderF, retailerFee, subtotal, gst, total,
    monthlyMWh,
  };
}

function StageCard({ stage, startDate, isExpanded, onToggle }: {
  stage: ConnectionStage;
  startDate: Date | null;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const endDate = startDate && stage.targetWeeks ? addWeeks(startDate, stage.targetWeeks) : null;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={cn('border transition-colors', isExpanded ? 'border-primary/40 bg-primary/5' : 'hover:border-primary/20')}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  {stage.id}
                </div>
                <div>
                  <CardTitle className="text-sm">{stage.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {stage.gateName}
                    {stage.targetWeeks && ` · ${stage.targetWeeks} weeks`}
                    {!stage.targetWeeks && ' · Variable duration'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stage.financialObligations.length > 0 && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <DollarSign className="w-3 h-3" />
                    {stage.financialObligations.length}
                  </Badge>
                )}
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
            {startDate && (
              <p className="text-xs text-muted-foreground mt-1 ml-11">
                {format(startDate, 'MMM d, yyyy')}
                {endDate && ` → ${format(endDate, 'MMM d, yyyy')}`}
              </p>
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-muted-foreground">{stage.description}</p>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Key Deliverables</p>
              <ul className="space-y-1">
                {stage.keyDeliverables.map((d, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            {stage.financialObligations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Financial Obligations</p>
                <ul className="space-y-1">
                  {stage.financialObligations.map((f, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="text-xs">{stage.responsibleParty}</Badge>
              <SourceBadge url={stage.source} label="AESO Connection Process" />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function EnergizationTimeline() {
  const [capacityMW, setCapacityMW] = useState(45);
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [dfo, setDfo] = useState('fortisalberta');
  const [loadFactor, setLoadFactor] = useState(0.95);
  const [substationFraction, setSubstationFraction] = useState(1.0);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [poolPrice, setPoolPrice] = useState(51); // Jan 2026 prudential

  // Calculate all financial figures
  const calculations = useMemo(() => {
    const clusterPreliminary = AESO_ISO_FEES.clusterPreliminaryFee.calculate(capacityMW);
    const clusterDetailed = AESO_ISO_FEES.clusterDetailedFee.calculate(capacityMW);
    const poolParticipation = AESO_ISO_FEES.poolParticipationFee.amount;

    const monthlyDTS = calculateMonthlyDTS(capacityMW, loadFactor, poolPrice, substationFraction);
    const financialSecurityDTS = monthlyDTS.total * AESO_FINANCIAL_SECURITY.monthsRequired;

    // Energy market financial security: 2 months of estimated energy purchases
    const monthlyEnergy = capacityMW * loadFactor * 730 * poolPrice;
    const financialSecurityEnergy = monthlyEnergy * AESO_FINANCIAL_SECURITY.monthsRequired;

    const totalUpfrontFees = withGST(clusterPreliminary) + withGST(clusterDetailed) + withGST(poolParticipation);
    const totalRefundableSecurity = financialSecurityDTS + financialSecurityEnergy;
    const totalCapitalAtRisk = totalUpfrontFees + totalRefundableSecurity + monthlyDTS.total;

    return {
      clusterPreliminary,
      clusterDetailed,
      poolParticipation,
      monthlyDTS,
      financialSecurityDTS,
      financialSecurityEnergy,
      monthlyEnergy,
      totalUpfrontFees,
      totalRefundableSecurity,
      totalCapitalAtRisk,
    };
  }, [capacityMW, loadFactor, poolPrice, substationFraction]);

  // Compute stage dates backward from target energization
  const stageDates = useMemo(() => {
    if (!targetDate) return {};
    // Stages 1-3 have known durations, work backward from target
    const stage3Weeks = AESO_CONNECTION_STAGES[2].targetWeeks || 32;
    const stage2Weeks = AESO_CONNECTION_STAGES[1].targetWeeks || 16;
    const stage1Weeks = AESO_CONNECTION_STAGES[0].targetWeeks || 8;

    // Rough estimates: stages 4+5 combined ~52 weeks (variable but indicative)
    const stage45Weeks = 52;

    const stage5End = targetDate;
    const stage5Start = addWeeks(stage5End, -26);
    const stage4Start = addWeeks(stage5Start, -26);
    const stage3Start = addWeeks(stage4Start, -stage3Weeks);
    const stage2Start = addWeeks(stage3Start, -stage2Weeks);
    const stage1Start = addWeeks(stage2Start, -stage1Weeks);

    return {
      1: stage1Start,
      2: stage2Start,
      3: stage3Start,
      4: stage4Start,
      5: stage5Start,
      6: targetDate,
    } as Record<number, Date>;
  }, [targetDate]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Energization Timeline Planner
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Model the full AESO connection process — every fee, deposit, and milestone from SASR to In-Service Date.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <SourceBadge url="https://www.aeso.ca/grid/connecting-to-the-grid/connection-process/" label="AESO Connection Process" />
            <SourceBadge url="https://www.aeso.ca/rules-standards-and-tariff/iso-fees/" label="ISO Fees" />
            <SourceBadge url="https://www.aeso.ca/rules-standards-and-tariff/iso-rules/section-103-3-financial-security-requirements/" label="Section 103.3" />
          </div>
        </div>

        {/* Section 1: Input Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Facility Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Capacity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contracted Capacity</label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[capacityMW]}
                    onValueChange={([v]) => setCapacityMW(v)}
                    min={1}
                    max={200}
                    step={1}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={capacityMW}
                      onChange={(e) => setCapacityMW(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
                      className="w-20 h-8 text-sm"
                    />
                    <span className="text-sm text-muted-foreground">MW</span>
                  </div>
                </div>
              </div>

              {/* Target Energization Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Target Energization Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal h-8 text-sm', !targetDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDate ? format(targetDate, 'PPP') : 'Select target date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* DFO */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Distribution Facility Owner</label>
                <Select value={dfo} onValueChange={setDfo}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALBERTA_DFOS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} — {d.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Load Factor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Load Factor
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 inline ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Ratio of average load to contracted capacity (0.5–1.0)</TooltipContent>
                  </Tooltip>
                </label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[loadFactor * 100]}
                    onValueChange={([v]) => setLoadFactor(v / 100)}
                    min={50}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{(loadFactor * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Pool Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Prudential Pool Price
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 inline ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AESO-published prudential pool price.</p>
                      <p>Jan 2026: $51/MWh, Feb 2026: $33/MWh</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={poolPrice}
                    onChange={(e) => setPoolPrice(Math.max(0, Number(e.target.value) || 0))}
                    className="w-24 h-8 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">$/MWh</span>
                </div>
              </div>

              {/* Substation Fraction */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Substation Fraction
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 inline ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Fraction of POD substation cost allocated (0.0–1.0)</TooltipContent>
                  </Tooltip>
                </label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[substationFraction * 100]}
                    onValueChange={([v]) => setSubstationFraction(v / 100)}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{(substationFraction * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Connection Process Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            AESO Connection Process — 6 Stage Timeline
          </h3>

          {/* Visual timeline bar */}
          <div className="hidden lg:flex items-center gap-0 mb-4 px-2">
            {AESO_CONNECTION_STAGES.map((stage, i) => (
              <React.Fragment key={stage.id}>
                <div
                  className={cn(
                    'flex-1 text-center py-2 px-1 rounded-lg border text-xs cursor-pointer transition-colors',
                    expandedStage === stage.id
                      ? 'bg-primary/10 border-primary/40 text-primary font-semibold'
                      : 'bg-card border-border text-muted-foreground hover:bg-accent/50'
                  )}
                  onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                >
                  <div className="font-medium">{stage.name}</div>
                  <div className="text-[10px]">{stage.targetWeeks ? `${stage.targetWeeks} wks` : 'Variable'}</div>
                </div>
                {i < AESO_CONNECTION_STAGES.length - 1 && (
                  <div className="w-4 h-0.5 bg-border flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Stage cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AESO_CONNECTION_STAGES.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                startDate={stageDates[stage.id] || null}
                isExpanded={expandedStage === stage.id}
                onToggle={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
              />
            ))}
          </div>
        </div>

        {/* Section 3: Financial Obligations Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financial Obligations Breakdown
            </CardTitle>
            <CardDescription>Every fee and deposit required before and after energization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pre-Connection Fees */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Pre-Connection Fees (non-refundable)</h4>
              <div className="space-y-2">
                <FeeRow
                  label="Cluster Assessment — Preliminary"
                  formula={AESO_ISO_FEES.clusterPreliminaryFee.formula}
                  amount={calculations.clusterPreliminary}
                  withGstAmount={withGST(calculations.clusterPreliminary)}
                  sourceUrl={AESO_ISO_FEES.clusterPreliminaryFee.source}
                  sourceLabel="ISO Fees"
                />
                <FeeRow
                  label="Cluster Assessment — Detailed"
                  formula={AESO_ISO_FEES.clusterDetailedFee.formula}
                  amount={calculations.clusterDetailed}
                  withGstAmount={withGST(calculations.clusterDetailed)}
                  sourceUrl={AESO_ISO_FEES.clusterDetailedFee.source}
                  sourceLabel="ISO Fees"
                />
                <FeeRow
                  label="Pool Participation Fee (annual)"
                  formula={`$${AESO_ISO_FEES.poolParticipationFee.amount} + GST`}
                  amount={calculations.poolParticipation}
                  withGstAmount={withGST(calculations.poolParticipation)}
                  sourceUrl={AESO_ISO_FEES.poolParticipationFee.source}
                  sourceLabel="ISO Fees"
                />
              </div>
            </div>

            <Separator />

            {/* Financial Security — DTS */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                Financial Security — SAS Agreement (refundable)
                <SourceBadge url={AESO_FINANCIAL_SECURITY.source} label="Section 103.3" />
              </h4>
              <p className="text-xs text-muted-foreground mb-2">{AESO_FINANCIAL_SECURITY.description}</p>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly DTS charges (estimated)</span>
                  <span className="font-medium">{formatCAD(calculations.monthlyDTS.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">× {AESO_FINANCIAL_SECURITY.monthsRequired} months</span>
                  <span className="font-bold text-foreground">{formatCAD(calculations.financialSecurityDTS)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Financial Security — Energy Market */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                Financial Security — Energy Market (refundable)
                <SourceBadge url={AESO_FINANCIAL_SECURITY.source} label="Section 103.3" />
              </h4>
              <p className="text-xs text-muted-foreground mb-2">Based on estimated monthly energy purchases at the prudential pool price.</p>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly energy cost ({capacityMW} MW × {(loadFactor * 100).toFixed(0)}% LF × 730 hrs × ${poolPrice}/MWh)</span>
                  <span className="font-medium">{formatCAD(calculations.monthlyEnergy)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">× {AESO_FINANCIAL_SECURITY.monthsRequired} months</span>
                  <span className="font-bold text-foreground">{formatCAD(calculations.financialSecurityEnergy)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Ongoing Charges */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Ongoing Post-Energization Charges</h4>
              <div className="space-y-2">
                <FeeRow
                  label="Energy Market Trading Charge"
                  formula={`$${AESO_ISO_FEES.energyMarketTradingCharge.perMWh}/MWh + GST`}
                  amount={AESO_ISO_FEES.energyMarketTradingCharge.perMWh * calculations.monthlyDTS.monthlyMWh}
                  withGstAmount={withGST(AESO_ISO_FEES.energyMarketTradingCharge.perMWh * calculations.monthlyDTS.monthlyMWh)}
                  sourceUrl={AESO_ISO_FEES.energyMarketTradingCharge.source}
                  sourceLabel="ISO Fees"
                />
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">Monthly DTS Charges (incl. GST)</span>
                    <span className="font-bold text-foreground">{formatCAD(calculations.monthlyDTS.total)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span>Bulk Demand (12CP)</span><span className="text-right">{formatCAD(calculations.monthlyDTS.bulkDemand)}</span>
                    <span>Bulk Energy</span><span className="text-right">{formatCAD(calculations.monthlyDTS.bulkEnergy)}</span>
                    <span>Regional Capacity</span><span className="text-right">{formatCAD(calculations.monthlyDTS.regionalCapacity)}</span>
                    <span>Regional Energy</span><span className="text-right">{formatCAD(calculations.monthlyDTS.regionalEnergy)}</span>
                    <span>POD Substation</span><span className="text-right">{formatCAD(calculations.monthlyDTS.podSubstation)}</span>
                    <span>POD Demand (tiered)</span><span className="text-right">{formatCAD(calculations.monthlyDTS.podDemand)}</span>
                    <span>Operating Reserve ({AESO_RATE_DTS_2026.operatingReserve.ratePercent}%)</span><span className="text-right">{formatCAD(calculations.monthlyDTS.operatingReserve)}</span>
                    <span>TCR</span><span className="text-right">{formatCAD(calculations.monthlyDTS.tcr)}</span>
                    <span>Voltage Control</span><span className="text-right">{formatCAD(calculations.monthlyDTS.voltageControl)}</span>
                    <span>System Support</span><span className="text-right">{formatCAD(calculations.monthlyDTS.systemSupport)}</span>
                    <span>Rider F</span><span className="text-right">{formatCAD(calculations.monthlyDTS.riderF)}</span>
                    <span>Retailer Fee</span><span className="text-right">{formatCAD(calculations.monthlyDTS.retailerFee)}</span>
                    <span>GST (5%)</span><span className="text-right">{formatCAD(calculations.monthlyDTS.gst)}</span>
                  </div>
                  <div className="mt-2">
                    <SourceBadge url={AESO_RATE_DTS_2026.sourceUrl} label="2026-015T Bill Estimator" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Total Capital-at-Risk Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            title="Upfront Fees"
            subtitle="Non-refundable"
            amount={calculations.totalUpfrontFees}
            icon={<DollarSign className="w-4 h-4" />}
            variant="default"
          />
          <SummaryCard
            title="DTS Security"
            subtitle="Refundable deposit"
            amount={calculations.financialSecurityDTS}
            icon={<Shield className="w-4 h-4" />}
            variant="default"
          />
          <SummaryCard
            title="Energy Security"
            subtitle="Refundable deposit"
            amount={calculations.financialSecurityEnergy}
            icon={<Shield className="w-4 h-4" />}
            variant="default"
          />
          <SummaryCard
            title="Total Capital at Risk"
            subtitle="Before first revenue"
            amount={calculations.totalCapitalAtRisk}
            icon={<Zap className="w-4 h-4" />}
            variant="highlight"
          />
        </div>

        {/* Section 5: Data Centre Staging Note */}
        <Card className="border-dashed">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Data Centre Staged Energizations</p>
                <p className="text-xs text-muted-foreground mt-1">{AESO_DATA_CENTRE_STAGING.description}</p>
                <div className="mt-2">
                  <SourceBadge url={AESO_DATA_CENTRE_STAGING.source} label="AESO Process Updates Nov 2025" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

function FeeRow({ label, formula, amount, withGstAmount, sourceUrl, sourceLabel }: {
  label: string;
  formula: string;
  amount: number;
  withGstAmount: number;
  sourceUrl: string;
  sourceLabel: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-muted/20 rounded-lg px-3 py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{formula}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">{formatCAD(withGstAmount)}</p>
          <p className="text-xs text-muted-foreground">{formatCAD(amount)} + GST</p>
        </div>
        <SourceBadge url={sourceUrl} label={sourceLabel} />
      </div>
    </div>
  );
}

function SummaryCard({ title, subtitle, amount, icon, variant }: {
  title: string;
  subtitle: string;
  amount: number;
  icon: React.ReactNode;
  variant: 'default' | 'highlight';
}) {
  return (
    <Card className={cn(variant === 'highlight' && 'border-primary/40 bg-primary/5')}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
        </div>
        <p className={cn('text-xl font-bold', variant === 'highlight' ? 'text-primary' : 'text-foreground')}>
          {formatCAD(amount)}
        </p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
