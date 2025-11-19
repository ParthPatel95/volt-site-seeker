import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Phase3FeaturesResponse {
  success: boolean;
  phase: string;
  description: string;
  stats: {
    total_records: number;
    updated_records: number;
    gas_features: number;
    interaction_features: number;
    volatility_features: number;
    momentum_features: number;
    natural_gas_coverage: string;
  };
  improvements: string[];
}

export const useAESOPhase3Features = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Phase3FeaturesResponse | null>(null);

  const calculatePhase3Features = async () => {
    setLoading(true);
    try {
      toast({
        title: "🌤️ Calculating Phase 3 Features",
        description: "Processing weather, natural gas, interactions, volatility, and momentum...",
        duration: 5000,
      });

      const { data, error } = await supabase.functions.invoke('aeso-phase3-features');

      if (error) {
        throw error;
      }

      if (data.success) {
        setResults(data);
        toast({
          title: "✅ Phase 3 Features Complete",
          description: `${data.stats.updated_records} records enhanced with ${data.stats.gas_features + data.stats.interaction_features + data.stats.volatility_features + data.stats.momentum_features} features`,
          duration: 10000,
        });
      } else {
        throw new Error(data.error || 'Phase 3 calculation failed');
      }

      return data;
    } catch (error: any) {
      console.error('Phase 3 features error:', error);
      toast({
        title: "Phase 3 Features Failed",
        description: error.message || "Failed to calculate Phase 3 features",
        variant: "destructive",
        duration: 10000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculatePhase3Features,
    loading,
    results,
  };
};
