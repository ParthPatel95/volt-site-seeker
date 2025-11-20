import { supabase } from '@/integrations/supabase/client';

export type WidgetType = 'stat_card' | 'line_chart' | 'bar_chart' | 'area_chart' | 'pie_chart' | 'gauge' | 'table';

interface DataAnalysis {
  hasTimeSeries: boolean;
  hasNumericValues: boolean;
  hasCategoricalData: boolean;
  hasMultipleSeries: boolean;
  dataPointCount: number;
  keys: string[];
}

/**
 * Analyzes data structure and recommends the best widget type
 */
export async function analyzeAndRecommendWidget(dataSource: string): Promise<{
  widgetType: WidgetType;
  confidence: number;
  alternativeTypes: WidgetType[];
}> {
  try {
    // Fetch sample data for analysis
    const sampleData = await fetchSampleData(dataSource);
    
    if (!sampleData || sampleData.length === 0) {
      return {
        widgetType: 'stat_card',
        confidence: 0.5,
        alternativeTypes: ['line_chart', 'table'],
      };
    }

    // Analyze the data structure
    const analysis = analyzeDataStructure(sampleData);
    
    // Recommend widget type based on analysis
    return recommendWidgetType(analysis, dataSource);
  } catch (error) {
    console.error('Error analyzing data for widget recommendation:', error);
    return {
      widgetType: 'line_chart',
      confidence: 0.3,
      alternativeTypes: ['stat_card', 'table'],
    };
  }
}

async function fetchSampleData(dataSource: string): Promise<any[]> {
  try {
    switch (dataSource) {
      case 'historical_pricing':
        const { data: historicalData } = await supabase
          .from('aeso_training_data')
          .select('timestamp, pool_price')
          .order('timestamp', { ascending: false })
          .limit(24);
        return historicalData?.map(d => ({
          time: new Date(d.timestamp).toLocaleTimeString(),
          price: d.pool_price,
        })) || [];

      case 'predictions':
        const { data: predData } = await supabase
          .from('aeso_price_predictions')
          .select('*')
          .order('target_timestamp', { ascending: true })
          .limit(24);
        return predData?.map(p => ({
          time: new Date(p.target_timestamp).toLocaleTimeString(),
          price: p.predicted_price,
          actual: p.actual_price,
        })) || [];

      case 'generation':
        // Generation mix is best as pie chart - fetch latest data
        const { data: apiData } = await supabase.functions.invoke('energy-data-integration');
        if (apiData?.aeso?.generationMix) {
          const genMix = apiData.aeso.generationMix;
          return [
            { name: 'Wind', value: genMix.wind_mw || 0 },
            { name: 'Solar', value: genMix.solar_mw || 0 },
            { name: 'Gas', value: genMix.natural_gas_mw || 0 },
            { name: 'Coal', value: genMix.coal_mw || 0 },
            { name: 'Hydro', value: genMix.hydro_mw || 0 },
          ].filter(item => item.value > 0);
        }
        return [];

      case 'market_data':
        // Market data has single values - best as stat cards
        return [{ currentPrice: 100, currentLoad: 9500, change: 2.5 }];

      case 'analytics':
        const { data: perfData } = await supabase
          .from('aeso_model_performance')
          .select('evaluation_date, mae, rmse, smape')
          .order('evaluation_date', { ascending: false })
          .limit(20);
        return perfData?.map(d => ({
          time: new Date(d.evaluation_date || '').toLocaleDateString(),
          mae: d.mae || 0,
          rmse: d.rmse || 0,
        })) || [];

      case 'weather':
        const { data: weatherData } = await supabase
          .from('aeso_training_data')
          .select('temperature_calgary, wind_speed, timestamp')
          .order('timestamp', { ascending: false })
          .limit(24);
        return weatherData?.map(d => ({
          time: new Date(d.timestamp).toLocaleTimeString(),
          temperature: d.temperature_calgary,
          windSpeed: d.wind_speed,
        })) || [];

      default:
        return [];
    }
  } catch (error) {
    console.error(`Error fetching sample data for ${dataSource}:`, error);
    return [];
  }
}

function analyzeDataStructure(data: any[]): DataAnalysis {
  if (!data || data.length === 0) {
    return {
      hasTimeSeries: false,
      hasNumericValues: false,
      hasCategoricalData: false,
      hasMultipleSeries: false,
      dataPointCount: 0,
      keys: [],
    };
  }

  const firstItem = data[0];
  const keys = Object.keys(firstItem);
  
  // Check for time series data
  const hasTimeSeries = keys.some(k => 
    k.toLowerCase().includes('time') || 
    k.toLowerCase().includes('date') || 
    k.toLowerCase().includes('timestamp')
  );

  // Check for numeric values
  const numericKeys = keys.filter(k => typeof firstItem[k] === 'number');
  const hasNumericValues = numericKeys.length > 0;

  // Check for categorical data (name/value pairs common in pie charts)
  const hasCategoricalData = keys.includes('name') && keys.includes('value');

  // Check if multiple numeric series exist
  const hasMultipleSeries = numericKeys.length > 1;

  return {
    hasTimeSeries,
    hasNumericValues,
    hasCategoricalData,
    hasMultipleSeries,
    dataPointCount: data.length,
    keys,
  };
}

function recommendWidgetType(analysis: DataAnalysis, dataSource: string): {
  widgetType: WidgetType;
  confidence: number;
  alternativeTypes: WidgetType[];
} {
  // Pie chart for categorical data (generation mix)
  if (analysis.hasCategoricalData || dataSource === 'generation') {
    return {
      widgetType: 'pie_chart',
      confidence: 0.95,
      alternativeTypes: ['bar_chart', 'table'],
    };
  }

  // Stat card for single values or very small datasets
  if (analysis.dataPointCount <= 1 || (!analysis.hasTimeSeries && !analysis.hasMultipleSeries)) {
    return {
      widgetType: 'stat_card',
      confidence: 0.9,
      alternativeTypes: ['gauge', 'table'],
    };
  }

  // Area chart for time series with single metric
  if (analysis.hasTimeSeries && !analysis.hasMultipleSeries && analysis.dataPointCount > 10) {
    return {
      widgetType: 'area_chart',
      confidence: 0.85,
      alternativeTypes: ['line_chart', 'bar_chart'],
    };
  }

  // Line chart for time series with multiple metrics or predictions
  if (analysis.hasTimeSeries && analysis.hasMultipleSeries) {
    return {
      widgetType: 'line_chart',
      confidence: 0.9,
      alternativeTypes: ['area_chart', 'table'],
    };
  }

  // Bar chart for comparison data
  if (analysis.hasNumericValues && !analysis.hasTimeSeries && analysis.dataPointCount > 1) {
    return {
      widgetType: 'bar_chart',
      confidence: 0.8,
      alternativeTypes: ['line_chart', 'table'],
    };
  }

  // Default to line chart
  return {
    widgetType: 'line_chart',
    confidence: 0.6,
    alternativeTypes: ['table', 'bar_chart'],
  };
}
