import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle2, AlertTriangle, Database, FileText } from 'lucide-react';

interface Props {
  recordCount: number;
  dataSource: 'database' | 'upload';
}

const sources = [
  {
    category: 'Pool Price & AIL Demand',
    icon: Database,
    description: 'Hourly pool prices and Alberta Internal Load (AIL) demand data',
    source: 'aeso_training_data table — 33,635+ verified records, June 2022 – present',
    status: 'verified' as const,
    url: 'https://www.aeso.ca/market/market-and-system-reporting/data-requests/',
  },
  {
    category: 'Rate DTS Tariffs',
    icon: FileText,
    description: 'All 15+ AESO transmission charge components (Bulk, Regional, POD, OR, TCR, etc.)',
    source: 'AUC Decision 29606-D01-2024 — AESO ISO Tariff 2025',
    status: 'verified' as const,
    url: 'https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/',
    effective: 'Jan 1, 2025',
    verified: 'Feb 2026',
  },
  {
    category: 'FortisAlberta Rate 65',
    icon: FileText,
    description: 'Distribution demand charge ($7.52/kW/mo) and volumetric delivery (0.2704¢/kWh)',
    source: 'FortisAlberta July 2025 Rate Schedule',
    status: 'verified' as const,
    url: 'https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf',
    effective: 'Jul 1, 2025',
    verified: 'Feb 2026',
  },
  {
    category: 'Operating Reserve (12.44%)',
    icon: AlertTriangle,
    description: 'Percentage of pool price charged for operating reserves',
    source: 'AESO estimate — actual rate settled monthly based on ancillary services costs',
    status: 'estimate' as const,
  },
  {
    category: 'TCR ($0.265/MWh)',
    icon: AlertTriangle,
    description: 'Transmission Constraint Rebalancing — variable monthly AESO supplement',
    source: 'AESO estimate — recalculated monthly',
    status: 'estimate' as const,
  },
  {
    category: 'Exchange Rate (0.7334 CAD/USD)',
    icon: AlertTriangle,
    description: 'User-provided CAD/USD conversion rate',
    source: 'User input — default from Bank of Canada average',
    status: 'user-input' as const,
  },
];

export function PowerModelDataSources({ recordCount, dataSource }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" />
          Data Sources & Attribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {dataSource === 'database' && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20 text-xs">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span>
              <strong>{recordCount.toLocaleString()}</strong> hourly records loaded from verified <code className="bg-muted px-1 rounded">aeso_training_data</code> database
            </span>
          </div>
        )}
        {dataSource === 'upload' && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50 border border-accent text-xs">
            <AlertTriangle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>
              <strong>{recordCount.toLocaleString()}</strong> hourly records loaded from user-uploaded CSV — data not independently verified
            </span>
          </div>
        )}

        <div className="space-y-2">
          {sources.map(s => (
            <div key={s.category} className="flex items-start gap-3 p-2 rounded-lg border border-border/50 text-xs">
              <s.icon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{s.category}</span>
                  <Badge
                    variant={s.status === 'verified' ? 'default' : s.status === 'estimate' ? 'secondary' : 'outline'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {s.status === 'verified' ? '✓ Verified' : s.status === 'estimate' ? '≈ Estimate' : '⌨ User Input'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{s.source}</p>
                {s.effective && (
                  <p className="text-muted-foreground">Effective: {s.effective} · Verified: {s.verified}</p>
                )}
              </div>
              {s.url && (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
