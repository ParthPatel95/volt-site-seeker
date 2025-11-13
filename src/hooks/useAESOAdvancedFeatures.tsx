import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AdvancedFeatureStats {
  total_records: number;
  updated_records: number;
  natural_gas_coverage: string;
  fourier_features: number;
  gas_features: number;
  timing_features: number;
  advanced_features: number;
}

export function useAESOAdvancedFeatures() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdvancedFeatureStats | null>(null);

  const calculateAdvancedFeatures = async () => {
    setLoading(true);
    try {
      toast({
        title: "🚀 Calculating Advanced Features",
        description: "Computing Fourier transforms, natural gas integration, and advanced interactions...",
        duration: 5000,
      });

      const { data, error } = await supabase.functions.invoke('aeso-advanced-feature-engineer');

      if (error) {
        throw error;
      }

      if (data.success) {
        setStats(data.stats);
        toast({
          title: "✅ Advanced Features Calculated",
          description: `Updated ${data.stats.updated_records} records with ${data.stats.fourier_features + data.stats.gas_features + data.stats.timing_features + data.stats.advanced_features} new features`,
          duration: 10000,
        });
      } else {
        throw new Error(data.error || 'Advanced feature calculation failed');
      }

      return data;
    } catch (error: any) {
      console.error('Advanced features error:', error);
      toast({
        title: "Advanced Features Failed",
        description: error.message || "Failed to calculate advanced features",
        variant: "destructive",
        duration: 10000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculateAdvancedFeatures,
    loading,
    stats,
  };
}
