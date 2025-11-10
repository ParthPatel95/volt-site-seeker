import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';

interface MonitoringData {
  drift_score: number;
  performance_drift: number;
  feature_drift: number;
  requires_retraining: boolean;
  recent_performance?: {
    mae: number;
    rmse: number;
    mape: number;
  };
  overall_performance?: {
    mae: number;
    rmse: number;
    mape: number;
  };
}

interface ModelMonitoringMetricsProps {
  monitoring?: MonitoringData | null;
}

export function ModelMonitoringMetrics({ monitoring }: ModelMonitoringMetricsProps) {
  if (!monitoring) {
    return null;
  }

  const getDriftColor = (drift: number) => {
    if (drift < 0.15) return 'text-green-500';
    if (drift < 0.30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getDriftLabel = (drift: number) => {
    if (drift < 0.15) return 'Low';
    if (drift < 0.30) return 'Moderate';
    return 'High';
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Model Monitoring & Drift Detection</CardTitle>
          </div>
          {monitoring.requires_retraining ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Retraining Needed
            </Badge>
          ) : (
            <Badge variant="default" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-3 w-3" />
              Healthy
            </Badge>
          )}
        </div>
        <CardDescription>
          Real-time model performance tracking and drift detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drift Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Drift Score</span>
              <span className={`text-sm font-semibold ${getDriftColor(monitoring.drift_score)}`}>
                {getDriftLabel(monitoring.drift_score)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    monitoring.drift_score < 0.15 ? 'bg-green-500' :
                    monitoring.drift_score < 0.30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, monitoring.drift_score * 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {(monitoring.drift_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Performance Drift</span>
              <span className={`text-sm font-semibold ${getDriftColor(monitoring.performance_drift)}`}>
                {getDriftLabel(monitoring.performance_drift)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    monitoring.performance_drift < 0.15 ? 'bg-green-500' :
                    monitoring.performance_drift < 0.30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, monitoring.performance_drift * 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {(monitoring.performance_drift * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Feature Drift</span>
              <span className={`text-sm font-semibold ${getDriftColor(monitoring.feature_drift)}`}>
                {getDriftLabel(monitoring.feature_drift)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    monitoring.feature_drift < 0.15 ? 'bg-green-500' :
                    monitoring.feature_drift < 0.30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, monitoring.feature_drift * 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {(monitoring.feature_drift * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Windows */}
        {monitoring.recent_performance && monitoring.overall_performance && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Performance Comparison
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="text-xs font-medium text-muted-foreground">Recent (7 Days)</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAE:</span>
                    <span className="font-mono font-medium">${monitoring.recent_performance.mae.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RMSE:</span>
                    <span className="font-mono font-medium">${monitoring.recent_performance.rmse.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAPE:</span>
                    <span className="font-mono font-medium">{monitoring.recent_performance.mape.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="text-xs font-medium text-muted-foreground">Overall</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAE:</span>
                    <span className="font-mono font-medium">${monitoring.overall_performance.mae.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RMSE:</span>
                    <span className="font-mono font-medium">${monitoring.overall_performance.rmse.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAPE:</span>
                    <span className="font-mono font-medium">{monitoring.overall_performance.mape.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retraining Recommendation */}
        {monitoring.requires_retraining && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-medium text-destructive">Retraining Recommended</div>
              <div className="text-xs text-muted-foreground">
                Model drift has exceeded acceptable thresholds. Consider retraining the model with recent data to maintain prediction accuracy.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
