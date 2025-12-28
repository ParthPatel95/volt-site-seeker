
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wind, Sun, Zap, TrendingUp, Info } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AESOForecastPanelProps {
  windSolarForecast: any;
  loading: boolean;
}

export function AESOForecastPanel({ windSolarForecast, loading }: AESOForecastPanelProps) {
  // Check if we have real data
  const hasRealData = windSolarForecast?.forecasts?.length > 0;
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // NO FAKE DATA - Only show real data or "No Data" message
  if (!hasRealData) {
    return (
      <div className="space-y-6">
        <Alert className="border-muted bg-muted/50">
          <Info className="h-4 w-4 text-muted-foreground" />
          <AlertDescription className="text-muted-foreground">
            <span className="font-medium">No Wind/Solar Data Available</span> — Real-time renewable generation data 
            is currently unavailable. Please check back later or verify database connectivity.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Use ONLY real data - no fallback generation
  const forecastData = windSolarForecast.forecasts.slice(0, 24).map((forecast: any) => ({
    time: new Date(forecast.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    wind: forecast.wind_forecast_mw,
    solar: forecast.solar_forecast_mw,
    total: forecast.total_renewable_forecast_mw
  }));

  const currentData = forecastData[forecastData.length - 1] || { wind: 0, solar: 0, total: 0 };
  const totalForecasts = windSolarForecast.total_forecasts;

  // Calculate statistics from REAL data
  const avgWind = Math.round(forecastData.reduce((sum: number, item: any) => sum + item.wind, 0) / forecastData.length);
  const avgSolar = Math.round(forecastData.reduce((sum: number, item: any) => sum + item.solar, 0) / forecastData.length);
  const peakRenewable = Math.max(...forecastData.map((item: any) => item.total));
  const renewablePercentage = Math.round((currentData.total / 12000) * 100);

  return (
    <div className="space-y-6">
      {/* Current Renewable Generation Overview - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Wind Generation</CardTitle>
            <div className="flex items-center gap-1">
              <Badge className="text-xs bg-green-100 text-green-800 border-green-300">Live</Badge>
              <Wind className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{currentData.wind} MW</div>
            <p className="text-xs text-green-600 dark:text-green-400">24h avg: {avgWind} MW</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950 dark:to-orange-950 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Solar Generation</CardTitle>
            <div className="flex items-center gap-1">
              <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">Live</Badge>
              <Sun className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{currentData.solar} MW</div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">24h avg: {avgSolar} MW</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Renewable</CardTitle>
            <div className="flex items-center gap-1">
              <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-300">Live</Badge>
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{currentData.total} MW</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">Peak: {peakRenewable} MW</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 dark:from-purple-950 dark:to-violet-950 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Renewable Mix</CardTitle>
            <div className="flex items-center gap-1">
              <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-300">Live</Badge>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{renewablePercentage}%</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">of total capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Renewable Generation Chart - REAL DATA ONLY */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center flex-wrap gap-2">
            <Wind className="w-5 h-5 text-green-600" />
            24-Hour Renewable Generation
            <div className="ml-auto flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Live Data
              </Badge>
              <Badge variant="outline">
                {totalForecasts} records
              </Badge>
            </div>
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

      {/* Real Data Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Generation Insights
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
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <h4 className="font-semibold text-sm text-green-800 dark:text-green-200">High Renewable Periods</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Price suppression during peak wind/solar generation
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200">Grid Balance</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Monitoring curtailment and ramping needs
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <h4 className="font-semibold text-sm text-purple-800 dark:text-purple-200">Data Source</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Real-time AESO generation data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
