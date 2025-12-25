import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Brain,
  Building2
} from 'lucide-react';
import { format, subHours, addHours, parseISO, isAfter, isBefore } from 'date-fns';

interface PriceDataPoint {
  timestamp?: string;
  datetime?: string;
  pool_price: number;
  forecast_pool_price?: number;
  ail_mw?: number;
}

interface AIPrediction {
  timestamp: string;
  price: number;
  confidenceLower?: number;
  confidenceUpper?: number;
  confidenceScore?: number;
}

interface LivePriceChartProps {
  data: PriceDataPoint[];
  currentPrice: number;
  loading?: boolean;
  aiPredictions?: AIPrediction[];
  onRefresh?: () => void;
}

type TimeRange = '24H' | '48H' | '72H';

export function LivePriceChart({ 
  data, 
  currentPrice, 
  loading, 
  aiPredictions = [],
  onRefresh 
}: LivePriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');

  // Get hours based on time range (for past data)
  const getHoursBack = () => {
    switch (timeRange) {
      case '24H': return 24;
      case '48H': return 48;
      case '72H': return 72;
    }
  };

  // Process data: past actual prices + future AESO forecasts + AI predictions
  const chartData = useMemo(() => {
    const now = new Date();
    const hoursBack = getHoursBack();
    const cutoffPast = subHours(now, hoursBack);
    const cutoffFuture = addHours(now, hoursBack);
    
    console.log('[LivePriceChart] Processing data:', {
      dataLength: data?.length || 0,
      aiPredictionsLength: aiPredictions?.length || 0,
      timeRange,
      cutoffPast: cutoffPast.toISOString(),
      cutoffFuture: cutoffFuture.toISOString()
    });
    
    const chartPoints: any[] = [];
    
    // Process historical data
    if (data && data.length > 0) {
      data.forEach(d => {
        const ts = d.datetime || d.timestamp || '';
        if (!ts) return;
        
        let parsedDate: Date;
        try {
          if (ts.includes('T')) {
            parsedDate = parseISO(ts);
          } else {
            // Format like "2025-11-25 00:00"
            parsedDate = new Date(ts.replace(' ', 'T') + ':00');
          }
        } catch {
          parsedDate = new Date(ts);
        }
        
        // Skip invalid dates
        if (isNaN(parsedDate.getTime())) return;
        
        // Check if within time range
        if (isBefore(parsedDate, cutoffPast) || isAfter(parsedDate, cutoffFuture)) return;
        
        const isPast = isBefore(parsedDate, now);
        const timestamp = parsedDate.toISOString();
        
        const existingPoint = chartPoints.find(p => p.timestamp === timestamp);
        if (existingPoint) {
          if (isPast && d.pool_price !== undefined) {
            existingPoint.actual = d.pool_price;
          }
          if (!isPast && d.forecast_pool_price !== undefined) {
            existingPoint.aesoForecast = d.forecast_pool_price;
          }
        } else {
          chartPoints.push({
            timestamp,
            parsedDate,
            actual: isPast ? d.pool_price : undefined,
            aesoForecast: !isPast && d.forecast_pool_price ? d.forecast_pool_price : undefined,
          });
        }
      });
    }
    
    // Process AI predictions (always for future times)
    if (aiPredictions && aiPredictions.length > 0) {
      console.log('[LivePriceChart] Processing AI predictions:', aiPredictions.length);
      
      aiPredictions.forEach(pred => {
        let predDate: Date;
        try {
          predDate = parseISO(pred.timestamp);
        } catch {
          predDate = new Date(pred.timestamp);
        }
        
        if (isNaN(predDate.getTime())) return;
        if (isBefore(predDate, cutoffPast) || isAfter(predDate, cutoffFuture)) return;
        
        const timestamp = predDate.toISOString();
        
        // Find existing point within 30 min window
        const existingPoint = chartPoints.find(p => 
          Math.abs(new Date(p.timestamp).getTime() - predDate.getTime()) < 30 * 60 * 1000
        );
        
        if (existingPoint) {
          existingPoint.aiPrediction = pred.price;
          existingPoint.aiLower = pred.confidenceLower;
          existingPoint.aiUpper = pred.confidenceUpper;
        } else {
          chartPoints.push({
            timestamp,
            parsedDate: predDate,
            aiPrediction: pred.price,
            aiLower: pred.confidenceLower,
            aiUpper: pred.confidenceUpper,
          });
        }
      });
    }
    
    // Sort by timestamp
    const sortedPoints = chartPoints.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    
    console.log('[LivePriceChart] Final chart data:', {
      totalPoints: sortedPoints.length,
      actualPoints: sortedPoints.filter(p => p.actual !== undefined).length,
      aesoForecastPoints: sortedPoints.filter(p => p.aesoForecast !== undefined).length,
      aiPredictionPoints: sortedPoints.filter(p => p.aiPrediction !== undefined).length
    });
    
    return sortedPoints;
  }, [data, aiPredictions, timeRange]);

  // Calculate statistics from actual prices only - including negative prices
  const stats = useMemo(() => {
    const actualPrices = chartData.filter(d => d.actual !== undefined).map(d => d.actual);
    const aiPredPrices = chartData.filter(d => d.aiPrediction !== undefined).map(d => d.aiPrediction);
    
    if (actualPrices.length === 0) {
      return { high: 0, low: 0, avg: 0, change: 0, changePercent: 0, aiAvg: 0, negativeHours: 0, hasNegatives: false };
    }
    
    const high = Math.max(...actualPrices);
    const low = Math.min(...actualPrices);
    // Net average includes negative prices (which reduce the average - good for consumers)
    const avg = actualPrices.reduce((a, b) => a + b, 0) / actualPrices.length;
    const firstPrice = actualPrices[0];
    const lastPrice = actualPrices[actualPrices.length - 1];
    const change = lastPrice - firstPrice;
    const changePercent = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;
    const aiAvg = aiPredPrices.length > 0 
      ? aiPredPrices.reduce((a, b) => a + b, 0) / aiPredPrices.length 
      : 0;
    
    // Track negative price hours (AESO can go negative during wind oversupply)
    const negativeHours = actualPrices.filter(p => p < 0).length;
    const hasNegatives = negativeHours > 0;
    
    return { high, low, avg, change, changePercent, aiAvg, negativeHours, hasNegatives };
  }, [chartData]);

  const isPositive = stats.change >= 0;

  const formatXAxis = (value: string) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      return format(date, 'MMM d HH:mm');
    } catch {
      return '';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const now = new Date();
    let labelDate: Date;
    try {
      labelDate = new Date(label);
    } catch {
      return null;
    }
    const isPast = isBefore(labelDate, now);
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-2">
          {format(labelDate, 'MMM d, yyyy HH:mm')}
        </p>
        {payload.map((entry: any, index: number) => {
          if (entry.value === undefined || entry.value === null) return null;
          
          let label = '';
          let color = entry.color;
          
          switch (entry.dataKey) {
            case 'actual':
              label = 'Actual Price';
              break;
            case 'aesoForecast':
              label = 'AESO Forecast';
              break;
            case 'aiPrediction':
              label = 'AI Prediction';
              break;
            default:
              return null;
          }
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">{label}:</span>
              <span className="text-sm font-semibold">${entry.value.toFixed(2)}</span>
            </div>
          );
        })}
        <div className="mt-1 pt-1 border-t border-border/50">
          <Badge variant={isPast ? 'default' : 'secondary'} className="text-[10px]">
            {isPast ? 'Historical' : 'Forecast'}
          </Badge>
        </div>
      </div>
    );
  };

  // Find the "now" reference line position
  const nowTimestamp = new Date().toISOString();

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
              <p className="text-xs text-muted-foreground">
                Past {timeRange} actual prices + {timeRange} forecast
              </p>
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
          {/* Time Range Selector - New 24H/48H/72H */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {(['24H', '48H', '72H'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="px-4 py-1 h-8 text-sm font-medium"
              >
                {range}
              </Button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-primary rounded" />
              <span className="text-muted-foreground">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-blue-500 rounded" style={{ borderStyle: 'dashed' }} />
              <Building2 className="w-3 h-3 text-blue-500" />
              <span className="text-muted-foreground">AESO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-emerald-500 rounded" style={{ borderStyle: 'dashed' }} />
              <Brain className="w-3 h-3 text-emerald-500" />
              <span className="text-muted-foreground">AI</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-4">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">High</p>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">${stats.high.toFixed(2)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Low</p>
            <p className={`text-sm font-bold ${stats.low < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-green-600 dark:text-green-400'}`}>
              ${stats.low.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Net Avg</p>
            <p className="text-sm font-bold text-foreground">${stats.avg.toFixed(2)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Change</p>
            <p className={`text-sm font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}${stats.change.toFixed(2)}
            </p>
          </div>
          {stats.hasNegatives && (
            <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">⚡ Negative</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats.negativeHours}h</p>
            </div>
          )}
          {stats.aiAvg > 0 && (
            <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-600 dark:text-blue-400">AI Avg</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">${stats.aiAvg.toFixed(2)}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Activity className="w-8 h-8 animate-pulse text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Activity className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No price data available</p>
              <p className="text-xs text-muted-foreground">Try refreshing or selecting a different time range</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aiConfidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickFormatter={(v) => `$${v}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* "Now" reference line */}
              <ReferenceLine 
                x={nowTimestamp} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ 
                  value: 'Now', 
                  position: 'top', 
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 11,
                  fontWeight: 600
                }}
              />
              
              {/* AI Confidence band (area behind AI line) */}
              <Area 
                type="monotone" 
                dataKey="aiUpper" 
                fill="url(#aiConfidenceGradient)" 
                stroke="none"
                connectNulls={false}
              />
              
              {/* Actual price area gradient */}
              <Area 
                type="monotone" 
                dataKey="actual" 
                fill="url(#actualGradient)" 
                stroke="none"
                connectNulls={false}
              />
              
              {/* Actual price line (solid) */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                connectNulls={false}
                name="Actual Price"
              />
              
              {/* AESO Forecast line (dashed blue) */}
              <Line
                type="monotone"
                dataKey="aesoForecast"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{ r: 3, fill: '#3b82f6' }}
                connectNulls={false}
                name="AESO Forecast"
              />
              
              {/* AI Prediction line (dashed green) */}
              <Line
                type="monotone"
                dataKey="aiPrediction"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                activeDot={{ r: 3, fill: '#10b981' }}
                connectNulls={false}
                name="AI Prediction"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Live indicator */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Live • Updates every minute</span>
          </div>
          {aiPredictions && aiPredictions.length > 0 && (
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-emerald-500" />
              <span>{aiPredictions.length} AI predictions loaded</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
