import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Search, Settings, LayoutDashboard, ChevronDown, Zap, Shield, FileText, PlayCircle, Bell, BarChart3 } from 'lucide-react';
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

function SectionCard({ icon: Icon, title, description, children, defaultOpen = true }: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card variant="outline" className="overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm">{title}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function AnalyticsTab() {
  const [activeCategory, setActiveCategory] = useState('pricing');
  const [showCoverage, setShowCoverage] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground">Pricing, exploration, strategy, and grid tools</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5 text-muted-foreground"
            onClick={() => setShowCoverage(v => !v)}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Data Coverage
          </Button>
          <Link to="/app/aeso-dashboards">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboards
            </Button>
          </Link>
        </div>
      </div>

      {/* Data coverage (inline, not bottom) */}
      {showCoverage && (
        <Card variant="outline">
          <CardContent className="pt-4">
            <DataCoverageStatus />
          </CardContent>
        </Card>
      )}

      {/* 3-category tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full justify-start gap-1 h-auto p-1">
          <TabsTrigger value="pricing" className="text-sm gap-2 px-4 py-2">
            <DollarSign className="w-4 h-4" />
            Pricing & Markets
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-sm gap-2 px-4 py-2">
            <Search className="w-4 h-4" />
            Tools & Exploration
          </TabsTrigger>
          <TabsTrigger value="operations" className="text-sm gap-2 px-4 py-2">
            <Settings className="w-4 h-4" />
            Operations
          </TabsTrigger>
        </TabsList>

        {/* Pricing & Markets */}
        <TabsContent value="pricing" className="mt-4 space-y-4">
          <SectionCard
            icon={DollarSign}
            title="Historical Pricing"
            description="Pool price trends, uptime analytics, curtailment analysis, and shared reports"
          >
            <div className="space-y-4">
              <AESOHistoricalPricing />
              <UnifiedAnalyticsExport />
            </div>
          </SectionCard>

          <SectionCard
            icon={Zap}
            title="Hourly Price Explorer"
            description="Granular hourly price data with duration curves and spike analysis"
          >
            <HourlyPriceExplorer />
          </SectionCard>
        </TabsContent>

        {/* Tools & Exploration */}
        <TabsContent value="tools" className="mt-4 space-y-4">
          <SectionCard
            icon={Search}
            title="Data Explorer"
            description="Custom scatter plots, regressions, and multi-variable analysis"
          >
            <DataExplorerPanel />
          </SectionCard>

          <SectionCard
            icon={Shield}
            title="Ancillary Services & Grid"
            description="Reserves, interties, and grid reliability metrics"
          >
            <AncillaryServicesAnalytics />
          </SectionCard>
        </TabsContent>

        {/* Operations */}
        <TabsContent value="operations" className="mt-4 space-y-4">
          <SectionCard
            icon={FileText}
            title="AESO Programs"
            description="Grid participation programs, eligibility, and revenue opportunities"
          >
            <AESOProgramsPanel />
          </SectionCard>

          <SectionCard
            icon={PlayCircle}
            title="Strategy Simulator"
            description="Compare operating strategies with Monte Carlo simulation"
          >
            <StrategySimulator />
          </SectionCard>

          <SectionCard
            icon={Bell}
            title="Notifications"
            description="Telegram alerts, price spike warnings, and custom rules"
          >
            <NotificationsPanel />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
