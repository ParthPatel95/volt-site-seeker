import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { decomposePriceDrivers, PriceDriver } from '@/utils/advancedAnalytics';
import { HourlyDataPoint } from '@/services/historicalDataService';

interface PriceDriverWidgetProps {
  config: {
    title: string;
    dataFilters?: {
      timeRange?: string;
    };
  };
}

export function PriceDriverWidget({ config }: PriceDriverWidgetProps) {
  const [drivers, setDrivers] = useState<PriceDriver[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [config.dataFilters?.timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price, generation_wind, ail_mw')
        .order('timestamp', { ascending: false })
        .limit(500);

      if (error) throw error;

      const hourlyData: HourlyDataPoint[] = (data || []).map(d => ({
        ts: d.timestamp,
        price: d.pool_price,
        generation: d.generation_wind || 0,
        ail: d.ail_mw || 0,
      })).reverse();

      if (hourlyData.length > 0) {
        const driverData = decomposePriceDrivers(hourlyData);
        setDrivers(driverData);
        setCurrentPrice(hourlyData[hourlyData.length - 1].price);
      }
    } catch (error) {
      console.error('Error fetching price driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const baseDriver = drivers.find(d => d.factor === 'Base Price');
  const otherDrivers = drivers.filter(d => d.factor !== 'Base Price');

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>What's driving current electricity prices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Price Display */}
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Current Pool Price</div>
          <div className="text-3xl font-bold">${currentPrice.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">per MWh</div>
        </div>

        {/* Waterfall Chart */}
        <div className="space-y-3">
          {/* Base Price */}
          {baseDriver && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{baseDriver.factor}</span>
                <span className="text-sm font-mono font-semibold">
                  ${baseDriver.impact.toFixed(2)}
                </span>
              </div>
              <div className="h-8 bg-primary rounded-md flex items-center px-3">
                <span className="text-xs text-primary-foreground">
                  {baseDriver.description}
                </span>
              </div>
            </div>
          )}

          {/* Other Drivers */}
          {otherDrivers.map((driver, idx) => {
            const isPositive = driver.impact > 0;
            const isNeutral = Math.abs(driver.impact) < 0.5;

            return (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isNeutral ? (
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    ) : isPositive ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{driver.factor}</span>
                  </div>
                  <span
                    className={`text-sm font-mono font-semibold ${
                      isNeutral
                        ? 'text-muted-foreground'
                        : isPositive
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {isPositive ? '+' : ''}${driver.impact.toFixed(2)}
                  </span>
                </div>
                <div className="relative h-6 bg-muted rounded-md overflow-hidden">
                  <div
                    className={`absolute h-full ${
                      isNeutral
                        ? 'bg-muted-foreground/30'
                        : isPositive
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    } transition-all`}
                    style={{
                      width: `${Math.min(Math.abs(driver.percentage), 100)}%`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-medium">{driver.description}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Impact:</span>
            <span className="font-mono font-semibold">
              {otherDrivers.reduce((sum, d) => sum + d.impact, 0) > 0 ? '+' : ''}
              ${otherDrivers.reduce((sum, d) => sum + d.impact, 0).toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Price decomposition based on recent market conditions and historical averages
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
