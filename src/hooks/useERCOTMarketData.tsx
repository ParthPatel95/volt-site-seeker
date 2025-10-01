import { useState, useEffect, useCallback } from 'react';

export interface ERCOTOperatingReserve {
  total_reserve_mw: number;
  spinning_reserve_mw: number;
  supplemental_reserve_mw: number;
  timestamp: string;
  source: string;
}

export interface ERCOTInterchange {
  imports_mw: number;
  exports_mw: number;
  net_mw: number;
  timestamp: string;
  source: string;
}

export interface ERCOTEnergyStorage {
  charging_mw: number;
  discharging_mw: number;
  net_storage_mw: number;
  state_of_charge_percent: number | null;
  timestamp: string;
  source: string;
}

export const useERCOTMarketData = () => {
  const [operatingReserve, setOperatingReserve] = useState<ERCOTOperatingReserve | null>(null);
  const [interchange, setInterchange] = useState<ERCOTInterchange | null>(null);
  const [energyStorage, setEnergyStorage] = useState<ERCOTEnergyStorage | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Generate realistic mock data for ERCOT
      const now = new Date();
      
      // Operating Reserve (typically 12-15% of system load)
      const totalReserve = Math.round(8000 + Math.random() * 2000);
      setOperatingReserve({
        total_reserve_mw: totalReserve,
        spinning_reserve_mw: Math.round(totalReserve * 0.6),
        supplemental_reserve_mw: Math.round(totalReserve * 0.4),
        timestamp: now.toISOString(),
        source: 'ercot_mock'
      });

      // Interchange (ERCOT has DC ties to Mexico and other regions)
      const netFlow = Math.round((Math.random() - 0.5) * 1000);
      setInterchange({
        imports_mw: netFlow > 0 ? Math.abs(netFlow) : 0,
        exports_mw: netFlow < 0 ? Math.abs(netFlow) : 0,
        net_mw: netFlow,
        timestamp: now.toISOString(),
        source: 'ercot_mock'
      });

      // Energy Storage (Texas has significant battery storage)
      const charging = Math.round(Math.random() * 500);
      const discharging = Math.round(Math.random() * 600);
      setEnergyStorage({
        charging_mw: charging,
        discharging_mw: discharging,
        net_storage_mw: discharging - charging,
        state_of_charge_percent: Math.round(Math.random() * 40 + 50), // 50-90%
        timestamp: now.toISOString(),
        source: 'ercot_mock'
      });

    } catch (error) {
      console.error('Error fetching ERCOT market data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    operatingReserve,
    interchange,
    energyStorage,
    loading,
    refetch
  };
};
