import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Target, TrendingUp, CheckCircle, AlertCircle, RefreshCw, Sparkles, Info, Play } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AccuracyMetric {
  target_timestamp: string;
  predicted_price: number;
  actual_price: number;
  absolute_error: number;
  percent_error: number;
  within_confidence: boolean;
  horizon_hours: number;
}

export const PredictionAccuracyTracker = () => {
  const [accuracyData, setAccuracyData] = useState<AccuracyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [currentModelVersion, setCurrentModelVersion] = useState<string | null>(null);
  const [accuracyModelVersion, setAccuracyModelVersion] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    avgMAE: number;
    avgMAPE: number;
    confidenceAccuracy: number;
    totalPredictions: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccuracyData();
    fetchCurrentModelVersion();
  }, []);

  const fetchCurrentModelVersion = async () => {
    try {
      const { data } = await supabase
        .from('aeso_model_performance')
        .select('model_version')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setCurrentModelVersion(data[0].model_version);
      }
    } catch (error) {
      console.error('Error fetching current model version:', error);
    }
  };

  const fetchAccuracyData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('aeso_prediction_accuracy')
        .select('*')
        .order('target_timestamp', { ascending: false })
        .limit(168); // Last 7 days

      if (error) throw error;

      if (data && data.length > 0) {
        setAccuracyData(data);
        
        // Get the model version from the most recent accuracy record
        if (data[0]) {
          const { data: predData } = await supabase
            .from('aeso_price_predictions')
            .select('model_version')
            .eq('target_timestamp', data[0].target_timestamp)
            .limit(1);
          
          if (predData && predData.length > 0 && predData[0].model_version) {
            setAccuracyModelVersion(predData[0].model_version);
          }
        }
        
        const avgMAE = data.reduce((sum, d) => sum + d.absolute_error, 0) / data.length;
        const avgMAPE = data.reduce((sum, d) => sum + d.percent_error, 0) / data.length;
        const withinConfidence = data.filter(d => d.within_confidence).length;
        
        setSummary({
          avgMAE,
          avgMAPE,
          confidenceAccuracy: (withinConfidence / data.length) * 100,
          totalPredictions: data.length
        });
      }
    } catch (error) {
      console.error('Error fetching accuracy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPredictions = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-predictor');
      
      if (error) throw error;
      
      toast({
        title: "Predictions Generated",
        description: `Created ${data.count} predictions with ${data.validated_count || 0} immediately validated. Accuracy metrics ${data.validated_count > 0 ? 'updated' : 'will update as actual prices become available'}.`,
      });
      
      // Refresh accuracy data after a short delay
      setTimeout(() => {
        fetchAccuracyData();
      }, 2000);
    } catch (error: any) {
      console.error('Error generating predictions:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate new predictions",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const runPhase7Pipeline = async () => {
    setRunningPipeline(true);
    try {
      // Step 1: Calculate Enhanced Features
      toast({
        title: "Phase 7 Pipeline: Step 1/3",
        description: "Calculating enhanced price lag features and Phase 3 features...",
      });
      
      const { data: featuresData, error: featuresError } = await supabase.functions.invoke('aeso-enhanced-feature-calculator');
      
      if (featuresError) throw new Error(`Feature calculation failed: ${featuresError.message}`);
      
      if (featuresData?.success) {
        toast({
          title: "✓ Enhanced Features Calculated",
          description: `Processed ${featuresData.records_processed} records. Waiting for DB propagation...`,
        });
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Step 2: Filter Data Quality
      toast({
        title: "Phase 7 Pipeline: Step 2/3",
        description: "Filtering invalid data points (outliers, missing features)...",
      });
      
      const { data: qualityData, error: qualityError } = await supabase.functions.invoke('aeso-data-quality-filter');
      
      if (qualityError) throw new Error(`Quality filtering failed: ${qualityError.message}`);
      
      if (qualityData?.success) {
        toast({
          title: "✓ Data Quality Filtered",
          description: `${qualityData.valid_records} valid records of ${qualityData.total_records} total. Preparing for training...`,
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Step 3: Train Model
      toast({
        title: "Phase 7 Pipeline: Step 3/3",
        description: "Training regime-specific XGBoost models with Phase 3 features...",
      });
      
      const { data: trainingData, error: trainingError } = await supabase.functions.invoke('aeso-model-trainer');
      
      if (trainingError) throw new Error(`Model training failed: ${trainingError.message}`);
      
      if (trainingData?.success) {
        toast({
          title: "✅ Phase 7 Pipeline Complete!",
          description: `Model ${trainingData.model_version} trained on ${trainingData.training_records} records. sMAPE: ${trainingData.metrics?.smape}%`,
        });
        
        // Refresh data
        fetchCurrentModelVersion();
        fetchAccuracyData();
      }
    } catch (error: any) {
      console.error('Phase 7 pipeline error:', error);
      toast({
        title: "Pipeline Failed",
        description: error.message || "Failed to run Phase 7 pipeline",
        variant: "destructive"
      });
    } finally {
      setRunningPipeline(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Prediction Accuracy Tracker
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading accuracy metrics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!accuracyData.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Prediction Accuracy Tracker
            </CardTitle>
            <Button onClick={generateNewPredictions} variant="default" size="sm" disabled={generating}>
              <Sparkles className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Generate Predictions'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No accuracy data available for the current model ({currentModelVersion || 'unknown'}). 
            Generate new predictions to create accuracy metrics.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            After generating predictions, the system will automatically validate them against 
            available actual prices to provide immediate accuracy feedback.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = accuracyData
    .slice(0, 48)
    .reverse()
    .map(d => ({
      time: new Date(d.target_timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
      predicted: d.predicted_price,
      actual: d.actual_price,
      error: d.absolute_error
    }));

  const isOutdated = currentModelVersion && accuracyModelVersion && currentModelVersion !== accuracyModelVersion;

  return (
    <div className="space-y-4">
      {/* Model Version Warning */}
      {isOutdated && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Outdated Accuracy Data</strong> - These metrics are from model version {accuracyModelVersion}. 
                Current model is {currentModelVersion}. Generate new predictions to see updated accuracy.
              </div>
              <Button onClick={generateNewPredictions} disabled={generating} size="sm" className="ml-4">
                <Sparkles className="h-4 w-4 mr-2" />
                {generating ? 'Generating...' : 'Generate Predictions'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <>
          <div className="flex justify-end gap-2 mb-4">
            <Button onClick={runPhase7Pipeline} variant="default" size="sm" disabled={runningPipeline}>
              <Play className={`h-4 w-4 mr-2 ${runningPipeline ? 'animate-spin' : ''}`} />
              {runningPipeline ? 'Running Pipeline...' : 'Run Phase 7 Pipeline'}
            </Button>
            <Button onClick={generateNewPredictions} variant="outline" size="sm" disabled={generating}>
              <Sparkles className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Generating...' : 'Generate Predictions'}
            </Button>
            <Button onClick={fetchAccuracyData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Error (MAE)</p>
                  <p className="text-2xl font-bold">${summary.avgMAE.toFixed(2)}</p>
                </div>
                <Target className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg MAPE</p>
                  <p className="text-2xl font-bold">{summary.avgMAPE.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confidence Hit Rate</p>
                  <p className="text-2xl font-bold">{summary.confidenceAccuracy.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Validated</p>
                  <p className="text-2xl font-bold">{summary.totalPredictions}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
        </>
      )}

      {/* Accuracy Chart */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Predicted vs Actual Prices
            </CardTitle>
            <CardDescription>
              Comparison of predicted and actual prices over the last 48 hours (Historical data before latest retraining)
            </CardDescription>
          </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: '$/MWh', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Predicted"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="Actual"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      )}

      {/* Error Distribution */}
      {summary && (
        <Card>
        <CardHeader>
          <CardTitle>Prediction Error Analysis</CardTitle>
          <CardDescription>Distribution of prediction errors by horizon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 6, 12, 24].map(horizon => {
              const horizonData = accuracyData.filter(d => d.horizon_hours === horizon);
              if (horizonData.length === 0) return null;
              
              const avgError = horizonData.reduce((sum, d) => sum + d.absolute_error, 0) / horizonData.length;
              const avgPctError = horizonData.reduce((sum, d) => sum + d.percent_error, 0) / horizonData.length;
              
              return (
                <div key={horizon} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{horizon}h Ahead Predictions</p>
                    <p className="text-sm text-muted-foreground">
                      {horizonData.length} validated predictions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${avgError.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{avgPctError.toFixed(1)}% MAPE</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
};
