import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity } from 'lucide-react';

interface ForecastData {
  date: string;
  demand_forecast_mw: number;
  price_forecast: number;
  price_at_90_uptime?: number;
  price_at_92_uptime?: number;
  price_at_95_uptime?: number;
  price_at_97_uptime?: number;
}

interface Props {
  forecast: ForecastData[];
}

export function UptimePricingTool({ forecast }: Props) {
  const uptimeLevels = [
    { level: 90, key: 'price_at_90_uptime' as const, color: 'text-red-600' },
    { level: 92, key: 'price_at_92_uptime' as const, color: 'text-orange-600' },
    { level: 95, key: 'price_at_95_uptime' as const, color: 'text-yellow-600' },
    { level: 97, key: 'price_at_97_uptime' as const, color: 'text-green-600' }
  ];

  const calculateAveragePrice = (uptimeKey: keyof ForecastData) => {
    const validPrices = forecast
      .map(f => f[uptimeKey])
      .filter((price): price is number => typeof price === 'number' && !isNaN(price));
    
    if (validPrices.length === 0) return 0;
    return validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Uptime-Based Price Forecasting Tool
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Forecasted electricity prices at different generation availability levels
        </p>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {uptimeLevels.map(({ level, key, color }) => (
            <Card key={level}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Avg @ {level}% Uptime</p>
                  <div className={`text-2xl font-bold ${color}`}>
                    ${calculateAveragePrice(key).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">per MWh</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">
            Daily Price Forecasts by Uptime Level
          </h3>
          {forecast.map((day, index) => {
            const hasUptimeData = uptimeLevels.some(({ key }) => 
              day[key] !== undefined && !isNaN(day[key] as number)
            );

            return (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Demand: {(day.demand_forecast_mw / 1000).toFixed(1)} GW
                      </p>
                    </div>
                    <Badge variant="outline">
                      Base: ${day.price_forecast.toFixed(2)}/MWh
                    </Badge>
                  </div>

                  {hasUptimeData ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {uptimeLevels.map(({ level, key, color }) => {
                        const price = day[key];
                        if (price === undefined || isNaN(price)) return null;
                        
                        const priceChange = ((price - day.price_forecast) / day.price_forecast) * 100;
                        
                        return (
                          <div key={level} className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">{level}% Uptime</p>
                            <p className={`text-lg font-bold ${color}`}>
                              ${price.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <TrendingUp className={`w-3 h-3 ${priceChange < 0 ? 'text-green-500' : 'text-red-500'} ${priceChange < 0 ? 'rotate-180' : ''}`} />
                              <p className={`text-xs ${priceChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(priceChange).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Uptime pricing data not available for this day
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Explanation */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              How This Works
            </h4>
            <p className="text-xs text-muted-foreground">
              This tool calculates forecasted prices based on generation uptime scenarios. 
              Lower uptime (90%) means more hours at capacity constraints, resulting in higher prices during peak demand. 
              Higher uptime (97%) indicates better availability, leading to more stable pricing. 
              Prices are calculated using real AESO hourly demand and price forecast data.
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
