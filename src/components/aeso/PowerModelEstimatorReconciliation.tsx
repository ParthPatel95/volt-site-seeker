import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { AnnualReconciliation } from '@/lib/aeso/billEstimatorReconciliation';
import { BILL_ESTIMATOR_SOURCE_URL } from '@/lib/aeso/billEstimator2026';

const fmt = (n: number) =>
  n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
const fmtPct = (n: number) => `${(n * 100).toFixed(3)}%`;
const fmtDelta = (n: number) => {
  const sign = n >= 0 ? '+' : '−';
  return `${sign}${Math.abs(n).toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 })}`;
};

interface Props {
  reconciliation: AnnualReconciliation;
  hasOverrides: boolean;
}

export function PowerModelEstimatorReconciliation({ reconciliation, hasOverrides }: Props) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    pass: {
      Icon: CheckCircle2,
      label: 'Matches AESO Estimator',
      tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    },
    drift: {
      Icon: AlertTriangle,
      label: 'Drift detected',
      tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    },
    fail: {
      Icon: XCircle,
      label: 'Out of tolerance',
      tone: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    },
  }[reconciliation.status];

  const { Icon } = statusConfig;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              AESO 2026-015T Bill Estimator — Reconciliation
              <Badge variant="outline" className={statusConfig.tone}>
                <Icon className="w-3.5 h-3.5 mr-1" />
                {statusConfig.label} · Δ {fmtPct(reconciliation.subtotalDelta.deltaPct)}
              </Badge>
            </CardTitle>
            <CardDescription>
              Independent line-by-line check of the model's DTS subtotal against the official AESO
              Bill Estimator formulas.{' '}
              <a
                href={BILL_ESTIMATOR_SOURCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline hover:bg-secondary"
              >
                Appendix 1 source <ExternalLink className="w-3 h-3" />
              </a>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasOverrides && (
          <p className="text-xs text-muted-foreground border-l-2 border-amber-500/40 pl-3">
            Reconciliation uses official AESO 2026-015T rates. Differences here reflect any tariff
            overrides you applied in the editable rates panel.
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b">
              <tr>
                <th className="text-left py-2 pr-4 font-medium">Component</th>
                <th className="text-right py-2 px-4 font-medium">Calculator</th>
                <th className="text-right py-2 px-4 font-medium">AESO Estimator</th>
                <th className="text-right py-2 px-4 font-medium">Δ $</th>
                <th className="text-right py-2 px-4 font-medium">Δ %</th>
                <th className="text-center py-2 pl-4 font-medium">Check</th>
              </tr>
            </thead>
            <tbody>
              {reconciliation.lines.map((l) => (
                <tr key={l.key} className="border-b last:border-0">
                  <td className="py-2 pr-4">{l.label}</td>
                  <td className="text-right py-2 px-4 tabular-nums">{fmt(l.calc)}</td>
                  <td className="text-right py-2 px-4 tabular-nums">{fmt(l.estimator)}</td>
                  <td className="text-right py-2 px-4 tabular-nums">{fmtDelta(l.deltaAbs)}</td>
                  <td className="text-right py-2 px-4 tabular-nums">{fmtPct(l.deltaPct)}</td>
                  <td className="text-center py-2 pl-4">
                    {l.withinTolerance ? (
                      <CheckCircle2 className="w-4 h-4 inline text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 inline text-amber-600" />
                    )}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold bg-muted/40">
                <td className="py-2 pr-4">{reconciliation.subtotalDelta.label}</td>
                <td className="text-right py-2 px-4 tabular-nums">{fmt(reconciliation.calcSubtotal)}</td>
                <td className="text-right py-2 px-4 tabular-nums">{fmt(reconciliation.estimatorSubtotal)}</td>
                <td className="text-right py-2 px-4 tabular-nums">{fmtDelta(reconciliation.subtotalDelta.deltaAbs)}</td>
                <td className="text-right py-2 px-4 tabular-nums">{fmtPct(reconciliation.subtotalDelta.deltaPct)}</td>
                <td className="text-center py-2 pl-4">
                  {reconciliation.subtotalDelta.withinTolerance ? (
                    <CheckCircle2 className="w-4 h-4 inline text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 inline text-amber-600" />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {reconciliation.months.length > 0 && (
          <div>
            <Button variant="ghost" size="sm" onClick={() => setExpanded((x) => !x)}>
              {expanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              {expanded ? 'Hide' : 'View'} monthly breakdown ({reconciliation.months.length} months)
            </Button>
            {expanded && (
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-1 pr-3 font-medium">Month</th>
                      <th className="text-right py-1 px-3 font-medium">Calc DTS</th>
                      <th className="text-right py-1 px-3 font-medium">Estimator DTS</th>
                      <th className="text-right py-1 px-3 font-medium">Δ $</th>
                      <th className="text-right py-1 px-3 font-medium">Δ %</th>
                      <th className="text-center py-1 pl-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reconciliation.months.map((m) => (
                      <tr key={m.monthIndex} className="border-b last:border-0">
                        <td className="py-1 pr-3">{m.month}</td>
                        <td className="text-right py-1 px-3 tabular-nums">{fmt(m.subtotalDelta.calc)}</td>
                        <td className="text-right py-1 px-3 tabular-nums">{fmt(m.subtotalDelta.estimator)}</td>
                        <td className="text-right py-1 px-3 tabular-nums">{fmtDelta(m.subtotalDelta.deltaAbs)}</td>
                        <td className="text-right py-1 px-3 tabular-nums">{fmtPct(m.subtotalDelta.deltaPct)}</td>
                        <td className="text-center py-1 pl-3">
                          {m.allWithinTolerance ? (
                            <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 inline text-amber-600" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Tolerance: ≤ $1 or ≤ 0.5% per line; ≤ 0.1% on subtotal. Source:{' '}
          AESO 2026-015T Appendix 1 Bill Estimator.
        </p>
      </CardContent>
    </Card>
  );
}