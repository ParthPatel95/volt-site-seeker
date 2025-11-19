import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Phase4FeaturesResponse {
  success: boolean;
  phase: string;
  description: string;
  stats: {
    total_records: number;
    updated_records: number;
    polynomial_features: number;
    ratio_features: number;
    cross_features: number;
    binning_features: number;
  };
  improvements: string[];
}

export const useAESOPhase4Features = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Phase4FeaturesResponse | null>(null);

  const calculatePhase4Features = async () => {
    setLoading(true);
    try {
      toast({
        title: "🔬 Calculating Phase 4 Features",
        description: "Processing advanced feature engineering: polynomials, ratios, crosses & binning...",
        duration: 5000,
      });

      const { data, error } = await supabase.functions.invoke('aeso-phase4-features');

      if (error) {
        throw error;
      }

      if (data.success) {
        setResults(data);
        const totalFeatures = data.stats.polynomial_features + data.stats.ratio_features + 
                             data.stats.cross_features + data.stats.binning_features;
        toast({
          title: "✅ Phase 4 Features Complete",
          description: `${data.stats.updated_records} records enhanced with ${totalFeatures} advanced features`,
          duration: 10000,
        });
      } else {
        throw new Error(data.error || 'Phase 4 calculation failed');
      }

      return data;
    } catch (error: any) {
      console.error('Phase 4 features error:', error);
      toast({
        title: "Phase 4 Features Failed",
        description: error.message || "Failed to calculate Phase 4 features",
        variant: "destructive",
        duration: 10000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculatePhase4Features,
    loading,
    results,
  };
};
