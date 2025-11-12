import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CVFoldResult {
  fold_number: number;
  smape: number;
  mae: number;
  rmse: number;
  mape: number;
  validation_samples: number;
}

interface CVResponse {
  success: boolean;
  duration_seconds: number;
  num_folds: number;
  fold_results: CVFoldResult[];
  average_metrics: {
    smape: number;
    mae: number;
    rmse: number;
    mape: number;
  };
  message: string;
}

export const useAESOCrossValidation = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CVResponse | null>(null);
  const { toast } = useToast();

  const runCrossValidation = async (numFolds: number = 5, validationWindowHours: number = 168) => {
    setLoading(true);
    
    try {
      console.log(`Starting cross-validation with ${numFolds} folds...`);
      
      const { data, error } = await supabase.functions.invoke('aeso-cv-validator', {
        body: {
          numFolds,
          validationWindowHours
        }
      });

      if (error) {
        console.error('Cross-validation error:', error);
        toast({
          title: "Cross-Validation Failed",
          description: error.message || "Failed to complete cross-validation",
          variant: "destructive"
        });
        return null;
      }

      if (data?.success) {
        setResults(data);
        toast({
          title: "Cross-Validation Complete",
          description: data.message || `Average sMAPE: ${data.average_metrics?.smape?.toFixed(2)}%`,
          variant: "default"
        });
        
        console.log('Cross-validation results:', data);
        return data;
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Cross-validation error:', error);
      toast({
        title: "Cross-Validation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    runCrossValidation,
    loading,
    results
  };
};
