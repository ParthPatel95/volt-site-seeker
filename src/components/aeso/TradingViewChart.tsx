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
  BarChart3
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

type TimeRange = '24H' | '48H' | '72H' | '1W';

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

  // Calculate statistics
  const stats = useMemo(() => {
    const actualPrices = chartData.filter(d => d.actual !== undefined).map(d => d.actual);
    const aiPredPrices = chartData.filter(d => d.aiPrediction !== undefined).map(d => d.aiPrediction);
    const aesoForecasts = chartData.filter(d => d.aesoForecast !== undefined).map(d => d.aesoForecast);
    
    if (actualPrices.length === 0) {
      return { high: 0, low: 0, avg: 0, change: 0, changePercent: 0, aiAvg: 0, aesoAvg: 0, negativeHours: 0 };
    }
    
    const high = Math.max(...actualPrices);
    const low = Math.min(...actualPrices);
    const avg = actualPrices.reduce((a, b) => a + b, 0) / actualPrices.length;
    const firstPrice = actualPrices[0];
    const lastPrice = actualPrices[actualPrices.length - 1];
    const change = lastPrice - firstPrice;
    const changePercent = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;
    const aiAvg = aiPredPrices.length > 0 
      ? aiPredPrices.reduce((a, b) => a + b, 0) / aiPredPrices.length 
      : 0;
    const aesoAvg = aesoForecasts.length > 0
      ? aesoForecasts.reduce((a, b) => a + b, 0) / aesoForecasts.length
      : 0;
    const negativeHours = actualPrices.filter(p => p < 0).length;
    
    return { high, low, avg, change, changePercent, aiAvg, aesoAvg, negativeHours };
  }, [chartData]);

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
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-2">
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
              <span className="text-xs text-slate-400">{label}:</span>
              <span className="text-sm font-semibold text-white">${entry.value.toFixed(2)}</span>
            </div>
          );
        })}
        <div className="mt-2 pt-2 border-t border-slate-700">
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
    <Card className="border-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Ticker Tape */}
      <TickerTape
        currentPrice={currentPrice}
        changePercent={stats.changePercent}
        high={stats.high}
        low={stats.low}
        average={stats.avg}
        aiPrediction={nextHourPredictions.aiPrediction}
        aesoForecast={nextHourPredictions.aesoForecast}
        negativeHours={stats.negativeHours}
      />

      <CardHeader className="pb-2 pt-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Current Price Panel */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white">AESO Pool Price</CardTitle>
                <p className="text-xs text-slate-400">
                  Live • {timeRange} Historical + Forecast
                </p>
              </div>
            </div>

            {/* Current Price Display */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <motion.div 
                    className="text-4xl font-bold text-white"
                    key={currentPrice}
                    initial={{ scale: 1.05, color: isPositive ? '#22c55e' : '#ef4444' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    transition={{ duration: 0.5 }}
                  >
                    ${currentPrice.toFixed(2)}
                  </motion.div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                      isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span className="text-sm font-semibold">
                        {isPositive ? '+' : ''}{stats.changePercent.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {isPositive ? '+' : ''}${stats.change.toFixed(2)} CAD/MWh
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs text-emerald-400">Live</span>
                </div>
              </div>

              {/* Price Level Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>${stats.low.toFixed(0)}</span>
                  <span>Price Range ({timeRange})</span>
                  <span>${stats.high.toFixed(0)}</span>
                </div>
                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 opacity-30" 
                    style={{ width: '100%' }}
                  />
                  <motion.div 
                    className="absolute w-3 h-3 -top-0.5 bg-white rounded-full shadow-lg border-2 border-primary"
                    style={{
                      left: `calc(${((currentPrice - stats.low) / (stats.high - stats.low || 1)) * 100}% - 6px)`
                    }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Next Hour Preview */}
          <div className="lg:w-80">
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

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
            {(['24H', '48H', '72H', '1W'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1 h-8 text-sm font-medium ${
                  timeRange === range 
                    ? '' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {range}
              </Button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomIn}
              className="h-8 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomOut}
              className="h-8 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              className="h-8 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-primary rounded" />
              <span className="text-slate-400">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-blue-500 rounded" style={{ borderStyle: 'dashed' }} />
              <Building2 className="w-3 h-3 text-blue-500" />
              <span className="text-slate-400">AESO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-emerald-500 rounded" style={{ borderStyle: 'dashed' }} />
              <Brain className="w-3 h-3 text-emerald-500" />
              <span className="text-slate-400">AI</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-4">
          <div className="text-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">High</p>
            <p className="text-sm font-bold text-red-400">${stats.high.toFixed(2)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Low</p>
            <p className={`text-sm font-bold ${stats.low < 0 ? 'text-emerald-400' : 'text-green-400'}`}>
              ${stats.low.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Net Avg</p>
            <p className="text-sm font-bold text-white">${stats.avg.toFixed(2)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Change</p>
            <p className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}${stats.change.toFixed(2)}
            </p>
          </div>
          {stats.negativeHours > 0 && (
            <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-[10px] text-emerald-500 uppercase tracking-wider">Negative</p>
              <p className="text-sm font-bold text-emerald-400">{stats.negativeHours}h</p>
            </div>
          )}
          {stats.aiAvg > 0 && (
            <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-[10px] text-blue-500 uppercase tracking-wider">AI Avg</p>
              <p className="text-sm font-bold text-blue-400">${stats.aiAvg.toFixed(2)}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2 px-2 sm:px-6">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Activity className="w-8 h-8 animate-pulse text-slate-500" />
              <p className="text-sm text-slate-500">Loading chart data...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center space-y-2">
              <Activity className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm text-slate-500">No price data available</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              ref={chartRef}
              data={chartData} 
              margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
            >
              <defs>
                <linearGradient id="actualGradientTV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aiConfidenceGradientTV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 25%)" opacity={0.5} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis}
                stroke="hsl(220 13% 45%)"
                fontSize={10}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="hsl(220 13% 45%)"
                fontSize={10}
                tickFormatter={(v) => `$${v}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* "Now" reference line */}
              <ReferenceLine 
                x={nowTimestamp} 
                stroke="hsl(220 13% 55%)" 
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ 
                  value: 'NOW', 
                  position: 'top', 
                  fill: 'hsl(220 13% 65%)',
                  fontSize: 10,
                  fontWeight: 700
                }}
              />
              
              {/* AI Confidence band */}
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

              {/* Actual prices area fill */}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="none"
                fill="url(#actualGradientTV)"
                fillOpacity={1}
              />
              
              {/* Actual prices line */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: '#fff', strokeWidth: 2 }}
                connectNulls={false}
              />
              
              {/* AESO Forecast line */}
              <Line 
                type="monotone" 
                dataKey="aesoForecast" 
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                connectNulls={false}
              />
              
              {/* AI Prediction line */}
              <Line 
                type="monotone" 
                dataKey="aiPrediction" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
                activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                connectNulls={false}
              />

              {/* Brush for zoom/pan */}
              <Brush 
                dataKey="timestamp" 
                height={30} 
                stroke="hsl(var(--primary))"
                fill="hsl(220 13% 15%)"
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

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live • Updates every minute</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Brain className="w-3 h-3" />
            <span>{aiPredictions?.length || 0} AI predictions loaded</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
