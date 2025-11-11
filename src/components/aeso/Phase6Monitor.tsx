import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, TrendingUp, Clock, CheckCircle2, XCircle, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAESOPricePrediction } from "@/hooks/useAESOPricePrediction";

export const Phase6Monitor = () => {
  const { toast } = useToast();
  const { 
    optimizeHyperparameters, 
    checkAutoRetraining,
    getRetrainingHistory,
    getHyperparameterTrials 
  } = useAESOPricePrediction();
  
  const [optimizing, setOptimizing] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [retrainingHistory, setRetrainingHistory] = useState<any[]>([]);
  const [hyperparameterTrials, setHyperparameterTrials] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [history, trials] = await Promise.all([
        getRetrainingHistory(),
        getHyperparameterTrials()
      ]);
      
      setRetrainingHistory(history || []);
      setHyperparameterTrials(trials || []);
    } catch (error) {
      console.error('Error loading Phase 6 data:', error);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const result = await optimizeHyperparameters(5);
      
      toast({
        title: "Hyperparameter Optimization Complete",
        description: `Best MAE: $${result.best_performance.mae.toFixed(2)}/MWh. Improvement: ${result.improvement_vs_baseline}`,
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: "Optimization Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOptimizing(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const result = await checkAutoRetraining();
      
      if (result.retraining_completed) {
        toast({
          title: "Model Retrained Successfully",
          description: `MAE improved by ${result.improvement.mae}%`,
        });
      } else {
        toast({
          title: "Retraining Not Needed",
          description: result.message,
        });
      }
      
      await loadData();
    } catch (error: any) {
      toast({
        title: "Retraining Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRetraining(false);
    }
  };

  const bestTrial = hyperparameterTrials.find(t => t.is_best_trial);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Phase 6: Advanced ML Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleOptimize} 
              disabled={optimizing}
              className="flex-1"
            >
              <Settings className="mr-2 h-4 w-4" />
              {optimizing ? "Optimizing..." : "Optimize Hyperparameters"}
            </Button>
            
            <Button 
              onClick={handleRetrain} 
              disabled={retraining}
              variant="outline"
              className="flex-1"
            >
              <Play className="mr-2 h-4 w-4" />
              {retraining ? "Retraining..." : "Check & Retrain"}
            </Button>
          </div>

          {bestTrial && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Best Hyperparameters
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Learning Rate:</span>
                  <span className="ml-2 font-medium">{bestTrial.hyperparameters.learning_rate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Depth:</span>
                  <span className="ml-2 font-medium">{bestTrial.hyperparameters.max_depth}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">N Estimators:</span>
                  <span className="ml-2 font-medium">{bestTrial.hyperparameters.n_estimators}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">MAE:</span>
                  <span className="ml-2 font-medium text-green-600">
                    ${bestTrial.performance_metrics.mae.toFixed(2)}/MWh
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {retrainingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Recent Retraining Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {retrainingHistory.slice(0, 5).map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-3 border rounded-lg text-sm"
                >
                  <div className="flex items-center gap-3">
                    {event.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : event.status === 'failed' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <div>
                      <div className="font-medium capitalize">{event.triggered_by.replace('_', ' ')}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.scheduled_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    event.status === 'completed' ? 'default' :
                    event.status === 'failed' ? 'destructive' : 
                    'secondary'
                  }>
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hyperparameterTrials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Hyperparameter Trials ({hyperparameterTrials.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {hyperparameterTrials.map((trial) => (
                <div 
                  key={trial.id} 
                  className={`p-3 border rounded-lg text-sm ${
                    trial.is_best_trial ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Trial #{trial.trial_number}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        MAE: ${trial.performance_metrics.mae.toFixed(2)}
                      </span>
                      {trial.is_best_trial && (
                        <Badge variant="default" className="text-xs">Best</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    LR: {trial.hyperparameters.learning_rate} | 
                    Depth: {trial.hyperparameters.max_depth} | 
                    Est: {trial.hyperparameters.n_estimators}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
