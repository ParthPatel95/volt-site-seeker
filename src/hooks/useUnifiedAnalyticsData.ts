import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UnifiedAnalyticsFilters {
  startDate: string;
  endDate: string;
  includeWeather: boolean;
  includePrices: boolean;
  includeDemand: boolean;
  includeReserves: boolean;
  includeGeneration: boolean;
  includeInterties: boolean;
}

export interface UnifiedDataPoint {
  timestamp: string;
  date: string;
  hour: number;
  day_of_week: number | null;
  month: number | null;
  season: string | null;
  is_weekend: boolean | null;
  is_holiday: boolean | null;
  
  // Weather
  temp_calgary: number | null;
  temp_edmonton: number | null;
  wind_speed: number | null;
  cloud_cover: number | null;
  heating_degree_days: number | null;
  cooling_degree_days: number | null;
  
  // Prices
  pool_price: number | null;
  price_lag_24h: number | null;
  price_rolling_avg_24h: number | null;
  price_rolling_std_24h: number | null;
  price_volatility_6h: number | null;
  
  // Demand
  ail_mw: number | null;
  demand_ramp_rate: number | null;
  is_morning_ramp: number | null;
  is_evening_peak: number | null;
  
  // Reserves
  operating_reserve: number | null;
  operating_reserve_price: number | null;
  spinning_reserve_mw: number | null;
  supplemental_reserve_mw: number | null;
  reserve_margin_percent: number | null;
  
  // Generation
  generation_gas: number | null;
  generation_wind: number | null;
  generation_solar: number | null;
  generation_hydro: number | null;
  generation_coal: number | null;
  generation_other: number | null;
  renewable_penetration: number | null;
  renewable_ratio: number | null;
  
  // Interties
  intertie_bc_flow: number | null;
  intertie_sask_flow: number | null;
  intertie_montana_flow: number | null;
  interchange_net: number | null;
  total_interchange_flow: number | null;
}

export interface UnifiedAnalyticsStats {
  totalRecords: number;
  dateRange: { start: string; end: string };
  priceStats: {
    min: number;
    max: number;
    avg: number;
    std: number;
  };
  demandStats: {
    min: number;
    max: number;
    avg: number;
  };
  highPriceHours: number;
  correlations: {
    tempVsPrice: number | null;
    demandVsPrice: number | null;
    windVsPrice: number | null;
  };
}

const DEFAULT_FILTERS: UnifiedAnalyticsFilters = {
  startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  includeWeather: true,
  includePrices: true,
  includeDemand: true,
  includeReserves: true,
  includeGeneration: true,
  includeInterties: true,
};

export function useUnifiedAnalyticsData() {
  const { toast } = useToast();
  const [data, setData] = useState<UnifiedDataPoint[]>([]);
  const [stats, setStats] = useState<UnifiedAnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UnifiedAnalyticsFilters>(DEFAULT_FILTERS);

  const fetchData = useCallback(async (customFilters?: Partial<UnifiedAnalyticsFilters>) => {
    const activeFilters = { ...filters, ...customFilters };
    setLoading(true);
    
    try {
      // Build the query based on filters
      const query = supabase
        .from('aeso_training_data')
        .select(`
          timestamp,
          hour_of_day,
          day_of_week,
          month,
          season,
          is_weekend,
          is_holiday,
          temperature_calgary,
          temperature_edmonton,
          wind_speed,
          cloud_cover,
          heating_degree_days,
          cooling_degree_days,
          pool_price,
          price_lag_24h,
          price_rolling_avg_24h,
          price_rolling_std_24h,
          price_volatility_6h,
          ail_mw,
          demand_ramp_rate,
          is_morning_ramp,
          is_evening_peak,
          operating_reserve,
          operating_reserve_price,
          spinning_reserve_mw,
          supplemental_reserve_mw,
          reserve_margin_percent,
          generation_gas,
          generation_wind,
          generation_solar,
          generation_hydro,
          generation_coal,
          generation_other,
          renewable_penetration,
          renewable_ratio,
          intertie_bc_flow,
          intertie_sask_flow,
          intertie_montana_flow,
          interchange_net,
          total_interchange_flow
        `)
        .gte('timestamp', `${activeFilters.startDate}T00:00:00`)
        .lte('timestamp', `${activeFilters.endDate}T23:59:59`)
        .order('timestamp', { ascending: true });

      const { data: rawData, error } = await query;

      if (error) throw error;

      if (!rawData || rawData.length === 0) {
        toast({
          title: "No Data Found",
          description: "No data available for the selected date range",
          variant: "destructive",
        });
        setData([]);
        setStats(null);
        return;
      }

      // Transform data
      const transformedData: UnifiedDataPoint[] = rawData.map((row) => ({
        timestamp: row.timestamp,
        date: row.timestamp.split('T')[0],
        hour: row.hour_of_day ?? new Date(row.timestamp).getHours(),
        day_of_week: row.day_of_week,
        month: row.month,
        season: row.season,
        is_weekend: row.is_weekend,
        is_holiday: row.is_holiday,
        temp_calgary: row.temperature_calgary,
        temp_edmonton: row.temperature_edmonton,
        wind_speed: row.wind_speed,
        cloud_cover: row.cloud_cover,
        heating_degree_days: row.heating_degree_days,
        cooling_degree_days: row.cooling_degree_days,
        pool_price: row.pool_price,
        price_lag_24h: row.price_lag_24h,
        price_rolling_avg_24h: row.price_rolling_avg_24h,
        price_rolling_std_24h: row.price_rolling_std_24h,
        price_volatility_6h: row.price_volatility_6h,
        ail_mw: row.ail_mw,
        demand_ramp_rate: row.demand_ramp_rate,
        is_morning_ramp: row.is_morning_ramp,
        is_evening_peak: row.is_evening_peak,
        operating_reserve: row.operating_reserve,
        operating_reserve_price: row.operating_reserve_price,
        spinning_reserve_mw: row.spinning_reserve_mw,
        supplemental_reserve_mw: row.supplemental_reserve_mw,
        reserve_margin_percent: row.reserve_margin_percent,
        generation_gas: row.generation_gas,
        generation_wind: row.generation_wind,
        generation_solar: row.generation_solar,
        generation_hydro: row.generation_hydro,
        generation_coal: row.generation_coal,
        generation_other: row.generation_other,
        renewable_penetration: row.renewable_penetration,
        renewable_ratio: row.renewable_ratio,
        intertie_bc_flow: row.intertie_bc_flow,
        intertie_sask_flow: row.intertie_sask_flow,
        intertie_montana_flow: row.intertie_montana_flow,
        interchange_net: row.interchange_net,
        total_interchange_flow: row.total_interchange_flow,
      }));

      setData(transformedData);

      // Calculate statistics
      const prices = transformedData.map(d => d.pool_price).filter((p): p is number => p !== null);
      const demands = transformedData.map(d => d.ail_mw).filter((d): d is number => d !== null);
      const temps = transformedData.map(d => d.temp_calgary).filter((t): t is number => t !== null);
      const winds = transformedData.map(d => d.generation_wind).filter((w): w is number => w !== null);

      const priceAvg = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
      const priceStd = prices.length > 0 
        ? Math.sqrt(prices.reduce((sum, p) => sum + Math.pow(p - priceAvg, 2), 0) / prices.length)
        : 0;

      const calculatedStats: UnifiedAnalyticsStats = {
        totalRecords: transformedData.length,
        dateRange: {
          start: activeFilters.startDate,
          end: activeFilters.endDate,
        },
        priceStats: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0,
          avg: priceAvg,
          std: priceStd,
        },
        demandStats: {
          min: demands.length > 0 ? Math.min(...demands) : 0,
          max: demands.length > 0 ? Math.max(...demands) : 0,
          avg: demands.length > 0 ? demands.reduce((a, b) => a + b, 0) / demands.length : 0,
        },
        highPriceHours: prices.filter(p => p > 100).length,
        correlations: {
          tempVsPrice: calculateCorrelation(temps, prices.slice(0, temps.length)),
          demandVsPrice: calculateCorrelation(demands, prices.slice(0, demands.length)),
          windVsPrice: calculateCorrelation(winds, prices.slice(0, winds.length)),
        },
      };

      setStats(calculatedStats);

      toast({
        title: "Data Loaded",
        description: `Loaded ${transformedData.length.toLocaleString()} hourly records`,
      });

    } catch (error) {
      console.error('Error fetching unified analytics data:', error);
      toast({
        title: "Error Loading Data",
        description: error instanceof Error ? error.message : "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  const updateFilters = useCallback((newFilters: Partial<UnifiedAnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    data,
    stats,
    loading,
    filters,
    fetchData,
    updateFilters,
  };
}

// Helper function to calculate Pearson correlation coefficient
function calculateCorrelation(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return null;
  
  return numerator / denominator;
}
