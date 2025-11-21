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
    limit?: number;
  };
  widgetType: string;
}

// Comprehensive data source list
export const DATA_SOURCES = [
  { value: 'historical_pricing', label: 'Historical Pricing' },
  { value: 'price_predictions', label: 'Price Predictions' },
  { value: 'ensemble_predictions', label: 'Ensemble Predictions' },
  { value: 'market_data', label: 'Real-time Market Data' },
  { value: 'generation_mix', label: 'Generation Mix' },
  { value: 'operating_reserve', label: 'Operating Reserve' },
  { value: 'interchange', label: 'Interchange/Interties' },
  { value: 'natural_gas', label: 'Natural Gas Prices' },
  { value: 'model_performance', label: 'Model Performance' },
  { value: 'market_regimes', label: 'Market Regimes' },
  { value: 'weather_forecasts', label: 'Weather Forecasts' },
  { value: 'enhanced_features', label: 'Enhanced Features' },
  { value: 'prediction_accuracy', label: 'Prediction Accuracy' },
  { value: 'training_data', label: 'Training Data Statistics' },
] as const;

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
  }, [
    widgetConfig.dataSource,
    widgetConfig.dataFilters?.timeRange,
    widgetConfig.dataFilters?.aggregation,
    (widgetConfig as any).market,
    (widgetConfig as any).refreshKey,
  ]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (widgetConfig.dataSource) {
        case 'historical_pricing':
          await fetchHistoricalData();
          break;
        case 'price_predictions':
          await fetchPredictionData();
          break;
        case 'ensemble_predictions':
          await fetchEnsembleData();
          break;
        case 'market_data':
          await fetchMarketData();
          break;
        case 'generation':
          await fetchGenerationData();
          break;
        case 'predictions':
          await fetchPredictionData();
          break;
        case 'analytics':
          await fetchModelPerformance();
          break;
        case 'weather':
          await fetchWeatherForecasts();
          break;
        case 'operating_reserve':
          await fetchOperatingReserve();
          break;
        case 'interchange':
          await fetchInterchange();
          break;
        case 'natural_gas':
          await fetchNaturalGas();
          break;
        case 'model_performance':
          await fetchModelPerformance();
          break;
        case 'market_regimes':
          await fetchMarketRegimes();
          break;
        case 'weather_forecasts':
          await fetchWeatherForecasts();
          break;
        case 'enhanced_features':
          await fetchEnhancedFeatures();
          break;
        case 'prediction_accuracy':
          await fetchPredictionAccuracy();
          break;
        case 'training_data':
          await fetchTrainingStats();
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
    const timeRange = widgetConfig.dataFilters.timeRange || '24hours';
    
    try {
      let historicalData;
      
      if (timeRange === '24hours') {
        const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
          body: { timeframe: 'daily' }
        });
        if (error || data?.error) throw error || new Error(data?.error);
        historicalData = data;
      } else if (timeRange === '7days' || timeRange === '30days') {
        const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
          body: { timeframe: 'monthly' }
        });
        if (error || data?.error) throw error || new Error(data?.error);
        historicalData = data;
      } else if (timeRange === '90days' || timeRange === '12months') {
        const { data, error } = await supabase.functions.invoke('aeso-historical-pricing', {
          body: { timeframe: 'yearly' }
        });
        if (error || data?.error) throw error || new Error(data?.error);
        historicalData = data;
      }
      
      if (historicalData) {
        // Build table data from raw hourly data or chart data
        const tableData = (historicalData.rawHourlyData || historicalData.chartData || []).map((d: any) => ({
          timestamp: d.datetime || d.date || d.time,
          pool_price: d.price?.toFixed(2) || 'N/A',
          hour: d.hour !== undefined ? d.hour : new Date(d.datetime || d.date).getHours(),
        }));

        setData({
          ...historicalData,
          chartData: historicalData.chartData || historicalData.rawHourlyData?.map((d: any) => ({
            time: new Date(d.datetime).toLocaleTimeString(),
            date: d.date,
            price: d.price,
          })) || [],
          tableData, // Add structured table data
          hourlyData: tableData, // Also provide as hourlyData for compatibility
        });
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setData({ chartData: [], tableData: [], hourlyData: [] });
    }
  };

  const fetchPredictionData = async () => {
    const { data: predictions, error } = await supabase
      .from('aeso_price_predictions')
      .select('*')
      .gte('prediction_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('target_timestamp', { ascending: true })
      .limit(48);

    if (error) {
      console.error('Prediction data fetch error:', error);
      setData({ chartData: [], tableData: [] });
      return;
    }

    const tableData = predictions?.map(p => ({
      target_time: new Date(p.target_timestamp).toLocaleString(),
      predicted_price: p.predicted_price?.toFixed(2),
      actual_price: p.actual_price?.toFixed(2) || 'Pending',
      confidence: p.confidence_score?.toFixed(2) || 'N/A',
      horizon_hours: p.horizon_hours,
    })) || [];
    
    setData({
      chartData: predictions?.map(p => ({
        time: new Date(p.target_timestamp).toLocaleTimeString(),
        price: p.predicted_price,
        predicted: p.predicted_price,
        actual: p.actual_price,
      })) || [],
      tableData,
      statistics: {
        avgPredicted: predictions?.reduce((sum, p) => sum + p.predicted_price, 0) / (predictions?.length || 1),
        accuracy: predictions?.filter(p => p.actual_price).length || 0,
      }
    });
  };

  const fetchMarketData = async () => {
    // Fetch real-time data from API
    const { data: apiData, error: apiError } = await supabase.functions.invoke('energy-data-integration');
    
    // Always fetch past 15 entries from database for table view
    const { data: pastData, error: dbError } = await supabase
      .from('aeso_training_data')
      .select('timestamp, pool_price, ail_mw, system_marginal_price')
      .order('timestamp', { ascending: false })
      .limit(15);

    if (apiError) {
      console.error('Failed to fetch real-time market data:', apiError);
      
      if (dbError) {
        console.error('Failed to fetch database data:', dbError);
        throw dbError;
      }

      setData({
        currentPrice: pastData?.[0]?.pool_price || 0,
        currentLoad: pastData?.[0]?.ail_mw || 0,
        change: 0,
        tableData: pastData?.map(d => ({
          timestamp: new Date(d.timestamp).toLocaleString(),
          pool_price: d.pool_price,
          ail_mw: d.ail_mw,
          smp: d.system_marginal_price,
        })) || [],
        chartData: pastData?.map(d => ({
          time: new Date(d.timestamp).toLocaleTimeString(),
          price: d.pool_price,
          load: d.ail_mw,
        })).reverse() || [],
      });
      return;
    }

    // Use real-time API data
    const aesoData = apiData?.aeso;
    if (aesoData?.pricing && aesoData?.loadData) {
      const currentPrice = aesoData.pricing.current_price || 0;
      const averagePrice = aesoData.pricing.average_price || currentPrice;
      const change = averagePrice > 0 ? ((currentPrice - averagePrice) / averagePrice) * 100 : 0;

      setData({
        currentPrice,
        currentLoad: aesoData.loadData.current_demand_mw || 0,
        peakForecast: aesoData.loadData.peak_forecast_mw || 0,
        smp: aesoData.pricing.system_marginal_price || 0,
        change,
        marketConditions: aesoData.pricing.market_conditions || 'normal',
        timestamp: aesoData.pricing.timestamp,
        tableData: pastData?.map(d => ({
          timestamp: new Date(d.timestamp).toLocaleString(),
          pool_price: d.pool_price,
          ail_mw: d.ail_mw,
          smp: d.system_marginal_price,
        })) || [],
        chartData: pastData?.map(d => ({
          time: new Date(d.timestamp).toLocaleTimeString(),
          price: d.pool_price,
          load: d.ail_mw,
        })).reverse() || [],
      });
    }
  };

  const fetchGenerationData = async () => {
    // Fetch real-time generation mix from API
    const { data: apiData, error: apiError } = await supabase.functions.invoke('energy-data-integration');
    
    if (!apiError && apiData?.aeso?.generationMix) {
      const genMix = apiData.aeso.generationMix;
      
      // Format for pie chart
      const pieData = [
        { name: 'Wind', value: genMix.wind_mw || 0 },
        { name: 'Solar', value: genMix.solar_mw || 0 },
        { name: 'Gas', value: genMix.natural_gas_mw || 0 },
        { name: 'Coal', value: genMix.coal_mw || 0 },
        { name: 'Hydro', value: genMix.hydro_mw || 0 },
        { name: 'Other', value: genMix.other_mw || 0 },
      ].filter(item => item.value > 0); // Only show sources with generation
      
      setData({
        pieData,
        wind: genMix.wind_mw || 0,
        solar: genMix.solar_mw || 0,
        gas: genMix.natural_gas_mw || 0,
        coal: genMix.coal_mw || 0,
        hydro: genMix.hydro_mw || 0,
        nuclear: genMix.nuclear_mw || 0,
        other: genMix.other_mw || 0,
        totalGeneration: genMix.total_generation_mw || 0,
        renewablePercentage: genMix.renewable_percentage || 0,
        timestamp: genMix.timestamp,
      });
      return;
    }

    // Fallback to database
    const { data: genData, error } = await supabase
      .from('aeso_training_data')
      .select('generation_wind, generation_solar, generation_gas, generation_coal, generation_hydro, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) throw error;

    const latest = genData?.[0];
    if (latest) {
      const pieData = [
        { name: 'Wind', value: latest.generation_wind || 0 },
        { name: 'Solar', value: latest.generation_solar || 0 },
        { name: 'Gas', value: latest.generation_gas || 0 },
        { name: 'Coal', value: latest.generation_coal || 0 },
        { name: 'Hydro', value: latest.generation_hydro || 0 },
      ].filter(item => item.value > 0);
      
      setData({
        pieData,
        wind: latest.generation_wind || 0,
        solar: latest.generation_solar || 0,
        gas: latest.generation_gas || 0,
        coal: latest.generation_coal || 0,
        hydro: latest.generation_hydro || 0,
        timestamp: latest.timestamp,
      });
    }
  };

  const fetchEnsembleData = async () => {
    const { data: ensembleData, error } = await supabase
      .from('aeso_ensemble_predictions')
      .select('*')
      .order('target_timestamp', { ascending: false })
      .limit(48);

    if (error) throw error;

    const tableData = ensembleData?.map(p => ({
      target_time: new Date(p.target_timestamp).toLocaleString(),
      ensemble_price: p.ensemble_price?.toFixed(2),
      ml_price: p.ml_predictor_price?.toFixed(2) || 'N/A',
      arima_price: p.arima_price?.toFixed(2) || 'N/A',
      actual_price: p.actual_price?.toFixed(2) || 'Pending',
      error: p.ensemble_error?.toFixed(2) || 'N/A',
    })) || [];
    
    setData({
      chartData: ensembleData?.map(p => ({
        time: new Date(p.target_timestamp).toLocaleTimeString(),
        ensemble: p.ensemble_price,
        actual: p.actual_price,
        ml: p.ml_predictor_price,
        arima: p.arima_price,
      })) || [],
      tableData,
      statistics: {
        avgEnsemble: ensembleData?.reduce((sum, p) => sum + p.ensemble_price, 0) / (ensembleData?.length || 1),
        avgError: ensembleData?.reduce((sum, p) => sum + (p.ensemble_error || 0), 0) / (ensembleData?.length || 1),
      }
    });
  };

  const fetchOperatingReserve = async () => {
    const { data: reserveData, error } = await supabase
      .from('aeso_training_data')
      .select('operating_reserve, operating_reserve_price, spinning_reserve_mw, supplemental_reserve_mw, timestamp')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    const tableData = reserveData?.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString(),
      operating_reserve: d.operating_reserve?.toFixed(2) || 'N/A',
      operating_reserve_price: d.operating_reserve_price?.toFixed(2) || 'N/A',
      spinning_reserve: d.spinning_reserve_mw?.toFixed(2) || 'N/A',
      supplemental_reserve: d.supplemental_reserve_mw?.toFixed(2) || 'N/A',
    })) || [];

    setData({
      current: reserveData?.[0] || {},
      chartData: reserveData?.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString(),
        operating: d.operating_reserve,
        spinning: d.spinning_reserve_mw,
        supplemental: d.supplemental_reserve_mw,
      })).reverse() || [],
      tableData,
    });
  };

  const fetchInterchange = async () => {
    const { data: interchangeData, error } = await supabase
      .from('aeso_training_data')
      .select('intertie_bc_flow, intertie_sask_flow, intertie_montana_flow, interchange_net, timestamp')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    const tableData = interchangeData?.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString(),
      bc_flow: d.intertie_bc_flow?.toFixed(2) || 'N/A',
      sask_flow: d.intertie_sask_flow?.toFixed(2) || 'N/A',
      montana_flow: d.intertie_montana_flow?.toFixed(2) || 'N/A',
      net_interchange: d.interchange_net?.toFixed(2) || 'N/A',
    })) || [];

    setData({
      current: interchangeData?.[0] || {},
      chartData: interchangeData?.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString(),
        bc: d.intertie_bc_flow,
        sask: d.intertie_sask_flow,
        montana: d.intertie_montana_flow,
        net: d.interchange_net,
      })).reverse() || [],
      tableData,
    });
  };

  const fetchNaturalGas = async () => {
    const { data: gasData, error } = await supabase
      .from('aeso_natural_gas_prices')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    const tableData = gasData?.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString(),
      price: d.price?.toFixed(2) || 'N/A',
      market: d.market || 'AECO',
      source: d.source || 'N/A',
    })) || [];

    setData({
      currentPrice: gasData?.[0]?.price || 0,
      chartData: gasData?.map(d => ({
        time: new Date(d.timestamp).toLocaleDateString(),
        price: d.price,
      })).reverse() || [],
      tableData,
    });
  };

  const fetchModelPerformance = async () => {
    const { data: perfData, error } = await supabase
      .from('aeso_model_performance')
      .select('*')
      .order('evaluation_date', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Model performance fetch error:', error);
      setData({ chartData: [], tableData: [] });
      return;
    }

    const tableData = perfData?.map(d => ({
      evaluation_date: new Date(d.evaluation_date || '').toLocaleDateString(),
      model_version: d.model_version || 'N/A',
      mae: d.mae?.toFixed(2) || 'N/A',
      rmse: d.rmse?.toFixed(2) || 'N/A',
      smape: d.smape?.toFixed(2) || 'N/A',
      r_squared: d.r_squared?.toFixed(3) || 'N/A',
    })) || [];

    setData({
      latest: perfData?.[0] || {},
      chartData: perfData?.map(d => ({
        time: new Date(d.evaluation_date || '').toLocaleDateString(),
        mae: d.mae || 0,
        rmse: d.rmse || 0,
        smape: d.smape || 0,
        price: d.mae || 0,
      })).reverse() || [],
      tableData,
    });
  };

  const fetchMarketRegimes = async () => {
    const { data: regimeData, error } = await supabase
      .from('aeso_market_regimes')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    const tableData = regimeData?.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString(),
      regime: d.regime || 'N/A',
      confidence: (d.confidence * 100).toFixed(1) + '%',
      avg_price_24h: d.avg_price_24h?.toFixed(2) || 'N/A',
      price_volatility: d.price_volatility_24h?.toFixed(2) || 'N/A',
    })) || [];

    setData({
      current: regimeData?.[0] || {},
      chartData: regimeData?.map(d => ({
        time: new Date(d.timestamp).toLocaleString(),
        regime: d.regime,
        confidence: d.confidence,
        avgPrice: d.avg_price_24h,
      })).reverse() || [],
      tableData,
    });
  };

  const fetchWeatherForecasts = async () => {
    // For now, return placeholder data since we don't have weather API integration
    const { data: weatherData, error } = await supabase
      .from('aeso_training_data')
      .select('temperature_calgary, temperature_edmonton, wind_speed, cloud_cover, timestamp')
      .order('timestamp', { ascending: false })
      .limit(24);

    if (error) {
      console.error('Weather data fetch error:', error);
      setData({
        chartData: [],
        tableData: [],
        current: { temperature: 0, windSpeed: 0, cloudCover: 0 }
      });
      return;
    }

    const tableData = weatherData?.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString(),
      temperature_calgary: d.temperature_calgary?.toFixed(1) + '°C' || 'N/A',
      temperature_edmonton: d.temperature_edmonton?.toFixed(1) + '°C' || 'N/A',
      wind_speed: d.wind_speed?.toFixed(1) + ' m/s' || 'N/A',
      cloud_cover: d.cloud_cover?.toFixed(0) + '%' || 'N/A',
    })) || [];

    setData({
      current: weatherData?.[0] ? {
        temperature: weatherData[0].temperature_calgary || 0,
        windSpeed: weatherData[0].wind_speed || 0,
        cloudCover: weatherData[0].cloud_cover || 0,
      } : {},
      chartData: weatherData?.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString(),
        temperature: d.temperature_calgary,
        windSpeed: d.wind_speed,
        cloudCover: d.cloud_cover,
      })).reverse() || [],
      tableData,
    });
  };

  const fetchEnhancedFeatures = async () => {
    const { data: featuresData, error } = await supabase
      .from('aeso_enhanced_features')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    const tableData = featuresData?.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString(),
      natural_gas_price: d.natural_gas_price?.toFixed(2) || 'N/A',
      price_volatility_24h: d.price_volatility_24h?.toFixed(2) || 'N/A',
      price_momentum_3h: d.price_momentum_3h?.toFixed(2) || 'N/A',
      net_imports: d.net_imports?.toFixed(2) || 'N/A',
      renewable_curtailment: d.renewable_curtailment?.toFixed(2) || 'N/A',
    })) || [];

    setData({
      current: featuresData?.[0] || {},
      chartData: featuresData?.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString(),
        gasPrice: d.natural_gas_price,
        volatility: d.price_volatility_24h,
        momentum: d.price_momentum_3h,
      })).reverse() || [],
      tableData,
    });
  };

  const fetchPredictionAccuracy = async () => {
    const { data: accuracyData, error } = await supabase
      .from('aeso_prediction_accuracy')
      .select('*')
      .order('target_timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    const tableData = accuracyData?.map(d => ({
      target_time: new Date(d.target_timestamp).toLocaleString(),
      predicted_price: d.predicted_price?.toFixed(2),
      actual_price: d.actual_price?.toFixed(2),
      absolute_error: d.absolute_error?.toFixed(2),
      smape: d.symmetric_percent_error?.toFixed(2) + '%',
      horizon_hours: d.horizon_hours,
    })) || [];

    setData({
      chartData: accuracyData?.map(d => ({
        time: new Date(d.target_timestamp).toLocaleString(),
        predicted: d.predicted_price,
        actual: d.actual_price,
        error: d.absolute_error,
        smape: d.symmetric_percent_error,
      })).reverse() || [],
      tableData,
      statistics: {
        avgError: accuracyData?.reduce((sum, d) => sum + d.absolute_error, 0) / (accuracyData?.length || 1),
        avgSmape: accuracyData?.reduce((sum, d) => sum + (d.symmetric_percent_error || 0), 0) / (accuracyData?.length || 1),
      }
    });
  };

  const fetchTrainingStats = async () => {
    const { data: statsData, error } = await supabase
      .from('aeso_training_data')
      .select('pool_price, ail_mw, renewable_penetration, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (error) throw error;

    const totalRecords = statsData?.length || 0;
    const avgPrice = statsData?.reduce((sum, d) => sum + d.pool_price, 0) / totalRecords;
    const avgLoad = statsData?.reduce((sum, d) => sum + (d.ail_mw || 0), 0) / totalRecords;
    const avgRenewable = statsData?.reduce((sum, d) => sum + (d.renewable_penetration || 0), 0) / totalRecords;

    const tableData = statsData?.slice(0, 100).map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString(),
      pool_price: d.pool_price?.toFixed(2),
      ail_mw: d.ail_mw?.toFixed(2) || 'N/A',
      renewable_penetration: d.renewable_penetration?.toFixed(2) + '%' || 'N/A',
    })) || [];

    setData({
      statistics: {
        totalRecords,
        avgPrice,
        avgLoad,
        avgRenewable,
        latestTimestamp: statsData?.[0]?.timestamp,
      },
      chartData: statsData?.slice(0, 100).map(d => ({
        time: new Date(d.timestamp).toLocaleDateString(),
        price: d.pool_price,
        load: d.ail_mw,
      })).reverse() || [],
      tableData,
    });
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
