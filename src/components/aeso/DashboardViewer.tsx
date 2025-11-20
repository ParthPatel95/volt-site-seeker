import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Filter, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatCard } from '@/components/aeso/dashboard-widgets/StatCard';
import { ChartWidget } from '@/components/aeso/dashboard-widgets/ChartWidget';
import { GaugeWidget } from '@/components/aeso/dashboard-widgets/GaugeWidget';
import { TableWidget } from '@/components/aeso/dashboard-widgets/TableWidget';
import { PieChartWidget } from '@/components/aeso/dashboard-widgets/PieChartWidget';

interface DashboardViewerProps {
  dashboard: any;
  widgets: any[];
  market: 'aeso' | 'ercot';
}

export function DashboardViewer({ dashboard, widgets, market }: DashboardViewerProps) {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('24hours');
  const [aggregation, setAggregation] = useState('hourly');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/aeso-dashboards')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{dashboard?.dashboard_name}</h1>
            {dashboard?.description && (
              <p className="text-muted-foreground mt-1">{dashboard.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
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

          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
    </div>
  );
}
