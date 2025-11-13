import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  smape: number;
  mae: number;
  rmse: number;
  spike_error_rate?: number;
}

interface DriftStats {
  validated_predictions: number;
  model_version: string;
  model_trained_at: string;
  data_age_hours: number | null;
}

interface DriftDetectionResult {
  success: boolean;
  drift_detected: boolean;
  needs_retraining: boolean;
  drift_reasons: string[];
  current_performance: PerformanceMetrics;
  baseline_performance: PerformanceMetrics;
  degradation_factor: number;
  stats: DriftStats;
  recommendations: string[];
  timestamp: string;
}

export const useAESODriftDetector = () => {
  const [loading, setLoading] = useState(false);
  const [driftResult, setDriftResult] = useState<DriftDetectionResult | null>(null);
  const { toast } = useToast();

  const checkDrift = async () => {
    setLoading(true);
    
    try {
      console.log('🔍 Checking for model drift...');
      
      const { data, error } = await supabase.functions.invoke('aeso-drift-detector');

      if (error) {
        console.error('Drift detection error:', error);
        toast({
          title: "Drift Detection Failed",
          description: error.message || "Failed to check for model drift",
          variant: "destructive"
        });
        return null;
      }

      if (data?.success) {
        setDriftResult(data);
        
        if (data.drift_detected) {
          toast({
            title: "⚠️ Model Drift Detected",
            description: `Performance degraded: ${data.drift_reasons.join(', ')}. Retraining recommended.`,
            variant: "destructive",
            duration: 10000
          });
        } else {
          toast({
            title: "✅ No Drift Detected",
            description: `Model performing well. sMAPE: ${data.current_performance.smape.toFixed(2)}%`,
            variant: "default"
          });
        }
        
        console.log('Drift detection result:', data);
        return data;
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Drift detection error:', error);
      toast({
        title: "Drift Detection Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkDrift,
    loading,
    driftResult
  };
};
