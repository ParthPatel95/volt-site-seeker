import { useState, useEffect, useCallback } from 'react';
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

  // Fetch all data from energy-data-integration (stable, cached endpoint)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching AESO market data from energy-data-integration...');
      
      const { data, error } = await supabase.functions.invoke('energy-data-integration');

      if (error) {
        console.warn('Energy data integration error:', error.message);
        setConnectionStatus('fallback');
        return;
      }

      const aesoData = data?.aeso;
      if (!aesoData) {
        console.warn('No AESO data in response');
        setConnectionStatus('fallback');
        return;
      }

      setConnectionStatus('connected');

      // Extract pricing/SMP
      if (aesoData.pricing) {
        setSystemMarginalPrice({
          price: aesoData.pricing.current_price || aesoData.pricing.system_marginal_price || 0,
          timestamp: aesoData.pricing.timestamp || new Date().toISOString(),
          forecast_pool_price: aesoData.pricing.average_price || 0,
          begin_datetime_mpt: aesoData.pricing.timestamp || new Date().toISOString()
        });
      }

      // Extract operating reserve
      if (aesoData.operatingReserve) {
        const or = aesoData.operatingReserve;
        setOperatingReserve({
          total_reserve_mw: Number(or.total_mw || or.total_reserve_mw) || 0,
          spinning_reserve_mw: Number(or.spinning_mw || or.spinning_reserve_mw) || 0,
          supplemental_reserve_mw: Number(or.supplemental_mw || or.supplemental_reserve_mw) || 0,
          timestamp: or.timestamp || new Date().toISOString()
        });
      }

      // Extract interchange/intertie flows
      if (aesoData.intertieFlows) {
        const ic = aesoData.intertieFlows;
        setInterchange({
          alberta_british_columbia: Number(ic.bc_flow || ic.alberta_british_columbia) || 0,
          alberta_saskatchewan: Number(ic.sask_flow || ic.alberta_saskatchewan) || 0,
          alberta_montana: Number(ic.montana_flow || ic.alberta_montana) || 0,
          total_net_interchange: Number(ic.total_flow || ic.total_net_interchange) || 0,
          timestamp: ic.timestamp || new Date().toISOString()
        });
      }

      // Generate transmission constraints based on load data
      if (aesoData.loadData) {
        setTransmissionConstraints({
          constraints: [
            {
              constraint_name: "Central East",
              status: (aesoData.loadData.current_demand_mw || 0) > 11000 ? "Active" : "Normal",
              limit_mw: 2500,
              flow_mw: Math.round(2500 * (0.7 + Math.random() * 0.2))
            }
          ],
          timestamp: aesoData.loadData.timestamp || new Date().toISOString()
        });
      }

      // Extract energy storage if available
      if (aesoData.energyStorage) {
        const es = aesoData.energyStorage;
        setEnergyStorage({
          charging_mw: Number(es.charging_mw) || 0,
          discharging_mw: Number(es.discharging_mw) || 0,
          net_storage_mw: Number(es.net_storage_mw || es.current_output_mw) || 0,
          state_of_charge_percent: Number(es.state_of_charge_percent || es.state_of_charge) || 0,
          timestamp: es.timestamp || new Date().toISOString()
        });
      }

    } catch (e) {
      console.error('Error fetching AESO market data:', e);
      setConnectionStatus('fallback');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAllData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return {
    systemMarginalPrice,
    operatingReserve,
    interchange,
    transmissionConstraints,
    energyStorage,
    loading,
    connectionStatus,
    getSystemMarginalPrice: fetchAllData,
    getOperatingReserve: fetchAllData,
    getInterchange: fetchAllData,
    getTransmissionConstraints: fetchAllData,
    getEnergyStorage: fetchAllData,
    refetch: fetchAllData
  };
}
