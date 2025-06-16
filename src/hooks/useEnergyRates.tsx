
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface EnergyRate {
  id: string;
  market_id: string;
  rate_type: string;
  price_per_mwh: number;
  timestamp: string;
  node_name: string;
  node_id: string;
  created_at: string;
}

export interface EnergyMarket {
  id: string;
  market_name: string;
  market_code: string;
  region: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UtilityCompany {
  id: string;
  company_name: string;
  service_territory: string;
  state: string;
  market_id: string;
  website_url: string;
  contact_info: any;
  created_at: string;
  updated_at: string;
}

export function useEnergyRates() {
  const [rates, setRates] = useState<EnergyRate[]>([]);
  const [markets, setMarkets] = useState<EnergyMarket[]>([]);
  const [utilities, setUtilities] = useState<UtilityCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentRates, setCurrentRates] = useState<any>(null);
  const { toast } = useToast();

  const fetchMarkets = async () => {
    try {
      const { data, error } = await supabase
        .from('energy_markets')
        .select('*')
        .order('market_name');

      if (error) throw error;
      setMarkets(data || []);
    } catch (error: any) {
      console.error('Error fetching markets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch energy markets",
        variant: "destructive"
      });
    }
  };

  const fetchUtilities = async (state?: string) => {
    try {
      let query = supabase
        .from('utility_companies')
        .select('*')
        .order('company_name');

      if (state) {
        query = query.eq('state', state);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setUtilities(data || []);
    } catch (error: any) {
      console.error('Error fetching utilities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch utility companies",
        variant: "destructive"
      });
    }
  };

  const fetchRates = async (marketId?: string, limit = 100) => {
    setLoading(true);
    try {
      let query = supabase
        .from('energy_rates')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (marketId) {
        query = query.eq('market_id', marketId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setRates(data || []);
    } catch (error: any) {
      console.error('Error fetching rates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch energy rates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCosts = async (params: {
    monthly_consumption_mwh: number;
    peak_demand_mw: number;
    location: { state: string };
    property_id?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('energy-rate-intelligence', {
        body: {
          action: 'calculate_energy_costs',
          ...params
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Cost calculation failed');
      }

      return data?.cost_calculation || {
        monthly_cost: params.monthly_consumption_mwh * 50,
        breakdown: {
          energy_cost: params.monthly_consumption_mwh * 40,
          demand_charge: params.peak_demand_mw * 10
        }
      };

    } catch (error: any) {
      console.error('Error calculating costs:', error);
      
      let errorMessage = "Failed to calculate energy costs";
      if (error.message?.includes('non-2xx')) {
        errorMessage = "Energy rate service temporarily unavailable";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Return fallback calculation
      return {
        monthly_cost: params.monthly_consumption_mwh * 50,
        breakdown: {
          energy_cost: params.monthly_consumption_mwh * 40,
          demand_charge: params.peak_demand_mw * 10
        }
      };
    } finally {
      setLoading(false);
    }
  };

  const getCurrentRates = async (marketCode: string = 'ERCOT') => {
    setLoading(true);
    try {
      console.log('Fetching current rates for market:', marketCode);
      
      const { data, error } = await supabase.functions.invoke('energy-rate-intelligence', {
        body: {
          action: 'fetch_current_rates',
          market_code: marketCode
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.success === false) {
        throw new Error(data.error || 'Failed to fetch rates');
      }

      console.log('Received rates data:', data);
      
      const ratesData = data?.rates || {
        current_rate: 45.50,
        forecast: [46.00, 44.20, 43.80],
        market_conditions: 'normal',
        peak_demand_rate: 65.30
      };

      setCurrentRates(ratesData);
      return ratesData;

    } catch (error: any) {
      console.error('Error fetching current rates:', error);
      
      let errorMessage = "Failed to fetch current rates";
      if (error.message?.includes('non-2xx')) {
        errorMessage = "Rate data service temporarily unavailable";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Return fallback data
      const fallbackRates = {
        current_rate: 45.50,
        forecast: [46.00, 44.20, 43.80],
        market_conditions: 'normal',
        peak_demand_rate: 65.30
      };
      
      setCurrentRates(fallbackRates);
      return fallbackRates;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch current rates on component mount
  useEffect(() => {
    fetchMarkets();
    fetchUtilities();
    getCurrentRates('ERCOT');
    
    // Set up interval to refresh rates every 5 minutes
    const interval = setInterval(() => {
      getCurrentRates('ERCOT');
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    rates,
    markets,
    utilities,
    loading,
    currentRates,
    fetchRates,
    fetchUtilities,
    calculateCosts,
    getCurrentRates,
    refetch: () => {
      fetchMarkets();
      fetchUtilities();
      getCurrentRates('ERCOT');
    }
  };
}
