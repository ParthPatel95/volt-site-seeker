import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Zap, Search, Shield, ChevronDown, PlayCircle, FileText, Bell } from 'lucide-react';
import { AESOHistoricalPricing } from '@/components/aeso/AESOHistoricalPricing';
import { UnifiedAnalyticsExport } from '@/components/aeso/UnifiedAnalyticsExport';
import { DataCoverageStatus } from '@/components/aeso/DataCoverageStatus';
import { HourlyPriceExplorer } from '@/components/aeso/HourlyPriceExplorer';
import { DataExplorerPanel } from '@/components/aeso/DataExplorerPanel';
import { AncillaryServicesAnalytics } from '@/components/aeso/AncillaryServicesAnalytics';
import { AESOProgramsPanel } from '@/components/aeso/AESOProgramsPanel';
import { StrategySimulator } from '@/components/aeso/StrategySimulator';
import { NotificationsPanel } from '@/components/aeso/NotificationsPanel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function AnalyticsTab() {
  const [showCoverage, setShowCoverage] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('historical');

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">Historical pricing, data exploration, strategy simulation, and grid programs</p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="overflow-x-auto flex h-auto gap-1 w-full justify-start flex-wrap">
          <TabsTrigger value="historical" className="text-xs">Historical Pricing</TabsTrigger>
          <TabsTrigger value="hourly" className="text-xs gap-1"><Zap className="w-3 h-3" />Hourly Prices</TabsTrigger>
          <TabsTrigger value="explorer" className="text-xs gap-1"><Search className="w-3 h-3" />Data Explorer</TabsTrigger>
          <TabsTrigger value="ancillary" className="text-xs gap-1"><Shield className="w-3 h-3" />Ancillary & Grid</TabsTrigger>
          <TabsTrigger value="programs" className="text-xs gap-1"><FileText className="w-3 h-3" />AESO Programs</TabsTrigger>
          <TabsTrigger value="strategy" className="text-xs gap-1"><PlayCircle className="w-3 h-3" />Strategy Sim</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1"><Bell className="w-3 h-3" />Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="historical" className="mt-4 space-y-4">
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
        </TabsContent>

        <TabsContent value="hourly" className="mt-4">
          <HourlyPriceExplorer />
        </TabsContent>

        <TabsContent value="explorer" className="mt-4">
          <DataExplorerPanel />
        </TabsContent>

        <TabsContent value="ancillary" className="mt-4">
          <AncillaryServicesAnalytics />
        </TabsContent>

        <TabsContent value="programs" className="mt-4">
          <AESOProgramsPanel />
        </TabsContent>

        <TabsContent value="strategy" className="mt-4">
          <StrategySimulator />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationsPanel />
        </TabsContent>
      </Tabs>

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
