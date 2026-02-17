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
      <AESOHistoricalPricing />

      <UnifiedAnalyticsExport />

      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
        <div>
          <h3 className="font-semibold text-foreground">Custom Dashboards</h3>
          <p className="text-sm text-muted-foreground">Create and manage drag-and-drop dashboards</p>
        </div>
        <Link to="/app/aeso-dashboards">
          <Button variant="outline" className="gap-2">
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
