
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudRain } from 'lucide-react';

interface NOAAWeatherCardProps {
  weatherData: any;
}

export function NOAAWeatherCard({ weatherData }: NOAAWeatherCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CloudRain className="w-5 h-5 mr-2 text-blue-600" />
          Weather Data (NOAA)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {weatherData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">{weatherData.current_temperature_f}°F</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conditions</p>
                <Badge variant="outline">{weatherData.weather_conditions}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Humidity</span>
                <span className="font-medium">{weatherData.current_humidity_percent}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Wind Speed</span>
                <span className="font-medium">{weatherData.wind_speed_mph} mph {weatherData.wind_direction}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Barometric Pressure</span>
                <span className="font-medium">{weatherData.barometric_pressure_inHg}" Hg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Visibility</span>
                <span className="font-medium">{weatherData.visibility_miles} miles</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Historical Averages</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Annual Avg Temp:</span>
                  <span>{weatherData.historical_averages.annual_avg_temp_f}°F</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Precipitation:</span>
                  <span>{weatherData.historical_averages.annual_precipitation_inches}"</span>
                </div>
                <div className="flex justify-between">
                  <span>Heating Degree Days:</span>
                  <span>{weatherData.historical_averages.heating_degree_days}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cooling Degree Days:</span>
                  <span>{weatherData.historical_averages.cooling_degree_days}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Weather Risk Assessment</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Tornado Risk:</span>
                  <Badge variant="outline" className="text-xs">{weatherData.extreme_weather_risk.tornado_risk}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Hurricane Risk:</span>
                  <Badge variant="outline" className="text-xs">{weatherData.extreme_weather_risk.hurricane_risk}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Hail Risk:</span>
                  <Badge variant="outline" className="text-xs">{weatherData.extreme_weather_risk.hail_risk}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Drought Risk:</span>
                  <Badge variant="outline" className="text-xs">{weatherData.extreme_weather_risk.drought_risk}</Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CloudRain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Loading weather data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
