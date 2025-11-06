import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PricePrediction {
  timestamp: string;
  horizonHours: number;
  price: number;
  confidenceLower: number;
  confidenceUpper: number;
  confidenceScore: number;
  features: {
    avgPrice: number;
    hour: number;
    dayOfWeek: number;
    avgTemp: number;
    windSpeed: number;
    cloudCover: number;
    isWeekend: boolean;
    isHoliday: boolean;
  };
}

export interface ModelPerformance {
  modelVersion: string;
  mae: number;
  rmse: number;
  mape: number;
  rSquared: number;
  featureImportance: Record<string, number>;
}

export const useAESOPricePrediction = () => {
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPredictions = async (horizon: string = '24h') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-price-predictor', {
        body: { horizon }
      });

      // Check for errors in both the error object and data.error
      if (error) throw error;
      if (data && !data.success && data.error) {
        throw new Error(data.error);
      }

      if (data?.success) {
        setPredictions(data.predictions);
        toast({
          title: "Predictions Generated",
          description: `${data.predictions.length} price predictions for the next ${horizon}`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching predictions:', error);
      
      // Check if it's a training data issue - check multiple sources
      const errorMessage = error?.message || error?.error || error?.toString() || '';
      const isDataIssue = errorMessage.includes('Insufficient training data') || 
                         errorMessage.includes('training data');
      
      toast({
        title: isDataIssue ? "No Training Data" : "Prediction Error",
        description: isDataIssue 
          ? "Please click 'Update Data' first to collect historical price data for the AI model"
          : "Failed to generate price predictions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStoredPredictions = async (hoursAhead: number = 24) => {
    setLoading(true);
    try {
      const targetTime = new Date();
      targetTime.setHours(targetTime.getHours() + hoursAhead);

      const { data, error } = await supabase
        .from('aeso_price_predictions')
        .select('*')
        .gte('target_timestamp', new Date().toISOString())
        .lte('target_timestamp', targetTime.toISOString())
        .order('target_timestamp', { ascending: true });

      if (error) throw error;

      const formattedPredictions: PricePrediction[] = (data || []).map(d => ({
        timestamp: d.target_timestamp,
        horizonHours: d.horizon_hours,
        price: d.predicted_price,
        confidenceLower: d.confidence_lower || 0,
        confidenceUpper: d.confidence_upper || 0,
        confidenceScore: d.confidence_score || 0,
        features: (d.features_used as any) || {
          avgPrice: 0,
          hour: 0,
          dayOfWeek: 0,
          avgTemp: 0,
          windSpeed: 0,
          cloudCover: 0,
          isWeekend: false,
          isHoliday: false
        }
      }));

      setPredictions(formattedPredictions);
    } catch (error) {
      console.error('Error fetching stored predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModelPerformance = async () => {
    try {
      const { data, error } = await supabase
        .from('aeso_model_performance')
        .select('*')
        .order('evaluation_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setModelPerformance({
          modelVersion: data.model_version,
          mae: data.mae || 0,
          rmse: data.rmse || 0,
          mape: data.mape || 0,
          rSquared: data.r_squared || 0,
          featureImportance: (data.feature_importance as any) || {}
        });
      }
    } catch (error) {
      console.error('Error fetching model performance:', error);
    }
  };

  const collectTrainingData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('aeso-data-collector');
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Data Collected",
          description: "Training data successfully collected and stored",
        });
        
        // Automatically generate predictions after collecting data
        console.log('Auto-generating predictions after data collection...');
        await fetchPredictions('24h');
      }
    } catch (error) {
      console.error('Error collecting training data:', error);
      toast({
        title: "Collection Error",
        description: "Failed to collect training data",
        variant: "destructive"
      });
    }
  };

  const loadHistoricalData = async () => {
    setLoading(true);
    try {
      toast({
        title: "Loading Historical Data",
        description: "Fetching 3 years of data... This may take several minutes",
      });

      const { data, error } = await supabase.functions.invoke('aeso-historical-data-loader');
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Historical Data Loaded",
          description: `Successfully loaded ${data.recordsInserted} records from the past 3 years`,
        });

        // Automatically train model after loading historical data
        console.log('Auto-training model with historical data...');
        await trainModel();
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load historical data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async () => {
    setLoading(true);
    try {
      toast({
        title: "Training Model",
        description: "Analyzing correlations and training AI model...",
      });

      const { data, error } = await supabase.functions.invoke('aeso-model-trainer');
      if (error) throw error;
      
      if (data?.success) {
        setModelPerformance({
          modelVersion: data.model_version,
          mae: data.performance.mae,
          rmse: data.performance.rmse,
          mape: data.performance.mape,
          rSquared: data.performance.r_squared,
          featureImportance: data.feature_importance
        });

        toast({
          title: "Model Trained Successfully",
          description: `MAE: ${data.performance.mae.toFixed(2)}, MAPE: ${data.performance.mape.toFixed(2)}%, R²: ${data.performance.r_squared.toFixed(4)}`,
        });

        // Auto-generate predictions after training
        await fetchPredictions('24h');
      }
    } catch (error) {
      console.error('Error training model:', error);
      toast({
        title: "Training Error",
        description: "Failed to train model",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    predictions,
    modelPerformance,
    loading,
    fetchPredictions,
    fetchStoredPredictions,
    fetchModelPerformance,
    collectTrainingData,
    loadHistoricalData,
    trainModel
  };
};
