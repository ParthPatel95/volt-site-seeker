import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PredictionQuality {
  model_smape: number;
  model_mae: number;
  model_rmse: number;
  prediction_uncertainty: number;
}

interface Prediction {
  target_timestamp: string;
  ensemble_price: number;
  confidence_level: 'high' | 'medium' | 'low';
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  prediction_std: number;
  model_version: string;
  prediction_quality: PredictionQuality;
}

interface ModelInfo {
  version: string;
  trained_at: string;
  performance: {
    smape: number;
    mae: number;
    rmse: number;
    r_squared: number;
  };
}

export const useAESORealtimePredict = () => {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const { toast } = useToast();

  const generatePredictions = async (hoursAhead: number = 24) => {
    setLoading(true);
    
    try {
      console.log(`🔮 Requesting real-time predictions for ${hoursAhead} hours ahead...`);
      
      const { data, error } = await supabase.functions.invoke('aeso-predict-realtime', {
        body: { hoursAhead }
      });

      if (error) {
        console.error('Real-time prediction error:', error);
        toast({
          title: "Prediction Failed",
          description: error.message || "Failed to generate predictions",
          variant: "destructive"
        });
        return null;
      }

      if (data?.success) {
        setPredictions(data.predictions);
        setModelInfo(data.model_info);
        
        const avgConfidence = data.predictions.reduce((sum: number, p: Prediction) => 
          sum + (p.confidence_level === 'high' ? 100 : p.confidence_level === 'medium' ? 66 : 33), 0
        ) / data.predictions.length;

        toast({
          title: "✅ Predictions Generated",
          description: `${data.predictions.length} predictions with ${avgConfidence.toFixed(0)}% avg confidence`,
          variant: "default"
        });
        
        console.log('Real-time predictions:', data);
        return data;
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Real-time prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generatePredictions,
    loading,
    predictions,
    modelInfo
  };
};
