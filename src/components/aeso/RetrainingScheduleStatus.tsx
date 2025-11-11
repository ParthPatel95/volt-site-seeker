import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, PlayCircle, CheckCircle, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface RetrainingHistory {
  id: string;
  triggered: boolean;
  reason: string;
  performance_before: number | null;
  performance_after: number | null;
  improvement: number | null;
  training_records_before: number | null;
  training_records_after: number | null;
  duration_seconds: number | null;
  created_at: string;
}

export const RetrainingScheduleStatus = () => {
  const [history, setHistory] = useState<RetrainingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningNow, setRunningNow] = useState(false);
  const { toast } = useToast();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('aeso_retraining_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const runNow = async () => {
    setRunningNow(true);
    try {
      toast({
        title: "Running Scheduled Check",
        description: "Checking if retraining is needed...",
      });

      const { data, error } = await supabase.functions.invoke('aeso-scheduled-retraining');

      if (error) throw error;

      toast({
        title: data.action === 'retrained' ? '✅ Retrained' : '✅ Check Complete',
        description: data.message,
      });

      await fetchHistory();
    } catch (error) {
      console.error('Error running check:', error);
      toast({
        title: "Check Failed",
        description: error.message || "Failed to run retraining check",
        variant: "destructive",
      });
    } finally {
      setRunningNow(false);
    }
  };

  const lastRun = history.length > 0 ? history[0] : null;
  const lastRetrain = history.find(h => h.triggered);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Automatic Retraining Schedule
            </CardTitle>
            <CardDescription>Daily checks at 2:00 AM MT • Retrains when drift detected</CardDescription>
          </div>
          <Button onClick={runNow} disabled={runningNow} size="sm">
            <PlayCircle className="h-4 w-4 mr-2" />
            {runningNow ? 'Running...' : 'Run Now'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Next Check</span>
            </div>
            <div className="text-lg font-bold">Tomorrow 2:00 AM</div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last Check</span>
            </div>
            <div className="text-lg font-bold">
              {lastRun ? formatDistanceToNow(new Date(lastRun.created_at), { addSuffix: true }) : 'Never'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last Retrain</span>
            </div>
            <div className="text-lg font-bold">
              {lastRetrain ? formatDistanceToNow(new Date(lastRetrain.created_at), { addSuffix: true }) : 'Never'}
            </div>
          </div>
        </div>

        {/* Retraining Conditions */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Automatic Retraining Triggers</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-muted/30">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <div className="font-medium">Poor Model Accuracy</div>
                <div className="text-muted-foreground text-xs">Retrains when sMAPE exceeds 50%</div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-muted/30">
              <Clock className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <div className="font-medium">Daily Refresh</div>
                <div className="text-muted-foreground text-xs">Retrains every 24 hours with latest data</div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-muted/30">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
              <div>
                <div className="font-medium">Data Quality Issues</div>
                <div className="text-muted-foreground text-xs">Retrains when data quality drops below 80%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Recent Activity</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card text-sm"
                >
                  {entry.triggered ? (
                    <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {entry.triggered ? 'Retrained' : 'Check'}
                      </span>
                      <Badge variant={entry.triggered ? "default" : "secondary"} className="text-xs">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{entry.reason}</div>
                    {entry.triggered && entry.improvement !== null && (
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Before: </span>
                          <span className="font-medium">{entry.performance_before?.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">After: </span>
                          <span className="font-medium">{entry.performance_after?.toFixed(1)}%</span>
                        </div>
                        <div className={entry.improvement > 0 ? "text-success" : "text-destructive"}>
                          {entry.improvement > 0 ? '↓' : '↑'} {Math.abs(entry.improvement).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
