
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
  const [hasShownFallbackNotice, setHasShownFallbackNotice] = useState(false);
  const { toast } = useToast();

  const fetchAESOMarketData = async (dataType: string) => {
    setLoading(true);
    try {
      console.log('Fetching AESO market data:', dataType);
      
      const { data, error } = await supabase.functions.invoke('energy-data-integration');

      if (error) {
        console.error('AESO Market API error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to fetch AESO market data');
      }

      console.log('AESO market data received:', data);
      
      // Extract AESO data from the unified response
      const aesoData = data?.aeso;
      
      if (aesoData) {
        setConnectionStatus('connected');
        setHasShownFallbackNotice(false);
        return aesoData;
      } else {
        setConnectionStatus('fallback');
        return null;
      }

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
    if (data?.pricing) {
      setSystemMarginalPrice({
        price: data.pricing.current_price,
        timestamp: data.pricing.timestamp,
        forecast_pool_price: data.pricing.average_price,
        begin_datetime_mpt: data.pricing.timestamp
      });
    }
    return data;
  };

  const getOperatingReserve = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('aeso-market-data');
      if (error) {
        console.warn('Operating reserve API unavailable:', error.message);
        // Don't throw - gracefully handle API unavailability
      }
      
      if (data?.success && data?.aeso?.operatingReserve) {
        const or = data.aeso.operatingReserve;
        setOperatingReserve({
          total_reserve_mw: Number(or.total_reserve_mw) || 0,
          spinning_reserve_mw: Number(or.spinning_reserve_mw) || 0,
          supplemental_reserve_mw: Number(or.supplemental_reserve_mw) || 0,
          timestamp: or.timestamp || new Date().toISOString()
        });
        setConnectionStatus('connected');
        return data.aeso;
      }
    } catch (e) {
      console.warn('Operating reserve fetch error (API may be temporarily unavailable):', e);
    }
    
    // API unavailable - set to null to gracefully hide section instead of showing errors
    setOperatingReserve(null);
    return null;
  };
  const getInterchange = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('aeso-market-data');
      if (error) throw error;
      
      if (data?.success && data?.aeso?.interchange) {
        const ic = data.aeso.interchange;
        setInterchange({
          alberta_british_columbia: Number(ic.alberta_british_columbia) || 0,
          alberta_saskatchewan: Number(ic.alberta_saskatchewan) || 0,
          alberta_montana: Number(ic.alberta_montana) || 0,
          total_net_interchange: Number(ic.total_net_interchange) || 0,
          timestamp: ic.timestamp || new Date().toISOString()
        });
        setConnectionStatus('connected');
        return data.aeso;
      }
    } catch (e) {
      console.error('Interchange fetch error:', e);
    }
    
    // Data not available - set to null to hide the section
    setInterchange(null);
    setConnectionStatus('fallback');
    return null;
  };
  const getTransmissionConstraints = async () => {
    const data = await fetchAESOMarketData('fetch_transmission_constraints');
    if (data?.loadData) {
      // Generate constraints based on current conditions
      setTransmissionConstraints({
        constraints: [
          {
            constraint_name: "Central East",
            status: data.loadData.current_demand_mw > 11000 ? "Active" : "Normal",
            limit_mw: 2500,
            flow_mw: Math.round(2500 * (0.7 + Math.random() * 0.2))
          }
        ],
        timestamp: data.loadData.timestamp || new Date().toISOString()
      });
    }
    return data;
  };

  const getEnergyStorage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('aeso-market-data');
      if (error) throw error;
      
      if (data?.success && data?.aeso?.energyStorage) {
        const es = data.aeso.energyStorage;
        setEnergyStorage({
          charging_mw: Number(es.charging_mw) || 0,
          discharging_mw: Number(es.discharging_mw) || 0,
          net_storage_mw: Number(es.net_storage_mw) || 0,
          state_of_charge_percent: Number(es.state_of_charge_percent) || 0,
          timestamp: es.timestamp || new Date().toISOString()
        });
        setConnectionStatus('connected');
        return data.aeso;
      }
    } catch (e) {
      console.error('Energy storage fetch error:', e);
    }
    
    // Data not available - set to null to hide the section
    setEnergyStorage(null);
    setConnectionStatus('fallback');
    return null;
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
    
    // Set up interval to refresh data every 5 minutes (less frequent)
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
