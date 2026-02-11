import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface Assumption {
  label: string;
  detail: string;
  status: 'Verified' | 'Estimate' | 'User Input';
  source?: string;
  sourceUrl?: string;
  effectiveDate?: string;
}

const ASSUMPTIONS: Assumption[] = [
  {
    label: 'AESO Rate DTS Tariff',
    detail: 'All DTS charge components (Bulk System, Regional, POD, System Support, Rider F, etc.) sourced from the official AESO ISO Tariff.',
    status: 'Verified',
    source: 'AUC Decision 29606-D01-2024',
    sourceUrl: 'https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/',
    effectiveDate: '2025-01-01',
  },
  {
    label: 'FortisAlberta Rate 65',
    detail: 'Demand charge ($7.52/kW/month) and volumetric delivery (0.2704¢/kWh) from FortisAlberta July 2025 published schedule.',
    status: 'Verified',
    source: 'FortisAlberta Rates & Riders',
    sourceUrl: 'https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf',
    effectiveDate: '2025-07-01',
  },
  {
    label: '12CP Avoidance',
    detail: 'The model assumes 100% successful avoidance of coincident demand charges by curtailing during the top N demand hours each month. Coincident demand charge is set to $0 when avoidance is active.',
    status: 'User Input',
  },
  {
    label: 'Operating Reserve (12.44%)',
    detail: 'Percentage of pool energy costs. Actual rate varies monthly based on ancillary services costs settled by AESO. The 12.44% figure is a representative average.',
    status: 'Estimate',
    source: 'AESO Monthly Reports',
  },
  {
    label: 'Transmission Contribution Rate ($0.265/MWh)',
    detail: 'TCR is variable and recalculated monthly by AESO via supplement. The $0.265/MWh figure represents a recent average.',
    status: 'Estimate',
    source: 'AESO ISO Tariff Supplement',
  },
  {
    label: 'Pool Price Data',
    detail: 'Historical hourly pool prices and Alberta Internal Load (AIL) sourced from the aeso_training_data table, containing 33,635+ verified records from June 2022 to present.',
    status: 'Verified',
    source: 'AESO Historical Pricing API',
    sourceUrl: 'https://www.aeso.ca/',
  },
  {
    label: 'Breakeven Price Methodology',
    detail: 'Calculated as: (Hosting Rate CAD/MWh − Marginal Costs) ÷ (1 + Operating Reserve %). Facility curtails during hours when pool price exceeds breakeven to avoid uneconomic operation.',
    status: 'Verified',
  },
  {
    label: 'Sensitivity Analysis',
    detail: 'Linear scaling applied at ±5% and ±10% variance on key parameters (capacity, hosting rate, exchange rate). Does not account for non-linear interactions between variables.',
    status: 'Estimate',
  },
  {
    label: 'GST Rate (5%)',
    detail: 'Federal Goods and Services Tax applied to all pre-tax charges. Subject to federal legislative changes.',
    status: 'Verified',
    effectiveDate: '2008-01-01',
  },
  {
    label: 'CAD/USD Exchange Rate',
    detail: 'User-provided input. Not sourced from live FX feeds. All USD revenue is converted at this static rate for the entire modeling period.',
    status: 'User Input',
  },
  {
    label: 'Hosting Rate',
    detail: 'The USD/kWh rate received for hosting computing services. User-provided based on contractual terms. Converted to CAD using the exchange rate input.',
    status: 'User Input',
  },
];

export function PowerModelAssumptions() {
  return (
    <Collapsible defaultOpen>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Model Assumptions & Sources</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{ASSUMPTIONS.length} assumptions</Badge>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {ASSUMPTIONS.map((a, i) => (
                <div key={i} className="border border-border/50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{a.label}</span>
                        <Badge
                          variant={a.status === 'Verified' ? 'default' : a.status === 'Estimate' ? 'secondary' : 'outline'}
                          className="text-[9px] px-1.5 py-0 h-4 shrink-0"
                        >
                          {a.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{a.detail}</p>
                      {(a.source || a.effectiveDate) && (
                        <div className="flex items-center gap-3 mt-1.5">
                          {a.source && (
                            <span className="text-[10px] text-muted-foreground">
                              Source: {a.sourceUrl ? (
                                <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                                  {a.source} <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : a.source}
                            </span>
                          )}
                          {a.effectiveDate && (
                            <span className="text-[10px] text-muted-foreground">Effective: {a.effectiveDate}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
