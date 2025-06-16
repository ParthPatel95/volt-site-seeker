
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wind } from 'lucide-react';

interface EPAAirQualityCardProps {
  epaData: any;
}

export function EPAAirQualityCard({ epaData }: EPAAirQualityCardProps) {
  return (
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
                  {epaData.emission_sources.map((source: any, index: number) => (
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
  );
}
