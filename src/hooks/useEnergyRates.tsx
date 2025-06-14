
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error calculating costs:', error);
      toast({
        title: "Error",
        description: "Failed to calculate energy costs",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentRates = async (marketCode: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('energy-rate-intelligence', {
        body: {
          action: 'fetch_current_rates',
          market_code: marketCode
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching current rates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch current rates",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    fetchUtilities();
  }, []);

  return {
    rates,
    markets,
    utilities,
    loading,
    fetchRates,
    fetchUtilities,
    calculateCosts,
    getCurrentRates,
    refetch: () => {
      fetchMarkets();
      fetchUtilities();
    }
  };
}
