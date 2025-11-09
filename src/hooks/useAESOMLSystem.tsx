import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'degraded' | 'error';
  timestamp: string;
  health: {
    data_pipeline: string;
    model_training: string;
    prediction_service: string;
    data_quality_score: number | null;
    last_model_update: string | null;
    active_models: number;
  };
  metrics: {
    model_rmse: number | null;
    model_mae: number | null;
    model_mape: number | null;
    prediction_accuracy: number | null;
    predictions_24h: number;
    validated_predictions_24h: number;
    data_quality_score: number | null;
    current_market_regime: string;
    regime_confidence: number | null;
  };
  alerts: Array<{
    severity: string;
    message: string;
    metric: string;
  }>;
}

export interface WorkflowResult {
  success: boolean;
  workflow: string;
  total_time_ms: number;
  tasks_executed: number;
  tasks_succeeded: number;
  tasks_failed: number;
  results: Record<string, any>;
}

export const useAESOMLSystem = () => {
  const { toast } = useToast();

  // Monitor system health
  const { data: systemHealth, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['aeso-system-health'],
    queryFn: async (): Promise<SystemHealth> => {
      const { data, error } = await supabase.functions.invoke('aeso-monitoring-endpoint');
      
      if (error) {
        console.error('Error fetching system health:', error);
        throw error;
      }
      
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
  });

  // Run workflows
  const runWorkflow = useMutation({
    mutationFn: async (workflow: 'data_collection' | 'feature_engineering' | 'model_training' | 'prediction' | 'validation' | 'full_update' | 'daily_maintenance'): Promise<WorkflowResult> => {
      const { data, error } = await supabase.functions.invoke('aeso-orchestrator', {
        body: { workflow }
      });
      
      if (error) {
        console.error('Error running workflow:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Workflow completed successfully",
          description: `${result.tasks_succeeded}/${result.tasks_executed} tasks completed in ${(result.total_time_ms / 1000).toFixed(1)}s`,
        });
      } else {
        toast({
          title: "Workflow completed with errors",
          description: `${result.tasks_failed} tasks failed`,
          variant: "destructive",
        });
      }
      refetchHealth();
    },
    onError: (error: Error) => {
      toast({
        title: "Workflow failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Quick actions
  const collectData = () => runWorkflow.mutate('data_collection');
  const trainModel = () => runWorkflow.mutate('model_training');
  const generatePredictions = () => runWorkflow.mutate('prediction');
  const validatePredictions = () => runWorkflow.mutate('validation');
  const runFullUpdate = () => runWorkflow.mutate('full_update');
  const runMaintenance = () => runWorkflow.mutate('daily_maintenance');

  return {
    // System health
    systemHealth,
    healthLoading,
    refetchHealth,
    
    // Workflow execution
    runWorkflow: runWorkflow.mutate,
    workflowRunning: runWorkflow.isPending,
    workflowResult: runWorkflow.data,
    
    // Quick actions
    collectData,
    trainModel,
    generatePredictions,
    validatePredictions,
    runFullUpdate,
    runMaintenance,
    
    // Status checks
    isHealthy: systemHealth?.status === 'healthy',
    hasWarnings: systemHealth?.alerts && systemHealth.alerts.length > 0,
    hasCriticalIssues: systemHealth?.status === 'error' || systemHealth?.status === 'degraded',
  };
};
