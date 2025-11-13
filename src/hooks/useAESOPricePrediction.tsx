import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PricePrediction {
  timestamp: string;
  horizonHours: number;
  price: number;
  confidenceLower: number;
  confidenceUpper: number;
  confidenceScore: number;
  features: {
    avgPrice: number;
    hour: number;
    dayOfWeek: number;
    avgTemp: number;
    windSpeed: number;
    cloudCover: number;
    isWeekend: boolean;
    isHoliday: boolean;
  };
}

export interface ModelPerformance {
  modelVersion: string;
  mae: number;
  rmse: number;
  mape: number;
  rSquared: number;
  featureImportance: Record<string, number>;
  prediction_interval_80?: number;
  prediction_interval_95?: number;
  residual_std_dev?: number;
  regimePerformance?: Record<string, { mae: number; sample_count: number }>;
  drift_metrics?: {
    driftScore: number;
    performanceDrift: number;
    featureDrift: number;
    requiresRetraining: boolean;
  };
}

export const useAESOPricePrediction = () => {
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const fetchPredictions = async (horizon: string = '24h', forceRefresh: boolean = false) => {
    setLoading(true);
    try {
      // Always use optimized predictor, but allow forcing refresh to bypass cache
      const { data, error } = await supabase.functions.invoke('aeso-optimized-predictor', {
        body: { horizon, forceRefresh }
      });

      // Check for errors in both the error object and data.error
      if (error) throw error;
      if (data && !data.success && data.error) {
        throw new Error(data.error);
      }

      if (data?.success) {
        setPredictions(data.predictions);
        
        const perfMsg = data.performance 
          ? ` (${data.performance.cache_hit_rate_percent}% cached, ${data.performance.total_duration_ms}ms)`
          : '';
        
        toast({
          title: "Predictions Generated",
          description: `${data.predictions.length} price predictions for the next ${horizon}${perfMsg}`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching predictions:', error);
      
      // Check if it's a training data issue - check multiple sources
      const errorMessage = error?.message || error?.error || error?.toString() || '';
      const isDataIssue = errorMessage.includes('Insufficient training data') || 
                         errorMessage.includes('training data');
      
      toast({
        title: isDataIssue ? "No Training Data" : "Prediction Error",
        description: isDataIssue 
          ? "Please click 'Update Data' first to collect historical price data for the AI model"
          : "Failed to generate price predictions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStoredPredictions = async (hoursAhead: number = 24) => {
    setLoading(true);
    try {
      const now = new Date();
      const targetTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

      // Fetch only the most recent prediction for each hour
      // Use a subquery approach to get latest prediction per target hour
      const { data, error } = await supabase
        .from('aeso_price_predictions')
        .select('*')
        .gte('target_timestamp', now.toISOString())
        .lt('target_timestamp', targetTime.toISOString())
        .order('target_timestamp', { ascending: true })
        .order('prediction_timestamp', { ascending: false });

      if (error) throw error;

      // Deduplicate: keep only the MOST RECENT prediction for each unique hour
      // This ensures we show only the latest prediction per hour
      const uniquePredictions = new Map();
      (data || []).forEach(d => {
        const targetDate = new Date(d.target_timestamp);
        // Create hour bucket key (YYYY-MM-DD-HH)
        const hourKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}-${String(targetDate.getHours()).padStart(2, '0')}`;
        
        // Only keep if we haven't seen this hour yet (since data is ordered by prediction_timestamp desc)
        if (!uniquePredictions.has(hourKey)) {
          uniquePredictions.set(hourKey, d);
        }
      });

      const formattedPredictions: PricePrediction[] = Array.from(uniquePredictions.values())
        .map(d => ({
          timestamp: d.target_timestamp,
          horizonHours: d.horizon_hours,
          price: d.predicted_price,
          confidenceLower: d.confidence_lower || 0,
          confidenceUpper: d.confidence_upper || 0,
          confidenceScore: d.confidence_score || 0.75,
          features: (d.features_used as any) || {
            avgPrice: 0,
            hour: 0,
            dayOfWeek: 0,
            avgTemp: 0,
            windSpeed: 0,
            cloudCover: 0,
            isWeekend: false,
            isHoliday: false
          }
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(0, 24); // Ensure we return max 24 hours

      setPredictions(formattedPredictions);
    } catch (error) {
      console.error('Error fetching stored predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModelPerformance = async () => {
    try {
      const { data, error } = await supabase
        .from('aeso_model_performance')
        .select('*')
        .order('evaluation_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setModelPerformance({
          modelVersion: data.model_version,
          mae: data.mae || 0,
          rmse: data.rmse || 0,
          mape: data.mape || 0,
          rSquared: data.r_squared || 0,
          featureImportance: (data.feature_importance as any) || {},
          prediction_interval_80: data.prediction_interval_80,
          prediction_interval_95: data.prediction_interval_95,
          residual_std_dev: data.residual_std_dev,
          regimePerformance: (data.regime_performance as Record<string, { mae: number; sample_count: number }>) || {},
          drift_metrics: (data.metadata as any)?.drift_metrics || (data.drift_metrics as any),
        });
      }
    } catch (error) {
      console.error('Error fetching model performance:', error);
    }
  };

  const collectTrainingData = async () => {
    setLoading(true);
    try {
      const { data: currentData, error: currentError } = await supabase.functions.invoke('aeso-data-collector');
      
      if (currentError) throw currentError;
      
      toast({
        title: "Data Updated",
        description: "Latest energy data collected successfully",
      });
      
      await fetchPredictions('24h');
      
    } catch (error: any) {
      console.error('Error collecting data:', error);
      toast({
        title: "Data Collection Error",
        description: error.message || "Failed to collect latest data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async () => {
    setLoading(true);
    try {
      toast({
        title: "Fetching Historical Data",
        description: "Collecting up to 10 years of energy price data...",
      });
      
      const { data: histData, error: histError } = await supabase.functions.invoke('aeso-historical-data-fetcher');
      
      if (histError) {
        console.error('Historical fetch error:', histError);
        throw new Error('Failed to fetch historical data');
      }
      
      if (histData?.success) {
        toast({
          title: "Historical Data Collected",
          description: `${histData.recordsInserted} historical records collected`,
        });
      }
      
      toast({
        title: "Training AI Model",
        description: "Training prediction model with historical data...",
      });
      
      const { data: trainData, error: trainError } = await supabase.functions.invoke('aeso-model-trainer');
      
      if (trainError) throw trainError;
      
      if (trainData?.success) {
        setModelPerformance({
          modelVersion: trainData.model_version,
          mae: trainData.performance.mae,
          rmse: trainData.performance.rmse,
          mape: trainData.performance.mape,
          rSquared: trainData.performance.r_squared,
          featureImportance: trainData.feature_importance,
          prediction_interval_80: trainData.performance.prediction_interval_80,
          prediction_interval_95: trainData.performance.prediction_interval_95,
          residual_std_dev: trainData.performance.residual_std_dev
        });
        
        const driftWarning = trainData.monitoring?.requires_retraining 
          ? ' ⚠️ Model drift detected - retraining recommended' 
          : '';
        
        toast({
          title: "AI Model Trained",
          description: `Model accuracy: ${trainData.performance.r_squared.toFixed(2)} R² score, ${trainData.training_samples} samples${driftWarning}`,
          variant: trainData.monitoring?.requires_retraining ? "destructive" : "default"
        });
      }
      
    } catch (error: any) {
      console.error('Error training model:', error);
      toast({
        title: "Training Error",
        description: error.message || "Failed to train model",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const collectWeatherData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-weather-collector');
      
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Weather Data Updated",
          description: `Collected ${data.totalForecasts} weather forecasts`,
        });
      }
    } catch (error: any) {
      console.error('Error collecting weather:', error);
      toast({
        title: "Weather Collection Error",
        description: error.message || "Failed to collect weather data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runCompleteBackfill = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('aeso-complete-backfill');
      
      if (error) throw error;
      
      toast({
        title: "Backfill & Training Complete",
        description: `Pipeline completed in ${data.duration_minutes} minutes. Model ready for predictions.`,
      });
      
      await fetchModelPerformance();
      return data;
    } catch (error: any) {
      console.error('Complete backfill error:', error);
      toast({
        title: "Pipeline Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkAutoRetraining = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-auto-retraining');
      
      if (error) throw error;
      
      if (data?.retraining_triggered) {
        const improvement = data.new_performance 
          ? ` Improved MAE by $${data.new_performance.improvement.toFixed(2)}/MWh` 
          : '';
        
        toast({
          title: "Auto-Retraining Completed",
          description: `Model retrained due to: ${data.reason}.${improvement}`,
        });
        
        await fetchModelPerformance();
      } else {
        toast({
          title: "Model Health Check OK",
          description: `No retraining needed. Current MAE: $${data.current_performance.mae.toFixed(2)}/MWh`,
        });
      }
      
      return data;
    } catch (error: any) {
      console.error('Auto-retraining check error:', error);
      toast({
        title: "Retraining Check Error",
        description: error.message || "Failed to check retraining status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePredictions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-prediction-validator');
      
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Predictions Validated",
          description: `${data.validated} predictions validated. MAE: $${data.summary.mae}, MAPE: ${data.summary.mape}%`,
        });
      }
    } catch (error: any) {
      console.error('Error validating predictions:', error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate predictions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  const getPerformanceMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('aeso_prediction_performance' as any)
        .select('*')
        .order('request_timestamp', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as any[];
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return null;
    }
  };

  const explainPrediction = async (predictionId?: string, timestamp?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-prediction-explainer', {
        body: { predictionId, timestamp }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Prediction Explained",
          description: `Analysis complete for $${data.prediction.price.toFixed(2)}/MWh prediction`,
        });
        return data.explanation;
      }
    } catch (error: any) {
      console.error('Error explaining prediction:', error);
      toast({
        title: "Explanation Error",
        description: error.message || "Failed to explain prediction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMultiMarketPredictions = async (
    market: string = 'aeso',
    horizon: string = '24h',
    compareMarkets: boolean = false
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('multi-market-predictor', {
        body: { market, horizon, compareMarkets }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        setPredictions(data.predictions);
        
        const comparisonMsg = compareMarkets && data.market_comparison 
          ? ` (compared with ${data.market_comparison.markets_analyzed.length - 1} markets)`
          : '';
        
        toast({
          title: "Multi-Market Predictions",
          description: `${data.predictions.length} predictions for ${data.market_name}${comparisonMsg}`,
        });
        
        return data;
      }
    } catch (error: any) {
      console.error('Error fetching multi-market predictions:', error);
      toast({
        title: "Multi-Market Error",
        description: error.message || "Failed to fetch predictions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAITradingAdvice = async (
    market: string = 'aeso',
    advisoryType: string = 'trading_strategy',
    userContext: any = {}
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-trading-advisor', {
        body: { 
          market, 
          advisoryType, 
          userContext,
          predictions: predictions.slice(0, 24) // Send current predictions
        }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "AI Advisory Generated",
          description: `${data.advisory.outlook} outlook with ${data.advisory.trading_recommendations.length} recommendations`,
        });
        
        return data.advisory;
      }
    } catch (error: any) {
      console.error('Error getting AI advice:', error);
      
      // Handle specific AI errors
      if (error.message?.includes('rate limit')) {
        toast({
          title: "Rate Limit Reached",
          description: "Too many requests. Please try again in a moment.",
          variant: "destructive"
        });
      } else if (error.message?.includes('credits')) {
        toast({
          title: "Credits Depleted",
          description: "Please add credits to continue using AI features.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "AI Advisory Error",
          description: error.message || "Failed to generate trading advice",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const optimizeHyperparameters = async (trials: number = 5) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('aeso-hyperparameter-optimizer', {
        body: { trials }
      });
      
      if (error) throw error;
      
      console.log('Hyperparameter optimization:', data);
      return data;
    } catch (error) {
      console.error('Error optimizing hyperparameters:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRetrainingHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('aeso_retraining_schedule')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching retraining history:', error);
      throw error;
    }
  };

  const getHyperparameterTrials = async () => {
    try {
      const { data, error } = await supabase
        .from('aeso_hyperparameter_trials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching hyperparameter trials:', error);
      throw error;
    }
  };

  const calculateEnhancedFeatures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('aeso-enhanced-feature-calculator');
      
      if (error) throw error;
      
      console.log('Enhanced features calculated:', data);
      return data;
    } catch (error) {
      console.error('Error calculating enhanced features:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const filterDataQuality = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('aeso-data-quality-filter');
      
      if (error) throw error;
      
      console.log('Data quality filtering:', data);
      return data;
    } catch (error) {
      console.error('Error filtering data quality:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const runPhase7Pipeline = async () => {
    setLoading(true);
    setCurrentStep(1);
    try {
      // Step 1: Calculate Enhanced Features
      toast({
        title: "Phase 7: Step 1/3",
        description: "Calculating enhanced price lag features and interactions...",
      });
      
      const { data: featuresData, error: featuresError } = await supabase.functions.invoke('aeso-enhanced-feature-calculator');
      
      if (featuresError) throw new Error(`Feature calculation failed: ${featuresError.message}`);
      
      if (featuresData?.success) {
        toast({
          title: "✓ Enhanced Features Calculated",
          description: `Processed ${featuresData.records_processed} records with lag features. Waiting for DB propagation...`,
        });
        
        // Wait 3 seconds for database updates to propagate
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Step 2: Filter Data Quality
      setCurrentStep(2);
      toast({
        title: "Phase 7: Step 2/3",
        description: "Filtering invalid data points (outliers, spikes, zero prices)...",
      });
      
      const { data: qualityData, error: qualityError } = await supabase.functions.invoke('aeso-data-quality-filter');
      
      if (qualityError) throw new Error(`Data quality filtering failed: ${qualityError.message}`);
      
      if (qualityData?.success) {
        toast({
          title: "✓ Data Quality Filtered",
          description: `Quality score: ${qualityData.quality_score}% (${qualityData.valid_records}/${qualityData.total_records} valid). Waiting for DB propagation...`,
        });
        
        // Wait 2 seconds for database updates to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Step 3: Retrain Model
      setCurrentStep(3);
      toast({
        title: "Phase 7: Step 3/3",
        description: "Retraining model with enhanced features and clean data...",
      });
      
      const { data: trainData, error: trainError } = await supabase.functions.invoke('aeso-model-trainer');
      
      if (trainError) throw new Error(`Model training failed: ${trainError.message}`);
      
      if (trainData?.success) {
        setModelPerformance({
          modelVersion: trainData.model_version,
          mae: trainData.performance.mae,
          rmse: trainData.performance.rmse,
          mape: trainData.performance.mape,
          rSquared: trainData.performance.r_squared,
          featureImportance: trainData.feature_importance,
          prediction_interval_80: trainData.performance.prediction_interval_80,
          prediction_interval_95: trainData.performance.prediction_interval_95,
          residual_std_dev: trainData.performance.residual_std_dev,
          regimePerformance: trainData.performance.regime_performance || {}
        });
        
        toast({
          title: "✅ Phase 7 Complete!",
          description: `Model Excellence achieved! New accuracy: MAE $${trainData.performance.mae.toFixed(2)}, MAPE ${trainData.performance.mape.toFixed(1)}%, R² ${trainData.performance.r_squared.toFixed(3)}`,
          duration: 10000,
        });
        
        return {
          success: true,
          features: featuresData,
          quality: qualityData,
          training: trainData
        };
      }
      
    } catch (error: any) {
      console.error('Phase 7 Pipeline error:', error);
      toast({
        title: "Phase 7 Pipeline Failed",
        description: error.message || "Failed to complete the pipeline",
        variant: "destructive",
        duration: 10000,
      });
      throw error;
    } finally {
      setLoading(false);
      setCurrentStep(0);
    }
  };

  const runCompletePipeline = async () => {
    setLoading(true);
    setCurrentStep(1);
    
    try {
      toast({
        title: "🚀 Running Complete Pipeline",
        description: "Collecting data, calculating features, and retraining model (this may take 2-3 minutes)...",
        duration: 5000,
      });
      
      const { data, error } = await supabase.functions.invoke('aeso-complete-pipeline');
      
      if (error) {
        console.error('Complete pipeline error:', error);
        
        // Check if it's a timeout error
        if (error.message?.includes('timeout') || error.message?.includes('504') || error.message?.includes('Gateway Timeout')) {
          throw new Error('Model training timeout - The training process is still running in the background. Please wait 2-3 minutes and check the performance metrics below.');
        }
        
        throw error;
      }
      
      if (!data.success) {
        throw new Error('Pipeline failed - check logs for details');
      }
      
      // Extract performance metrics from the results
      const performanceStep = data.steps.find((s: any) => s.name === 'Performance Metrics');
      
      if (performanceStep?.success && performanceStep.metrics) {
        const metrics = performanceStep.metrics;
        setModelPerformance({
          mae: metrics.mae,
          rmse: metrics.rmse,
          mape: metrics.smape || metrics.mape, // Prefer sMAPE over MAPE
          rSquared: metrics.r_squared,
          modelVersion: metrics.model_version || 'enhanced_v1',
          featureImportance: {},
          prediction_interval_80: 0,
          prediction_interval_95: 0,
          residual_std_dev: 0,
          regimePerformance: {}
        });
        
        const trainingRecords = metrics.training_records || metrics.predictions_evaluated || 0;
        const smapeValue = metrics.smape || metrics.mape || 0;
        
        toast({
          title: "✅ Pipeline Complete!",
          description: `Model trained with enhanced features! sMAPE: ${smapeValue.toFixed(2)}%, MAE: $${metrics.mae?.toFixed(2)}, Training records: ${trainingRecords}`,
          duration: 10000,
        });
      } else {
        toast({
          title: "⚠️ Pipeline Completed with Warnings",
          description: "Pipeline finished but some steps may have failed. Check the console for details.",
          duration: 8000,
        });
      }
      
      return data;
      
    } catch (error: any) {
      console.error('Complete pipeline error:', error);
      
      // Check for timeout/gateway errors
      const errorMsg = error.message || '';
      const isTimeout = errorMsg.includes('timeout') || 
                       errorMsg.includes('504') || 
                       errorMsg.includes('Gateway Timeout') ||
                       errorMsg.includes('Failed to send a request');
      
      if (isTimeout) {
        toast({
          title: "⏱️ Training In Progress",
          description: "Model training takes 2-3 minutes and may continue in the background. Refresh the page to check results.",
          variant: "default",
          duration: 15000,
        });
      } else {
        toast({
          title: "Pipeline Failed",
          description: error.message || "Failed to complete the pipeline",
          variant: "destructive",
          duration: 10000,
        });
      }
      
      throw error;
    } finally {
      setLoading(false);
      setCurrentStep(0);
    }
  };

  return {
    predictions,
    modelPerformance,
    loading,
    currentStep,
    fetchPredictions,
    fetchStoredPredictions,
    fetchModelPerformance,
    collectTrainingData,
    trainModel,
    collectWeatherData,
    validatePredictions,
    runCompleteBackfill,
    checkAutoRetraining,
    getPerformanceMetrics,
    explainPrediction,
    fetchMultiMarketPredictions,
    getAITradingAdvice,
    optimizeHyperparameters,
    getRetrainingHistory,
    getHyperparameterTrials,
    calculateEnhancedFeatures,
    filterDataQuality,
    runPhase7Pipeline,
    runCompletePipeline,
  };
};
