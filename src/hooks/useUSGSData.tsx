
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ElevationData {
  latitude: number;
  longitude: number;
  elevation_feet: number;
  elevation_meters: number;
  data_source: string;
  query_date: string;
}

export interface LandUseData {
  latitude: number;
  longitude: number;
  primary_land_use: string;
  land_use_code: number;
  land_cover_classes: Array<{
    class: string;
    percentage: number;
    code: number;
  }>;
  impervious_surface_percent: number;
  tree_canopy_percent: number;
  nlcd_year: number;
  suitability_for_development: string;
  environmental_constraints: string[];
  query_date: string;
}

export interface GeologicalData {
  latitude: number;
  longitude: number;
  bedrock_type: string;
  geological_formation: string;
  soil_type: string;
  foundation_suitability: string;
  seismic_zone: string;
  flood_zone: string;
  groundwater_depth_feet: number;
  mineral_resources: string[];
  construction_considerations: string[];
  query_date: string;
}

export function useUSGSData() {
  const [elevationData, setElevationData] = useState<ElevationData | null>(null);
  const [landUseData, setLandUseData] = useState<LandUseData | null>(null);
  const [geologicalData, setGeologicalData] = useState<GeologicalData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUSGSData = async (dataType: string, coordinates: { latitude: number; longitude: number }) => {
    setLoading(true);
    try {
      console.log('Fetching USGS data:', dataType, coordinates);
      
      const { data, error } = await supabase.functions.invoke('usgs-data-integration', {
        body: {
          action: dataType,
          coordinates
        }
      });

      if (error) {
        console.error('USGS API error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to fetch USGS data');
      }

      console.log('USGS data received:', data);
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching USGS data:', error);
      
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

  const getElevationData = async (coordinates: { latitude: number; longitude: number }) => {
    const data = await fetchUSGSData('fetch_elevation_data', coordinates);
    if (data) {
      setElevationData(data);
    }
    return data;
  };

  const getLandUseData = async (coordinates: { latitude: number; longitude: number }) => {
    const data = await fetchUSGSData('fetch_land_use_data', coordinates);
    if (data) {
      setLandUseData(data);
    }
    return data;
  };

  const getGeologicalData = async (coordinates: { latitude: number; longitude: number }) => {
    const data = await fetchUSGSData('fetch_geological_data', coordinates);
    if (data) {
      setGeologicalData(data);
    }
    return data;
  };

  const getWaterData = async (coordinates: { latitude: number; longitude: number }) => {
    return await fetchUSGSData('fetch_water_data', coordinates);
  };

  return {
    elevationData,
    landUseData,
    geologicalData,
    loading,
    getElevationData,
    getLandUseData,
    getGeologicalData,
    getWaterData
  };
}
