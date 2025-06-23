
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wind, Sun, Zap, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AESOForecastPanelProps {
  windSolarForecast: any;
  loading: boolean;
}

export function AESOForecastPanel({ windSolarForecast, loading }: AESOForecastPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const forecastData = windSolarForecast?.forecasts?.slice(0, 24).map(forecast => ({
    time: new Date(forecast.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    wind: forecast.wind_forecast_mw / 1000, // Convert to GW
    solar: forecast.solar_forecast_mw / 1000,
    total: forecast.total_renewable_forecast_mw / 1000
  })) || [];

  const totalWindForecast = windSolarForecast?.forecasts?.reduce((sum, f) => sum + f.wind_forecast_mw, 0) / windSolarForecast?.forecasts?.length || 0;
  const totalSolarForecast = windSolarForecast?.forecasts?.reduce((sum, f) => sum + f.solar_forecast_mw, 0) / windSolarForecast?.forecasts?.length || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Renewable Generation Forecast Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-green-600" />
            24-Hour Renewable Generation Forecast
            {windSolarForecast?.timestamp && (
              <Badge variant="outline" className="ml-auto">
                Updated: {new Date(windSolarForecast.timestamp).toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value.toFixed(2)} GW`, 
                    name === 'wind' ? 'Wind' : name === 'solar' ? 'Solar' : 'Total Renewable'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="wind" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="solar" 
                  stackId="1"
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading renewable forecast...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wind Forecast Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wind className="w-5 h-5 mr-2 text-green-600" />
            Wind Generation Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {windSolarForecast ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(totalWindForecast / 1000).toFixed(1)} GW
                </div>
                <p className="text-sm text-muted-foreground">Average Forecasted Output</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Peak Forecast</span>
                  <span className="font-semibold">
                    {Math.max(...windSolarForecast.forecasts.map(f => f.wind_forecast_mw / 1000)).toFixed(1)} GW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Low Forecast</span>
                  <span className="font-semibold">
                    {Math.min(...windSolarForecast.forecasts.map(f => f.wind_forecast_mw / 1000)).toFixed(1)} GW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Forecasts Available</span>
                  <span className="font-semibold">{windSolarForecast.total_forecasts}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1 text-green-800">Wind Outlook</h4>
                <p className="text-sm text-green-700">
                  {totalWindForecast > 2000 ? 
                    'Strong wind generation expected - favorable for renewable energy supply' :
                    'Moderate wind generation forecasted - potential for thermal backup needs'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Wind className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading wind forecast...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solar Forecast Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="w-5 h-5 mr-2 text-yellow-600" />
            Solar Generation Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {windSolarForecast ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {(totalSolarForecast / 1000).toFixed(1)} GW
                </div>
                <p className="text-sm text-muted-foreground">Average Forecasted Output</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Peak Forecast</span>
                  <span className="font-semibold">
                    {Math.max(...windSolarForecast.forecasts.map(f => f.solar_forecast_mw / 1000)).toFixed(1)} GW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Night Hours</span>
                  <span className="font-semibold">
                    {windSolarForecast.forecasts.filter(f => f.solar_forecast_mw === 0).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Production Hours</span>
                  <span className="font-semibold">
                    {windSolarForecast.forecasts.filter(f => f.solar_forecast_mw > 0).length}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1 text-yellow-800">Solar Outlook</h4>
                <p className="text-sm text-yellow-700">
                  {totalSolarForecast > 1000 ? 
                    'High solar irradiance expected - peak generation during midday hours' :
                    'Moderate solar conditions - consider backup generation during peak demand'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Sun className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading solar forecast...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecast Summary Table */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Hourly Forecast Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {windSolarForecast?.forecasts ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Time</th>
                    <th className="text-right p-2">Wind (MW)</th>
                    <th className="text-right p-2">Solar (MW)</th>
                    <th className="text-right p-2">Total (MW)</th>
                    <th className="text-right p-2">% of Peak</th>
                  </tr>
                </thead>
                <tbody>
                  {windSolarForecast.forecasts.slice(0, 12).map((forecast, index) => {
                    const maxTotal = Math.max(...windSolarForecast.forecasts.map(f => f.total_renewable_forecast_mw));
                    const percentage = (forecast.total_renewable_forecast_mw / maxTotal) * 100;
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {new Date(forecast.datetime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </td>
                        <td className="text-right p-2 font-mono">
                          {forecast.wind_forecast_mw.toFixed(0)}
                        </td>
                        <td className="text-right p-2 font-mono">
                          {forecast.solar_forecast_mw.toFixed(0)}
                        </td>
                        <td className="text-right p-2 font-mono font-semibold">
                          {forecast.total_renewable_forecast_mw.toFixed(0)}
                        </td>
                        <td className="text-right p-2">
                          <Badge variant={percentage > 75 ? 'default' : percentage > 50 ? 'secondary' : 'outline'}>
                            {percentage.toFixed(0)}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading forecast breakdown...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
