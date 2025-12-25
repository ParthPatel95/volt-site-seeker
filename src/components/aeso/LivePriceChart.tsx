import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  CandlestickChart,
  LineChartIcon
} from 'lucide-react';
import { format, subHours, parseISO, startOfHour, differenceInHours } from 'date-fns';

interface PriceDataPoint {
  timestamp: string;
  pool_price: number;
  ail_mw?: number;
}

interface LivePriceChartProps {
  data: PriceDataPoint[];
  currentPrice: number;
  loading?: boolean;
}

type TimeRange = '1H' | '4H' | '12H' | '24H' | '7D';
type ChartType = 'line' | 'candle';

interface CandleData {
  timestamp: string;
  hour: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export function LivePriceChart({ data, currentPrice, loading }: LivePriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    let hoursBack = 24;
    
    switch (timeRange) {
      case '1H': hoursBack = 1; break;
      case '4H': hoursBack = 4; break;
      case '12H': hoursBack = 12; break;
      case '24H': hoursBack = 24; break;
      case '7D': hoursBack = 168; break;
    }
    
    const cutoff = subHours(now, hoursBack);
    
    return data
      .filter(d => new Date(d.timestamp) >= cutoff)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [data, timeRange]);

  // Calculate candlestick data (hourly OHLC)
  const candleData = useMemo((): CandleData[] => {
    if (!filteredData || filteredData.length === 0) return [];
    
    const hourlyGroups = new Map<string, PriceDataPoint[]>();
    
    filteredData.forEach(d => {
      const hourKey = format(startOfHour(new Date(d.timestamp)), 'yyyy-MM-dd HH:00');
      if (!hourlyGroups.has(hourKey)) {
        hourlyGroups.set(hourKey, []);
      }
      hourlyGroups.get(hourKey)!.push(d);
    });
    
    const candles: CandleData[] = [];
    
    hourlyGroups.forEach((points, hourKey) => {
      if (points.length === 0) return;
      
      const prices = points.map(p => p.pool_price);
      const sortedByTime = [...points].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      candles.push({
        timestamp: hourKey,
        hour: format(new Date(hourKey), 'HH:mm'),
        open: sortedByTime[0].pool_price,
        high: Math.max(...prices),
        low: Math.min(...prices),
        close: sortedByTime[sortedByTime.length - 1].pool_price,
        volume: points.reduce((sum, p) => sum + (p.ail_mw || 0), 0) / points.length
      });
    });
    
    return candles.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [filteredData]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { high: 0, low: 0, avg: 0, change: 0, changePercent: 0 };
    }
    
    const prices = filteredData.map(d => d.pool_price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = lastPrice - firstPrice;
    const changePercent = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;
    
    return { high, low, avg, change, changePercent };
  }, [filteredData]);

  const isPositive = stats.change >= 0;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 4));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.5));
  const handleReset = () => setZoomLevel(1);

  const formatXAxis = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (timeRange === '1H' || timeRange === '4H') {
        return format(date, 'HH:mm');
      } else if (timeRange === '7D') {
        return format(date, 'EEE HH:mm');
      }
      return format(date, 'HH:mm');
    } catch {
      return '';
    }
  };

  // Custom candlestick component
  const CandlestickBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    
    const { open, close, high, low } = payload;
    const isUp = close >= open;
    const color = isUp ? 'hsl(var(--watt-success))' : 'hsl(0, 84%, 60%)';
    
    const bodyTop = Math.min(open, close);
    const bodyHeight = Math.abs(close - open);
    const wickTop = high;
    const wickBottom = low;
    
    // Calculate pixel positions
    const priceRange = stats.high - stats.low || 1;
    const chartHeight = 280 / zoomLevel;
    
    return (
      <g>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={y}
          x2={x + width / 2}
          y2={y + height}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={x + 2}
          y={y + (isUp ? height * 0.3 : height * 0.2)}
          width={Math.max(width - 4, 4)}
          height={Math.max(height * 0.5, 4)}
          fill={isUp ? color : color}
          stroke={color}
          strokeWidth={1}
          rx={1}
        />
      </g>
    );
  };

  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Live Price Chart</CardTitle>
              <p className="text-xs text-muted-foreground">Real-time AESO pool price</p>
            </div>
          </div>
          
          {/* Current Price Badge */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isPositive 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
              <span className={`text-lg font-bold ${
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                ${currentPrice.toFixed(2)}
              </span>
              <span className={`text-sm ${
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isPositive ? '+' : ''}{stats.changePercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {(['1H', '4H', '12H', '24H', '7D'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="px-3 py-1 h-7 text-xs font-medium"
              >
                {range}
              </Button>
            ))}
          </div>

          {/* Chart Type & Zoom Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="px-2 py-1 h-7"
              >
                <LineChartIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={chartType === 'candle' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('candle')}
                className="px-2 py-1 h-7"
              >
                <CandlestickChart className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-7 w-7 p-0">
                <ZoomIn className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-7 w-7 p-0">
                <ZoomOut className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} className="h-7 w-7 p-0">
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">High</p>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">${stats.high.toFixed(2)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Low</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">${stats.low.toFixed(2)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-sm font-bold text-foreground">${stats.avg.toFixed(2)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Change</p>
            <p className={`text-sm font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}${stats.change.toFixed(2)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Activity className="w-8 h-8 animate-pulse text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No data available for selected range</p>
          </div>
        ) : chartType === 'line' ? (
          <ResponsiveContainer width="100%" height={300 / zoomLevel}>
            <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickFormatter={(v) => `$${v}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelFormatter={(label) => {
                  try {
                    return format(new Date(label), 'MMM d, HH:mm');
                  } catch {
                    return label;
                  }
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <ReferenceLine y={stats.avg} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
              <Area 
                type="monotone" 
                dataKey="pool_price" 
                fill="url(#priceGradient)" 
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="pool_price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300 / zoomLevel}>
            <ComposedChart data={candleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickFormatter={(v) => `$${v}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    open: 'Open',
                    high: 'High',
                    low: 'Low',
                    close: 'Close'
                  };
                  return [`$${value.toFixed(2)}`, labels[name] || name];
                }}
              />
              <Bar dataKey="low" fill="transparent" />
              <Bar dataKey="high" shape={<CandlestickBar />} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Live • Updates every minute</span>
        </div>
      </CardContent>
    </Card>
  );
}
