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

// Cache configuration
const CACHE_KEY = 'aeso_drift_result_cache';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Boot error detection
const isBootError = (error: any): boolean => {
  const message = String(error?.message || error || '').toLowerCase();
  return message.includes('503') || 
         message.includes('boot_error') ||
         message.includes('failed to start') ||
         message.includes('temporarily unavailable') ||
         message.includes('internal error');
};

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache utilities
const cacheDriftResult = (data: DriftDetectionResult) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('[Drift] Failed to cache result:', e);
  }
};

const getCachedDriftResult = (): DriftDetectionResult | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (e) {
    console.warn('[Drift] Failed to read cache:', e);
    return null;
  }
};

export const useAESODriftDetector = () => {
  const [loading, setLoading] = useState(false);
  const [driftResult, setDriftResult] = useState<DriftDetectionResult | null>(null);
  const { toast } = useToast();

  const checkDrift = async (retryCount = 0): Promise<DriftDetectionResult | null> => {
    setLoading(true);
    
    try {
      console.log(`🔍 Checking for model drift... ${retryCount > 0 ? `(retry ${retryCount}/3)` : ''}`);
      
      const { data, error } = await supabase.functions.invoke('aeso-drift-detector');

      if (error) {
        // Check for boot error - retry with exponential backoff
        if (isBootError(error) && retryCount < 3) {
          const delayMs = (retryCount + 1) * 2000;
          console.log(`[Drift] Boot error detected, retry ${retryCount + 1}/3 in ${delayMs / 1000}s...`);
          setLoading(false); // Reset loading during wait
          await delay(delayMs);
          return checkDrift(retryCount + 1);
        }

        console.error('Drift detection error:', error);
        
        // Try cached result on failure
        const cached = getCachedDriftResult();
        if (cached) {
          toast({
            title: "Using Cached Result",
            description: "Could not reach server, showing last known drift status",
            variant: "default"
          });
          setDriftResult(cached);
          setLoading(false);
          return cached;
        }
        
        toast({
          title: "Drift Detection Failed",
          description: error.message || "Failed to check for model drift",
          variant: "destructive"
        });
        setLoading(false);
        return null;
      }

      if (data?.success) {
        // Cache successful result
        cacheDriftResult(data);
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
        setLoading(false);
        return data;
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Drift detection error:', error);
      
      // Try cached result on exception
      const cached = getCachedDriftResult();
      if (cached) {
        toast({
          title: "Using Cached Result",
          description: "Could not reach server, showing last known drift status",
          variant: "default"
        });
        setDriftResult(cached);
        setLoading(false);
        return cached;
      }
      
      toast({
        title: "Drift Detection Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      setLoading(false);
      return null;
    }
  };

  return {
    checkDrift,
    loading,
    driftResult
  };
};
