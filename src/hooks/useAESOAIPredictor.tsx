import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIAnalysis {
  market_regime: 'stable' | 'volatile' | 'spike_risk' | 'low';
  key_drivers: string[];
  risk_factors: string[];
  recommendation: string;
}

interface AIPrediction {
  id: string;
  prediction_timestamp: string;
  target_timestamp: string;
  predicted_price: number;
  confidence_lower: number;
  confidence_upper: number;
  confidence_score: number;
  horizon_hours: number;
  model_version: string;
  features_used: {
    ai_reasoning: string;
    market_regime: string;
    key_drivers: string[];
    risk_factors: string[];
    recommendation: string;
    ai_confidence: number;
    historical_avg: number;
    historical_std: number;
    context_hours: number;
  };
}

interface MarketContext {
  current_price: number;
  avg_7d: number;
  volatility: number;
  trend_24h: string;
  data_points: number;
}

interface AIPredicorResponse {
  success: boolean;
  predictions: AIPrediction[];
  analysis: AIAnalysis;
  market_context: MarketContext;
  model_version: string;
  generated_at: string;
  error?: string;
}

export const useAESOAIPredictor = () => {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [marketContext, setMarketContext] = useState<MarketContext | null>(null);
  const { toast } = useToast();

  const generateAIPredictions = async () => {
    setLoading(true);
    
    try {
      console.log('🤖 Requesting AI-powered predictions...');
      
      const { data, error } = await supabase.functions.invoke('aeso-ai-predictor', {
        body: {}
      });

      if (error) {
        console.error('AI prediction error:', error);
        toast({
          title: "AI Prediction Failed",
          description: error.message || "Failed to generate AI predictions",
          variant: "destructive"
        });
        return null;
      }

      const response = data as AIPredicorResponse;

      if (response?.success) {
        setPredictions(response.predictions);
        setAnalysis(response.analysis);
        setMarketContext(response.market_context);
        
        toast({
          title: "AI Analysis Complete",
          description: `${response.predictions.length} predictions generated with ${response.analysis.market_regime} market regime`,
          variant: "default"
        });
        
        console.log('AI predictions:', response);
        return response;
      } else {
        throw new Error(response?.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('AI prediction error:', error);
      toast({
        title: "AI Prediction Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async () => {
    setLoading(true);
    
    try {
      console.log('🏋️ Starting ML model training...');
      
      const { data, error } = await supabase.functions.invoke('aeso-ml-trainer', {
        body: {}
      });

      if (error) {
        console.error('Training error:', error);
        toast({
          title: "Training Failed",
          description: error.message || "Failed to train model",
          variant: "destructive"
        });
        return null;
      }

      if (data?.success) {
        toast({
          title: "Training Complete",
          description: `Model ${data.model_version} trained on ${data.training_records?.toLocaleString()} records. MAE: $${data.performance?.mae?.toFixed(2)}`,
          variant: "default"
        });
        
        return data;
      } else {
        throw new Error(data?.error || 'Training failed');
      }
      
    } catch (error) {
      console.error('Training error:', error);
      toast({
        title: "Training Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const validatePredictions = async () => {
    setLoading(true);
    
    try {
      console.log('🔍 Validating predictions...');
      
      const { data, error } = await supabase.functions.invoke('aeso-validate-predictions', {
        body: {}
      });

      if (error) {
        console.error('Validation error:', error);
        toast({
          title: "Validation Failed",
          description: error.message || "Failed to validate predictions",
          variant: "destructive"
        });
        return null;
      }

      if (data?.success) {
        toast({
          title: "Validation Complete",
          description: `Validated ${data.validated} predictions. Overall MAE: $${data.summary?.overall?.mae?.toFixed(2) || 'N/A'}`,
          variant: "default"
        });
        
        return data;
      } else {
        throw new Error(data?.error || 'Validation failed');
      }
      
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateAIPredictions,
    trainModel,
    validatePredictions,
    loading,
    predictions,
    analysis,
    marketContext
  };
};
