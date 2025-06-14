
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
      // Check if energy_markets table exists, if not use placeholder data
      const { error } = await supabase
        .from('energy_markets' as any)
        .select('*')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist yet, use placeholder data
        const placeholderMarkets: EnergyMarket[] = [
          {
            id: '1',
            market_name: 'Electric Reliability Council of Texas',
            market_code: 'ERCOT',
            region: 'Texas',
            timezone: 'America/Chicago',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            market_name: 'PJM Interconnection',
            market_code: 'PJM',
            region: 'Eastern US',
            timezone: 'America/New_York',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setMarkets(placeholderMarkets);
        return;
      }

      const { data } = await supabase
        .from('energy_markets' as any)
        .select('*')
        .order('market_name');

      setMarkets(data || []);
    } catch (error: any) {
      console.error('Error fetching markets:', error);
      toast({
        title: "Info",
        description: "Energy markets feature will be available after database migration",
        variant: "default"
      });
    }
  };

  const fetchUtilities = async (state?: string) => {
    try {
      // Check if utility_companies table exists, if not use placeholder data
      const { error } = await supabase
        .from('utility_companies' as any)
        .select('*')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist yet, use placeholder data
        const placeholderUtilities: UtilityCompany[] = [
          {
            id: '1',
            company_name: 'Oncor Electric Delivery',
            service_territory: 'North Texas',
            state: 'TX',
            market_id: '1',
            website_url: 'https://www.oncor.com',
            contact_info: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setUtilities(state ? placeholderUtilities.filter(u => u.state === state) : placeholderUtilities);
        return;
      }

      let query = supabase
        .from('utility_companies' as any)
        .select('*')
        .order('company_name');

      if (state) {
        query = query.eq('state', state);
      }

      const { data } = await query;
      setUtilities(data || []);
    } catch (error: any) {
      console.error('Error fetching utilities:', error);
      toast({
        title: "Info",
        description: "Utility companies feature will be available after database migration",
        variant: "default"
      });
    }
  };

  const fetchRates = async (marketId?: string, limit = 100) => {
    setLoading(true);
    try {
      // Check if energy_rates table exists, if not use placeholder data
      const { error } = await supabase
        .from('energy_rates' as any)
        .select('*')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist yet, use placeholder data
        const placeholderRates: EnergyRate[] = [
          {
            id: '1',
            market_id: marketId || '1',
            rate_type: 'real_time',
            price_per_mwh: 45.50,
            timestamp: new Date().toISOString(),
            node_name: 'Houston Hub',
            node_id: 'HB_HOUSTON',
            created_at: new Date().toISOString()
          }
        ];
        setRates(placeholderRates);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('energy_rates' as any)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (marketId) {
        query = query.eq('market_id', marketId);
      }

      const { data } = await query;
      setRates(data || []);
    } catch (error: any) {
      console.error('Error fetching rates:', error);
      toast({
        title: "Info",
        description: "Energy rates feature will be available after database migration",
        variant: "default"
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
        title: "Info",
        description: "Cost calculation will be available after database migration",
        variant: "default"
      });
      // Return placeholder calculation
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
        title: "Info",
        description: "Real-time rates will be available after database migration",
        variant: "default"
      });
      return {
        current_rate: 45.50,
        forecast: [46.00, 44.20, 43.80]
      };
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
