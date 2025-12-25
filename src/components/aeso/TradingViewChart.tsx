import React, { useState, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area
} from 'recharts';
import { 
  Activity, 
  Brain
} from 'lucide-react';
import { format, subHours, addHours, parseISO, isAfter, isBefore } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Import modular chart components
import { ChartToolbar } from './chart/ChartToolbar';
import { ChartDrawingTools } from './chart/ChartDrawingTools';
import { ChartSidebar } from './chart/ChartSidebar';
import { VolumeChart } from './chart/VolumeChart';
import { OHLCHeader } from './chart/OHLCHeader';
import { PriceActionBar } from './chart/PriceActionBar';
import { TimeRangeSelector } from './chart/TimeRangeSelector';
import { FloatingPriceBadge } from './chart/FloatingPriceBadge';

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
  onGeneratePredictions?: () => void;
}

type TimeRange = '1H' | '4H' | '24H' | '48H' | '72H' | '1W';

export function TradingViewChart({ 
  data, 
  currentPrice, 
  loading, 
  aiLoading = false,
  aiPredictions = [],
  onRefresh,
  onGeneratePredictions
}: TradingViewChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [activeTool, setActiveTool] = useState('crosshair');
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
            existingPoint.volume = d.ail_mw;
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
            volume: isPast ? d.ail_mw : undefined,
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

  // Get next hour predictions with actual confidence from prediction data
  const nextHourPredictions = useMemo(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    
    const aesoForecast = chartData.find(d => 
      d.aesoForecast !== undefined && 
      Math.abs(new Date(d.timestamp).getTime() - nextHour.getTime()) < 30 * 60 * 1000
    )?.aesoForecast;
    
    const aiPredictionPoint = chartData.find(d => 
      d.aiPrediction !== undefined && 
      Math.abs(new Date(d.timestamp).getTime() - nextHour.getTime()) < 30 * 60 * 1000
    );
    
    // Find matching prediction for confidence score
    const matchingPred = aiPredictions.find(p => 
      Math.abs(new Date(p.timestamp).getTime() - nextHour.getTime()) < 30 * 60 * 1000
    );
    
    return {
      aesoForecast,
      aiPrediction: aiPredictionPoint?.aiPrediction,
      aiConfidence: matchingPred?.confidenceScore ?? 0.85
    };
  }, [chartData, aiPredictions]);

  // Volume data for volume chart
  const volumeData = useMemo(() => {
    let prevPrice = 0;
    return chartData
      .filter(d => d.volume !== undefined && d.volume > 0)
      .map(d => {
        const priceUp = d.actual !== undefined ? d.actual > prevPrice : undefined;
        if (d.actual !== undefined) prevPrice = d.actual;
        return {
          timestamp: d.timestamp,
          volume: d.volume,
          priceUp
        };
      });
  }, [chartData]);

  const isPositive = stats.change >= 0;
  const nowTimestamp = new Date().toISOString();

  // Calculate floating price badge position
  const priceRange = stats.high - stats.low;
  const pricePosition = priceRange > 0 
    ? ((stats.high - currentPrice) / priceRange) * 100 
    : 50;

  const formatXAxis = (value: string) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      return format(date, 'HH:mm');
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
          
          let entryLabel = '';
          switch (entry.dataKey) {
            case 'actual':
              entryLabel = 'Actual Price';
              break;
            case 'aesoForecast':
              entryLabel = 'AESO Forecast';
              break;
            case 'aiPrediction':
              entryLabel = 'AI Prediction';
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
              <span className="text-xs text-muted-foreground">{entryLabel}:</span>
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

  return (
    <Card className="border-border overflow-hidden bg-card shadow-sm">
      {/* 1. Top Toolbar */}
      <ChartToolbar
        symbol="AESO/CAD"
        timeInterval={timeRange}
        onTimeIntervalChange={(interval) => setTimeRange(interval as TimeRange)}
      />

      {/* 2. OHLC Header - Inline like TradingView */}
      <OHLCHeader
        open={stats.open}
        high={stats.high}
        low={stats.low}
        close={stats.close}
        change={stats.change}
        changePercent={stats.changePercent}
        currentPrice={currentPrice}
      />

      {/* 3. Price Action Bar - SELL/BUY Buttons */}
      <PriceActionBar
        currentPrice={currentPrice}
        high={stats.high}
        low={stats.low}
        volume={stats.volume}
      />

      {/* 4. Main Content Area - Drawing Tools + Chart + Sidebar */}
      <div className="flex">
        {/* Left: Drawing Tools */}
        <div className="hidden lg:block">
          <ChartDrawingTools
            activeTool={activeTool}
            onToolChange={setActiveTool}
          />
        </div>

        {/* Center: Chart Area */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="h-[380px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Activity className="w-6 h-6 animate-pulse text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[380px] flex items-center justify-center">
              <div className="text-center space-y-2">
                <Activity className="w-6 h-6 mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground">No price data available</p>
              </div>
            </div>
          ) : (
            <>
              {/* Floating Price Badge */}
              <FloatingPriceBadge
                price={currentPrice}
                yPosition={pricePosition}
                isUp={isPositive}
              />

              {/* Main Chart */}
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart 
                  ref={chartRef}
                  data={chartData} 
                  margin={{ top: 10, right: 60, left: 0, bottom: 5 }}
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
                    orientation="right"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* NOW Reference Line */}
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
                  
                  {/* AI Confidence Band */}
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

                  {/* Actual Price Area */}
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="none"
                    fill="url(#actualGradientTV)"
                    fillOpacity={1}
                  />

                  {/* Actual Price Line */}
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                    connectNulls={false}
                  />

                  {/* AESO Forecast Line */}
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

                  {/* AI Prediction Line */}
                  <Line 
                    type="monotone" 
                    dataKey="aiPrediction" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                    activeDot={{ r: 3, fill: '#10b981', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>

              {/* Volume Chart Below Main Chart */}
              <VolumeChart data={volumeData} nowTimestamp={nowTimestamp} />
            </>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="hidden lg:block w-56">
          <ChartSidebar
            currentPrice={currentPrice}
            stats={stats}
            aesoForecast={nextHourPredictions.aesoForecast}
            aiPrediction={nextHourPredictions.aiPrediction}
            aiConfidence={nextHourPredictions.aiConfidence}
            loading={loading}
            aiLoading={aiLoading}
            onGeneratePredictions={onGeneratePredictions}
          />
        </div>
      </div>

      {/* 5. Bottom Time Range Selector */}
      <TimeRangeSelector
        activeRange={timeRange}
        onRangeChange={setTimeRange}
        aiPredictionCount={aiPredictions?.length || 0}
      />

      {/* Mobile Stats Bar - Key metrics for smaller screens */}
      <div className="lg:hidden px-3 py-2 border-t border-border grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground">High</p>
          <p className="text-xs font-bold text-red-500">${stats.high.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Low</p>
          <p className="text-xs font-bold text-emerald-500">${stats.low.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">AI Pred</p>
          <p className="text-xs font-bold text-emerald-600">
            {aiLoading ? '...' : nextHourPredictions.aiPrediction ? `$${nextHourPredictions.aiPrediction.toFixed(0)}` : '--'}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Vol</p>
          <p className="text-xs font-bold text-foreground">{stats.volatility.toFixed(0)}%</p>
        </div>
      </div>
      
      {/* Chart Legend - Mobile */}
      <div className="lg:hidden px-3 py-2 border-t border-border flex items-center justify-center gap-4 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-primary rounded" />
          <span className="text-muted-foreground">Actual</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-blue-500 rounded" style={{ borderStyle: 'dashed' }} />
          <span className="text-muted-foreground">AESO</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-emerald-500 rounded" />
          <Brain className="w-3 h-3 text-emerald-500" />
          <span className="text-muted-foreground">AI</span>
        </div>
      </div>
    </Card>
  );
}
