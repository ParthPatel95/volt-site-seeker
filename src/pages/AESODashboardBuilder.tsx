import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAESODashboards } from '@/hooks/useAESODashboards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Share2, Plus, LineChart, BarChart3, Gauge, Table, AreaChart, PieChart, Activity, TrendingUp, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { StatCard } from '@/components/aeso/dashboard-widgets/StatCard';
import { ChartWidget } from '@/components/aeso/dashboard-widgets/ChartWidget';
import { GaugeWidget } from '@/components/aeso/dashboard-widgets/GaugeWidget';
import { TableWidget } from '@/components/aeso/dashboard-widgets/TableWidget';
import { PieChartWidget } from '@/components/aeso/dashboard-widgets/PieChartWidget';
import { AIDashboardChat } from '@/components/aeso/AIDashboardChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DATA_SOURCES } from '@/hooks/useAESODashboardData';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Widget {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  widget_type: string;
  widget_config: any;
  data_source: string;
  data_filters: any;
}

export default function AESODashboardBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getDashboardById, updateDashboard } = useAESODashboards();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardName, setDashboardName] = useState('');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);

  // Check if we should show AI chat based on navigation state
  useEffect(() => {
    if (location.state?.showAI) {
      setShowAIChat(true);
    }
  }, [location.state]);

  useEffect(() => {
    loadDashboard();
  }, [id]);

  const loadDashboard = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getDashboardById(id);
    if (data) {
      setDashboard(data);
      setDashboardName(data.dashboard_name);
      
      // Load existing widgets
      if (data.aeso_dashboard_widgets) {
        const loadedWidgets = data.aeso_dashboard_widgets.map((w: any) => ({
          i: w.id,
          x: w.position_x,
          y: w.position_y,
          w: w.width,
          h: w.height,
          widget_type: w.widget_type,
          widget_config: w.widget_config,
          data_source: w.data_source,
          data_filters: w.data_filters,
        }));
        setWidgets(loadedWidgets);
      }
    }
    setLoading(false);
  };

  const addWidget = (type: string) => {
    const newWidget: Widget = {
      i: `widget-${Date.now()}`,
      x: 0,
      y: Infinity,
      w: type === 'stat_card' ? 3 : 6,
      h: type === 'stat_card' ? 2 : 4,
      widget_type: type,
      widget_config: {
        title: `New ${type.replace('_', ' ')}`,
      },
      data_source: 'historical_pricing',
      data_filters: {
        timeRange: '30days',
        metrics: ['pool_price'],
        aggregation: 'hourly',
      },
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget);
  };

  const onLayoutChange = (layout: any[]) => {
    setWidgets(widgets.map((widget, idx) => ({
      ...widget,
      x: layout[idx].x,
      y: layout[idx].y,
      w: layout[idx].w,
      h: layout[idx].h,
    })));
  };

  const updateWidgetConfig = (widgetId: string, updates: Partial<Widget>) => {
    setWidgets(widgets.map(w => w.i === widgetId ? { ...w, ...updates } : w));
    if (selectedWidget?.i === widgetId) {
      setSelectedWidget({ ...selectedWidget, ...updates });
    }
  };

  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.i !== widgetId));
    if (selectedWidget?.i === widgetId) {
      setSelectedWidget(null);
    }
  };

  const handleAIWidgets = (aiWidgets: any[]) => {
    const newWidgets = aiWidgets.map(w => ({
      i: `widget-${Date.now()}-${Math.random()}`,
      x: 0,
      y: Infinity,
      w: w.w || 6,
      h: w.h || 4,
      widget_type: w.widget_type,
      widget_config: w.widget_config,
      data_source: w.data_source,
      data_filters: w.data_filters,
    }));
    setWidgets([...widgets, ...newWidgets]);
  };

  const handleSave = async () => {
    if (!id) return;
    // TODO: Save widgets to database via API
    await updateDashboard(id, { 
      dashboard_name: dashboardName,
      layout_config: {
        lg: widgets.map(w => ({ i: w.i, x: w.x, y: w.y, w: w.w, h: w.h })),
        md: [],
        sm: [],
      }
    });
  };

  const renderWidget = (widget: Widget) => {
    const config = {
      title: widget.widget_config.title || 'Widget',
      dataSource: widget.data_source,
      dataFilters: widget.data_filters,
      widgetType: widget.widget_type,
    };

    const widgetContent = (() => {
      switch (widget.widget_type) {
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
          return <div className="p-4">Unknown widget type</div>;
      }
    })();

    return (
      <div
        key={widget.i}
        className={`cursor-pointer transition-all ${
          selectedWidget?.i === widget.i ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => setSelectedWidget(widget)}
      >
        {widgetContent}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-1/3" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Dashboard not found</h2>
          <Button onClick={() => navigate('/app/aeso-dashboards')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/aeso-dashboards')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Input
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              className="text-2xl font-bold border-none bg-transparent focus-visible:ring-0 px-0"
              placeholder="Dashboard Name"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={showAIChat ? "default" : "outline"} 
              onClick={() => setShowAIChat(!showAIChat)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button variant="outline" onClick={() => navigate(`/app/aeso-dashboard-share/${id}`)}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
          {/* Widget Palette */}
          {!showAIChat && (
            <div className="col-span-2 bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Add Widgets</h3>
            </div>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="p-4 space-y-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Charts</p>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => addWidget('line_chart')}
                  >
                    <LineChart className="w-4 h-4 mr-2" />
                    Line Chart
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => addWidget('bar_chart')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Bar Chart
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => addWidget('area_chart')}
                  >
                    <AreaChart className="w-4 h-4 mr-2" />
                    Area Chart
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => addWidget('pie_chart')}
                  >
                    <PieChart className="w-4 h-4 mr-2" />
                    Pie Chart
                  </Button>
                </div>

                <div className="space-y-1 pt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Indicators</p>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => addWidget('stat_card')}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Stat Card
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => addWidget('gauge')}
                  >
                    <Gauge className="w-4 h-4 mr-2" />
                    Gauge
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => addWidget('table')}
                  >
                    <Table className="w-4 h-4 mr-2" />
                    Data Table
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
          )}

          {/* AI Chat Panel */}
          {showAIChat && (
            <div className="col-span-3 bg-card rounded-lg border">
              <AIDashboardChat onWidgetsGenerated={handleAIWidgets} />
            </div>
          )}

          {/* Canvas */}
          <div className={`${showAIChat ? 'col-span-7' : 'col-span-8'} bg-card rounded-lg border p-6 overflow-auto`}>
            {widgets.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Add widgets to build your dashboard</p>
                  <p className="text-sm mt-2">Click widgets from the left panel to add them</p>
                </div>
              </div>
            ) : (
              <GridLayout
                className="layout"
                layout={widgets.map(w => ({ i: w.i, x: w.x, y: w.y, w: w.w, h: w.h }))}
                cols={12}
                rowHeight={80}
                width={1200}
                onLayoutChange={onLayoutChange}
                draggableHandle=".drag-handle"
              >
                {widgets.map(renderWidget)}
              </GridLayout>
            )}
          </div>

          {/* Properties Panel */}
          {!showAIChat && (
            <div className="col-span-2 bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Properties</h3>
            </div>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="p-4">
                {selectedWidget ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={selectedWidget.widget_config.title || ''}
                        onChange={(e) => updateWidgetConfig(selectedWidget.i, {
                          widget_config: { ...selectedWidget.widget_config, title: e.target.value }
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Data Source</Label>
                      <Select
                        value={selectedWidget.data_source}
                        onValueChange={(value) => updateWidgetConfig(selectedWidget.i, { data_source: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DATA_SOURCES.map(source => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Range</Label>
                      <Select
                        value={selectedWidget.data_filters.timeRange || '30days'}
                        onValueChange={(value) => updateWidgetConfig(selectedWidget.i, {
                          data_filters: { ...selectedWidget.data_filters, timeRange: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24hours">Last 24 Hours</SelectItem>
                          <SelectItem value="30days">Last 30 Days</SelectItem>
                          <SelectItem value="12months">Last 12 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Widget Type</Label>
                      <Select
                        value={selectedWidget.widget_type}
                        onValueChange={(value) => updateWidgetConfig(selectedWidget.i, { widget_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line_chart">Line Chart</SelectItem>
                          <SelectItem value="bar_chart">Bar Chart</SelectItem>
                          <SelectItem value="area_chart">Area Chart</SelectItem>
                          <SelectItem value="pie_chart">Pie Chart</SelectItem>
                          <SelectItem value="gauge">Gauge</SelectItem>
                          <SelectItem value="stat_card">Stat Card</SelectItem>
                          <SelectItem value="table">Data Table</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => deleteWidget(selectedWidget.i)}
                    >
                      Delete Widget
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click a widget to configure its properties
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
