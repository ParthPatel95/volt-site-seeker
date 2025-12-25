import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  ComposedChart, 
  Line, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Cell
} from 'recharts';
import { 
  Activity, 
  Brain,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bell,
  Maximize2,
  Minimize2,
  RefreshCw,
  Loader2,
  ChevronDown,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { format, subHours, addHours, parseISO, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import { usePriceAlerts, PriceAlert } from '@/hooks/usePriceAlerts';
import { cn } from '@/lib/utils';

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

type TimeRange = '1D' | '5D' | '1M' | '3M';

// Indicator definitions
const AVAILABLE_INDICATORS = [
  { id: 'sma20', name: 'SMA (20)', color: '#f59e0b', period: 20, type: 'sma' },
  { id: 'sma50', name: 'SMA (50)', color: '#8b5cf6', period: 50, type: 'sma' },
  { id: 'ema12', name: 'EMA (12)', color: '#ec4899', period: 12, type: 'ema' },
  { id: 'ema26', name: 'EMA (26)', color: '#06b6d4', period: 26, type: 'ema' },
  { id: 'bollinger', name: 'Bollinger Bands', color: '#6366f1', period: 20, type: 'bollinger' },
];

const TIME_INTERVALS = [
  { value: '1H', label: '1H' },
  { value: '4H', label: '4H' },
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
];

const TIME_RANGES = [
  { value: '1D', label: '1D', hours: 24 },
  { value: '5D', label: '5D', hours: 120 },
  { value: '1M', label: '1M', hours: 720 },
  { value: '3M', label: '3M', hours: 2160 },
];

// Calculate SMA
function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// Calculate EMA
function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  let ema: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // First EMA is SMA
      const slice = data.slice(0, period);
      ema = slice.reduce((a, b) => a + b, 0) / period;
      result.push(ema);
    } else {
      ema = (data[i] - (ema as number)) * multiplier + (ema as number);
      result.push(ema);
    }
  }
  return result;
}

// Calculate Bollinger Bands
function calculateBollingerBands(data: number[], period: number = 20, stdDev: number = 2): { upper: (number | null)[], middle: (number | null)[], lower: (number | null)[] } {
  const sma = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i] as number;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
  }

  return { upper, middle: sma, lower };
}

export function TradingViewChart({ 
  data, 
  currentPrice, 
  loading, 
  aiLoading = false,
  aiPredictions = [],
  onRefresh,
  onGeneratePredictions
}: TradingViewChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [interval, setInterval] = useState('1H');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(() => {
    const saved = localStorage.getItem('chart-indicators');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [newAlertThreshold, setNewAlertThreshold] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Use price alerts hook
  const { 
    alerts, 
    loading: alertsLoading, 
    createAlert, 
    deleteAlert,
    createQuickAlert 
  } = usePriceAlerts();

  // Persist indicator selection
  useEffect(() => {
    localStorage.setItem('chart-indicators', JSON.stringify(selectedIndicators));
  }, [selectedIndicators]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await chartContainerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
      toast.error('Fullscreen not supported');
    }
  };

  const toggleIndicator = (indicatorId: string) => {
    setSelectedIndicators(prev => 
      prev.includes(indicatorId) 
        ? prev.filter(id => id !== indicatorId)
        : [...prev, indicatorId]
    );
  };

  // Get hours based on time range
  const getHoursBack = () => {
    const range = TIME_RANGES.find(r => r.value === timeRange);
    return range?.hours || 24;
  };

  // Process data for chart
  const chartData = useMemo(() => {
    const now = new Date();
    const hoursBack = getHoursBack();
    const cutoffPast = subHours(now, hoursBack);
    const cutoffFuture = addHours(now, Math.min(hoursBack, 72));
    
    const chartPoints: any[] = [];
    
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

  // Calculate indicators
  const indicatorData = useMemo(() => {
    const actualPrices = chartData.map(d => d.actual).filter(p => p !== undefined) as number[];
    if (actualPrices.length < 5) return {};

    const indicators: Record<string, (number | null)[]> = {};

    selectedIndicators.forEach(indId => {
      const ind = AVAILABLE_INDICATORS.find(i => i.id === indId);
      if (!ind) return;

      if (ind.type === 'sma') {
        indicators[indId] = calculateSMA(actualPrices, ind.period);
      } else if (ind.type === 'ema') {
        indicators[indId] = calculateEMA(actualPrices, ind.period);
      } else if (ind.type === 'bollinger') {
        const bb = calculateBollingerBands(actualPrices, ind.period);
        indicators['bb_upper'] = bb.upper;
        indicators['bb_middle'] = bb.middle;
        indicators['bb_lower'] = bb.lower;
      }
    });

    return indicators;
  }, [chartData, selectedIndicators]);

  // Add indicators to chart data
  const chartDataWithIndicators = useMemo(() => {
    const actualDataPoints = chartData.filter(d => d.actual !== undefined);
    
    return chartData.map((point, idx) => {
      const actualIdx = actualDataPoints.findIndex(p => p.timestamp === point.timestamp);
      if (actualIdx === -1) return point;

      const enhanced = { ...point };
      Object.entries(indicatorData).forEach(([key, values]) => {
        if (values[actualIdx] !== null && values[actualIdx] !== undefined) {
          enhanced[key] = values[actualIdx];
        }
      });
      return enhanced;
    });
  }, [chartData, indicatorData]);

  // Calculate OHLC and statistics
  const stats = useMemo(() => {
    const actualPrices = chartData.filter(d => d.actual !== undefined).map(d => d.actual);
    const volumes = chartData.filter(d => d.volume !== undefined && d.volume > 0).map(d => d.volume);
    
    if (actualPrices.length === 0) {
      return { open: 0, high: 0, low: 0, close: 0, change: 0, changePercent: 0, volume: 0 };
    }
    
    const open = actualPrices[0];
    const high = Math.max(...actualPrices);
    const low = Math.min(...actualPrices);
    const close = actualPrices[actualPrices.length - 1];
    const change = close - open;
    const changePercent = open !== 0 ? (change / open) * 100 : 0;
    const volume = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
    
    return { open, high, low, close, change, changePercent, volume };
  }, [chartData]);

  // Get next hour AI prediction
  const nextHourPrediction = useMemo(() => {
    if (!aiPredictions || aiPredictions.length === 0) return null;
    
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
    
    return aiPredictions.find(p => 
      Math.abs(new Date(p.timestamp).getTime() - nextHour.getTime()) < 30 * 60 * 1000
    );
  }, [aiPredictions]);

  // Volume data with color based on price movement
  const volumeData = useMemo(() => {
    let prevPrice = 0;
    return chartData
      .filter(d => d.volume !== undefined && d.volume > 0)
      .map(d => {
        const priceUp = d.actual !== undefined ? d.actual >= prevPrice : true;
        if (d.actual !== undefined) prevPrice = d.actual;
        return { ...d, priceUp };
      });
  }, [chartData]);

  const activeAlerts = alerts.filter(a => a.is_active);
  const isPositive = stats.change >= 0;
  const nowTimestamp = new Date().toISOString();

  const formatXAxis = (value: string) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '';
      return format(date, timeRange === '1D' ? 'HH:mm' : 'MM/dd HH:mm');
    } catch {
      return '';
    }
  };

  const handleCreateAlert = async () => {
    const threshold = parseFloat(newAlertThreshold);
    if (isNaN(threshold) || threshold <= 0) {
      toast.error('Please enter a valid threshold value');
      return;
    }

    try {
      await createAlert({
        alert_type: 'price_threshold',
        threshold_value: threshold,
        condition: newAlertCondition,
        is_active: true,
        notification_method: 'app'
      });
      setShowAlertDialog(false);
      setNewAlertThreshold('');
      toast.success(`Alert created: ${newAlertCondition} $${threshold}`);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleQuickAlert = async (type: 'high' | 'low') => {
    const threshold = type === 'high' ? Math.ceil(currentPrice * 1.1) : Math.floor(currentPrice * 0.9);
    try {
      await createQuickAlert(type, threshold);
      toast.success(`Quick alert created: ${type === 'high' ? 'above' : 'below'} $${threshold}`);
    } catch (err) {
      // Error handled in hook
    }
  };

  // Custom Tooltip
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
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl min-w-[180px]">
        <p className="text-xs font-medium text-muted-foreground mb-2 border-b border-border pb-2">
          {format(labelDate, 'MMM d, yyyy HH:mm')}
        </p>
        {payload.map((entry: any, index: number) => {
          if (entry.value === undefined || entry.value === null) return null;
          
          let entryLabel = '';
          let icon = null;
          switch (entry.dataKey) {
            case 'actual':
              entryLabel = 'Actual';
              break;
            case 'aesoForecast':
              entryLabel = 'AESO Forecast';
              break;
            case 'aiPrediction':
              entryLabel = 'AI Prediction';
              icon = <Brain className="w-3 h-3 text-emerald-500" />;
              break;
            case 'sma20':
              entryLabel = 'SMA(20)';
              break;
            case 'sma50':
              entryLabel = 'SMA(50)';
              break;
            case 'ema12':
              entryLabel = 'EMA(12)';
              break;
            case 'ema26':
              entryLabel = 'EMA(26)';
              break;
            case 'bb_upper':
              entryLabel = 'BB Upper';
              break;
            case 'bb_middle':
              entryLabel = 'BB Middle';
              break;
            case 'bb_lower':
              entryLabel = 'BB Lower';
              break;
            default:
              return null;
          }
          
          return (
            <div key={index} className="flex items-center justify-between gap-3 py-0.5">
              <div className="flex items-center gap-1.5">
                {icon}
                <span className="text-xs text-muted-foreground">{entryLabel}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: entry.color }}>${entry.value.toFixed(2)}</span>
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

  const chartHeight = isFullscreen ? 'calc(100vh - 200px)' : 280;

  return (
    <Card 
      ref={chartContainerRef}
      className={cn(
        "border-border overflow-hidden bg-card shadow-lg",
        isFullscreen && "fixed inset-0 z-50 rounded-none flex flex-col"
      )}
    >
      {/* ===== TOP TOOLBAR ===== */}
      <div className="flex items-center justify-between h-11 px-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {/* Symbol */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-background border border-border">
            <Activity className="w-4 h-4 text-red-500" />
            <span className="font-bold text-sm">AESO/CAD</span>
          </div>
          
          {/* Time Interval Dropdown */}
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-16 h-7 text-xs border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_INTERVALS.map(int => (
                <SelectItem key={int.value} value={int.value} className="text-xs">
                  {int.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden sm:flex items-center gap-1">
            {/* Indicators Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <BarChart3 className="w-3.5 h-3.5 mr-1" />
                  Indicators
                  {selectedIndicators.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                      {selectedIndicators.length}
                    </Badge>
                  )}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Technical Indicators</p>
                  <div className="space-y-2">
                    {AVAILABLE_INDICATORS.map(ind => (
                      <div key={ind.id} className="flex items-center gap-2">
                        <Checkbox 
                          id={ind.id}
                          checked={selectedIndicators.includes(ind.id)}
                          onCheckedChange={() => toggleIndicator(ind.id)}
                        />
                        <div 
                          className="w-3 h-0.5 rounded" 
                          style={{ backgroundColor: ind.color }}
                        />
                        <Label htmlFor={ind.id} className="text-xs cursor-pointer flex-1">
                          {ind.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedIndicators.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full h-7 text-xs"
                      onClick={() => setSelectedIndicators([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Alerts Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => setShowAlertDialog(true)}
            >
              <Bell className="w-3.5 h-3.5 mr-1" />
              Alerts
              {activeAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                  {activeAlerts.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/50 text-[10px] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            LIVE
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRefresh}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ===== INLINE OHLC + SELL/BUY HEADER ===== */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 border-b border-border bg-card text-xs">
        {/* OHLC Values */}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">
            O <span className="font-mono font-semibold text-foreground">${stats.open.toFixed(2)}</span>
          </span>
          <span className="text-muted-foreground">
            H <span className="font-mono font-semibold text-red-500">${stats.high.toFixed(2)}</span>
          </span>
          <span className="text-muted-foreground">
            L <span className="font-mono font-semibold text-emerald-500">${stats.low.toFixed(2)}</span>
          </span>
          <span className="text-muted-foreground">
            C <span className="font-mono font-semibold text-foreground">${stats.close.toFixed(2)}</span>
          </span>
        </div>

        {/* Change */}
        <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{isPositive ? '+' : ''}${stats.change.toFixed(2)}</span>
          <span className="text-[10px]">({isPositive ? '+' : ''}{stats.changePercent.toFixed(2)}%)</span>
        </div>

        <div className="hidden sm:block h-4 w-px bg-border" />

        {/* SELL / BUY Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 px-2 text-xs border-red-500/50 text-red-500 hover:bg-red-500/10"
            onClick={() => toast.info('Sell signal recorded')}
          >
            ${stats.low.toFixed(2)} SELL
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 px-2 text-xs border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
            onClick={() => toast.info('Buy signal recorded')}
          >
            ${currentPrice.toFixed(2)} BUY
          </Button>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-1 text-muted-foreground">
          <span>Vol</span>
          <span className="font-mono font-semibold text-foreground">{(stats.volume / 1000).toFixed(1)}K MW</span>
        </div>
      </div>

      {/* ===== MAIN CHART AREA ===== */}
      <div className={cn("flex", isFullscreen && "flex-1")}>
        {/* Chart Container */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="h-[360px] flex items-center justify-center bg-muted/10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[360px] flex items-center justify-center bg-muted/10">
              <div className="text-center space-y-2">
                <Activity className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No price data available</p>
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Main Price Chart */}
              <ResponsiveContainer width="100%" height={chartHeight}>
                <ComposedChart 
                  data={chartDataWithIndicators} 
                  margin={{ top: 10, right: 60, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aiConfidenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxis}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
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
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Alert Threshold Lines */}
                  {activeAlerts.map(alert => (
                    <ReferenceLine 
                      key={alert.id}
                      y={alert.threshold_value}
                      stroke={alert.condition === 'above' ? '#ef4444' : '#10b981'}
                      strokeDasharray="8 4"
                      strokeWidth={1.5}
                      label={{
                        value: `$${alert.threshold_value} (${alert.condition})`,
                        position: 'left',
                        fill: alert.condition === 'above' ? '#ef4444' : '#10b981',
                        fontSize: 9
                      }}
                    />
                  ))}
                  
                  {/* NOW Reference Line */}
                  <ReferenceLine 
                    x={nowTimestamp} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                  
                  {/* Bollinger Bands */}
                  {selectedIndicators.includes('bollinger') && (
                    <>
                      <Area 
                        type="monotone" 
                        dataKey="bb_upper" 
                        stroke="none"
                        fill="url(#bollingerGradient)"
                        fillOpacity={1}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bb_upper" 
                        stroke="#6366f1" 
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        dot={false}
                        connectNulls={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bb_middle" 
                        stroke="#6366f1" 
                        strokeWidth={1}
                        dot={false}
                        connectNulls={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bb_lower" 
                        stroke="#6366f1" 
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        dot={false}
                        connectNulls={false}
                      />
                    </>
                  )}
                  
                  {/* AI Confidence Band */}
                  <Area 
                    type="monotone" 
                    dataKey="aiUpper" 
                    stroke="none"
                    fill="url(#aiConfidenceGradient)"
                    fillOpacity={1}
                  />

                  {/* Actual Price Area */}
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="none"
                    fill="url(#actualGradient)"
                    fillOpacity={1}
                  />

                  {/* SMA Lines */}
                  {selectedIndicators.includes('sma20') && (
                    <Line 
                      type="monotone" 
                      dataKey="sma20" 
                      stroke="#f59e0b" 
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls={false}
                    />
                  )}
                  {selectedIndicators.includes('sma50') && (
                    <Line 
                      type="monotone" 
                      dataKey="sma50" 
                      stroke="#8b5cf6" 
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls={false}
                    />
                  )}

                  {/* EMA Lines */}
                  {selectedIndicators.includes('ema12') && (
                    <Line 
                      type="monotone" 
                      dataKey="ema12" 
                      stroke="#ec4899" 
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls={false}
                    />
                  )}
                  {selectedIndicators.includes('ema26') && (
                    <Line 
                      type="monotone" 
                      dataKey="ema26" 
                      stroke="#06b6d4" 
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls={false}
                    />
                  )}

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
                    strokeDasharray="4 4"
                    dot={false}
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
                    activeDot={{ r: 4, fill: '#10b981', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>

              {/* Volume Chart */}
              {volumeData.length > 0 && !isFullscreen && (
                <ResponsiveContainer width="100%" height={60}>
                  <ComposedChart 
                    data={volumeData} 
                    margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="timestamp" hide />
                    <YAxis hide domain={[0, 'auto']} />
                    <Bar dataKey="volume" radius={[2, 2, 0, 0]} maxBarSize={6}>
                      {volumeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={entry.priceUp ? 'hsl(142 76% 36% / 0.5)' : 'hsl(0 84% 60% / 0.5)'}
                        />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {/* Floating Current Price Badge */}
              <div 
                className="absolute right-1 top-1/3 transform -translate-y-1/2 z-10"
              >
                <div className={`px-2 py-1 rounded text-xs font-bold text-white shadow-lg ${
                  isPositive ? 'bg-red-500' : 'bg-emerald-500'
                }`}>
                  ${currentPrice.toFixed(2)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className={cn(
          "hidden lg:flex flex-col w-48 border-l border-border bg-muted/20 p-3",
          isFullscreen && "w-56"
        )}>
          {/* Current Price */}
          <div className="space-y-1 pb-3 border-b border-border">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">Current Price</p>
            <p className={`text-xl font-bold ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
              ${currentPrice.toFixed(2)}
            </p>
            <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{isPositive ? '+' : ''}{stats.changePercent.toFixed(2)}%</span>
            </div>
          </div>

          {/* AI Prediction */}
          <div className="space-y-1.5 py-3 border-b border-border">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3 h-3 text-emerald-500" />
              <p className="text-[10px] uppercase text-muted-foreground font-medium">AI Prediction</p>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                <span className="text-xs text-muted-foreground">Generating...</span>
              </div>
            ) : nextHourPrediction ? (
              <>
                <p className="text-lg font-bold text-emerald-600">${nextHourPrediction.price.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">
                  Confidence: {((nextHourPrediction.confidenceScore || 0.85) * 100).toFixed(0)}%
                </p>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-7 text-xs border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
                onClick={onGeneratePredictions}
              >
                <Brain className="w-3 h-3 mr-1.5" />
                Generate
              </Button>
            )}
          </div>

          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <div className="space-y-1.5 py-3 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Bell className="w-3 h-3 text-amber-500" />
                <p className="text-[10px] uppercase text-muted-foreground font-medium">Active Alerts</p>
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {activeAlerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between text-[10px]">
                    <span className={alert.condition === 'above' ? 'text-red-500' : 'text-emerald-500'}>
                      {alert.condition === 'above' ? '↑' : '↓'} ${alert.threshold_value}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4"
                      onClick={() => deleteAlert(alert.id!)}
                    >
                      <X className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Stats */}
          <div className="space-y-2 py-3">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">Session Stats</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">High</p>
                <p className="font-semibold text-red-500">${stats.high.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Low</p>
                <p className="font-semibold text-emerald-500">${stats.low.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Open</p>
                <p className="font-semibold">${stats.open.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Vol</p>
                <p className="font-semibold">{(stats.volume / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-auto pt-3 border-t border-border space-y-1.5">
            <p className="text-[10px] uppercase text-muted-foreground font-medium">Legend</p>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-primary"></div>
                <span className="text-muted-foreground">Actual Price</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500" style={{ borderTop: '1px dashed' }}></div>
                <span className="text-muted-foreground">AESO Forecast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-emerald-500" style={{ borderTop: '1px dashed' }}></div>
                <span className="text-muted-foreground">AI Prediction</span>
              </div>
              {selectedIndicators.map(indId => {
                const ind = AVAILABLE_INDICATORS.find(i => i.id === indId);
                if (!ind) return null;
                return (
                  <div key={indId} className="flex items-center gap-2">
                    <div className="w-4 h-0.5" style={{ backgroundColor: ind.color }}></div>
                    <span className="text-muted-foreground">{ind.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE STATS BAR ===== */}
      <div className="lg:hidden grid grid-cols-4 gap-1 px-2 py-2 border-t border-border bg-muted/30 text-center">
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">High</p>
          <p className="text-xs font-bold text-red-500">${stats.high.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">Low</p>
          <p className="text-xs font-bold text-emerald-500">${stats.low.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">AI Pred</p>
          {aiLoading ? (
            <Loader2 className="w-3 h-3 animate-spin mx-auto text-emerald-500" />
          ) : (
            <p className="text-xs font-bold text-emerald-500">
              {nextHourPrediction ? `$${nextHourPrediction.price.toFixed(0)}` : '--'}
            </p>
          )}
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">Chg</p>
          <p className={`text-xs font-bold ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
            {isPositive ? '+' : ''}{stats.changePercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* ===== BOTTOM TIME RANGE SELECTOR ===== */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30">
        <div className="flex items-center gap-1">
          {TIME_RANGES.map(range => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-6 px-2 text-xs ${
                timeRange === range.value 
                  ? 'bg-primary/10 text-primary font-semibold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTimeRange(range.value as TimeRange)}
            >
              {range.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{format(new Date(), 'HH:mm')}</span>
          <span className="text-[10px]">UTC</span>
        </div>
      </div>

      {/* ===== ALERTS DIALOG ===== */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Price Alerts
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Quick Alerts */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Alerts</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                  onClick={() => handleQuickAlert('high')}
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                  Above +10%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                  onClick={() => handleQuickAlert('low')}
                >
                  <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
                  Below -10%
                </Button>
              </div>
            </div>

            {/* Custom Alert */}
            <div className="space-y-3 pt-3 border-t border-border">
              <p className="text-sm font-medium">Custom Alert</p>
              <div className="flex gap-2">
                <Select value={newAlertCondition} onValueChange={(v: 'above' | 'below') => setNewAlertCondition(v)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    type="number"
                    placeholder={currentPrice.toFixed(2)}
                    value={newAlertThreshold}
                    onChange={(e) => setNewAlertThreshold(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <Button onClick={handleCreateAlert}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Active Alerts List */}
            {alerts.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-border">
                <p className="text-sm font-medium">Active Alerts ({activeAlerts.length})</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${alert.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                        <span className={`text-sm ${alert.condition === 'above' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {alert.condition === 'above' ? '↑' : '↓'} ${alert.threshold_value}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {alert.alert_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => deleteAlert(alert.id!)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
