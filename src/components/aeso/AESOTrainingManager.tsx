import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  BarChart3, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAESOPricePrediction } from '@/hooks/useAESOPricePrediction';
import { useAESOCrossValidation } from '@/hooks/useAESOCrossValidation';
import { useAESOEnsemble } from '@/hooks/useAESOEnsemble';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainingJob {
  id: string;
  model_version: string;
  status: string;
  scheduled_at: string;
  training_started_at: string | null;
  training_completed_at: string | null;
  trigger_reason: string | null;
  triggered_by: string;
  performance_after: any;
}

export function AESOTrainingManager() {
  const [currentJob, setCurrentJob] = useState<TrainingJob | null>(null);
  const [jobHistory, setJobHistory] = useState<TrainingJob[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    runCompletePipeline,
    loading: pipelineLoading
  } = useAESOPricePrediction();

  const {
    runCrossValidation,
    loading: cvLoading,
    results: cvResults
  } = useAESOCrossValidation();

  const {
    generateEnsemblePredictions,
    loading: ensembleLoading,
    predictions: ensemblePredictions
  } = useAESOEnsemble();

  // Fetch recent training jobs
  const fetchTrainingJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('aeso_retraining_schedule')
        .select('*')
        .order('scheduled_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        // Find the most recent in-progress or pending job
        const activeJob = data.find(job => 
          job.status === 'in_progress' || job.status === 'pending'
        );
        setCurrentJob(activeJob || data[0]);
        setJobHistory(data);
      }
    } catch (error: any) {
      console.error('Error fetching training jobs:', error);
      toast.error('Failed to fetch training history');
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription to training job updates
  useEffect(() => {
    fetchTrainingJobs();

    const channel = supabase
      .channel('training-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aeso_retraining_schedule'
        },
        (payload) => {
          console.log('Training job update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const updatedJob = payload.new as TrainingJob;
            
            // Update current job if it's the same ID
            if (currentJob?.id === updatedJob.id) {
              setCurrentJob(updatedJob);
              
              // Show toast for status changes
              if (updatedJob.status === 'completed') {
                toast.success('Model training completed successfully!');
              } else if (updatedJob.status === 'failed') {
                toast.error('Model training failed');
              }
            }
            
            // Refresh job history
            fetchTrainingJobs();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentJob?.id]);

  const startTraining = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('aeso-model-trainer', {
        body: {}
      });

      if (error) throw error;

      toast.success(`Training started! Job ID: ${data.job_id}`);
      fetchTrainingJobs();
    } catch (error: any) {
      console.error('Error starting training:', error);
      toast.error('Failed to start training');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      failed: 'destructive',
      in_progress: 'secondary',
      pending: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const calculateProgress = (job: TrainingJob) => {
    if (job.status === 'completed') return 100;
    if (job.status === 'failed') return 0;
    if (job.status === 'in_progress') return 50;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Training Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Model Training Controls</CardTitle>
          <CardDescription>Train and optimize AESO price prediction models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={startTraining}
              disabled={pipelineLoading || loading}
              className="flex-col h-auto py-4"
            >
              <Brain className={`w-6 h-6 mb-2 ${pipelineLoading ? 'animate-pulse' : ''}`} />
              <span className="font-semibold">Full Model Training</span>
              <span className="text-xs opacity-80">Train with all available data</span>
            </Button>

            <Button 
              onClick={() => runCrossValidation(5, 168)}
              disabled={cvLoading || loading}
              variant="outline"
              className="flex-col h-auto py-4"
            >
              <Target className={`w-6 h-6 mb-2 ${cvLoading ? 'animate-pulse' : ''}`} />
              <span className="font-semibold">Cross-Validation</span>
              <span className="text-xs opacity-80">5-fold validation (168h windows)</span>
            </Button>

            <Button 
              onClick={() => generateEnsemblePredictions(24)}
              disabled={ensembleLoading || loading}
              variant="outline"
              className="flex-col h-auto py-4"
            >
              <BarChart3 className={`w-6 h-6 mb-2 ${ensembleLoading ? 'animate-pulse' : ''}`} />
              <span className="font-semibold">Generate Predictions</span>
              <span className="text-xs opacity-80">Ensemble forecast (24h)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Training Job */}
      {currentJob && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(currentJob.status)}
                  Current Training Job
                </CardTitle>
                <CardDescription>Job ID: {currentJob.id}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTrainingJobs}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              {getStatusBadge(currentJob.status)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="text-muted-foreground">{calculateProgress(currentJob)}%</span>
              </div>
              <Progress value={calculateProgress(currentJob)} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Scheduled</span>
                <p className="font-medium">{new Date(currentJob.scheduled_at).toLocaleString()}</p>
              </div>
              {currentJob.training_started_at && (
                <div>
                  <span className="text-muted-foreground">Started</span>
                  <p className="font-medium">{new Date(currentJob.training_started_at).toLocaleString()}</p>
                </div>
              )}
              {currentJob.training_completed_at && (
                <div>
                  <span className="text-muted-foreground">Completed</span>
                  <p className="font-medium">{new Date(currentJob.training_completed_at).toLocaleString()}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Triggered By</span>
                <p className="font-medium capitalize">{currentJob.triggered_by}</p>
              </div>
            </div>

            {currentJob.performance_after && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">MAE:</span>
                    <span className="ml-2 font-medium">${currentJob.performance_after.mae?.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RMSE:</span>
                    <span className="ml-2 font-medium">${currentJob.performance_after.rmse?.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">sMAPE:</span>
                    <span className="ml-2 font-medium">{currentJob.performance_after.smape?.toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">R²:</span>
                    <span className="ml-2 font-medium">{currentJob.performance_after.r_squared?.toFixed(3)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Training Records:</span>
                    <span className="ml-2 font-medium">{currentJob.performance_after.training_records?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Training History */}
      <Card>
        <CardHeader>
          <CardTitle>Training History</CardTitle>
          <CardDescription>Recent training jobs and their outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No training history available
              </p>
            ) : (
              jobHistory.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(job.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{job.model_version}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
