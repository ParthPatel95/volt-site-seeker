import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface AutoRetrainingControlProps {
  onCheckRetraining: () => Promise<any>;
  loading: boolean;
}

export function AutoRetrainingControl({ onCheckRetraining, loading }: AutoRetrainingControlProps) {
  const [lastCheckResult, setLastCheckResult] = useState<any>(null);

  const handleCheck = async () => {
    const result = await onCheckRetraining();
    setLastCheckResult(result);
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <CardTitle>Automated Retraining</CardTitle>
          </div>
          {lastCheckResult && (
            <Badge 
              variant={lastCheckResult.retraining_triggered ? "default" : "secondary"}
              className="gap-1"
            >
              {lastCheckResult.retraining_triggered ? (
                <>
                  <PlayCircle className="h-3 w-3" />
                  Retrained
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Healthy
                </>
              )}
            </Badge>
          )}
        </div>
        <CardDescription>
          Phase 6: Intelligent model monitoring with automatic retraining triggers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            The system continuously monitors model performance and automatically triggers retraining when:
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Drift score exceeds 25% threshold</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Performance degradation &gt;30%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Feature distribution shifts &gt;40%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>MAE exceeds $15/MWh</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Model age exceeds 30 days</span>
            </li>
          </ul>
        </div>

        {lastCheckResult && (
          <div className="p-4 rounded-lg border border-border/50 bg-secondary/20 space-y-3">
            <div className="flex items-start gap-3">
              {lastCheckResult.retraining_triggered ? (
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-2 flex-1">
                <div className="text-sm font-medium">
                  {lastCheckResult.retraining_triggered ? 'Retraining Completed' : 'Model Health Check'}
                </div>
                
                {lastCheckResult.retraining_triggered ? (
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div>Trigger Reasons: {lastCheckResult.reason}</div>
                    {lastCheckResult.new_performance && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="p-2 rounded bg-secondary/50">
                          <div className="text-muted-foreground">Previous MAE</div>
                          <div className="font-mono font-medium">${lastCheckResult.previous_performance.mae.toFixed(2)}</div>
                        </div>
                        <div className="p-2 rounded bg-secondary/50">
                          <div className="text-muted-foreground">New MAE</div>
                          <div className="font-mono font-medium text-green-500">
                            ${lastCheckResult.new_performance.mae.toFixed(2)}
                            {lastCheckResult.new_performance.improvement > 0 && (
                              <span className="text-xs ml-1">
                                (↓${lastCheckResult.new_performance.improvement.toFixed(2)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>MAE: ${lastCheckResult.current_performance.mae.toFixed(2)}/MWh</div>
                    <div>Drift Score: {(lastCheckResult.current_performance.drift_score * 100).toFixed(1)}%</div>
                    <div>Days Since Training: {lastCheckResult.current_performance.days_since_training}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleCheck}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Check & Auto-Retrain if Needed
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
