
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CapacityEstimationRequest {
  latitude: number;
  longitude: number;
  manualOverride?: {
    transformers?: number;
    capacity?: number;
    substationType?: 'transmission' | 'distribution';
  };
}

interface CapacityEstimationResult {
  coordinates: { lat: number; lng: number };
  estimatedCapacity: {
    min: number;
    max: number;
    unit: 'MW';
  };
  substationType: 'transmission' | 'distribution' | 'unknown';
  detectionResults: {
    transformersDetected: number;
    transmissionLines: number;
    substationArea: number;
    confidence: number;
  };
  observations: string[];
  publicData?: {
    name?: string;
    operator?: string;
    knownCapacity?: number;
    source: string;
  };
  satelliteImageUrl: string;
  timestamp: string;
}

export function useCapacityEstimator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CapacityEstimationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const estimateCapacity = async (request: CapacityEstimationRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Estimating substation capacity:', request);
      
      const { data, error: functionError } = await supabase.functions.invoke('substation-capacity-estimator', {
        body: request
      });

      if (functionError) {
        throw functionError;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to estimate capacity');
      }

      setResult(data.result);
      
      toast({
        title: "Capacity Estimation Complete",
        description: `Estimated ${data.result.estimatedCapacity.min}-${data.result.estimatedCapacity.max} MW`,
      });

      return data.result;
    } catch (err: any) {
      console.error('Capacity estimation error:', err);
      const errorMessage = err.message || 'Failed to estimate substation capacity';
      setError(errorMessage);
      
      toast({
        title: "Estimation Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateCoordinates = (lat: number, lng: number): boolean => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const runQAValidation = (result: CapacityEstimationResult): string[] => {
    const issues: string[] = [];
    
    if (result.detectionResults.confidence < 70) {
      issues.push('Low detection confidence - manual verification recommended');
    }
    
    if (result.detectionResults.transformersDetected === 0) {
      issues.push('No transformers detected - coordinates may not be a substation');
    }
    
    if (result.estimatedCapacity.max - result.estimatedCapacity.min > 100) {
      issues.push('Wide capacity range - consider manual input for better accuracy');
    }
    
    if (!result.publicData?.name || result.publicData.name.includes('Unknown')) {
      issues.push('No public records found - estimation based on imagery only');
    }
    
    return issues;
  };

  return {
    loading,
    result,
    error,
    estimateCapacity,
    validateCoordinates,
    runQAValidation,
    clearResult: () => setResult(null),
    clearError: () => setError(null)
  };
}
