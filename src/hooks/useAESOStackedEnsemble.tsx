import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface StackedEnsembleMetrics {
  test_smape: number;
  test_mae: number;
  test_rmse: number;
  validation_smape: number;
}

interface BaseModelSMAPEs {
  gradient_boosting: number;
  ridge: number;
  lstm: number;
  quantile: number;
  seasonal: number;
}

interface EnsembleWeights {
  gb: number;
  ridge: number;
  lstm: number;
  quantile: number;
  seasonal: number;
}

interface StackedEnsembleResult {
  success: boolean;
  model_version: string;
  metrics: StackedEnsembleMetrics;
  base_model_smapes: BaseModelSMAPEs;
  ensemble_weights: EnsembleWeights;
  improvement: string;
}

export function useAESOStackedEnsemble() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StackedEnsembleResult | null>(null);

  const trainStackedEnsemble = async () => {
    setLoading(true);
    try {
      toast({
        title: "🎯 Training Stacked Ensemble",
        description: "Training 5 base models (GB, Ridge, LSTM, Quantile, Seasonal) + meta-learner with sMAPE optimization. This will take 2-3 minutes...",
        duration: 5000,
      });

      const { data, error } = await supabase.functions.invoke('aeso-stacked-ensemble-trainer');

      if (error) {
        throw error;
      }

      if (data.success) {
        setResult(data);
        toast({
          title: "✅ Stacked Ensemble Trained",
          description: `Test sMAPE: ${data.metrics.test_smape.toFixed(2)}% | ${data.improvement}`,
          duration: 15000,
        });
      } else {
        throw new Error(data.error || 'Stacked ensemble training failed');
      }

      return data;
    } catch (error: any) {
      console.error('Stacked ensemble error:', error);
      
      // Check for timeout/gateway errors
      const errorMsg = error.message || '';
      const isTimeout = errorMsg.includes('timeout') || 
                       errorMsg.includes('504') || 
                       errorMsg.includes('Gateway Timeout') ||
                       errorMsg.includes('Failed to send a request');
      
      if (isTimeout) {
        toast({
          title: "⏱️ Training In Progress",
          description: "Stacked ensemble training takes 2-3 minutes and may continue in the background. Refresh the page to check results.",
          variant: "default",
          duration: 15000,
        });
      } else {
        toast({
          title: "Training Failed",
          description: error.message || "Failed to train stacked ensemble",
          variant: "destructive",
          duration: 10000,
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    trainStackedEnsemble,
    loading,
    result,
  };
}
