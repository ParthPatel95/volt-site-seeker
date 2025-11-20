import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const SERIES_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

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
  const samplePoint = chartData[0] || {};
  const numericKeys = Object.keys(samplePoint).filter((key) => typeof samplePoint[key] === 'number');
  const seriesKeys = numericKeys.filter((key) => key !== 'time' && key !== 'date');

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No data available</p>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={refetch}
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (config.widgetType) {
      case 'line_chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={(entry) => entry.time || entry.date} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              {seriesKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar_chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={(entry) => entry.time || entry.date} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              {seriesKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={SERIES_COLORS[index % SERIES_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area_chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={(entry) => entry.time || entry.date} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              {seriesKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                  fill={SERIES_COLORS[index % SERIES_COLORS.length]}
                  fillOpacity={0.3}
                />
              ))}
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
