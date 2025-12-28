import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  ReferenceArea,
  Area,
  Cell,
  Brush
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
  X,
  CandlestickChart as CandlestickIcon,
  LineChart,
  Bug,
  ZoomIn,
  ZoomOut,
  Move,
  Target,
  AlertTriangle,
  Server
} from 'lucide-react';
import { format, subHours, addHours, parseISO, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { cn } from '@/lib/utils';
import { RSIPanel, MACDPanel } from './indicators';
import { aggregateToCandles } from './CandlestickRenderer';

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

interface PriceCeiling {
  hardCeiling: number;
  softCeiling: number;
  floor: number;
  ruleName: string;
}

interface TradingViewChartProps {
  data: PriceDataPoint[];
  currentPrice: number;
  loading?: boolean;
  aiLoading?: boolean;
  aiPredictions?: AIPrediction[];
  priceCeilings?: PriceCeiling;
  onRefresh?: () => void;
  onGeneratePredictions?: () => void;
}

type TimeRange = '1D' | '5D' | '1M' | '3M';
type ChartType = 'line' | 'candlestick';
type IndicatorPanel = 'none' | 'rsi' | 'macd';

// Indicator definitions
const AVAILABLE_INDICATORS = [
  { id: 'sma20', name: 'SMA (20)', color: '#f59e0b', period: 20, type: 'sma' },
  { id: 'sma50', name: 'SMA (50)', color: '#8b5cf6', period: 50, type: 'sma' },
  { id: 'ema12', name: 'EMA (12)', color: '#ec4899', period: 12, type: 'ema' },
  { id: 'ema26', name: 'EMA (26)', color: '#06b6d4', period: 26, type: 'ema' },
  { id: 'bollinger', name: 'Bollinger Bands', color: '#6366f1', period: 20, type: 'bollinger' },
];

const TIME_INTERVALS = [
  { value: '1H', label: '1H', hours: 1 },
  { value: '4H', label: '4H', hours: 4 },
  { value: '1D', label: '1D', hours: 24 },
  { value: '1W', label: '1W', hours: 168 },
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
  priceCeilings,
  onRefresh,
  onGeneratePredictions
}: TradingViewChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [interval, setInterval] = useState('1H');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [showDebug, setShowDebug] = useState(false);
  const [indicatorPanel, setIndicatorPanel] = useState<IndicatorPanel>('none');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(() => {
    const saved = localStorage.getItem('chart-indicators');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [newAlertThreshold, setNewAlertThreshold] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');
  
  // Interactive chart state
  const [brushStartIndex, setBrushStartIndex] = useState<number | undefined>(undefined);
  const [brushEndIndex, setBrushEndIndex] = useState<number | undefined>(undefined);
  const [crosshairData, setCrosshairData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartIndices, setDragStartIndices] = useState<{ start: number, end: number }>({ start: 0, end: 0 });
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const mainChartRef = useRef<HTMLDivElement>(null);
  
  // Use price alerts hook
  const { 
    alerts, 
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
  const getHoursBack = useCallback(() => {
    const range = TIME_RANGES.find(r => r.value === timeRange);
    return range?.hours || 24;
  }, [timeRange]);

  // Process data for chart - COMBINED VIEW
  const chartData = useMemo(() => {
    const now = new Date();
    const hoursBack = getHoursBack();
    const cutoffPast = subHours(now, hoursBack);
    const cutoffFuture = addHours(now, Math.min(hoursBack, 72));
    
    const pointMap = new Map<string, any>();
    
    console.log('[TradingViewChart] Processing data:', {
      dataPoints: data?.length || 0,
      aiPredictions: aiPredictions?.length || 0,
      timeRange,
      hoursBack
    });
    
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
        
        const isPast = isBefore(parsedDate, now) || Math.abs(parsedDate.getTime() - now.getTime()) < 60000;
        const hourKey = `${parsedDate.getFullYear()}-${parsedDate.getMonth()}-${parsedDate.getDate()}-${parsedDate.getHours()}`;
        const timestamp = parsedDate.toISOString();
        
        const existingPoint = pointMap.get(hourKey);
        if (existingPoint) {
          if (d.pool_price !== undefined && isPast) {
            existingPoint.actual = d.pool_price;
            existingPoint.volume = d.ail_mw;
          }
          if (d.forecast_pool_price !== undefined) {
            existingPoint.aesoForecast = d.forecast_pool_price;
          }
        } else {
          const point = {
            timestamp,
            parsedDate,
            hourKey,
            actual: isPast && d.pool_price !== undefined ? d.pool_price : undefined,
            aesoForecast: d.forecast_pool_price !== undefined ? d.forecast_pool_price : undefined,
            volume: isPast ? d.ail_mw : undefined,
          };
          pointMap.set(hourKey, point);
        }
      });
    }
    
    // Process AI predictions
    if (aiPredictions && aiPredictions.length > 0) {
      console.log('[TradingViewChart] AI Predictions sample:', aiPredictions.slice(0, 3));
      
      aiPredictions.forEach(pred => {
        let predDate: Date;
        try {
          predDate = parseISO(pred.timestamp);
        } catch {
          predDate = new Date(pred.timestamp);
        }
        
        if (isNaN(predDate.getTime())) return;
        if (isBefore(predDate, cutoffPast) || isAfter(predDate, cutoffFuture)) return;
        
        const hourKey = `${predDate.getFullYear()}-${predDate.getMonth()}-${predDate.getDate()}-${predDate.getHours()}`;
        const timestamp = predDate.toISOString();
        
        const existingPoint = pointMap.get(hourKey);
        
        if (existingPoint) {
          existingPoint.aiPrediction = pred.price;
          existingPoint.aiLower = pred.confidenceLower;
          existingPoint.aiUpper = pred.confidenceUpper;
          existingPoint.confidenceScore = pred.confidenceScore;
        } else {
          const point = {
            timestamp,
            parsedDate: predDate,
            hourKey,
            aiPrediction: pred.price,
            aiLower: pred.confidenceLower,
            aiUpper: pred.confidenceUpper,
            confidenceScore: pred.confidenceScore,
          };
          pointMap.set(hourKey, point);
        }
      });
    }
    
    const sorted = Array.from(pointMap.values()).sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    
    const actualCount = sorted.filter(p => p.actual !== undefined).length;
    const forecastCount = sorted.filter(p => p.aesoForecast !== undefined).length;
    const aiCount = sorted.filter(p => p.aiPrediction !== undefined).length;
    
    console.log('[TradingViewChart] Chart data summary:', {
      totalPoints: sorted.length,
      actualPrices: actualCount,
      aesoForecasts: forecastCount,
      aiPredictions: aiCount
    });
    
    return sorted;
  }, [data, aiPredictions, timeRange, getHoursBack]);

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
    
    return chartData.map((point) => {
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

  // Calculate statistics
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

  // Volume data
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

  // Aggregate data into OHLC candles for candlestick chart
  const candleData = useMemo(() => {
    const actualData = chartData
      .filter(d => d.actual !== undefined)
      .map(d => ({ timestamp: d.timestamp, actual: d.actual }));
    
    if (actualData.length < 2) return [];
    
    const candles = aggregateToCandles(actualData, interval === '4H' ? 4 : interval === '1D' ? 24 : interval === '1W' ? 168 : 1);
    
    // Add candleBody for bar height calculation
    return candles.map(c => ({
      ...c,
      candleBody: Math.abs(c.close - c.open) || 1,
      priceRange: c.high - c.low
    }));
  }, [chartData, interval]);

  // Find NOW index for jumping to current time
  const nowIndex = useMemo(() => {
    const now = new Date();
    let closestIdx = 0;
    let closestDiff = Infinity;
    chartData.forEach((point, idx) => {
      const diff = Math.abs(point.parsedDate.getTime() - now.getTime());
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIdx = idx;
      }
    });
    return closestIdx;
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

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const dataLen = chartDataWithIndicators.length;
    if (dataLen === 0) return;
    
    const currentStart = brushStartIndex ?? 0;
    const currentEnd = brushEndIndex ?? dataLen - 1;
    const currentRange = currentEnd - currentStart;
    const newRange = Math.max(5, Math.floor(currentRange * 0.6));
    const center = Math.floor((currentStart + currentEnd) / 2);
    
    setBrushStartIndex(Math.max(0, center - Math.floor(newRange / 2)));
    setBrushEndIndex(Math.min(dataLen - 1, center + Math.floor(newRange / 2)));
  }, [brushStartIndex, brushEndIndex, chartDataWithIndicators.length]);

  const handleZoomOut = useCallback(() => {
    const dataLen = chartDataWithIndicators.length;
    if (dataLen === 0) return;
    
    const currentStart = brushStartIndex ?? 0;
    const currentEnd = brushEndIndex ?? dataLen - 1;
    const currentRange = currentEnd - currentStart;
    const newRange = Math.min(dataLen, Math.floor(currentRange * 1.5));
    const center = Math.floor((currentStart + currentEnd) / 2);
    
    setBrushStartIndex(Math.max(0, center - Math.floor(newRange / 2)));
    setBrushEndIndex(Math.min(dataLen - 1, center + Math.floor(newRange / 2)));
  }, [brushStartIndex, brushEndIndex, chartDataWithIndicators.length]);

  const handleResetZoom = useCallback(() => {
    setBrushStartIndex(undefined);
    setBrushEndIndex(undefined);
  }, []);

  const handleJumpToNow = useCallback(() => {
    const dataLen = chartDataWithIndicators.length;
    if (dataLen === 0) return;
    
    const viewRange = Math.min(24, dataLen); // Show 24 points around NOW
    setBrushStartIndex(Math.max(0, nowIndex - Math.floor(viewRange / 2)));
    setBrushEndIndex(Math.min(dataLen - 1, nowIndex + Math.floor(viewRange / 2)));
  }, [nowIndex, chartDataWithIndicators.length]);

  // Mouse wheel zoom
  useEffect(() => {
    const chartEl = mainChartRef.current;
    if (!chartEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    };

    chartEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => chartEl.removeEventListener('wheel', handleWheel);
  }, [handleZoomIn, handleZoomOut]);

  // Drag to pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartIndices({
      start: brushStartIndex ?? 0,
      end: brushEndIndex ?? chartDataWithIndicators.length - 1
    });
  }, [brushStartIndex, brushEndIndex, chartDataWithIndicators.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartX;
    const dataLen = chartDataWithIndicators.length;
    const chartWidth = mainChartRef.current?.offsetWidth || 800;
    const pointsPerPixel = dataLen / chartWidth;
    const indexDelta = Math.round(deltaX * pointsPerPixel * -0.5);
    
    const newStart = Math.max(0, Math.min(dataLen - 10, dragStartIndices.start + indexDelta));
    const newEnd = Math.max(newStart + 5, Math.min(dataLen - 1, dragStartIndices.end + indexDelta));
    
    setBrushStartIndex(newStart);
    setBrushEndIndex(newEnd);
  }, [isDragging, dragStartX, dragStartIndices, chartDataWithIndicators.length]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle brush change from navigator
  const handleBrushChange = useCallback((e: any) => {
    if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
      setBrushStartIndex(e.startIndex);
      setBrushEndIndex(e.endIndex);
    }
  }, []);

  // Get visible data based on brush
  const visibleData = useMemo(() => {
    if (brushStartIndex === undefined || brushEndIndex === undefined) {
      return chartDataWithIndicators;
    }
    return chartDataWithIndicators.slice(brushStartIndex, brushEndIndex + 1);
  }, [chartDataWithIndicators, brushStartIndex, brushEndIndex]);

  // Handle tooltip/crosshair
  const handleChartMouseMove = useCallback((state: any) => {
    if (state?.activePayload?.[0]?.payload) {
      setCrosshairData(state.activePayload[0].payload);
    }
  }, []);

  const handleChartMouseLeave = useCallback(() => {
    setCrosshairData(null);
  }, []);

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

  // Enhanced Custom Tooltip with Crosshair Values
  const EnhancedTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const now = new Date();
    let labelDate: Date;
    try {
      labelDate = new Date(label);
    } catch {
      return null;
    }
    const isPast = isBefore(labelDate, now);
    
    // Find all values
    const actualValue = payload.find((p: any) => p.dataKey === 'actual')?.value;
    const forecastValue = payload.find((p: any) => p.dataKey === 'aesoForecast')?.value;
    const aiValue = payload.find((p: any) => p.dataKey === 'aiPrediction')?.value;
    const aiLower = payload.find((p: any) => p.dataKey === 'aiLower')?.value;
    const aiUpper = payload.find((p: any) => p.dataKey === 'aiUpper')?.value;
    
    // Calculate deltas
    const aiDelta = actualValue && aiValue ? (aiValue - actualValue).toFixed(2) : null;
    const forecastDelta = actualValue && forecastValue ? (forecastValue - actualValue).toFixed(2) : null;
    
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border rounded-lg p-4 shadow-2xl min-w-[220px]">
        {/* Time header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
          <p className="text-sm font-semibold text-foreground">
            {format(labelDate, 'MMM d, HH:mm')}
          </p>
          <Badge variant={isPast ? 'default' : 'secondary'} className="text-[10px]">
            {isPast ? 'Historical' : 'Forecast'}
          </Badge>
        </div>
        
        {/* Values grid */}
        <div className="space-y-2">
          {actualValue !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Actual</span>
              </div>
              <span className="text-sm font-bold text-primary">${actualValue.toFixed(2)}</span>
            </div>
          )}
          
          {forecastValue !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">AESO Forecast</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-blue-500">${forecastValue.toFixed(2)}</span>
                {forecastDelta && (
                  <span className={cn("text-[10px]", parseFloat(forecastDelta) >= 0 ? "text-red-500" : "text-emerald-500")}>
                    {parseFloat(forecastDelta) >= 0 ? '+' : ''}{forecastDelta}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {aiValue !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-muted-foreground">AI Prediction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-500">${aiValue.toFixed(2)}</span>
                {aiDelta && (
                  <span className={cn("text-[10px]", parseFloat(aiDelta) >= 0 ? "text-red-500" : "text-emerald-500")}>
                    {parseFloat(aiDelta) >= 0 ? '+' : ''}{aiDelta}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {aiLower !== undefined && aiUpper !== undefined && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground">
                AI Confidence Range: ${aiLower.toFixed(2)} - ${aiUpper.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Responsive chart height - always use numbers for ResponsiveContainer
  const getChartHeight = useCallback(() => {
    if (isFullscreen) return undefined; // Will use flex-1 to fill space
    // Responsive heights based on window width
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 240; // mobile
      if (window.innerWidth < 1024) return 300; // tablet
    }
    return 360; // desktop
  }, [isFullscreen]);

  const chartHeight = getChartHeight();

  return (
    <Card 
      ref={chartContainerRef}
      className={cn(
        "border-border overflow-hidden bg-card shadow-lg flex flex-col",
        isFullscreen && "fixed inset-0 z-50 rounded-none h-screen w-screen"
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
          
          {/* Time Range Selector */}
          <div className="hidden sm:flex items-center border border-border rounded overflow-hidden">
            {TIME_RANGES.map(tr => (
              <Button
                key={tr.value}
                variant={timeRange === tr.value ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2.5 text-xs rounded-none"
                onClick={() => {
                  setTimeRange(tr.value as TimeRange);
                  handleResetZoom();
                }}
              >
                {tr.label}
              </Button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border border-border rounded overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs rounded-none"
              onClick={handleZoomIn}
              title="Zoom In (scroll up)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs rounded-none"
              onClick={handleZoomOut}
              title="Zoom Out (scroll down)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs rounded-none"
              onClick={handleResetZoom}
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs rounded-none border-l border-border"
              onClick={handleJumpToNow}
              title="Jump to Now"
            >
              <Target className="w-3.5 h-3.5 mr-1" />
              NOW
            </Button>
          </div>

          {/* Chart Type Toggle */}
          <div className="hidden sm:flex items-center border border-border rounded overflow-hidden">
            <Button 
              variant={chartType === 'line' ? 'secondary' : 'ghost'}
              size="sm" 
              className="h-7 px-2 text-xs rounded-none"
              onClick={() => setChartType('line')}
            >
              <LineChart className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant={chartType === 'candlestick' ? 'secondary' : 'ghost'}
              size="sm" 
              className="h-7 px-2 text-xs rounded-none"
              onClick={() => setChartType('candlestick')}
              title="Candlestick Chart"
            >
              <CandlestickIcon className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-1">
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

            {/* Oscillator Panel Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Activity className="w-3.5 h-3.5 mr-1" />
                  Oscillators
                  {indicatorPanel !== 'none' && (
                    <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                      1
                    </Badge>
                  )}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" align="start">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Oscillator Panels</p>
                  <div className="space-y-1">
                    <Button
                      variant={indicatorPanel === 'none' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                      onClick={() => setIndicatorPanel('none')}
                    >
                      None
                    </Button>
                    <Button
                      variant={indicatorPanel === 'rsi' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                      onClick={() => setIndicatorPanel('rsi')}
                    >
                      <div className="w-3 h-0.5 rounded bg-purple-500 mr-2" />
                      RSI (14)
                    </Button>
                    <Button
                      variant={indicatorPanel === 'macd' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                      onClick={() => setIndicatorPanel('macd')}
                    >
                      <div className="w-3 h-0.5 rounded bg-blue-500 mr-2" />
                      MACD
                    </Button>
                  </div>
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
          <Button 
            variant={showDebug ? 'secondary' : 'ghost'}
            size="icon" 
            className="h-7 w-7"
            onClick={() => setShowDebug(!showDebug)}
            title="Toggle debug panel"
          >
            <Bug className="w-3.5 h-3.5" />
          </Button>
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

      {/* ===== OHLC HEADER ===== */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 border-b border-border bg-card text-xs">
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

        <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-red-500' : 'text-emerald-500'}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{isPositive ? '+' : ''}${stats.change.toFixed(2)}</span>
          <span className="text-[10px]">({isPositive ? '+' : ''}{stats.changePercent.toFixed(2)}%)</span>
        </div>

        <div className="hidden sm:block h-4 w-px bg-border" />

        {/* Drag hint */}
        <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
          <Move className="w-3 h-3" />
          <span className="text-[10px]">Drag to pan • Scroll to zoom</span>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-1 text-muted-foreground ml-auto">
          <span>Vol</span>
          <span className="font-mono font-semibold text-foreground">{(stats.volume / 1000).toFixed(1)}K MW</span>
        </div>
      </div>

      {/* ===== DEBUG PANEL ===== */}
      {showDebug && (
        <div className="px-3 py-2 border-b border-border bg-amber-500/10 text-xs">
          <div className="flex flex-wrap gap-4">
            <span className="text-muted-foreground">
              Raw: <span className="font-mono text-foreground">{data?.length || 0}</span>
            </span>
            <span className="text-muted-foreground">
              Chart: <span className="font-mono text-foreground">{chartData.length}</span>
            </span>
            <span className="text-muted-foreground">
              Visible: <span className="font-mono text-primary">{visibleData.length}</span>
            </span>
            <span className="text-muted-foreground">
              Actual: <span className="font-mono text-primary">{chartData.filter(p => p.actual !== undefined).length}</span>
            </span>
            <span className="text-muted-foreground">
              AESO: <span className="font-mono text-blue-500">{chartData.filter(p => p.aesoForecast !== undefined).length}</span>
            </span>
            <span className="text-muted-foreground">
              AI: <span className="font-mono text-emerald-500">{chartData.filter(p => p.aiPrediction !== undefined).length}</span>
            </span>
            <span className={`font-medium ${(data?.length || 0) > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {(data?.length || 0) > 0 ? '✓ Real Data' : '⚠ No Data'}
            </span>
          </div>
        </div>
      )}

      {/* ===== MAIN CHART AREA ===== */}
      <div className={cn(
        "flex flex-col overflow-hidden",
        isFullscreen ? "flex-1 min-h-0" : ""
      )}>
        {/* Chart Container with drag handlers */}
        <div
          ref={mainChartRef}
          className={cn(
            "relative cursor-grab active:cursor-grabbing p-2 sm:p-3",
            isDragging && "cursor-grabbing",
            isFullscreen ? "flex-1 min-h-0" : "h-[240px] sm:h-[300px] lg:h-[360px]"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {loading ? (
            <div className={cn(
              "flex items-center justify-center bg-muted/10 rounded-lg",
              isFullscreen ? "h-full" : "h-[220px] sm:h-[280px] lg:h-[340px]"
            )}>
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className={cn(
              "flex items-center justify-center bg-muted/10 rounded-lg",
              isFullscreen ? "h-full" : "h-[220px] sm:h-[280px] lg:h-[340px]"
            )}>
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
              {/* Main Combined Chart */}
              <div className={cn(
                "rounded-lg border border-border/50 overflow-hidden",
                isFullscreen ? "h-full" : ""
              )}>
              <ResponsiveContainer width="100%" height={isFullscreen ? "100%" : chartHeight}>
                <ComposedChart 
                  data={chartType === 'candlestick' ? candleData : visibleData}
                  margin={{ top: 10, right: 60, left: 0, bottom: 0 }}
                  onMouseMove={handleChartMouseMove}
                  onMouseLeave={handleChartMouseLeave}
                >
                  <defs>
                    {/* Actual price gradient */}
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    {/* AI confidence gradient */}
                    <linearGradient id="aiConfidenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                    {/* Bollinger gradient */}
                    <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>

                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))" 
                    opacity={0.5}
                    vertical={false}
                  />
                  
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxis}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    stroke="hsl(var(--border))"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={50}
                  />
                  
                  <YAxis 
                    orientation="right"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    stroke="hsl(var(--border))"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                    domain={['auto', 'auto']}
                    width={55}
                  />
                  
                  <Tooltip content={<EnhancedTooltip />} />

                  {/* Alert reference lines */}
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

                  {/* Price Ceiling Lines from Datacenter Rules */}
                  {priceCeilings && (
                    <>
                      {/* Hard Ceiling - Red danger zone */}
                      <ReferenceLine 
                        y={priceCeilings.hardCeiling}
                        stroke="#ef4444"
                        strokeWidth={2}
                        label={{
                          value: `⚠ Hard Ceiling $${priceCeilings.hardCeiling}`,
                          position: 'left',
                          fill: '#ef4444',
                          fontSize: 9,
                          fontWeight: 'bold'
                        }}
                      />
                      {/* Soft Ceiling - Yellow warning */}
                      <ReferenceLine 
                        y={priceCeilings.softCeiling}
                        stroke="#f59e0b"
                        strokeDasharray="6 3"
                        strokeWidth={1.5}
                        label={{
                          value: `Soft Ceiling $${priceCeilings.softCeiling}`,
                          position: 'left',
                          fill: '#f59e0b',
                          fontSize: 9
                        }}
                      />
                      {/* Floor - Green */}
                      <ReferenceLine 
                        y={priceCeilings.floor}
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                        label={{
                          value: `Floor $${priceCeilings.floor}`,
                          position: 'left',
                          fill: '#10b981',
                          fontSize: 9
                        }}
                      />
                    </>
                  )}
                  
                  {/* NOW Reference Line - Animated */}
                  <ReferenceLine 
                    x={nowTimestamp} 
                    stroke="#f59e0b" 
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: '◆ NOW',
                      position: 'top',
                      fill: '#f59e0b',
                      fontSize: 10,
                      fontWeight: 'bold'
                    }}
                  />
                  
                  {/* Layer 1: AI Confidence Band (bottom layer) */}
                  <Area 
                    type="monotone" 
                    dataKey="aiUpper" 
                    stroke="none"
                    fill="url(#aiConfidenceGradient)"
                    fillOpacity={1}
                    name="AI Confidence Upper"
                    connectNulls
                  />
                  <Area 
                    type="monotone" 
                    dataKey="aiLower" 
                    stroke="none"
                    fill="hsl(var(--background))"
                    fillOpacity={1}
                    name="AI Confidence Lower"
                    connectNulls
                  />

                  {/* Layer 2: Bollinger Bands */}
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

                  {/* Layer 3: Actual Price Area */}
                  {chartType === 'line' && (
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="none"
                      fill="url(#actualGradient)"
                      fillOpacity={1}
                    />
                  )}

                  {/* Layer 4: SMA Lines */}
                  {selectedIndicators.includes('sma20') && (
                    <Line 
                      type="monotone" 
                      dataKey="sma20" 
                      stroke="#f59e0b" 
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls={false}
                      name="SMA(20)"
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
                      name="SMA(50)"
                    />
                  )}

                  {/* Layer 5: EMA Lines */}
                  {selectedIndicators.includes('ema12') && (
                    <Line 
                      type="monotone" 
                      dataKey="ema12" 
                      stroke="#ec4899" 
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls={false}
                      name="EMA(12)"
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
                      name="EMA(26)"
                    />
                  )}

                  {/* Layer 6: Main Lines (overlaid) */}
                  {/* Actual Price Line - Solid (for line chart mode) */}
                  {chartType === 'line' && (
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                      connectNulls={false}
                      name="Actual Price"
                    />
                  )}

                  {/* True OHLC Candlestick rendering */}
                  {chartType === 'candlestick' && candleData.length > 0 && (
                    <Bar
                      dataKey="candleBody"
                      fill="transparent"
                      name="OHLC"
                      isAnimationActive={false}
                      shape={(props: any) => {
                        const { x, width, payload } = props;
                        if (!payload?.open) return null;
                        
                        const { open, high, low, close } = payload;
                        const isUp = close >= open;
                        const color = isUp ? '#10b981' : '#ef4444';
                        
                        // Get Y scale from chart
                        const yScale = props.yAxis?.scale || ((v: number) => 200 - v);
                        const openY = yScale(open);
                        const closeY = yScale(close);
                        const highY = yScale(high);
                        const lowY = yScale(low);
                        
                        const bodyTop = Math.min(openY, closeY);
                        const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
                        const wickX = x + width / 2;
                        const candleWidth = Math.max(width - 4, 4);
                        
                        return (
                          <g>
                            {/* Wick line (high to low) */}
                            <line
                              x1={wickX}
                              y1={highY}
                              x2={wickX}
                              y2={lowY}
                              stroke={color}
                              strokeWidth={1}
                            />
                            {/* Body rectangle (open to close) */}
                            <rect
                              x={x + (width - candleWidth) / 2}
                              y={bodyTop}
                              width={candleWidth}
                              height={bodyHeight}
                              fill={isUp ? color : color}
                              stroke={color}
                              strokeWidth={1}
                            />
                          </g>
                        );
                      }}
                    >
                      {candleData.map((entry, index) => (
                        <Cell
                          key={`candle-${index}`}
                          fill={entry.close >= entry.open ? '#10b981' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  )}

                  {/* AESO Forecast Line - Dashed */}
                  <Line 
                    type="monotone" 
                    dataKey="aesoForecast" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={false}
                    activeDot={{ r: 4, fill: '#3b82f6', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                    connectNulls
                    name="AESO Forecast"
                  />

                  {/* AI Prediction Line - Dotted */}
                  <Line 
                    type="monotone" 
                    dataKey="aiPrediction" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={{ r: 5, fill: '#10b981', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                    connectNulls
                    name="AI Prediction"
                  />
              </ComposedChart>
              </ResponsiveContainer>
              </div>

              {/* Floating Current Price Badge */}
              <div className="absolute right-14 top-1/3 transform -translate-y-1/2 z-10">
                <div className={`px-2 py-1 rounded text-xs font-bold text-white shadow-lg animate-pulse ${
                  isPositive ? 'bg-red-500' : 'bg-emerald-500'
                }`}>
                  ${currentPrice.toFixed(2)}
                </div>
              </div>

              {/* Crosshair Value Display */}
              {crosshairData && (
                <div className="absolute left-4 top-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
                  <div className="flex items-center gap-4">
                    {crosshairData.actual !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-mono font-bold">${crosshairData.actual.toFixed(2)}</span>
                      </div>
                    )}
                    {crosshairData.aesoForecast !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-mono font-bold text-blue-500">${crosshairData.aesoForecast.toFixed(2)}</span>
                      </div>
                    )}
                    {crosshairData.aiPrediction !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Brain className="w-3 h-3 text-emerald-500" />
                        <span className="font-mono font-bold text-emerald-500">${crosshairData.aiPrediction.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RSI Panel */}
        {indicatorPanel === 'rsi' && !loading && chartData.length > 0 && (
          <RSIPanel data={chartData} period={14} height={80} />
        )}

        {/* MACD Panel */}
        {indicatorPanel === 'macd' && !loading && chartData.length > 0 && (
          <MACDPanel data={chartData} height={100} />
        )}

        {/* Volume Chart */}
        {volumeData.length > 0 && !loading && (
          <div className="h-10 sm:h-12 flex-shrink-0 mx-2 sm:mx-3 mb-1 border-t border-border/50">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={visibleData.filter(d => d.volume)} 
                margin={{ top: 2, right: 60, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="timestamp" hide />
                <YAxis hide domain={[0, 'auto']} />
                <Bar dataKey="volume" radius={[2, 2, 0, 0]} maxBarSize={6}>
                  {visibleData.filter(d => d.volume).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.actual >= (visibleData[index - 1]?.actual || 0) 
                        ? 'hsl(142 76% 36% / 0.6)' 
                        : 'hsl(0 84% 60% / 0.6)'}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Mini Navigator Bar */}
        {chartDataWithIndicators.length > 0 && !loading && (
          <div className="h-14 sm:h-16 flex-shrink-0 px-2 sm:px-3 py-1 sm:py-2 border-t border-border bg-muted/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Navigator</span>
              <span className="text-[10px] text-muted-foreground">
                ({brushStartIndex ?? 0} - {brushEndIndex ?? chartDataWithIndicators.length - 1} of {chartDataWithIndicators.length})
              </span>
            </div>
            <ResponsiveContainer width="100%" height={35}>
              <ComposedChart 
                data={chartDataWithIndicators}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
                <Line
                  type="monotone"
                  dataKey="aiPrediction"
                  stroke="#10b981"
                  strokeWidth={1}
                  dot={false}
                  connectNulls
                />
                <Brush
                  dataKey="timestamp"
                  height={35}
                  stroke="hsl(var(--border))"
                  fill="hsl(var(--muted))"
                  tickFormatter={() => ''}
                  startIndex={brushStartIndex}
                  endIndex={brushEndIndex}
                  onChange={handleBrushChange}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ===== LEGEND & AI PREDICTION FOOTER ===== */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-border bg-muted/20">
        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-primary rounded" />
            <span className="text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-blue-500 rounded" style={{ borderTop: '2px dashed' }} />
            <span className="text-muted-foreground">AESO Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-emerald-500 rounded" style={{ borderTop: '2px dotted' }} />
            <span className="text-muted-foreground">AI Prediction</span>
          </div>
          {selectedIndicators.map(indId => {
            const ind = AVAILABLE_INDICATORS.find(i => i.id === indId);
            if (!ind) return null;
            return (
              <div key={indId} className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 rounded" style={{ backgroundColor: ind.color }} />
                <span className="text-muted-foreground">{ind.name}</span>
              </div>
            );
          })}
        </div>

        {/* AI Next Hour Prediction */}
        <div className="flex items-center gap-3">
          {aiLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              <span className="text-xs text-muted-foreground">Generating predictions...</span>
            </div>
          ) : nextHourPrediction ? (
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Next Hour:</span>
              <span className="text-sm font-bold text-emerald-500">${nextHourPrediction.price.toFixed(2)}</span>
              <Badge variant="secondary" className="text-[10px]">
                {((nextHourPrediction.confidenceScore || 0.85) * 100).toFixed(0)}% conf
              </Badge>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 text-xs border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
              onClick={onGeneratePredictions}
            >
              <Brain className="w-3 h-3 mr-1.5" />
              Generate AI Predictions
            </Button>
          )}
        </div>
      </div>

      {/* ===== ALERT DIALOG ===== */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Price Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Alert when price goes</Label>
              <Select value={newAlertCondition} onValueChange={(v) => setNewAlertCondition(v as 'above' | 'below')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Above</SelectItem>
                  <SelectItem value="below">Below</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Threshold ($CAD)</Label>
              <Input 
                type="number"
                placeholder="Enter price..."
                value={newAlertThreshold}
                onChange={(e) => setNewAlertThreshold(e.target.value)}
              />
            </div>
            {activeAlerts.length > 0 && (
              <div className="space-y-2">
                <Label>Active Alerts</Label>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {activeAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <span className={alert.condition === 'above' ? 'text-red-500' : 'text-emerald-500'}>
                        {alert.condition === 'above' ? '↑' : '↓'} ${alert.threshold_value}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => deleteAlert(alert.id!)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAlert}>Create Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
