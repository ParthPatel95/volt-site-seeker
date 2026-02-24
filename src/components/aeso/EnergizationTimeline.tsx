import React, { useState, useMemo, useCallback } from 'react';
import { format, addWeeks } from 'date-fns';
import { CapacitySensitivityChart } from './energization-charts/CapacitySensitivityChart';
import { CashFlowWaterfall } from './energization-charts/CashFlowWaterfall';
import { GanttTimeline } from './energization-charts/GanttTimeline';
import { DTSBreakdownDonut } from './energization-charts/DTSBreakdownDonut';
import { AnnualProjectionTable } from './energization-charts/AnnualProjectionTable';
import { DFOComparisonChart } from './energization-charts/DFOComparisonChart';
import { CalendarIcon, ExternalLink, Shield, DollarSign, Clock, ChevronDown, ChevronUp, Info, CheckCircle2, Zap, Building2, ArrowUpDown } from 'lucide-react';
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
  DFO_DISTRIBUTION_RATES,
  withGST,
  formatCAD,
  type ConnectionStage,
  type DFODistributionRates,
} from '@/constants/energization-fees';
import { AESO_RATE_DTS_2026 } from '@/constants/tariff-rates';

function SourceBadge({ url, label }: { url: string; label: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
      <Badge variant="outline" className="text-xs gap-1 font-normal hover:bg-accent cursor-pointer text-primary">
        <CheckCircle2 className="w-3 h-3 text-primary" />
        {label}
        <ExternalLink className="w-3 h-3" />
      </Badge>
    </a>
  );
}

function FormLink({ href, label, updated }: { href: string; label: string; updated?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md px-2.5 py-2 transition-colors border border-border/50"
    >
      <ExternalLink className="w-3 h-3 flex-shrink-0 text-primary" />
      <span className="flex-1 truncate">{label}</span>
      {updated && <span className="text-[10px] text-muted-foreground flex-shrink-0">{updated}</span>}
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
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
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
                      <DollarSign className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />
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

        {/* Cluster 3 Status Banner */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">Cluster 3 SASR Intake Window — Now Open</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The Cluster 3 System Access Service Request (SASR) submission deadline is <strong className="text-foreground">April 30, 2026</strong>. 
                    Projects must have a grid connection date on or before April 30, 2031. The window was extended from February to accommodate restudies 
                    from expected Cluster 2 cancellations. Stage 1 has been extended by two months to March 2027.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                  <div className="bg-background/50 rounded-md p-2">
                    <p className="text-muted-foreground">SASR Deadline</p>
                    <p className="font-semibold text-foreground">April 30, 2026</p>
                  </div>
                  <div className="bg-background/50 rounded-md p-2">
                    <p className="text-muted-foreground">Fee Invoice Issued</p>
                    <p className="font-semibold text-foreground">May 27, 2026</p>
                  </div>
                  <div className="bg-background/50 rounded-md p-2">
                    <p className="text-muted-foreground">Fee + TFO Arrangement Due</p>
                    <p className="font-semibold text-foreground">June 26, 2026</p>
                  </div>
                  <div className="bg-background/50 rounded-md p-2">
                    <p className="text-muted-foreground">Project List Published</p>
                    <p className="font-semibold text-foreground">July 3, 2026</p>
                  </div>
                </div>
                <SourceBadge url="https://www.aeso.ca/grid/connecting-to-the-grid/cluster-assessment/" label="AESO Cluster 3 Schedule" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AESO Forms, Templates & Key Documents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              AESO Forms, Templates & Key Documents
            </CardTitle>
            <CardDescription>Official forms required throughout the connection process — sourced directly from AESO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Reference Guides */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Reference Guides</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormLink href="https://www.aeso.ca/assets/templates/Quick-Reference-Guide-Cluster-Assessment.pdf" label="Cluster Assessment Process" updated="May 27, 2025" />
                <FormLink href="https://www.aeso.ca/assets/templates/Quick-Reference-Guide-Independent-Assessment.pdf" label="Independent Assessment Process" updated="May 27, 2025" />
                <FormLink href="https://www.aeso.ca/assets/templates/Quick-Reference-Guide-Connection-Process.pdf" label="Connection Process" updated="May 27, 2025" />
                <FormLink href="https://www.aeso.ca/assets/templates/Quick-Reference-Guide-Behind-The-Fence.pdf" label="Behind the Fence Process" updated="May 27, 2025" />
                <FormLink href="https://www.aeso.ca/assets/templates/Quick-Reference-Guide-Contract-Process.pdf" label="Contract Process" updated="May 27, 2025" />
                <FormLink href="https://www.aeso.ca/assets/templates/Financial-Obligations-for-Connection-BTF-Contract-Projects.pdf" label="Financial Obligations Guide" updated="July 17, 2025" />
              </div>
            </div>

            <Separator />

            {/* SASR Submission */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">SASR Submission (Stage 0)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormLink href="https://experience.adobe.com/" label="Adobe Workfront — SASR Online Portal" />
                <FormLink href="https://www.aeso.ca/assets/templates/SASR-Guide.pdf" label="SASR Guide (How to Submit)" />
                <FormLink href="https://www.aeso.ca/grid/connecting-to-the-grid/cluster-assessment/" label="Cluster Assessment Page" />
                <FormLink href="https://www.aeso.ca/grid/connecting-to-the-grid/transmission-capability-map/" label="Transmission Capability Map" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                To set up an Adobe Workfront account, email <a href="mailto:customer.connections@aeso.ca" className="text-primary hover:underline">customer.connections@aeso.ca</a>
              </p>
            </div>

            <Separator />

            {/* Fee Guidelines */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fees & Financial Security</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormLink href="https://www.aeso.ca/assets/templates/cluster-assessments/Fee-Guideline.pdf" label="Cluster Assessment Fee Guideline" />
                <FormLink href="https://www.aeso.ca/rules-standards-and-tariff/iso-fees/" label="ISO Fees Schedule" />
                <FormLink href="https://www.aeso.ca/rules-standards-and-tariff/iso-rules/section-103-3-financial-security-requirements/" label="Section 103.3 — Financial Security" />
                <FormLink href="https://www.aeso.ca/rules-standards-and-tariff/tariff/guoc-rates/" label="GUOC Estimate Calculator" />
              </div>
            </div>

            <Separator />

            {/* Stage 3 Templates */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Stage 3 — Regulatory Preparation</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormLink href="https://www.aeso.ca/assets/templates/Engineering-Connection-Assessment-Study-Results.docx" label="Engineering Connection Assessment — Study Results (.docx)" />
                <FormLink href="https://www.aeso.ca/assets/templates/aeso-cost-template.xlsx" label="AESO Cost Estimate Template (.xlsx)" />
                <FormLink href="https://www.aeso.ca/assets/templates/Environmental-Effects-Screening-Form.docx" label="Environmental Effects Screening Form (.docx)" />
                <FormLink href="https://www.aeso.ca/assets/templates/Project-Schedule-Alignment-Connection.docx" label="Project Schedule Alignment (.docx)" />
              </div>
            </div>

            <Separator />

            {/* Stage 5-6 Templates */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Stages 5-6 — Energization & Close Out</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormLink href="https://www.aeso.ca/assets/templates/Energization-Package-Requirements.pdf" label="Energization Package Requirements" />
                <FormLink href="https://www.aeso.ca/assets/templates/Commissioning-Certificate-Request-Form.docx" label="Commissioning Certificate Request (.docx)" />
                <FormLink href="https://www.aeso.ca/grid/connecting-to-the-grid/project-data-update-package-submissions/" label="PDUP Instruction Manual" />
                <FormLink href="https://www.aeso.ca/market/market-participation/joining-the-energy-market/" label="Joining the Energy Market (ETS Setup)" />
              </div>
            </div>

            <Separator />

            {/* ISO Rules & Standards */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Relevant ISO Rules & Standards</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormLink href="https://www.aeso.ca/rules-standards-and-tariff/iso-rules/section-501-3-abbreviated-needs-approval-process/" label="Section 501.3 — Abbreviated Needs Approval (ANAP)" />
                <FormLink href="https://www.aeso.ca/rules-standards-and-tariff/iso-rules/section-503-21-reporting-facility-modelling-data/" label="Section 503.21 — Facility Modelling Data" />
                <FormLink href="https://www.aeso.ca/rules-standards-and-tariff/iso-rules/section-504-5-service-proposals-and-cost-estimating/" label="Section 504.5 — Service Proposals & Cost Estimating" />
                <FormLink href="https://www.aeso.ca/rules-standards-and-tariff/iso-rules/section-505-3-coordinating-synchronization-commissioning-wecc-testing-and-ancillary-services-testing/" label="Section 505.3 — Commissioning & Testing" />
                <FormLink href="https://www.aeso.ca/grid/connecting-to-the-grid/market-participant-choice/" label="Market Participant Choice (MPC) Process" />
                <FormLink href="https://www.aeso.ca/future-of-electricity/reliability-requirements-roadmap/" label="IBR Connection Requirements" />
              </div>
            </div>

            {/* Information Document */}
            <div className="bg-muted/30 rounded-lg p-3 flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">Key Information Document:</strong>{' '}
                <a href="https://www.aeso.ca/rules-standards-and-tariff/tariff/id-2018-018t-provision-of-system-access-service-and-the-connection-process" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  ID #2018-018T — Provision of System Access Service and the Connection Process
                </a> establishes the AESO's practices for efficient processing of system access service requests.
              </div>
            </div>

            {/* Contact */}
            <div className="bg-muted/30 rounded-lg p-3 flex items-start gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">AESO Customer Connections:</strong>{' '}
                <a href="tel:4035392793" className="text-primary hover:underline">403-539-2793</a>{' · '}
                <a href="mailto:customer.connections@aeso.ca" className="text-primary hover:underline">customer.connections@aeso.ca</a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational: Connection Process Types */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4" />
              Understanding the AESO Connection Process
            </CardTitle>
            <CardDescription>Key concepts every market participant must understand before submitting a SASR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Assessment Paths */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Two Assessment Paths</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-muted/20 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium text-foreground">Cluster Assessment</p>
                  <p className="text-xs text-muted-foreground">
                    For generation and energy storage projects injecting <strong>≥5 MW</strong> of new flow into the AIES. 
                    Projects are batched and assessed together simultaneously — a common practice across North American ISOs.
                    SASRs must be submitted during designated intake windows.
                  </p>
                  <SourceBadge url="https://www.aeso.ca/grid/connecting-to-the-grid/cluster-assessment/" label="Cluster Assessment" />
                </div>
                <div className="bg-muted/20 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium text-foreground">Independent Assessment</p>
                  <p className="text-xs text-muted-foreground">
                    For <strong>load and reliability projects</strong>, and generation/storage projects injecting <strong>&lt;5 MW</strong>.
                    SASRs can be submitted at any time (no intake window required).
                  </p>
                  <SourceBadge url="https://www.aeso.ca/grid/connecting-to-the-grid/" label="Independent Assessment" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Project Types */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Execution Phase — Project Types</p>
              <p className="text-xs text-muted-foreground mb-2">After assessment, AESO categorizes your project into one of these types. The type may change as new information emerges.</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs mt-0.5 flex-shrink-0">Connection</Badge>
                  <p className="text-xs text-muted-foreground">Requires new or altered transmission facilities built by the designated TFO upon receipt of AUC regulatory approvals. May require a new or altered SAS Agreement.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs mt-0.5 flex-shrink-0">MPC</Badge>
                  <p className="text-xs text-muted-foreground">Market Participant Choice — a variation where the market participant builds a portion (or all) of the transmission facility in lieu of the TFO, with ownership transferred to the TFO upon completion.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs mt-0.5 flex-shrink-0">Behind the Fence</Badge>
                  <p className="text-xs text-muted-foreground">Market participant alters existing facilities connected to the transmission system. No expansion of the transmission system required, but may require a new/altered SAS Agreement and submission of modelling data per Section 503.21.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs mt-0.5 flex-shrink-0">Contract</Badge>
                  <p className="text-xs text-muted-foreground">Alters or terminates an existing SAS Agreement only. No alterations to transmission facilities or market participant facilities are required.</p>
                </div>
              </div>
              <SourceBadge url="https://www.aeso.ca/grid/connecting-to-the-grid/" label="AESO Connection Process" />
            </div>

            <Separator />

            {/* Pre-submission checklist */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Pre-Submission Checklist</p>
              <p className="text-xs text-muted-foreground mb-2">Prior to submitting a SASR, AESO recommends these initial steps:</p>
              <ul className="space-y-1.5">
                <li className="text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Review the <a href="https://www.aeso.ca/assets/templates/SASR-Guide.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">SASR Guide</a> in detail to understand submission requirements</span>
                </li>
                <li className="text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Determine the reason for requesting system access and capacity requirements</span>
                </li>
                <li className="text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Review the <a href="https://www.aeso.ca/grid/connecting-to-the-grid/transmission-capability-map/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Transmission Capability Map</a> for generation capacity and siting decisions</span>
                </li>
                <li className="text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Contact the DFO in your region to determine if the project can be supported via distribution connection</span>
                </li>
                <li className="text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Set up your <a href="https://experience.adobe.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Adobe Workfront</a> account by emailing customer.connections@aeso.ca</span>
                </li>
              </ul>
              <SourceBadge url="https://www.aeso.ca/grid/connecting-to-the-grid/" label="AESO Pre-Submission Steps" />
            </div>

            <Separator />

            {/* Acronym Reference */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground w-full justify-between">
                  <span>Acronym Reference</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2 bg-muted/20 rounded-lg p-3">
                  <span><strong className="text-foreground">AUC</strong> — Alberta Utilities Commission</span>
                  <span><strong className="text-foreground">CCD</strong> — Construction Contribution Decision</span>
                  <span><strong className="text-foreground">CEII</strong> — Critical Energy Infrastructure Info</span>
                  <span><strong className="text-foreground">DFO</strong> — Distribution Facility Owner</span>
                  <span><strong className="text-foreground">DTS</strong> — Demand Transmission Service</span>
                  <span><strong className="text-foreground">ETS</strong> — Energy Trading System</span>
                  <span><strong className="text-foreground">GFO</strong> — Generation Facility Owner</span>
                  <span><strong className="text-foreground">GUOC</strong> — Gen. Unit Owner's Contribution</span>
                  <span><strong className="text-foreground">ISD</strong> — In-Service Date</span>
                  <span><strong className="text-foreground">MC</strong> — Maximum Capability</span>
                  <span><strong className="text-foreground">NID</strong> — Needs Identification Document</span>
                  <span><strong className="text-foreground">P&L</strong> — Permit & Licence</span>
                  <span><strong className="text-foreground">PDUP</strong> — Project Data Update Package</span>
                  <span><strong className="text-foreground">SAS</strong> — System Access Service</span>
                  <span><strong className="text-foreground">SASR</strong> — System Access Service Request</span>
                  <span><strong className="text-foreground">SLD</strong> — Single Line Diagram</span>
                  <span><strong className="text-foreground">TFO</strong> — Transmission Facility Owner</span>
                  <span><strong className="text-foreground">PILON</strong> — Payment in Lieu of Notice</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

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

        {/* Enhanced Analytics — Capacity Sensitivity & Cash Flow Waterfall */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CapacitySensitivityChart
            loadFactor={loadFactor}
            poolPrice={poolPrice}
            substationFraction={substationFraction}
            calculateMonthlyDTS={calculateMonthlyDTS}
          />
          <CashFlowWaterfall calculations={calculations} />
        </div>

        {/* Gantt Chart & DTS Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GanttTimeline targetDate={targetDate} />
          <DTSBreakdownDonut monthlyDTS={calculations.monthlyDTS} />
        </div>

        {/* 5-Year Projection */}
        <AnnualProjectionTable
          monthlyDTS={calculations.monthlyDTS}
          poolParticipation={calculations.poolParticipation}
        />

        {/* Section 5: DFO Cost Comparison */}
        <DFOComparisonSection capacityMW={capacityMW} loadFactor={loadFactor} monthlyDTS={calculations.monthlyDTS} />

        {/* DFO Comparison Bar Chart */}
        <DFOComparisonChart capacityMW={capacityMW} monthlyMWh={calculations.monthlyDTS.monthlyMWh} />

        {/* Section 6: Data Centre Staging Note */}
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

function DFOComparisonSection({ capacityMW, loadFactor, monthlyDTS }: {
  capacityMW: number;
  loadFactor: number;
  monthlyDTS: { total: number; monthlyMWh: number };
}) {
  const comparisons = useMemo(() => {
    const capacityKW = capacityMW * 1000;
    const monthlyKWh = monthlyDTS.monthlyMWh * 1000;

    return DFO_DISTRIBUTION_RATES.map((dfo) => {
      const demandCost = capacityKW * dfo.demandCharge.perKWMonth;
      const deliveryCost = monthlyKWh * (dfo.distributionDelivery.centsPerKWh / 100);
      const ridersCost = monthlyKWh * (dfo.riders.centsPerKWh / 100);
      const facilitiesCost = dfo.facilitiesCharge.perMonth;
      const distributionSubtotal = demandCost + deliveryCost + ridersCost + facilitiesCost;
      const distributionGST = distributionSubtotal * 0.05;
      const distributionTotal = distributionSubtotal + distributionGST;

      const allInMonthly = monthlyDTS.total + distributionTotal;
      const allInPerMWh = allInMonthly / monthlyDTS.monthlyMWh;
      const allInCentsPerKWh = allInPerMWh / 10;

      return {
        dfo,
        demandCost,
        deliveryCost,
        ridersCost,
        facilitiesCost,
        distributionTotal,
        allInMonthly,
        allInPerMWh,
        allInCentsPerKWh,
      };
    }).sort((a, b) => a.allInMonthly - b.allInMonthly);
  }, [capacityMW, loadFactor, monthlyDTS]);

  const lowestCost = comparisons[0]?.allInMonthly || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4" />
          DFO Distribution Cost Comparison
        </CardTitle>
        <CardDescription>
          Side-by-side comparison of distribution charges by DFO — AESO DTS transmission charges are identical across all DFOs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Explanation callout */}
        <div className="bg-muted/30 rounded-lg p-3 mb-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">How this works:</strong> All Alberta DFOs pass through the same AESO DTS transmission charges ({formatCAD(monthlyDTS.total)}/mo for your facility).
            The difference is in <strong>distribution-level</strong> charges — demand charges, delivery fees, and riders — which vary by DFO and their AUC-approved rate schedule.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {comparisons.map((c, idx) => (
            <Card key={c.dfo.id} className={cn(
              'border transition-colors',
              idx === 0 && 'border-primary/40 bg-primary/5'
            )}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{c.dfo.name}</p>
                    <p className="text-xs text-muted-foreground">{c.dfo.rateClass} — {c.dfo.region}</p>
                  </div>
                  {idx === 0 && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Lowest Cost</Badge>
                  )}
                </div>

                {/* Key metric */}
                <div className="mb-3">
                  <p className="text-2xl font-bold text-foreground">{formatCAD(c.allInMonthly)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <p className="text-xs text-muted-foreground">
                    All-in: {c.allInCentsPerKWh.toFixed(2)}¢/kWh · {formatCAD(c.allInPerMWh)}/MWh
                  </p>
                  {idx > 0 && (
                    <p className="text-xs text-destructive mt-0.5">
                      +{formatCAD(c.allInMonthly - lowestCost)}/mo vs {comparisons[0].dfo.name}
                    </p>
                  )}
                </div>

                <Separator className="my-2" />

                {/* Distribution breakdown */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Distribution Charges</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                    <span className="text-muted-foreground">Demand ({c.dfo.demandCharge.perKWMonth.toFixed(2)}/kW/mo)</span>
                    <span className="text-right font-medium">{formatCAD(c.demandCost)}</span>
                    <span className="text-muted-foreground">Delivery ({c.dfo.distributionDelivery.centsPerKWh}¢/kWh)</span>
                    <span className="text-right font-medium">{formatCAD(c.deliveryCost)}</span>
                    <span className="text-muted-foreground">Riders ({c.dfo.riders.centsPerKWh}¢/kWh)</span>
                    <span className="text-right font-medium">{formatCAD(c.ridersCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-border mt-1">
                    <span className="font-medium text-foreground">Distribution Total (incl. GST)</span>
                    <span className="font-bold text-foreground">{formatCAD(c.distributionTotal)}</span>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* 12CP eligibility */}
                <div className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{c.dfo.twelveCP.description}</span>
                </div>

                <div className="mt-2">
                  <SourceBadge url={c.dfo.source} label={`${c.dfo.rateClass} (eff. ${c.dfo.effectiveDate})`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Common DTS note */}
        <div className="mt-4 bg-muted/20 rounded-lg p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">AESO DTS charges</strong> ({formatCAD(monthlyDTS.total)}/mo) are identical for all DFOs and are included in the all-in totals above.
            Only the distribution-level charges vary. All DFOs provide full 12CP optimization eligibility for transmission-connected industrial loads.
          </p>
        </div>
      </CardContent>
    </Card>
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
