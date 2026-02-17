import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import { AESOHistoricalPricing } from '@/components/aeso/AESOHistoricalPricing';
import { UnifiedAnalyticsExport } from '@/components/aeso/UnifiedAnalyticsExport';
import { DataCoverageStatus } from '@/components/aeso/DataCoverageStatus';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function AnalyticsTab() {
  const [showCoverage, setShowCoverage] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">Historical pricing, data exports, and custom dashboards</p>
      </div>

      <AESOHistoricalPricing />

      <UnifiedAnalyticsExport />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">Custom Dashboards</h3>
          <p className="text-sm text-muted-foreground">Create and manage drag-and-drop dashboards</p>
        </div>
        <Link to="/app/aeso-dashboards" className="flex-shrink-0 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <LayoutDashboard className="w-4 h-4" />
            Open Dashboards
          </Button>
        </Link>
      </div>

      <Collapsible open={showCoverage} onOpenChange={setShowCoverage}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-muted-foreground">
            Data Coverage & Quality
            <ChevronDown className={`w-4 h-4 transition-transform ${showCoverage ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <DataCoverageStatus />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
