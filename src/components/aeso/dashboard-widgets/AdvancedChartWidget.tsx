import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Brush, ReferenceLine, ReferenceArea, Scatter, ScatterChart, ZAxis
} from 'recharts';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';
import { RefreshCw, Download, ZoomIn, TrendingUp, Activity } from 'lucide-react';
import { useState, useMemo } from 'react';

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  success: 'hsl(142 76% 36%)',
  warning: 'hsl(38 92% 50%)',
  danger: 'hsl(0 84% 60%)',
  chart1: 'hsl(var(--chart-1))',
  chart2: 'hsl(var(--chart-2))',
  chart3: 'hsl(var(--chart-3))',
  chart4: 'hsl(var(--chart-4))',
  chart5: 'hsl(var(--chart-5))',
};

interface AdvancedChartWidgetProps {
  config: WidgetConfig;
}

export function AdvancedChartWidget({ config }: AdvancedChartWidgetProps) {
  const { data, loading, error, refetch } = useAESODashboardData(config);
  const [showMovingAvg, setShowMovingAvg] = useState(true);
  const [showVolatility, setShowVolatility] = useState(false);
  const [brushDomain, setBrushDomain] = useState<any>(null);

  // Calculate moving average
  const enhancedData = useMemo(() => {
    if (!data?.chartData || !Array.isArray(data.chartData)) return [];
    
    const chartData = data.chartData;
    const period = 5; // 5-period moving average
    
    return chartData.map((item: any, index: number) => {
      const dataKey = item.price !== undefined ? 'price' : 
                      item.predicted !== undefined ? 'predicted' : 
                      Object.keys(item).find(k => typeof item[k] === 'number' && k !== 'time' && k !== 'date');
      
      if (!dataKey) return item;
      
      // Moving Average
      let ma = null;
      if (index >= period - 1) {
        const sum = chartData.slice(index - period + 1, index + 1)
          .reduce((acc: number, d: any) => acc + (d[dataKey] || 0), 0);
        ma = sum / period;
      }
      
      // Volatility (standard deviation)
      let volatilityUpper = null;
      let volatilityLower = null;
      if (ma && index >= period - 1) {
        const values = chartData.slice(index - period + 1, index + 1)
          .map((d: any) => d[dataKey] || 0);
        const variance = values.reduce((acc: number, val: number) => 
          acc + Math.pow(val - ma, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        volatilityUpper = ma + 2 * stdDev;
        volatilityLower = ma - 2 * stdDev;
      }
      
      return {
        ...item,
        movingAvg: ma,
        volatilityUpper,
        volatilityLower,
      };
    });
  }, [data?.chartData]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!enhancedData.length) return null;
    
    const values = enhancedData.map((d: any) => 
      d.price || d.predicted || d.value || 0
    ).filter((v: number) => v > 0);
    
    if (!values.length) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = sum / values.length;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean: mean.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      stdDev: stdDev.toFixed(2),
      median: sorted[Math.floor(sorted.length / 2)].toFixed(2),
      range: (Math.max(...values) - Math.min(...values)).toFixed(2),
    };
  }, [enhancedData]);

  const handleDownload = () => {
    const csv = [
      Object.keys(enhancedData[0] || {}).join(','),
      ...enhancedData.map((row: any) => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <Card className="border-primary/20 bg-background/95 backdrop-blur-sm p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
              </span>
              <span className="font-semibold">{entry.value?.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-80 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error || !enhancedData.length) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-80">
          <Activity className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            {error ? 'Failed to load chart data' : 'No data available'}
          </p>
          <Button size="sm" variant="outline" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dataKeys = Object.keys(enhancedData[0] || {}).filter(
    key => typeof enhancedData[0][key] === 'number' && 
    !['movingAvg', 'volatilityUpper', 'volatilityLower'].includes(key)
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">{config.title}</CardTitle>
          {statistics && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                Avg: ${statistics.mean}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Range: ${statistics.min} - ${statistics.max}
              </Badge>
              <Badge variant="outline" className="text-xs">
                σ: ${statistics.stdDev}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant={showMovingAvg ? 'default' : 'outline'}
            onClick={() => setShowMovingAvg(!showMovingAvg)}
            title="Toggle Moving Average"
          >
            <TrendingUp className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant={showVolatility ? 'default' : 'outline'}
            onClick={() => setShowVolatility(!showVolatility)}
            title="Toggle Volatility Bands"
          >
            <Activity className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={refetch}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={enhancedData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={(entry) => entry.time || entry.date} 
              fontSize={11}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              fontSize={11}
              stroke="hsl(var(--muted-foreground))"
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            
            {/* Volatility Bands */}
            {showVolatility && (
              <>
                <Area
                  type="monotone"
                  dataKey="volatilityUpper"
                  stroke="none"
                  fill={COLORS.warning}
                  fillOpacity={0.1}
                  name="Upper Band"
                />
                <Area
                  type="monotone"
                  dataKey="volatilityLower"
                  stroke="none"
                  fill={COLORS.warning}
                  fillOpacity={0.1}
                  name="Lower Band"
                />
              </>
            )}
            
            {/* Main Data Lines/Areas */}
            {config.widgetType === 'area_chart' ? (
              dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={Object.values(COLORS)[index % Object.values(COLORS).length]}
                  fill={`url(#colorGradient)`}
                  strokeWidth={2}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))
            ) : (
              dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={Object.values(COLORS)[index % Object.values(COLORS).length]}
                  strokeWidth={2}
                  dot={false}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                  animationDuration={500}
                />
              ))
            )}
            
            {/* Moving Average */}
            {showMovingAvg && (
              <Line
                type="monotone"
                dataKey="movingAvg"
                stroke={COLORS.accent}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="5-Period MA"
              />
            )}
            
            {/* Reference line for average */}
            {statistics && (
              <ReferenceLine
                y={parseFloat(statistics.mean)}
                stroke={COLORS.secondary}
                strokeDasharray="3 3"
                label={{ value: `Avg: $${statistics.mean}`, position: 'right', fontSize: 10 }}
              />
            )}
            
            {/* Brush for zooming */}
            <Brush 
              dataKey={(entry) => entry.time || entry.date}
              height={30}
              stroke={COLORS.primary}
              onChange={(domain) => setBrushDomain(domain)}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
