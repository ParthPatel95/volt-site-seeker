import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Filter, Share2, Bell, Download, Play, Pause, Sparkles, X, MessageSquare, History, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatCard } from '@/components/aeso/dashboard-widgets/StatCard';
import { ChartWidget } from '@/components/aeso/dashboard-widgets/ChartWidget';
import { GaugeWidget } from '@/components/aeso/dashboard-widgets/GaugeWidget';
import { TableWidget } from '@/components/aeso/dashboard-widgets/TableWidget';
import { PieChartWidget } from '@/components/aeso/dashboard-widgets/PieChartWidget';
import { ShareDashboardDialog } from './ShareDashboardDialog';
import { AlertConfigDialog } from './AlertConfigDialog';
import { AIAssistantSidebar } from './AIAssistantSidebar';
import { AutomatedInsightsPanel } from './AutomatedInsightsPanel';
import { QuickSuggestionsPanel } from './QuickSuggestionsPanel';
import { DashboardToolbar } from './DashboardToolbar';
import { DashboardComments } from './DashboardComments';
import { DashboardPresence } from './DashboardPresence';
import { DashboardVersionHistory } from './DashboardVersionHistory';
import { DashboardActivityFeed } from './DashboardActivityFeed';
import { DashboardShareDialog } from './DashboardShareDialog';
import { DashboardAnalyticsView } from './DashboardAnalyticsView';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardViewerProps {
  dashboard: any;
  widgets: any[];
  market: 'aeso' | 'ercot';
  isPublicView?: boolean;
}

export function DashboardViewer({ dashboard, widgets, market, isPublicView = false }: DashboardViewerProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('24hours');
  const [aggregation, setAggregation] = useState('hourly');
  const [refreshKey, setRefreshKey] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: 'Dashboard refreshed',
      description: 'All widgets have been updated with latest data',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export started',
      description: 'Your dashboard is being exported to PDF...',
    });
    // Export functionality would be implemented here
  };

  const renderWidget = (widget: any) => {
    const config = {
      title: widget.widget_config?.title || widget.title || 'Widget',
      dataSource: widget.data_source || widget.dataSource,
      dataFilters: {
        ...widget.data_filters,
        timeRange,
        aggregation,
      },
      widgetType: widget.widget_type || widget.widgetType,
      market,
      refreshKey, // Force re-fetch when filters change
    };

    const widgetContent = (() => {
      switch (widget.widget_type || widget.widgetType) {
        case 'stat_card':
          return <StatCard config={config} />;
        case 'gauge':
          return <GaugeWidget config={config} />;
        case 'line_chart':
        case 'bar_chart':
        case 'area_chart':
          return <ChartWidget config={config} />;
        case 'pie_chart':
          return <PieChartWidget config={config} />;
        case 'table':
          return <TableWidget config={config} />;
        default:
          return (
            <Card className="p-6">
              <p className="text-muted-foreground">Unknown widget type: {widget.widget_type}</p>
            </Card>
          );
      }
    })();

    return (
      <div key={widget.id || widget.i} className="h-full">
        {widgetContent}
      </div>
    );
  };

  const dashboardContext = {
    dashboardName: dashboard?.dashboard_name || 'Dashboard',
    market,
    timeRange,
    widgets: widgets || []
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Dashboard Area */}
      <div className={`flex-1 overflow-auto transition-all ${aiAssistantOpen ? 'mr-96' : ''}`}>
        <div className="space-y-6 p-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {!isPublicView && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/aeso-dashboards')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">{dashboard?.dashboard_name}</h1>
            {dashboard?.description && (
              <p className="text-muted-foreground mt-1">{dashboard.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Time Range</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24hours">Last 24 Hours</SelectItem>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="12months">Last 12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Aggregation</Label>
                  <Select value={aggregation} onValueChange={setAggregation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw">Raw Data</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleRefresh} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {!isPublicView && (
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="text-sm">Auto</span>
            </div>
          )}

          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          {!isPublicView && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleExport}
                title="Export Dashboard"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setShareDialogOpen(true)}
                title="Share Dashboard"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant={showCollaboration ? "default" : "outline"}
                size="icon" 
                onClick={() => setShowCollaboration(!showCollaboration)}
                title="Collaboration"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="icon" 
                onClick={() => setShowShareDialog(true)}
                title="Share Dashboard"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="icon" 
                onClick={() => setShowAnalytics(true)}
                title="Analytics"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={aiAssistantOpen ? "default" : "outline"}
                size="icon" 
                onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
                title="AI Assistant"
              >
                {aiAssistantOpen ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </>
          )}
          
          {/* Live Presence Indicator */}
          {!isPublicView && dashboard?.id && (
            <DashboardPresence dashboardId={dashboard.id} />
          )}
        </div>
      </div>

      {/* Advanced Dashboard Toolbar */}
      {!isPublicView && dashboard?.id && (
        <div className="flex items-center justify-end">
          <DashboardToolbar 
            dashboardId={dashboard.id}
            market={market}
            onExport={handleExport}
            onAlert={() => setAlertDialogOpen(true)}
          />
        </div>
      )}

      {/* AI Insights Panel */}
      {!isPublicView && dashboard?.id && (
        <div className="mb-6">
          <AutomatedInsightsPanel
            dashboardId={dashboard.id}
            market={market}
            timeRange={timeRange}
          />
        </div>
      )}

      {/* Widgets Grid */}
      {widgets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No widgets configured for this dashboard</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map(renderWidget)}
        </div>
      )}

        {/* Dialogs */}
        {!isPublicView && (
          <>
            <ShareDashboardDialog
              open={shareDialogOpen}
              onOpenChange={setShareDialogOpen}
              dashboardId={dashboard?.id || ''}
            />
            <AlertConfigDialog
              open={alertDialogOpen}
              onOpenChange={setAlertDialogOpen}
              dashboardId={dashboard?.id || ''}
            />
            <DashboardShareDialog
              open={showShareDialog}
              onOpenChange={setShowShareDialog}
              dashboardId={dashboard?.id || ''}
              dashboardName={dashboard?.dashboard_name || 'Dashboard'}
            />
            <DashboardAnalyticsView
              open={showAnalytics}
              onOpenChange={setShowAnalytics}
              dashboardId={dashboard?.id || ''}
              dashboardName={dashboard?.dashboard_name || 'Dashboard'}
            />
          </>
        )}
      </div>
    </div>

      {/* AI Assistant Sidebar */}
      {aiAssistantOpen && !isPublicView && (
        <div className="fixed right-0 top-0 h-screen w-96 shadow-2xl z-50">
          <AIAssistantSidebar dashboardContext={dashboardContext} />
        </div>
      )}

      {/* Collaboration Sidebar */}
      {showCollaboration && !isPublicView && dashboard?.id && (
        <div className="fixed right-0 top-0 h-screen w-96 shadow-2xl z-50 bg-background border-l">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Collaboration</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCollaboration(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <Tabs defaultValue="comments" className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="comments" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  <History className="w-4 h-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-auto p-4">
                <TabsContent value="comments" className="m-0 space-y-4">
                  <DashboardComments dashboardId={dashboard.id} />
                  <DashboardActivityFeed dashboardId={dashboard.id} />
                </TabsContent>

                <TabsContent value="history" className="m-0">
                  <DashboardVersionHistory dashboardId={dashboard.id} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
