import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAESODashboardData, WidgetConfig } from '@/hooks/useAESODashboardData';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMemo } from 'react';

interface CandlestickWidgetProps {
  config: WidgetConfig;
}

export function CandlestickWidget({ config }: CandlestickWidgetProps) {
  const { data, loading, error, refetch } = useAESODashboardData(config);

  // Transform data into OHLC format
  const candlestickData = useMemo(() => {
    if (!data?.chartData || !Array.isArray(data.chartData)) return [];
    
    // Group by date and calculate OHLC
    const grouped = new Map<string, number[]>();
    
    data.chartData.forEach((item: any) => {
      const date = new Date(item.date || item.time || Date.now());
      const dateKey = date.toISOString().split('T')[0];
      const value = item.price || item.value || 0;
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(value);
    });
    
    return Array.from(grouped.entries()).map(([date, values]) => {
      const sorted = [...values].sort((a, b) => a - b);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        open: values[0],
        high: Math.max(...values),
        low: Math.min(...values),
        close: values[values.length - 1],
        volume: values.length,
        change: values[values.length - 1] - values[0],
      };
    }).slice(-30); // Last 30 periods
  }, [data?.chartData]);

  const statistics = useMemo(() => {
    if (!candlestickData.length) return null;
    
    const bullish = candlestickData.filter(d => d.close > d.open).length;
    const bearish = candlestickData.filter(d => d.close < d.open).length;
    const avgVolume = candlestickData.reduce((sum, d) => sum + d.volume, 0) / candlestickData.length;
    const avgChange = candlestickData.reduce((sum, d) => sum + Math.abs(d.change), 0) / candlestickData.length;
    
    return {
      bullish,
      bearish,
      avgVolume: avgVolume.toFixed(0),
      avgChange: avgChange.toFixed(2),
    };
  }, [candlestickData]);

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

  if (error || !candlestickData.length) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-sm text-muted-foreground">Failed to load candlestick data</p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...candlestickData.map(d => d.high));
  const minValue = Math.min(...candlestickData.map(d => d.low));
  const range = maxValue - minValue;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">{config.title}</CardTitle>
          {statistics && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="default" className="text-xs bg-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                {statistics.bullish} Bullish
              </Badge>
              <Badge variant="destructive" className="text-xs">
                <TrendingDown className="w-3 h-3 mr-1" />
                {statistics.bearish} Bearish
              </Badge>
              <Badge variant="outline" className="text-xs">
                Avg Δ: ${statistics.avgChange}
              </Badge>
            </div>
          )}
        </div>
        <Button size="icon" variant="outline" onClick={refetch}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-0 overflow-auto">
        <div className="flex gap-1 min-h-[300px] items-end pb-10">
          {candlestickData.map((candle, index) => {
            const isBullish = candle.close >= candle.open;
            const bodyHeight = Math.abs(candle.close - candle.open);
            const wickTopHeight = candle.high - Math.max(candle.open, candle.close);
            const wickBottomHeight = Math.min(candle.open, candle.close) - candle.low;
            
            const bodyBottom = ((Math.min(candle.open, candle.close) - minValue) / range) * 100;
            const bodyTop = ((bodyHeight) / range) * 100;
            const wickTop = ((wickTopHeight) / range) * 100;
            const wickBottom = ((wickBottomHeight) / range) * 100;
            
            return (
              <div
                key={index}
                className="flex-1 min-w-[8px] max-w-[20px] flex flex-col items-center relative group"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                  <Card className="border-primary/20 bg-background/95 backdrop-blur-sm p-2 shadow-lg whitespace-nowrap">
                    <div className="text-xs space-y-1">
                      <div className="font-semibold border-b pb-1 mb-1">{candle.date}</div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Open:</span>
                        <span className="font-medium">${candle.open.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">High:</span>
                        <span className="font-medium">${candle.high.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Low:</span>
                        <span className="font-medium">${candle.low.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Close:</span>
                        <span className="font-medium">${candle.close.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 border-t">
                        <span className="text-muted-foreground">Change:</span>
                        <span className={`font-medium ${candle.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {candle.change >= 0 ? '+' : ''}{candle.change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Candlestick */}
                <div className="relative flex flex-col items-center h-full w-full" style={{ paddingBottom: `${bodyBottom}%` }}>
                  {/* Upper wick */}
                  <div
                    className="w-[2px] bg-current"
                    style={{ 
                      height: `${wickTop}%`,
                      color: isBullish ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)'
                    }}
                  />
                  
                  {/* Body */}
                  <div
                    className={`w-full ${isBullish ? 'bg-green-600' : 'bg-red-600'} border-2`}
                    style={{ 
                      height: bodyTop > 0 ? `${bodyTop}%` : '2px',
                      borderColor: isBullish ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)'
                    }}
                  />
                  
                  {/* Lower wick */}
                  <div
                    className="w-[2px] bg-current"
                    style={{ 
                      height: `${wickBottom}%`,
                      color: isBullish ? 'hsl(142 76% 36%)' : 'hsl(0 84% 60%)'
                    }}
                  />
                </div>
                
                {/* Date label (show every 5th) */}
                {index % 5 === 0 && (
                  <div className="absolute -bottom-8 text-xs text-muted-foreground rotate-45 origin-top-left whitespace-nowrap">
                    {candle.date}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
