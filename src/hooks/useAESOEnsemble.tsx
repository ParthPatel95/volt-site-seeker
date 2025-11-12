import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnsemblePrediction {
  target_timestamp: string;
  ensemble_price: number;
  ml_predictor_price: number;
  moving_average_price: number;
  arima_price: number;
  seasonal_price: number;
  prediction_std: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
}

interface EnsembleResponse {
  success: boolean;
  predictions: EnsemblePrediction[];
  duration_seconds: number;
  weights_used: {
    ml_weight: number;
    ma_weight: number;
    arima_weight: number;
    seasonal_weight: number;
  };
  message: string;
}

export const useAESOEnsemble = () => {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<EnsemblePrediction[]>([]);
  const { toast } = useToast();

  const generateEnsemblePredictions = async (hoursAhead: number = 24) => {
    setLoading(true);
    
    try {
      console.log(`Generating ensemble predictions for ${hoursAhead} hours ahead...`);
      
      const { data, error } = await supabase.functions.invoke('aeso-ensemble-predictor', {
        body: { hoursAhead }
      });

      if (error) {
        console.error('Ensemble prediction error:', error);
        toast({
          title: "Ensemble Prediction Failed",
          description: error.message || "Failed to generate ensemble predictions",
          variant: "destructive"
        });
        return null;
      }

      if (data?.success) {
        setPredictions(data.predictions);
        toast({
          title: "Ensemble Predictions Generated",
          description: data.message || `Generated ${data.predictions?.length || 0} predictions`,
          variant: "default"
        });
        
        console.log('Ensemble predictions:', data);
        console.log('Model weights used:', data.weights_used);
        return data;
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Ensemble prediction error:', error);
      toast({
        title: "Ensemble Prediction Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateEnsemblePredictions,
    loading,
    predictions
  };
};
