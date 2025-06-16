
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface EPAEmissionsData {
  region: string;
  air_quality_index: number;
  aqi_category: string;
  primary_pollutant: string;
  co2_emissions_tons_per_year: number;
  nox_emissions_tons_per_year: number;
  so2_emissions_tons_per_year: number;
  pm25_concentration: number;
  ozone_concentration: number;
  emission_sources: Array<{
    source: string;
    percentage: number;
  }>;
  renewable_energy_percent: number;
  carbon_intensity_lb_per_mwh: number;
  last_updated: string;
}

export interface NRELSolarData {
  region: string;
  annual_solar_irradiance_kwh_per_m2: number;
  peak_sun_hours: number;
  dni_average_kwh_per_m2_per_day: number;
  ghi_average_kwh_per_m2_per_day: number;
  temperature_coefficient: number;
  optimal_tilt_angle_degrees: number;
  solar_potential_rating: string;
  seasonal_variation: {
    summer_production_factor: number;
    winter_production_factor: number;
    spring_production_factor: number;
    fall_production_factor: number;
  };
  capacity_factor_percent: number;
  estimated_lcoe_cents_per_kwh: number;
  last_updated: string;
}

export function useEnergyData() {
  const [epaData, setEpaData] = useState<EPAEmissionsData | null>(null);
  const [solarData, setSolarData] = useState<NRELSolarData | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEnergyData = async (dataType: string, region?: string) => {
    setLoading(true);
    try {
      console.log('Fetching energy data:', dataType, region);
      
      const { data, error } = await supabase.functions.invoke('energy-data-integration', {
        body: {
          action: dataType,
          region
        }
      });

      if (error) {
        console.error('Energy Data API error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to fetch energy data');
      }

      console.log('Energy data received:', data);
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching energy data:', error);
      
      toast({
        title: "Error",
        description: `Failed to fetch ${dataType.replace('fetch_', '').replace('_', ' ')} data`,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getEPAEmissions = async (region?: string) => {
    const data = await fetchEnergyData('fetch_epa_emissions', region);
    if (data) {
      setEpaData(data);
    }
    return data;
  };

  const getNRELSolarData = async (region?: string) => {
    const data = await fetchEnergyData('fetch_nrel_solar', region);
    if (data) {
      setSolarData(data);
    }
    return data;
  };

  const getNOAAWeatherData = async (region?: string) => {
    const data = await fetchEnergyData('fetch_noaa_weather', region);
    if (data) {
      setWeatherData(data);
    }
    return data;
  };

  return {
    epaData,
    solarData,
    weatherData,
    loading,
    getEPAEmissions,
    getNRELSolarData,
    getNOAAWeatherData
  };
}
