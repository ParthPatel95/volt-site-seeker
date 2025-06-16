
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wind, 
  Sun, 
  Thermometer,
  CloudRain,
  Leaf,
  RefreshCw,
  Search
} from 'lucide-react';
import { useEnergyData } from '@/hooks/useEnergyData';

export function EnvironmentalDashboard() {
  const { 
    epaData, 
    solarData, 
    weatherData, 
    loading,
    getEPAEmissions,
    getNRELSolarData,
    getNOAAWeatherData
  } = useEnergyData();

  const [region, setRegion] = useState('Texas');

  useEffect(() => {
    // Load default data for Texas
    getEPAEmissions('Texas');
    getNRELSolarData('Texas');
    getNOAAWeatherData('Texas');
  }, []);

  const handleRegionSearch = async () => {
    if (!region.trim()) return;
    
    try {
      await Promise.all([
        getEPAEmissions(region),
        getNRELSolarData(region),
        getNOAAWeatherData(region)
      ]);
    } catch (error) {
      console.error('Error fetching environmental data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Environmental Dashboard</h2>
          <p className="text-muted-foreground">EPA air quality, NREL solar data, and NOAA weather information</p>
        </div>
      </div>

      {/* Region Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-green-600" />
            Regional Environmental Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="region">Region/State</Label>
              <Input
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Enter state or region name"
              />
            </div>
            <Button 
              onClick={handleRegionSearch}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Search className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Air Quality Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wind className="w-5 h-5 mr-2 text-blue-600" />
            Air Quality & Emissions (EPA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {epaData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Air Quality Index</p>
                  <p className="text-2xl font-bold">{epaData.air_quality_index}</p>
                  <Badge variant={epaData.aqi_category === 'Good' ? 'default' : 'destructive'}>
                    {epaData.aqi_category}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Primary Pollutant</p>
                  <p className="text-xl font-semibold">{epaData.primary_pollutant}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">PM2.5 Concentration</p>
                  <p className="text-xl font-semibold">{epaData.pm25_concentration} μg/m³</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Renewable Energy</p>
                  <p className="text-xl font-semibold">{epaData.renewable_energy_percent}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">Annual Emissions (tons/year)</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CO₂ Emissions</span>
                      <span className="font-medium">{epaData.co2_emissions_tons_per_year.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">NOx Emissions</span>
                      <span className="font-medium">{epaData.nox_emissions_tons_per_year.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">SO₂ Emissions</span>
                      <span className="font-medium">{epaData.so2_emissions_tons_per_year.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-3">Emission Sources</p>
                  <div className="space-y-2">
                    {epaData.emission_sources.map((source, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{source.source}</span>
                        <Badge variant="outline">{source.percentage}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Carbon Intensity</span>
                  <Badge variant="secondary">
                    {epaData.carbon_intensity_lb_per_mwh} lb CO₂/MWh
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Wind className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading EPA air quality data...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Solar Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="w-5 h-5 mr-2 text-yellow-600" />
              Solar Resource Data (NREL)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {solarData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Sun Hours</p>
                    <p className="text-2xl font-bold">{solarData.peak_sun_hours}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Solar Potential</p>
                    <Badge variant="default">{solarData.solar_potential_rating}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Annual Solar Irradiance</span>
                    <span className="font-medium">{solarData.annual_solar_irradiance_kwh_per_m2} kWh/m²</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Capacity Factor</span>
                    <span className="font-medium">{solarData.capacity_factor_percent}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Optimal Tilt Angle</span>
                    <span className="font-medium">{solarData.optimal_tilt_angle_degrees}°</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Est. LCOE</span>
                    <span className="font-medium">{solarData.estimated_lcoe_cents_per_kwh}¢/kWh</span>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">Seasonal Production Factors</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Summer:</span>
                      <span>{solarData.seasonal_variation.summer_production_factor.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Winter:</span>
                      <span>{solarData.seasonal_variation.winter_production_factor.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spring:</span>
                      <span>{solarData.seasonal_variation.spring_production_factor.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fall:</span>
                      <span>{solarData.seasonal_variation.fall_production_factor.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sun className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">Loading solar resource data...</p>
              </div>
            )}
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
