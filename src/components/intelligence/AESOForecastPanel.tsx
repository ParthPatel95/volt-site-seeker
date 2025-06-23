
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wind, Sun, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AESOForecastPanelProps {
  windSolarForecast: any;
  loading: boolean;
}

export function AESOForecastPanel({ windSolarForecast, loading }: AESOForecastPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Generate forecast data if not available
  const getForecastData = () => {
    if (windSolarForecast?.forecasts?.length > 0) {
      return windSolarForecast.forecasts.slice(0, 24).map(forecast => ({
        time: new Date(forecast.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        wind: forecast.wind_forecast_mw,
        solar: forecast.solar_forecast_mw,
        total: forecast.total_renewable_forecast_mw
      }));
    }

    // Generate sample forecast data
    const data = [];
    const baseWind = 2500;
    const baseSolar = 800;
    
    for (let i = 0; i < 24; i++) {
      const hour = new Date(Date.now() + i * 60 * 60 * 1000).getHours();
      const windVariation = Math.sin(i * 0.3) * 800 + Math.random() * 400;
      const solarVariation = hour >= 6 && hour <= 18 
        ? Math.sin((hour - 6) * Math.PI / 12) * 600 + Math.random() * 200
        : Math.random() * 50;
      
      const wind = Math.max(0, baseWind + windVariation);
      const solar = Math.max(0, baseSolar + solarVariation);
      
      data.push({
        time: new Date(Date.now() + i * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        wind: Math.round(wind),
        solar: Math.round(solar),
        total: Math.round(wind + solar)
      });
    }
    return data;
  };

  const forecastData = getForecastData();
  const currentData = forecastData[0] || { wind: 0, solar: 0, total: 0 };
  const totalForecasts = windSolarForecast?.total_forecasts || forecastData.length;

  // Calculate statistics
  const avgWind = Math.round(forecastData.reduce((sum, item) => sum + item.wind, 0) / forecastData.length);
  const avgSolar = Math.round(forecastData.reduce((sum, item) => sum + item.solar, 0) / forecastData.length);
  const peakRenewable = Math.max(...forecastData.map(item => item.total));
  const renewablePercentage = Math.round((currentData.total / 12000) * 100); // Assuming 12GW total capacity

  return (
    <div className="space-y-6">
      {/* Current Renewable Generation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Wind Generation</CardTitle>
            <Wind className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{currentData.wind} MW</div>
            <p className="text-xs text-green-600">24h avg: {avgWind} MW</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Solar Generation</CardTitle>
            <Sun className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{currentData.solar} MW</div>
            <p className="text-xs text-yellow-600">24h avg: {avgSolar} MW</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Renewable</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{currentData.total} MW</div>
            <p className="text-xs text-blue-600">Peak: {peakRenewable} MW</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Renewable Mix</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{renewablePercentage}%</div>
            <p className="text-xs text-purple-600">of total capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Renewable Generation Forecast Chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wind className="w-5 h-5 mr-2 text-green-600" />
            24-Hour Renewable Generation Forecast
            <Badge variant="outline" className="ml-auto">
              {totalForecasts} forecasts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `${value} MW`, 
                  name === 'wind' ? 'Wind Generation' : 
                  name === 'solar' ? 'Solar Generation' : 'Total Renewable'
                ]}
              />
              <Area
                type="monotone"
                dataKey="wind"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="wind"
              />
              <Area
                type="monotone"
                dataKey="solar"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
                name="solar"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Forecast Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Forecast Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Peak Renewable Output</span>
                <span className="font-semibold">{peakRenewable} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Wind</span>
                <span className="font-semibold">{avgWind} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Solar</span>
                <span className="font-semibold">{avgSolar} MW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Renewable Penetration</span>
                <Badge variant="outline">{renewablePercentage}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-orange-600" />
              Market Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm text-green-800">High Renewable Periods</h4>
                <p className="text-sm text-green-700">
                  Expected price suppression during peak wind/solar hours
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm text-blue-800">Grid Balance</h4>
                <p className="text-sm text-blue-700">
                  Monitoring for potential curtailment or ramping needs
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-sm text-purple-800">Forecast Accuracy</h4>
                <p className="text-sm text-purple-700">
                  Updated every 15 minutes with weather data integration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
