import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Phase2FeaturesResponse {
  success: boolean;
  phase: number;
  description: string;
  stats: {
    total_records: number;
    updated_records: number;
    fourier_features: number;
    timing_features: number;
    duration_seconds: number;
  };
  improvements: string[];
  sample_data: any[];
}

export const useAESOPhase2Features = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Phase2FeaturesResponse | null>(null);
  const { toast } = useToast();

  const calculatePhase2Features = async () => {
    setLoading(true);
    
    try {
      console.log('🚀 Starting Phase 2 feature calculation...');
      
      const { data, error } = await supabase.functions.invoke('aeso-phase2-features', {
        body: {}
      });

      if (error) {
        console.error('Phase 2 features error:', error);
        toast({
          title: "Phase 2 Calculation Failed",
          description: error.message || "Failed to calculate Phase 2 features",
          variant: "destructive"
        });
        return null;
      }

      if (data?.success) {
        setResults(data);
        toast({
          title: "Phase 2 Features Calculated",
          description: `✅ ${data.stats.updated_records} records updated with Fourier transforms and timing features`,
          variant: "default"
        });
        
        console.log('✅ Phase 2 improvements:', data.improvements);
        console.log('Sample data:', data.sample_data);
        return data;
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Phase 2 calculation error:', error);
      toast({
        title: "Phase 2 Calculation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculatePhase2Features,
    loading,
    results
  };
};
