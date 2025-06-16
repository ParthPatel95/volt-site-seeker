
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
  const { toast } = useToast();

  const fetchEIAData = async (request: EIARequest) => {
    setLoading(true);
    try {
      console.log('Fetching EIA data:', request);
      
      const { data, error } = await supabase.functions.invoke('eia-data-integration', {
        body: request
      });

      if (error) throw error;

      switch (request.action) {
        case 'get_power_plants':
          setPowerPlants(data.power_plants || []);
          toast({
            title: "Real EIA Data Loaded",
            description: `Found ${data.power_plants?.length || 0} power plants from official government data`,
          });
          break;
          
        case 'get_energy_prices':
          setEnergyPrices(data.energy_prices || []);
          toast({
            title: "Energy Prices Updated",
            description: `Loaded real pricing data from EIA`,
          });
          break;
          
        case 'get_transmission_lines':
          setTransmissionData(data.transmission_data || null);
          toast({
            title: "Transmission Data Loaded",
            description: `Real transmission infrastructure data from EIA`,
          });
          break;
          
        case 'get_generation_data':
          setGenerationData(data.generation_data || []);
          toast({
            title: "Generation Data Updated",
            description: `Real power generation statistics from EIA`,
          });
          break;
      }

      return data;
    } catch (error: any) {
      console.error('EIA data error:', error);
      toast({
        title: "EIA Data Error",
        description: error.message || "Failed to fetch EIA data",
        variant: "destructive"
      });
      throw error;
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

  return {
    loading,
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
    setGenerationData
  };
}
