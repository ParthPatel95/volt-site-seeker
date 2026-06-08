import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { CoverageReport } from '@/lib/aeso/dataCoverage';

interface Props {
  report: CoverageReport;
}

export function PowerModelDataCoverage({ report }: Props) {
  const [expanded, setExpanded] = useState(false);
  const elapsed = report.months.filter((m) => m.isComplete);
  const incompleteElapsed = elapsed.filter((m) => m.status !== 'complete');
  const partialCurrent = report.months.find((m) => !m.isComplete && m.status === 'partial');

  let tone: 'pass' | 'warn' | 'fail';
  let label: string;
  if (incompleteElapsed.length === 0 && report.invalidRecords === 0) {
    tone = 'pass';
    label = 'Validated · Annual totals are invoice-safe';
  } else if (incompleteElapsed.length === 0) {
    tone = 'warn';
    label = `Validated with ${report.invalidRecords} invalid rows skipped`;
  } else {
    tone = 'fail';
    label = `${incompleteElapsed.length} elapsed month(s) missing hours — annual totals are NOT invoice-safe`;
  }

  const ToneIcon = tone === 'pass' ? CheckCircle2 : tone === 'warn' ? AlertTriangle : XCircle;
  const toneClasses =
    tone === 'pass'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
      : tone === 'warn'
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
        : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';

  return (
    <Card className={tone === 'fail' ? 'border-red-500/30' : tone === 'warn' ? 'border-amber-500/30' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Hourly Data Coverage Audit</CardTitle>
            <Badge variant="outline" className={`text-[10px] ${toneClasses}`}>
              <ToneIcon className="w-3 h-3 mr-1" />
              {label}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded((x) => !x)} className="h-7">
            {expanded ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
            {expanded ? 'Hide' : 'View'} month-by-month
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Range {report.firstDate ?? '—'} → {report.lastDate ?? '—'} ·{' '}
          {report.distinctHours.toLocaleString()} distinct hours from {report.totalRecords.toLocaleString()} raw rows
          {report.duplicateRecords > 0 && ` · ${report.duplicateRecords.toLocaleString()} duplicate rows deduped`}
          {report.invalidRecords > 0 && ` · ${report.invalidRecords} invalid rows skipped`}
        </p>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-1 pr-3 font-medium">Month</th>
                  <th className="text-right py-1 px-3 font-medium">Expected</th>
                  <th className="text-right py-1 px-3 font-medium">Covered</th>
                  <th className="text-right py-1 px-3 font-medium">Missing</th>
                  <th className="text-right py-1 px-3 font-medium">Raw rows</th>
                  <th className="text-center py-1 pl-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.months.map((m) => {
                  const flag = m.isComplete && m.status !== 'complete';
                  return (
                    <tr
                      key={`${m.year}-${m.month}`}
                      className={`border-b last:border-0 ${flag ? 'bg-red-500/[0.04]' : ''}`}
                    >
                      <td className="py-1 pr-3">{m.label}{!m.isComplete && <span className="ml-1 text-[10px] text-muted-foreground">(in progress)</span>}</td>
                      <td className="text-right py-1 px-3 tabular-nums">{m.expectedHours}</td>
                      <td className="text-right py-1 px-3 tabular-nums">{m.coveredHours}</td>
                      <td className={`text-right py-1 px-3 tabular-nums ${m.missingHours > 0 ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                        {m.missingHours}
                      </td>
                      <td className="text-right py-1 px-3 tabular-nums text-muted-foreground">{m.rawRecords}</td>
                      <td className="text-center py-1 pl-3">
                        {m.status === 'complete' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-600" />
                        ) : flag ? (
                          <XCircle className="w-3.5 h-3.5 inline text-red-600" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 inline text-amber-600" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Invoice-safe means every elapsed calendar month in this dataset has its full {`{24 × days-in-month}`} hourly records.
            Months still in progress are excluded from the invoice-safe check but are shown here for transparency.
          </p>
        </CardContent>
      )}
    </Card>
  );
}