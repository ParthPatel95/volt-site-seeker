import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Database, 
  Play, 
  RefreshCw,
  Activity,
  BarChart3,
  Sparkles
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModelStatus {
  model_version: string;
  trained_at: string;
  mae: number;
  rmse: number;
  smape: number;
  r_squared: number;
  training_records: number;
  predictions_evaluated: number;
  model_quality: 'excellent' | 'good' | 'fair' | 'poor';
  available_training_records: number;
  records_with_features: number;
}

interface DataQuality {
  total_records: number;
  valid_records: number;
  with_lag_features: number;
  with_net_demand: number;
  with_renewable_pen: number;
  valid_percentage: number;
  latest_timestamp: string;
}

export const ModelStatusDashboard = () => {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [updatingPredictions, setUpdatingPredictions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    setLoading(true);
    try {
      // Fetch model status
      const { data: modelData, error: modelError } = await supabase
        .from('aeso_model_status')
        .select('*')
        .single();

      if (modelError) {
        console.error('Model status error:', modelError);
      } else if (modelData) {
        setModelStatus(modelData as ModelStatus);
      }

      // Fetch data quality
      const { data: qualityData, error: qualityError } = await supabase
        .from('aeso_data_quality_summary')
        .select('*')
        .single();

      if (qualityError) {
        console.error('Data quality error:', qualityError);
      } else if (qualityData) {
        setDataQuality(qualityData as DataQuality);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
      toast({
        title: "Error Loading Status",
        description: "Failed to fetch system status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runFullPipeline = async () => {
    setRunningPipeline(true);
    try {
      toast({
        title: "🚀 Starting Complete ML Pipeline",
        description: "Running data collection, advanced feature engineering, quality analysis, and stacked ensemble training...",
        duration: 5000,
      });
      
      const { data, error } = await supabase.functions.invoke('aeso-complete-pipeline');
      
      if (error) {
        throw new Error(`Pipeline failed: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Pipeline completed with errors');
      }
      
      // Show detailed results
      const steps = data.steps || {};
      let description = `Pipeline completed in ${(data.duration_ms / 1000).toFixed(1)}s\n`;
      
      if (steps.data_collection?.success) {
        description += `✓ Data Collection\n`;
      }
      if (steps.feature_engineering?.success) {
        description += `✓ Advanced Features: ${steps.advanced_features?.stats?.updated_records || 0} records\n`;
      }
      if (steps.quality_analysis?.success) {
        description += `✓ Quality Analysis\n`;
      }
      if (steps.model_training?.success) {
        const metrics = steps.model_training.metrics;
        description += `✓ Stacked Ensemble: sMAPE ${metrics?.test_smape?.toFixed(2) || 'N/A'}%`;
      }
      
      toast({
        title: "✅ Pipeline Complete!",
        description,
        duration: 15000,
      });
      
      // Refresh status
      await fetchSystemStatus();
    } catch (error: any) {
      console.error('Pipeline error:', error);
      toast({
        title: "Pipeline Failed",
        description: error.message || "Failed to run training pipeline",
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setRunningPipeline(false);
    }
  };

  const updatePredictionActuals = async () => {
    setUpdatingPredictions(true);
    try {
      const { data, error } = await supabase.rpc('update_prediction_actuals');
      
      if (error) throw error;
      
      toast({
        title: "Predictions Updated",
        description: `Updated ${data} predictions with actual prices.`,
      });
      
      await fetchSystemStatus();
    } catch (error: any) {
      console.error('Error updating predictions:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update predictions",
        variant: "destructive"
      });
    } finally {
      setUpdatingPredictions(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Badge className="bg-green-500">Excellent</Badge>;
      case 'good': return <Badge className="bg-blue-500">Good</Badge>;
      case 'fair': return <Badge className="bg-yellow-500">Fair</Badge>;
      case 'poor': return <Badge className="bg-red-500">Poor</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading system status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dataReadiness = dataQuality ? 
    Math.min(100, (dataQuality.with_lag_features / dataQuality.total_records) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI Prediction System Status
              </CardTitle>
              <CardDescription>
                Real-time model performance and data quality metrics
              </CardDescription>
            </div>
            <Button onClick={fetchSystemStatus} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Model Performance */}
      {modelStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Current Model Performance
            </CardTitle>
            <CardDescription>
              Version: {modelStatus.model_version} • Trained: {new Date(modelStatus.trained_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Model Quality</span>
              {getQualityBadge(modelStatus.model_quality)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">sMAPE</p>
                <p className="text-2xl font-bold">{modelStatus.smape.toFixed(1)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">MAE</p>
                <p className="text-2xl font-bold">${modelStatus.mae.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">RMSE</p>
                <p className="text-2xl font-bold">${modelStatus.rmse.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">R² Score</p>
                <p className="text-2xl font-bold">{modelStatus.r_squared.toFixed(3)}</p>
              </div>
            </div>

            {modelStatus.model_quality === 'poor' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Action Required:</strong> Model performance is poor (sMAPE &gt; 100%). 
                  The model is severely underpredicting. Run the full training pipeline to improve accuracy.
                </AlertDescription>
              </Alert>
            )}

            {modelStatus.model_quality === 'fair' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Performance Warning:</strong> Model accuracy is fair (sMAPE 50-100%). 
                  Consider retraining with more data for better predictions.
                </AlertDescription>
              </Alert>
            )}

            {(modelStatus.model_quality === 'excellent' || modelStatus.model_quality === 'good') && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Model is performing well! Accuracy is within acceptable range.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Quality */}
      {dataQuality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Training Data Quality
            </CardTitle>
            <CardDescription>
              Last updated: {new Date(dataQuality.latest_timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Data Readiness</span>
                <span className="font-medium">{dataReadiness.toFixed(0)}%</span>
              </div>
              <Progress value={dataReadiness} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Records</span>
                <span className="font-medium">{dataQuality.total_records.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valid Records</span>
                <span className="font-medium">{dataQuality.valid_records.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">With Lag Features</span>
                <span className="font-medium">{dataQuality.with_lag_features.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">With Net Demand</span>
                <span className="font-medium">{dataQuality.with_net_demand.toLocaleString()}</span>
              </div>
            </div>

            {dataQuality.valid_percentage < 80 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Only {dataQuality.valid_percentage}% of data is valid. Run the feature calculator to improve data quality.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Model Actions
          </CardTitle>
          <CardDescription>
            Improve model performance and update predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={runFullPipeline} 
            className="w-full"
            size="lg"
            disabled={runningPipeline}
          >
            <Play className={`h-4 w-4 mr-2 ${runningPipeline ? 'animate-spin' : ''}`} />
            {runningPipeline ? 'Running Training Pipeline...' : 'Run Full Training Pipeline'}
          </Button>
          
          <Button 
            onClick={updatePredictionActuals} 
            variant="outline"
            className="w-full"
            disabled={updatingPredictions}
          >
            <TrendingUp className={`h-4 w-4 mr-2 ${updatingPredictions ? 'animate-spin' : ''}`} />
            {updatingPredictions ? 'Updating...' : 'Update Prediction Actuals'}
          </Button>

          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <p><strong>Training Pipeline:</strong> Calculates features → Filters invalid data → Trains regime-specific models</p>
            <p><strong>Update Actuals:</strong> Matches predictions with actual prices for accuracy tracking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
