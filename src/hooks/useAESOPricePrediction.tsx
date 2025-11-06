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
        
        // Auto-train if we have enough data
        console.log('Checking if model training is needed...');
        await autoTrainIfNeeded();
        
        // Then generate predictions
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

  const autoTrainIfNeeded = async () => {
    try {
      // Check how much training data we have
      const { count } = await supabase
        .from('aeso_training_data')
        .select('*', { count: 'exact', head: true });

      if (!count || count < 100) {
        console.log(`Not enough data to train (${count}/100 minimum)`);
        return;
      }

      // Check when we last trained
      const { data: lastTraining } = await supabase
        .from('aeso_model_performance')
        .select('evaluation_date')
        .order('evaluation_date', { ascending: false })
        .limit(1)
        .single();

      const hoursSinceLastTraining = lastTraining 
        ? (Date.now() - new Date(lastTraining.evaluation_date).getTime()) / (1000 * 60 * 60)
        : Infinity;

      // Train every 24 hours or if never trained
      if (hoursSinceLastTraining > 24) {
        console.log('Auto-training model with latest data...');
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
          console.log('✅ Model auto-trained successfully');
        }
      } else {
        console.log(`Skipping training - last trained ${hoursSinceLastTraining.toFixed(1)}h ago`);
      }
    } catch (error) {
      console.error('Auto-training error:', error);
      // Don't show error to user for background training
    }
  };


  return {
    predictions,
    modelPerformance,
    loading,
    fetchPredictions,
    fetchStoredPredictions,
    fetchModelPerformance,
    collectTrainingData
  };
};
