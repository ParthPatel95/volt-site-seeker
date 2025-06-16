
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud,
  Sun,
  Thermometer,
  Wind,
  Droplets,
  Factory,
  Leaf,
  RefreshCw
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

  useEffect(() => {
    getEPAEmissions('Texas');
    getNRELSolarData('Texas');
    getNOAAWeatherData('Texas');
  }, []);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'default';
    if (aqi <= 100) return 'secondary';
    if (aqi <= 150) return 'outline';
    return 'destructive';
  };

  const getSolarRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent': return 'default';
      case 'very good': case 'good': return 'secondary';
      case 'fair': return 'outline';
      default: return 'destructive';
    }
  };

  const refetchAll = () => {
    getEPAEmissions('Texas');
    getNRELSolarData('Texas');
    getNOAAWeatherData('Texas');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Environmental & Energy Data</h2>
          <p className="text-muted-foreground">EPA emissions, NREL solar potential, and NOAA weather data</p>
        </div>
        <Button 
          onClick={refetchAll}
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-blue-600"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* EPA Air Quality */}
      {epaData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-blue-600" />
              Air Quality & Emissions (EPA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Air Quality Index</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{epaData.air_quality_index}</p>
                    <Badge variant={getAQIColor(epaData.air_quality_index)}>
                      {epaData.aqi_category}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Primary Pollutant</p>
                  <p className="text-lg font-semibold">{epaData.primary_pollutant}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renewable Energy</p>
                  <p className="text-2xl font-bold text-green-600">{epaData.renewable_energy_percent}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Carbon Intensity</p>
                  <p className="text-lg font-semibold">{epaData.carbon_intensity_lb_per_mwh} lb/MWh</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Emission Sources</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {epaData.emission_sources.map((source, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{source.source}</span>
                      <Badge variant="outline">{source.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Factory className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-muted-foreground">CO₂ Emissions</p>
                    <p className="font-semibold">{epaData.co2_emissions_tons_per_year.toLocaleString()} tons/year</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-muted-foreground">NOₓ Emissions</p>
                    <p className="font-semibold">{epaData.nox_emissions_tons_per_year.toLocaleString()} tons/year</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-muted-foreground">PM2.5 Concentration</p>
                    <p className="font-semibold">{epaData.pm25_concentration} μg/m³</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NREL Solar Data */}
      {solarData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="w-5 h-5 mr-2 text-yellow-600" />
              Solar Resource Potential (NREL)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Solar Potential</p>
                  <Badge variant={getSolarRatingColor(solarData.solar_potential_rating)}>
                    {solarData.solar_potential_rating}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Peak Sun Hours</p>
                  <p className="text-2xl font-bold">{solarData.peak_sun_hours}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity Factor</p>
                  <p className="text-2xl font-bold">{solarData.capacity_factor_percent}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">LCOE Estimate</p>
                  <p className="text-lg font-semibold">{solarData.estimated_lcoe_cents_per_kwh}¢/kWh</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Irradiance</p>
                  <p className="font-semibold">{solarData.annual_solar_irradiance_kwh_per_m2} kWh/m²</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Optimal Tilt Angle</p>
                  <p className="font-semibold">{solarData.optimal_tilt_angle_degrees}°</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temperature Coefficient</p>
                  <p className="font-semibold">{solarData.temperature_coefficient}/°C</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Seasonal Production Factors</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Summer</p>
                    <p className="font-bold">{solarData.seasonal_variation.summer_production_factor}x</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Fall</p>
                    <p className="font-bold">{solarData.seasonal_variation.fall_production_factor}x</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Winter</p>
                    <p className="font-bold">{solarData.seasonal_variation.winter_production_factor}x</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Spring</p>
                    <p className="font-bold">{solarData.seasonal_variation.spring_production_factor}x</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NOAA Weather Data */}
      {weatherData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Thermometer className="w-5 h-5 mr-2 text-red-600" />
              Weather & Climate Data (NOAA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Temperature</p>
                  <p className="text-2xl font-bold">{weatherData.current_temperature_f}°F</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="text-2xl font-bold">{weatherData.current_humidity_percent}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                  <p className="text-xl font-bold">{weatherData.wind_speed_mph} mph</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conditions</p>
                  <p className="font-semibold">{weatherData.weather_conditions}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Climate Averages</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-muted-foreground">Annual Avg Temp</p>
                      <p className="font-semibold">{weatherData.historical_averages.annual_avg_temp_f}°F</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-muted-foreground">Annual Precipitation</p>
                      <p className="font-semibold">{weatherData.historical_averages.annual_precipitation_inches}"</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Leaf className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-muted-foreground">Cooling Degree Days</p>
                      <p className="font-semibold">{weatherData.historical_averages.cooling_degree_days}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Extreme Weather Risk</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(weatherData.extreme_weather_risk).map(([risk, level]) => (
                    <div key={risk} className="text-center p-2 bg-muted rounded">
                      <p className="text-xs text-muted-foreground capitalize">{risk.replace('_', ' ')}</p>
                      <Badge variant={level === 'Low' ? 'default' : level === 'Moderate' ? 'secondary' : 'destructive'}>
                        {level as string}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
