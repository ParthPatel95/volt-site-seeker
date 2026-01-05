import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { CapexCalculatedSummary, CapexProjectSummary, CAPEX_CATEGORY_CONFIG, CapexCategory } from '../types/voltbuild-advanced.types';
import { toast } from 'sonner';

interface CapexSummaryPanelProps {
  calculations: CapexCalculatedSummary;
  summary: CapexProjectSummary | null | undefined;
  projectName: string;
  targetMw: number | null | undefined;
  onUpdateSettings: (updates: Partial<CapexProjectSummary>) => void;
  projectId: string;
}

export function CapexSummaryPanel({
  calculations,
  summary,
  projectName,
  targetMw,
  onUpdateSettings,
  projectId,
}: CapexSummaryPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const contingencyPct = summary?.contingency_pct ?? 10;
  const taxPct = summary?.tax_pct ?? 0;

  const handleExportCSV = () => {
    const rows = [
      ['Category', 'Amount'],
      ...Object.entries(calculations.byCategory).map(([cat, amount]) => [cat, amount.toString()]),
      ['', ''],
      ['Direct Costs', calculations.totalDirect.toString()],
      [`Contingency (${contingencyPct}%)`, calculations.totalContingency.toString()],
      [`Tax (${taxPct}%)`, calculations.totalTax.toString()],
      ['Grand Total', calculations.grandTotal.toString()],
    ];
    
    if (calculations.costPerMw) {
      rows.push(['Cost per MW', calculations.costPerMw.toString()]);
    }

    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}_capex_summary.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const handleExportPDF = () => {
    // For now, just show a toast - PDF export would require a library
    toast.info('PDF export coming soon');
  };

  const categories = Object.keys(CAPEX_CATEGORY_CONFIG) as CapexCategory[];

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Cost Summary</CardTitle>
        <p className="text-xs text-muted-foreground">All values are estimates</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* By Category */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            By Category
          </Label>
          {categories.map((cat) => {
            const amount = calculations.byCategory[cat] || 0;
            const config = CAPEX_CATEGORY_CONFIG[cat];
            const pct = calculations.totalDirect > 0 
              ? (amount / calculations.totalDirect) * 100 
              : 0;
            
            return (
              <div key={cat} className="flex items-center justify-between text-sm">
                <span className={config.color}>{cat}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    {pct.toFixed(0)}%
                  </span>
                  <span className="font-medium tabular-nums w-24 text-right">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Direct Costs</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(calculations.totalDirect)}
            </span>
          </div>

          {/* Contingency Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Contingency</Label>
              <span className="text-sm font-medium">{contingencyPct}%</span>
            </div>
            <Slider
              value={[contingencyPct]}
              onValueChange={([value]) => {
                onUpdateSettings({ project_id: projectId, contingency_pct: value });
              }}
              min={0}
              max={30}
              step={1}
              className="w-full"
            />
            <div className="text-right text-sm text-muted-foreground">
              {formatCurrency(calculations.totalContingency)}
            </div>
          </div>

          {/* Tax Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <Label className="text-sm">Tax %</Label>
              <Input
                type="number"
                value={taxPct}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  onUpdateSettings({ project_id: projectId, tax_pct: value });
                }}
                className="w-20 text-right"
                step="0.1"
                min="0"
                max="30"
              />
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {formatCurrency(calculations.totalTax)}
            </div>
          </div>
        </div>

        <Separator />

        {/* Grand Total */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Estimated Grand Total</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(calculations.grandTotal)}
            </span>
          </div>

          {calculations.costPerMw && targetMw && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Est. Cost per MW</span>
              <span className="font-medium">
                {formatCurrency(calculations.costPerMw)} / MW
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleExportCSV}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleExportPDF}
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
