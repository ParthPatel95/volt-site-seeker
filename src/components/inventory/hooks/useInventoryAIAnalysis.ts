import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExtractedText {
  modelNumber?: string;
  serialNumber?: string;
  barcode?: string;
  otherText?: string[];
}

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
  extractedText?: ExtractedText;
  identificationConfidence: 'high' | 'medium' | 'low';
}

export interface MultiItemAnalysisResult {
  items: AIAnalysisResult[];
  totalItemsDetected: number;
}

interface UseInventoryAIAnalysisResult {
  analyzeImage: (images: string | string[], existingCategories?: string[]) => Promise<AIAnalysisResult | null>;
  analyzeMultipleItems: (images: string | string[], existingCategories?: string[]) => Promise<MultiItemAnalysisResult | null>;
  isAnalyzing: boolean;
  analysisResult: AIAnalysisResult | null;
  multiItemResults: MultiItemAnalysisResult | null;
  error: string | null;
  reset: () => void;
}

export function useInventoryAIAnalysis(): UseInventoryAIAnalysisResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [multiItemResults, setMultiItemResults] = useState<MultiItemAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApiError = useCallback((fnError: { message?: string } | null, data: { error?: string } | null) => {
    if (fnError) {
      throw new Error(fnError.message || 'Analysis failed');
    }

    if (data?.error) {
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
  }, [toast]);

  // Single item analysis (backward compatible)
  const analyzeImage = useCallback(async (
    images: string | string[], 
    existingCategories?: string[]
  ): Promise<AIAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setMultiItemResults(null);

    try {
      const imageArray = Array.isArray(images) ? images : [images];
      
      const body = imageArray.length === 1 
        ? { imageBase64: imageArray[0], existingCategories, detectMultipleItems: false }
        : { images: imageArray, existingCategories, detectMultipleItems: false };

      const { data, error: fnError } = await supabase.functions.invoke('inventory-ai-analyzer', {
        body
      });

      handleApiError(fnError, data);

      const result = data.analysis as AIAnalysisResult;
      
      if (!result.identificationConfidence) {
        result.identificationConfidence = result.quantity.confidence;
      }
      
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
  }, [toast, handleApiError]);

  // Multi-item analysis
  const analyzeMultipleItems = useCallback(async (
    images: string | string[], 
    existingCategories?: string[]
  ): Promise<MultiItemAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setMultiItemResults(null);

    try {
      const imageArray = Array.isArray(images) ? images : [images];
      
      const body = imageArray.length === 1 
        ? { imageBase64: imageArray[0], existingCategories, detectMultipleItems: true }
        : { images: imageArray, existingCategories, detectMultipleItems: true };

      const { data, error: fnError } = await supabase.functions.invoke('inventory-ai-analyzer', {
        body
      });

      handleApiError(fnError, data);

      // Handle fallback if response format is unexpected but has valid data
      if (!data.multipleItems && data.analysis) {
        // Single item returned when multi-item was requested - wrap it
        const singleResult = data.analysis as AIAnalysisResult;
        const fallbackResult: MultiItemAnalysisResult = {
          items: [{
            ...singleResult,
            identificationConfidence: singleResult.identificationConfidence || singleResult.quantity.confidence
          }],
          totalItemsDetected: singleResult.quantity.count
        };
        setMultiItemResults(fallbackResult);
        toast({
          title: 'Found 1 item type',
          description: 'Only one item type was detected. Try a photo with more variety for multi-item mode.',
        });
        return fallbackResult;
      }

      if (!data.results) {
        throw new Error('Invalid multi-item response format');
      }

      const result = data.results as MultiItemAnalysisResult;
      
      // Ensure identificationConfidence exists for all items
      result.items = result.items.map(item => ({
        ...item,
        identificationConfidence: item.identificationConfidence || item.quantity.confidence
      }));
      
      setMultiItemResults(result);
      
      toast({
        title: `Found ${result.totalItemsDetected} items`,
        description: `Detected ${result.items.length} different item types.`,
      });
      
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
  }, [toast, handleApiError]);

  const reset = useCallback(() => {
    setAnalysisResult(null);
    setMultiItemResults(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analyzeImage,
    analyzeMultipleItems,
    isAnalyzing,
    analysisResult,
    multiItemResults,
    error,
    reset,
  };
}
