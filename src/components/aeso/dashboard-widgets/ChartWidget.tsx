import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ChartWidgetProps {
  config: WidgetConfig;
}

export function ChartWidget({ config }: ChartWidgetProps) {
  const { data, loading, error, refetch } = useAESODashboardData(config);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load chart data</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.chartData || data?.hourlyData || [];

  const renderChart = () => {
    switch (config.widgetType) {
      case 'line_chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} />
              {chartData[0]?.predicted && (
                <Line type="monotone" dataKey="predicted" stroke="hsl(var(--secondary))" strokeWidth={2} strokeDasharray="5 5" />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar_chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="price" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area_chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
        <Button size="icon" variant="ghost" onClick={refetch}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="h-full min-h-[200px]">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
}
