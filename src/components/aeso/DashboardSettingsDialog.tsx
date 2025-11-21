import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phase4FeaturesPanel } from './Phase4FeaturesPanel';
import { AlertManagementPanel } from './AlertManagementPanel';
import { ScheduledReportsPanel } from './ScheduledReportsPanel';
import { ExportOptionsPanel } from './ExportOptionsPanel';
import { ReportBuilderPanel } from './ReportBuilderPanel';
import { DataAPIPanel } from './DataAPIPanel';
import { ComparativeAnalysisPanel } from './ComparativeAnalysisPanel';
import { AdvancedWidgetsPanel } from './AdvancedWidgetsPanel';
import { CustomCalculationsPanel } from './CustomCalculationsPanel';
import { PerformanceOptimizationPanel } from './PerformanceOptimizationPanel';
import { MobileExperiencePanel } from './MobileExperiencePanel';
import { DashboardAnalyticsPanel } from './DashboardAnalyticsPanel';

interface DashboardSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardId: string;
  market: 'aeso' | 'ercot';
  defaultTab?: string;
}

export function DashboardSettingsDialog({
  open,
  onOpenChange,
  dashboardId,
  market,
  defaultTab = 'general',
}: DashboardSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Dashboard Settings & Tools</DialogTitle>
          <DialogDescription>
            Configure advanced features, analytics, and integrations for your dashboard
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="px-6 border-b">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-auto min-w-full">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="compare">Compare</TabsTrigger>
                <TabsTrigger value="widgets">Widgets</TabsTrigger>
                <TabsTrigger value="calculations">Calculations</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>

          <ScrollArea className="h-[calc(90vh-180px)]">
            <div className="p-6">
              <TabsContent value="features" className="mt-0">
                <Phase4FeaturesPanel />
              </TabsContent>

              <TabsContent value="alerts" className="mt-0">
                <AlertManagementPanel />
              </TabsContent>

              <TabsContent value="reports" className="mt-0">
                <ScheduledReportsPanel />
              </TabsContent>

              <TabsContent value="export" className="mt-0">
                <ExportOptionsPanel />
              </TabsContent>

              <TabsContent value="builder" className="mt-0">
                <ReportBuilderPanel />
              </TabsContent>

              <TabsContent value="api" className="mt-0">
                <DataAPIPanel />
              </TabsContent>

              <TabsContent value="compare" className="mt-0">
                <ComparativeAnalysisPanel />
              </TabsContent>

              <TabsContent value="widgets" className="mt-0">
                <AdvancedWidgetsPanel />
              </TabsContent>

              <TabsContent value="calculations" className="mt-0">
                <CustomCalculationsPanel />
              </TabsContent>

              <TabsContent value="performance" className="mt-0">
                <PerformanceOptimizationPanel />
              </TabsContent>

              <TabsContent value="mobile" className="mt-0">
                <MobileExperiencePanel />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <DashboardAnalyticsPanel />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
