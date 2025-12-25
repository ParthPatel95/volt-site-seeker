import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Brush
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Brain,
  Building2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  BarChart3,
  Gauge,
  Target,
  Clock
} from 'lucide-react';
import { format, subHours, addHours, parseISO, isAfter, isBefore } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { TickerTape } from './TickerTape';
import { NextHourPreview } from './NextHourPreview';

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

interface TradingViewChartProps {
  data: PriceDataPoint[];
  currentPrice: number;
  loading?: boolean;
  aiLoading?: boolean;
  aiPredictions?: AIPrediction[];
  onRefresh?: () => void;
}

type TimeRange = '1H' | '4H' | '24H' | '48H' | '72H' | '1W';

export function TradingViewChart({ 
  data, 
  currentPrice, 
  loading, 
  aiLoading = false,
  aiPredictions = [],
  onRefresh 
}: TradingViewChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [brushDomain, setBrushDomain] = useState<[number, number] | null>(null);
  const chartRef = useRef<any>(null);

  // Get hours based on time range (for past data)
  const getHoursBack = () => {
    switch (timeRange) {
      case '1H': return 1;
      case '4H': return 4;
      case '24H': return 24;
      case '48H': return 48;
      case '72H': return 72;
      case '1W': return 168;
    }
  };

  // Process data: past actual prices + future AESO forecasts + AI predictions
  const chartData = useMemo(() => {
    const now = new Date();
    const hoursBack = getHoursBack();
    const cutoffPast = subHours(now, hoursBack);
    const cutoffFuture = addHours(now, hoursBack);
    
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
            parsedDate = new Date(ts.replace(' ', 'T') + ':00');
          }
        } catch {
          parsedDate = new Date(ts);
        }
        
        if (isNaN(parsedDate.getTime())) return;
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
    
    // Process AI predictions
    if (aiPredictions && aiPredictions.length > 0) {
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
    
    return chartPoints.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
  }, [data, aiPredictions, timeRange]);

  // Calculate OHLC and statistics
  const stats = useMemo(() => {
    const actualPrices = chartData.filter(d => d.actual !== undefined).map(d => d.actual);
    const aiPredPrices = chartData.filter(d => d.aiPrediction !== undefined).map(d => d.aiPrediction);
    const aesoForecasts = chartData.filter(d => d.aesoForecast !== undefined).map(d => d.aesoForecast);
    
    if (actualPrices.length === 0) {
      return { 
        open: 0, high: 0, low: 0, close: 0, avg: 0, 
        change: 0, changePercent: 0, aiAvg: 0, aesoAvg: 0, 
        negativeHours: 0, volatility: 0, volume: 0 
      };
    }
    
    const open = actualPrices[0];
    const high = Math.max(...actualPrices);
    const low = Math.min(...actualPrices);
    const close = actualPrices[actualPrices.length - 1];
    const avg = actualPrices.reduce((a, b) => a + b, 0) / actualPrices.length;
    const change = close - open;
    const changePercent = open !== 0 ? (change / open) * 100 : 0;
    const aiAvg = aiPredPrices.length > 0 
      ? aiPredPrices.reduce((a, b) => a + b, 0) / aiPredPrices.length 
      : 0;
    const aesoAvg = aesoForecasts.length > 0
      ? aesoForecasts.reduce((a, b) => a + b, 0) / aesoForecasts.length
      : 0;
    const negativeHours = actualPrices.filter(p => p < 0).length;
    const volatility = avg !== 0 ? ((high - low) / avg) * 100 : 0;
    
    // Estimate volume from demand data
    const volumeData = data.filter(d => d.ail_mw).map(d => d.ail_mw || 0);
    const volume = volumeData.length > 0 
      ? volumeData.reduce((a, b) => a + b, 0) / volumeData.length 
      : 0;
    
    return { open, high, low, close, avg, change, changePercent, aiAvg, aesoAvg, negativeHours, volatility, volume };
  }, [chartData, data]);

  // Determine trading zone
  const getTradingZone = () => {
    if (stats.high === stats.low) return null;
    const position = (currentPrice - stats.low) / (stats.high - stats.low);
    if (position <= 0.25) return { type: 'buy', label: 'BUY ZONE', color: 'bg-emerald-500' };
    if (position >= 0.75) return { type: 'sell', label: 'SELL ZONE', color: 'bg-red-500' };
    return null;
  };

  const tradingZone = getTradingZone();

  // Get next hour predictions
  const nextHourPredictions = useMemo(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    
    const aesoForecast = chartData.find(d => 
      d.aesoForecast !== undefined && 
      Math.abs(new Date(d.timestamp).getTime() - nextHour.getTime()) < 30 * 60 * 1000
    )?.aesoForecast;
    
    const aiPrediction = chartData.find(d => 
      d.aiPrediction !== undefined && 
      Math.abs(new Date(d.timestamp).getTime() - nextHour.getTime()) < 30 * 60 * 1000
    );
    
    return {
      aesoForecast,
      aiPrediction: aiPrediction?.aiPrediction,
      aiConfidence: 0.85
    };
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
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-2">
          {format(labelDate, 'MMM d, yyyy HH:mm')}
        </p>
        {payload.map((entry: any, index: number) => {
          if (entry.value === undefined || entry.value === null) return null;
          
          let label = '';
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
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">{label}:</span>
              <span className="text-sm font-semibold text-foreground">${entry.value.toFixed(2)}</span>
            </div>
          );
        })}
        <div className="mt-2 pt-2 border-t border-border">
          <Badge variant={isPast ? 'default' : 'secondary'} className="text-[10px]">
            {isPast ? 'Historical' : 'Forecast'}
          </Badge>
        </div>
      </div>
    );
  };

  const nowTimestamp = new Date().toISOString();

  const handleZoomIn = () => {
    if (!brushDomain) {
      const len = chartData.length;
      setBrushDomain([Math.floor(len * 0.25), Math.floor(len * 0.75)]);
    } else {
      const [start, end] = brushDomain;
      const range = end - start;
      const newRange = Math.max(10, Math.floor(range * 0.5));
      const center = Math.floor((start + end) / 2);
      setBrushDomain([Math.max(0, center - newRange / 2), Math.min(chartData.length - 1, center + newRange / 2)]);
    }
  };

  const handleZoomOut = () => {
    if (brushDomain) {
      const [start, end] = brushDomain;
      const range = end - start;
      const newRange = Math.min(chartData.length, range * 2);
      const center = Math.floor((start + end) / 2);
      const newStart = Math.max(0, center - newRange / 2);
      const newEnd = Math.min(chartData.length - 1, center + newRange / 2);
      if (newStart === 0 && newEnd === chartData.length - 1) {
        setBrushDomain(null);
      } else {
        setBrushDomain([newStart, newEnd]);
      }
    }
  };

  const handleReset = () => {
    setBrushDomain(null);
    setTimeRange('24H');
  };

  return (
    <Card className="border-border overflow-hidden bg-card shadow-sm">
      {/* Sticky Ticker Tape */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <TickerTape
          currentPrice={currentPrice}
          changePercent={stats.changePercent}
          high={stats.high}
          low={stats.low}
          average={stats.avg}
          aiPrediction={nextHourPredictions.aiPrediction}
          aesoForecast={nextHourPredictions.aesoForecast}
          negativeHours={stats.negativeHours}
          volume={stats.volume}
          volatility={stats.volatility}
        />
      </div>

      {/* Compact Header Bar with Controls */}
      <div className="px-3 py-2 border-b border-border flex flex-wrap items-center justify-between gap-2 bg-muted/30">
        {/* Title & Live Indicator */}
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">AESO Pool Price</span>
          <div className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-medium text-emerald-600">LIVE</span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-background rounded-md p-0.5 border border-border">
          {(['1H', '4H', '24H', '48H', '72H', '1W'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={`px-2 py-0.5 h-6 text-[10px] font-medium ${
                timeRange === range 
                  ? '' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Zoom & Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-6 w-6 p-0">
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-6 w-6 p-0">
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 w-6 p-0">
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-0.5 bg-primary rounded" />
              <span className="text-muted-foreground">Actual</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-0.5 bg-blue-500 rounded" />
              <span className="text-muted-foreground">AESO</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-0.5 bg-emerald-500 rounded" />
              <span className="text-muted-foreground">AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Trading Dashboard - Grid Layout */}
      <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Price & OHLC (takes 2 cols on lg) */}
        <div className="lg:col-span-2 space-y-2">
          {/* Price Row with Trading Zone */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-baseline gap-3">
              <motion.span 
                className="text-3xl font-bold text-foreground tabular-nums"
                key={currentPrice}
                initial={{ scale: 1.02, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                ${currentPrice.toFixed(2)}
              </motion.span>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? 'text-red-500' : 'text-emerald-500'
              }`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? '+' : ''}{stats.changePercent.toFixed(2)}%
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ({isPositive ? '+' : ''}${stats.change.toFixed(2)})
              </span>
            </div>
            {tradingZone && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${tradingZone.color}`}
              >
                {tradingZone.label}
              </motion.div>
            )}
          </div>

          {/* OHLC + Stats Row */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            <div className="text-center p-1.5 rounded bg-muted/50 border border-border">
              <p className="text-[9px] text-muted-foreground uppercase">Open</p>
              <p className="text-xs font-bold text-foreground">${stats.open.toFixed(2)}</p>
            </div>
            <div className="text-center p-1.5 rounded bg-muted/50 border border-border">
              <p className="text-[9px] text-muted-foreground uppercase">High</p>
              <p className="text-xs font-bold text-red-500">${stats.high.toFixed(2)}</p>
            </div>
            <div className="text-center p-1.5 rounded bg-muted/50 border border-border">
              <p className="text-[9px] text-muted-foreground uppercase">Low</p>
              <p className="text-xs font-bold text-emerald-500">${stats.low.toFixed(2)}</p>
            </div>
            <div className="text-center p-1.5 rounded bg-muted/50 border border-border">
              <p className="text-[9px] text-muted-foreground uppercase">Close</p>
              <p className="text-xs font-bold text-foreground">${stats.close.toFixed(2)}</p>
            </div>
            <div className="text-center p-1.5 rounded bg-muted/50 border border-border hidden sm:block">
              <p className="text-[9px] text-muted-foreground uppercase">VWAP</p>
              <p className="text-xs font-bold text-foreground">${stats.avg.toFixed(2)}</p>
            </div>
            <div className="text-center p-1.5 rounded bg-muted/50 border border-border hidden sm:block">
              <p className="text-[9px] text-muted-foreground uppercase">Volatility</p>
              <p className={`text-xs font-bold ${stats.volatility > 20 ? 'text-amber-500' : 'text-foreground'}`}>
                {stats.volatility.toFixed(1)}%
              </p>
            </div>
            {stats.negativeHours > 0 && (
              <div className="text-center p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 hidden sm:block">
                <p className="text-[9px] text-emerald-600 uppercase">Negative</p>
                <p className="text-xs font-bold text-emerald-600">{stats.negativeHours}h</p>
              </div>
            )}
            {stats.aiAvg > 0 && (
              <div className="text-center p-1.5 rounded bg-emerald-500/5 border border-emerald-500/20 hidden sm:block">
                <p className="text-[9px] text-emerald-600 uppercase">AI Avg</p>
                <p className="text-xs font-bold text-emerald-600">${stats.aiAvg.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Price Level Bar */}
          <div className="p-2 rounded bg-muted/30 border border-border">
            <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
              <span>${stats.low.toFixed(0)}</span>
              <span className="font-medium">Range Position</span>
              <span>${stats.high.toFixed(0)}</span>
            </div>
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-40" 
                style={{ width: '100%' }}
              />
              <motion.div 
                className="absolute w-2.5 h-2.5 -top-0.5 bg-foreground rounded-full shadow ring-1 ring-background"
                style={{
                  left: `calc(${Math.max(0, Math.min(100, ((currentPrice - stats.low) / (stats.high - stats.low || 1)) * 100))}% - 5px)`
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </div>

        {/* Right: Next Hour Preview */}
        <div className="lg:col-span-1">
          <NextHourPreview
            aesoForecast={nextHourPredictions.aesoForecast}
            aiPrediction={nextHourPredictions.aiPrediction}
            aiConfidence={nextHourPredictions.aiConfidence}
            currentPrice={currentPrice}
            loading={loading}
            aiLoading={aiLoading}
          />
        </div>
      </div>

      {/* Chart */}
      <CardContent className="pt-0 px-2 sm:px-4 pb-3">
        {loading ? (
          <div className="h-[320px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Activity className="w-6 h-6 animate-pulse text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Activity className="w-6 h-6 mx-auto text-muted-foreground" />
              <p className="text-xs text-muted-foreground">No price data available</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart 
              ref={chartRef}
              data={chartData} 
              margin={{ top: 5, right: 5, left: 0, bottom: 35 }}
            >
              <defs>
                <linearGradient id="actualGradientTV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aiConfidenceGradientTV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis}
                stroke="hsl(var(--muted-foreground))"
                fontSize={9}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={9}
                tickFormatter={(v) => `$${v}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <ReferenceLine 
                x={nowTimestamp} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ 
                  value: 'NOW', 
                  position: 'top', 
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 9,
                  fontWeight: 700
                }}
              />
              
              <Area 
                type="monotone" 
                dataKey="aiUpper" 
                stroke="none"
                fill="url(#aiConfidenceGradientTV)"
                fillOpacity={1}
              />
              <Area 
                type="monotone" 
                dataKey="aiLower" 
                stroke="none"
                fill="transparent"
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="none"
                fill="url(#actualGradientTV)"
                fillOpacity={1}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="aesoForecast" 
                stroke="#3b82f6" 
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 3, fill: '#3b82f6', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="aiPrediction" 
                stroke="#10b981" 
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                activeDot={{ r: 3, fill: '#10b981', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                connectNulls={false}
              />
              <Brush 
                dataKey="timestamp" 
                height={25} 
                stroke="hsl(var(--primary))"
                fill="hsl(var(--muted))"
                tickFormatter={formatXAxis}
                startIndex={brushDomain ? brushDomain[0] : undefined}
                endIndex={brushDomain ? brushDomain[1] : undefined}
                onChange={(e) => {
                  if (e.startIndex !== undefined && e.endIndex !== undefined) {
                    setBrushDomain([e.startIndex, e.endIndex]);
                  }
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Compact Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Live • Updates every minute</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Brain className="w-3 h-3" />
            <span>{aiPredictions?.length || 0} AI predictions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
