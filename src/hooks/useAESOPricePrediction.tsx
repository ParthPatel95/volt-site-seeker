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
    setLoading(true);
    try {
      const { data: currentData, error: currentError } = await supabase.functions.invoke('aeso-data-collector');
      
      if (currentError) throw currentError;
      
      toast({
        title: "Data Updated",
        description: "Latest energy data collected successfully",
      });
      
      await fetchPredictions('24h');
      
    } catch (error: any) {
      console.error('Error collecting data:', error);
      toast({
        title: "Data Collection Error",
        description: error.message || "Failed to collect latest data",
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
        title: "Fetching Historical Data",
        description: "Collecting up to 10 years of energy price data...",
      });
      
      const { data: histData, error: histError } = await supabase.functions.invoke('aeso-historical-data-fetcher');
      
      if (histError) {
        console.error('Historical fetch error:', histError);
        throw new Error('Failed to fetch historical data');
      }
      
      if (histData?.success) {
        toast({
          title: "Historical Data Collected",
          description: `${histData.recordsInserted} historical records collected`,
        });
      }
      
      toast({
        title: "Training AI Model",
        description: "Training prediction model with historical data...",
      });
      
      const { data: trainData, error: trainError } = await supabase.functions.invoke('aeso-model-trainer');
      
      if (trainError) throw trainError;
      
      if (trainData?.success) {
        setModelPerformance({
          modelVersion: trainData.model_version,
          mae: trainData.performance.mae,
          rmse: trainData.performance.rmse,
          mape: trainData.performance.mape,
          rSquared: trainData.performance.r_squared,
          featureImportance: trainData.feature_importance
        });
        
        toast({
          title: "AI Model Trained",
          description: `Model accuracy: ${trainData.performance.r_squared.toFixed(2)} R² score, ${trainData.training_samples} samples`,
        });
      }
      
    } catch (error: any) {
      console.error('Error training model:', error);
      toast({
        title: "Training Error",
        description: error.message || "Failed to train model",
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
    trainModel
  };
};
