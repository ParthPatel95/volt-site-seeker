
import { useState, useEffect } from 'react';
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
      // Use placeholder data since energy_markets table doesn't exist yet
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
        },
        {
          id: '3',
          market_name: 'California Independent System Operator',
          market_code: 'CAISO',
          region: 'California',
          timezone: 'America/Los_Angeles',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setMarkets(placeholderMarkets);
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
      // Use placeholder data since utility_companies table doesn't exist yet
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
        },
        {
          id: '2',
          company_name: 'Pacific Gas & Electric',
          service_territory: 'Northern California',
          state: 'CA',
          market_id: '3',
          website_url: 'https://www.pge.com',
          contact_info: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          company_name: 'PECO Energy',
          service_territory: 'Southeast Pennsylvania',
          state: 'PA',
          market_id: '2',
          website_url: 'https://www.peco.com',
          contact_info: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      const filteredUtilities = state 
        ? placeholderUtilities.filter(u => u.state === state) 
        : placeholderUtilities;
      
      setUtilities(filteredUtilities);
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
      // Use placeholder data since energy_rates table doesn't exist yet
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
        },
        {
          id: '2',
          market_id: marketId || '1',
          rate_type: 'day_ahead',
          price_per_mwh: 47.20,
          timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          node_name: 'Dallas Hub',
          node_id: 'HB_DALLAS',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          market_id: marketId || '2',
          rate_type: 'real_time',
          price_per_mwh: 52.80,
          timestamp: new Date().toISOString(),
          node_name: 'Western Hub',
          node_id: 'PJM_WESTERN',
          created_at: new Date().toISOString()
        }
      ];
      
      const filteredRates = marketId 
        ? placeholderRates.filter(r => r.market_id === marketId)
        : placeholderRates;
      
      setRates(filteredRates);
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
      // Return placeholder calculation since the function doesn't exist yet
      const energyCost = params.monthly_consumption_mwh * 50; // $50/MWh average
      const demandCharge = params.peak_demand_mw * 15; // $15/MW demand charge
      
      return {
        monthly_cost: energyCost + demandCharge,
        breakdown: {
          energy_cost: energyCost,
          demand_charge: demandCharge,
          transmission_cost: params.peak_demand_mw * 5,
          other_fees: 500
        },
        rate_schedule: 'Sample Rate Schedule',
        utility: 'Sample Utility Company'
      };
    } catch (error: any) {
      console.error('Error calculating costs:', error);
      toast({
        title: "Info",
        description: "Cost calculation will be available after database migration",
        variant: "default"
      });
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
      // Return placeholder data since the function doesn't exist yet
      return {
        current_rate: 45.50,
        forecast: [46.00, 44.20, 43.80, 45.10, 47.30],
        market_code: marketCode,
        timestamp: new Date().toISOString()
      };
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
