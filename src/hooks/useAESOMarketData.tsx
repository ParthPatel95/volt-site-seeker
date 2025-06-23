
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AESOSystemMarginalPrice {
  price: number;
  timestamp: string;
  forecast_pool_price: number;
  begin_datetime_mpt: string;
}

export interface AESOOperatingReserve {
  total_reserve_mw: number;
  spinning_reserve_mw: number;
  supplemental_reserve_mw: number;
  timestamp: string;
}

export interface AESOInterchange {
  alberta_british_columbia: number;
  alberta_saskatchewan: number;
  alberta_montana: number;
  total_net_interchange: number;
  timestamp: string;
}

export interface AESOTransmissionConstraints {
  constraints: Array<{
    constraint_name: string;
    status: string;
    limit_mw: number;
    flow_mw: number;
  }>;
  timestamp: string;
}

export interface AESOEnergyStorage {
  charging_mw: number;
  discharging_mw: number;
  net_storage_mw: number;
  state_of_charge_percent: number;
  timestamp: string;
}

export function useAESOMarketData() {
  const [systemMarginalPrice, setSystemMarginalPrice] = useState<AESOSystemMarginalPrice | null>(null);
  const [operatingReserve, setOperatingReserve] = useState<AESOOperatingReserve | null>(null);
  const [interchange, setInterchange] = useState<AESOInterchange | null>(null);
  const [transmissionConstraints, setTransmissionConstraints] = useState<AESOTransmissionConstraints | null>(null);
  const [energyStorage, setEnergyStorage] = useState<AESOEnergyStorage | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'fallback'>('connecting');
  const { toast } = useToast();

  const fetchAESOMarketData = async (dataType: string) => {
    setLoading(true);
    try {
      console.log('Fetching AESO market data:', dataType);
      
      const { data, error } = await supabase.functions.invoke('aeso-data-integration', {
        body: {
          action: dataType
        }
      });

      if (error) {
        console.error('AESO Market API error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to fetch AESO market data');
      }

      console.log('AESO market data received:', data);
      
      // Update connection status based on data source
      if (data?.source === 'aeso_api') {
        setConnectionStatus('connected');
      } else if (data?.source === 'fallback') {
        setConnectionStatus('fallback');
        if (connectionStatus !== 'fallback') {
          toast({
            title: "AESO API Info",
            description: "Check AESO API key configuration - using simulated data",
            variant: "default"
          });
        }
      }
      
      return data?.data || data;

    } catch (error: any) {
      console.error('Error fetching AESO market data:', error);
      setConnectionStatus('fallback');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSystemMarginalPrice = async () => {
    const data = await fetchAESOMarketData('fetch_system_marginal_price');
    if (data) {
      setSystemMarginalPrice(data);
    }
    return data;
  };

  const getOperatingReserve = async () => {
    const data = await fetchAESOMarketData('fetch_operating_reserve');
    if (data) {
      setOperatingReserve(data);
    }
    return data;
  };

  const getInterchange = async () => {
    const data = await fetchAESOMarketData('fetch_interchange');
    if (data) {
      setInterchange(data);
    }
    return data;
  };

  const getTransmissionConstraints = async () => {
    const data = await fetchAESOMarketData('fetch_transmission_constraints');
    if (data) {
      setTransmissionConstraints(data);
    }
    return data;
  };

  const getEnergyStorage = async () => {
    const data = await fetchAESOMarketData('fetch_energy_storage');
    if (data) {
      setEnergyStorage(data);
    }
    return data;
  };

  // Auto-fetch all market data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        getSystemMarginalPrice(),
        getOperatingReserve(),
        getInterchange(),
        getTransmissionConstraints(),
        getEnergyStorage()
      ]);
    };

    fetchAllData();
    
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    systemMarginalPrice,
    operatingReserve,
    interchange,
    transmissionConstraints,
    energyStorage,
    loading,
    connectionStatus,
    getSystemMarginalPrice,
    getOperatingReserve,
    getInterchange,
    getTransmissionConstraints,
    getEnergyStorage,
    refetch: () => {
      getSystemMarginalPrice();
      getOperatingReserve();
      getInterchange();
      getTransmissionConstraints();
      getEnergyStorage();
    }
  };
}
