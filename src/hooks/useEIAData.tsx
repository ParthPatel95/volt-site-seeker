
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EIARequest {
  action: 'get_power_plants' | 'get_transmission_lines' | 'get_energy_prices' | 'get_generation_data';
  state?: string;
  region?: string;
  coordinates?: { lat: number; lng: number; radius?: number };
  fuel_type?: string;
}

interface PowerPlant {
  id: string;
  name: string;
  state: string;
  capacity_mw: number;
  fuel_type: string;
  utility_name: string;
  coordinates: { lat: number; lng: number };
  operational_status: string;
  commissioning_year?: number;
  data_source: string;
  last_updated: string;
}

interface EnergyPrice {
  period: string;
  price_cents_per_kwh: number;
  revenue_thousand_dollars: number;
  sales_thousand_mwh: number;
  state: string;
  sector: string;
}

export function useEIAData() {
  const [loading, setLoading] = useState(false);
  const [powerPlants, setPowerPlants] = useState<PowerPlant[]>([]);
  const [energyPrices, setEnergyPrices] = useState<EnergyPrice[]>([]);
  const [transmissionData, setTransmissionData] = useState<any>(null);
  const [generationData, setGenerationData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEIAData = async (request: EIARequest) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching EIA data:', request);
      
      const { data, error: fetchError } = await supabase.functions.invoke('eia-data-integration', {
        body: request
      });

      if (fetchError) {
        console.error('EIA function error:', fetchError);
        setError('EIA API temporarily unavailable');
        toast({
          title: "EIA Data Unavailable",
          description: "Unable to fetch EIA data. Please try again later.",
          variant: "destructive"
        });
        return { success: false, error: fetchError.message };
      }

      if (!data?.success) {
        console.warn('EIA API returned unsuccessful response:', data);
        setError('No data available from EIA API');
        return { success: false, error: 'No data available' };
      }

      switch (request.action) {
        case 'get_power_plants':
          setPowerPlants(data.power_plants || []);
          if (data.power_plants?.length > 0) {
            toast({
              title: "EIA Data Loaded",
              description: `Found ${data.power_plants.length} power plants`,
            });
          }
          break;
          
        case 'get_energy_prices':
          setEnergyPrices(data.energy_prices || []);
          if (data.energy_prices?.length > 0) {
            toast({
              title: "Energy Prices Updated",
              description: "Latest pricing data loaded",
            });
          }
          break;
          
        case 'get_transmission_lines':
          setTransmissionData(data.transmission_data || null);
          if (data.transmission_data) {
            toast({
              title: "Transmission Data Loaded",
              description: "Infrastructure data updated",
            });
          }
          break;
          
        case 'get_generation_data':
          setGenerationData(data.generation_data || []);
          if (data.generation_data?.length > 0) {
            toast({
              title: "Generation Data Updated",
              description: "Power generation statistics loaded",
            });
          }
          break;
      }

      return data;
    } catch (err: any) {
      console.error('EIA data error:', err);
      setError('Failed to fetch EIA data');
      
      toast({
        title: "EIA Data Error",
        description: "Unable to fetch data from EIA. Please try again later.",
        variant: "destructive"
      });
      
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getPowerPlantsByState = async (state: string, fuel_type?: string) => {
    return fetchEIAData({
      action: 'get_power_plants',
      state: state.toUpperCase(),
      fuel_type
    });
  };

  const getEnergyPricesByRegion = async (region?: string) => {
    return fetchEIAData({
      action: 'get_energy_prices',
      region
    });
  };

  const getTransmissionDataByState = async (state: string) => {
    return fetchEIAData({
      action: 'get_transmission_lines',
      state: state.toUpperCase()
    });
  };

  const getGenerationDataByState = async (state: string, fuel_type?: string) => {
    return fetchEIAData({
      action: 'get_generation_data',
      state: state.toUpperCase(),
      fuel_type
    });
  };

  const clearData = () => {
    setPowerPlants([]);
    setEnergyPrices([]);
    setTransmissionData(null);
    setGenerationData([]);
    setError(null);
  };

  return {
    loading,
    error,
    powerPlants,
    energyPrices,
    transmissionData,
    generationData,
    getPowerPlantsByState,
    getEnergyPricesByRegion,
    getTransmissionDataByState,
    getGenerationDataByState,
    setPowerPlants,
    setEnergyPrices,
    setTransmissionData,
    setGenerationData,
    clearData
  };
}
