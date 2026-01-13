import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIAnalysisResult {
  item: {
    name: string;
    description: string;
    brand?: string;
    model?: string;
    suggestedSku?: string;
  };
  quantity: {
    count: number;
    unit: string;
    confidence: 'high' | 'medium' | 'low';
  };
  condition: 'new' | 'good' | 'fair' | 'poor';
  category: {
    suggested: string;
    alternatives: string[];
  };
  marketValue: {
    lowEstimate: number;
    highEstimate: number;
    currency: string;
    confidence: 'high' | 'medium' | 'low';
    notes?: string;
    isUsed: boolean;
  };
}

interface UseInventoryAIAnalysisResult {
  analyzeImage: (imageBase64: string, existingCategories?: string[]) => Promise<AIAnalysisResult | null>;
  isAnalyzing: boolean;
  analysisResult: AIAnalysisResult | null;
  error: string | null;
  reset: () => void;
}

export function useInventoryAIAnalysis(): UseInventoryAIAnalysisResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeImage = useCallback(async (
    imageBase64: string, 
    existingCategories?: string[]
  ): Promise<AIAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('inventory-ai-analyzer', {
        body: { 
          imageBase64,
          existingCategories 
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Analysis failed');
      }

      if (data.error) {
        // Handle specific error cases
        if (data.error.includes('Rate limit')) {
          toast({
            title: 'Please wait',
            description: 'Too many requests. Please try again in a moment.',
            variant: 'destructive',
          });
        } else if (data.error.includes('credits')) {
          toast({
            title: 'Credits exhausted',
            description: 'AI credits have been used up. Please add more credits.',
            variant: 'destructive',
          });
        }
        throw new Error(data.error);
      }

      const result = data.analysis as AIAnalysisResult;
      setAnalysisResult(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      toast({
        title: 'Analysis failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const reset = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analyzeImage,
    isAnalyzing,
    analysisResult,
    error,
    reset,
  };
}
