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

      if (error) throw error;

      if (data?.success) {
        setPredictions(data.predictions);
        toast({
          title: "Predictions Generated",
          description: `${data.predictions.length} price predictions for the next ${horizon}`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching predictions:', error);
      
      // Check if it's a training data issue
      const errorMessage = error?.message || error?.toString() || '';
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
