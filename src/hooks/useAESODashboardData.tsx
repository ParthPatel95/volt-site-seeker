import { useState, useEffect } from 'react';
import { useAESOHistoricalPricing } from './useAESOHistoricalPricing';
import { supabase } from '@/integrations/supabase/client';

export interface WidgetConfig {
  title: string;
  dataSource: string;
  dataFilters: {
    timeRange?: string;
    metrics?: string[];
    aggregation?: string;
  };
  widgetType: string;
}

export const useAESODashboardData = (widgetConfig: WidgetConfig) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    dailyData, 
    monthlyData, 
    yearlyData,
    fetchDailyData,
    fetchMonthlyData,
    fetchYearlyData,
    loadingDaily,
    loadingMonthly,
    loadingYearly
  } = useAESOHistoricalPricing();

  useEffect(() => {
    fetchData();
  }, [widgetConfig.dataSource, widgetConfig.dataFilters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (widgetConfig.dataSource) {
        case 'historical_pricing':
          await fetchHistoricalData();
          break;
        case 'predictions':
          await fetchPredictionData();
          break;
        case 'market_data':
          await fetchMarketData();
          break;
        case 'generation':
          await fetchGenerationData();
          break;
        default:
          setData(null);
      }
    } catch (err) {
      console.error('Error fetching widget data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    const timeRange = widgetConfig.dataFilters.timeRange || '30days';
    
    if (timeRange === '24hours') {
      await fetchDailyData();
      setData(dailyData);
    } else if (timeRange === '30days') {
      await fetchMonthlyData();
      setData(monthlyData);
    } else if (timeRange === '12months') {
      await fetchYearlyData();
      setData(yearlyData);
    }
  };

  const fetchPredictionData = async () => {
    const { data: predictions, error } = await supabase
      .from('aeso_price_predictions')
      .select('*')
      .gte('prediction_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('target_timestamp', { ascending: true })
      .limit(48);

    if (error) throw error;
    
    setData({
      chartData: predictions?.map(p => ({
        time: new Date(p.target_timestamp).toLocaleTimeString(),
        predicted: p.predicted_price,
        actual: p.actual_price,
      })) || [],
      statistics: {
        avgPredicted: predictions?.reduce((sum, p) => sum + p.predicted_price, 0) / (predictions?.length || 1),
        accuracy: predictions?.filter(p => p.actual_price).length || 0,
      }
    });
  };

  const fetchMarketData = async () => {
    const { data: marketData, error } = await supabase
      .from('aeso_training_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    setData({
      currentPrice: marketData?.[0]?.pool_price || 0,
      currentLoad: marketData?.[0]?.ail_mw || 0,
      chartData: marketData?.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString(),
        price: d.pool_price,
        load: d.ail_mw,
      })).reverse() || [],
    });
  };

  const fetchGenerationData = async () => {
    const { data: genData, error } = await supabase
      .from('aeso_training_data')
      .select('generation_wind, generation_solar, generation_gas, generation_coal, generation_hydro, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) throw error;

    const latest = genData?.[0];
    if (latest) {
      setData({
        wind: latest.generation_wind || 0,
        solar: latest.generation_solar || 0,
        gas: latest.generation_gas || 0,
        coal: latest.generation_coal || 0,
        hydro: latest.generation_hydro || 0,
        timestamp: latest.timestamp,
      });
    }
  };

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading: loading || loadingDaily || loadingMonthly || loadingYearly,
    error,
    refetch,
  };
};
