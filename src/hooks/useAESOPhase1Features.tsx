import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Phase1FeaturesResponse {
  success: boolean;
  records_processed: number;
  message: string;
  improvements: {
    extended_lags: string[];
    quantile_features: string[];
    day_type: string;
    prediction_clipping: string;
    training_window: string;
  };
  sample_features: any[];
}

export const useAESOPhase1Features = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Phase1FeaturesResponse | null>(null);
  const { toast } = useToast();

  const calculatePhase1Features = async () => {
    setLoading(true);
    
    try {
      console.log('🚀 Starting Phase 1 feature calculation...');
      
      const { data, error } = await supabase.functions.invoke('aeso-phase1-features', {
        body: {}
      });

      if (error) {
        console.error('Phase 1 features error:', error);
        toast({
          title: "Feature Calculation Failed",
          description: error.message || "Failed to calculate Phase 1 features",
          variant: "destructive"
        });
        return null;
      }

      if (data?.success) {
        setResults(data);
        toast({
          title: "Phase 1 Features Calculated",
          description: `✅ ${data.records_processed} records processed with extended lags, quantiles, and day_type features`,
          variant: "default"
        });
        
        console.log('✅ Phase 1 improvements applied:', data.improvements);
        console.log('Sample features:', data.sample_features);
        return data;
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Phase 1 calculation error:', error);
      toast({
        title: "Feature Calculation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculatePhase1Features,
    loading,
    results
  };
};
