
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sun } from 'lucide-react';

interface NRELSolarCardProps {
  solarData: any;
}

export function NRELSolarCard({ solarData }: NRELSolarCardProps) {
  return (
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
  );
}
