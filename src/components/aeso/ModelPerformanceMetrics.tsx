import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Target, Sparkles } from "lucide-react";
import { ModelPerformance } from "@/hooks/useAESOPricePrediction";

interface ModelPerformanceMetricsProps {
  performance: ModelPerformance | null;
}

export const ModelPerformanceMetrics = ({ performance }: ModelPerformanceMetricsProps) => {
  if (!performance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading performance metrics...</p>
        </CardContent>
      </Card>
    );
  }

  const accuracyScore = Math.max(0, 100 - performance.mape);
  
  // Diagnostic checks
  const mapeIsSuspicious = performance.mape > 200; // MAPE > 200% indicates issues
  const hasRegimeData = Object.keys(performance.regimePerformance || {}).length > 0;
  
  const featureEntries = Object.entries(performance.featureImportance || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Model Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {mapeIsSuspicious && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-destructive mb-1">⚠️ High Error Detected</p>
            <p className="text-xs text-muted-foreground">
              MAPE is unusually high ({performance.mape.toFixed(1)}%). This may indicate missing enhanced features.
              Try running the Phase 7 pipeline: Calculate Enhanced Features → Filter Data → Retrain Model.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Overall Accuracy
              </span>
              <span className="text-sm font-bold">{accuracyScore.toFixed(1)}%</span>
            </div>
            <Progress value={accuracyScore} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">MAE (Error)</p>
              <p className="text-lg font-semibold">{performance.mae.toFixed(2)} $/MWh</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">RMSE</p>
              <p className="text-lg font-semibold">{performance.rmse.toFixed(2)} $/MWh</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">MAPE (%)</p>
              <p className="text-lg font-semibold">{performance.mape.toFixed(1)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">R² Score</p>
              <p className="text-lg font-semibold">{(performance.rSquared * 100).toFixed(1)}%</p>
            </div>
        </div>

        {Object.keys(performance.regimePerformance || {}).length > 0 && (
          <div className="border-t pt-4 mt-2">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Regime-Specific Performance (Phase 7)
            </h4>
            <div className="space-y-2">
              {Object.entries(performance.regimePerformance).map(([regime, metrics]: [string, any]) => (
                <div key={regime} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{regime.replace('_', ' ')}</span>
                  <span className="font-medium">
                    MAE: ${metrics.mae.toFixed(2)} ({metrics.sample_count} samples)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(performance.prediction_interval_80 || performance.prediction_interval_95) && (
            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Prediction Intervals (Phase 4)
              </h4>
              <div className="space-y-2">
                {performance.prediction_interval_80 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">80% Confidence</span>
                    <span className="font-medium">±${performance.prediction_interval_80.toFixed(2)}/MWh</span>
                  </div>
                )}
                {performance.prediction_interval_95 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">95% Confidence</span>
                    <span className="font-medium">±${performance.prediction_interval_95.toFixed(2)}/MWh</span>
                  </div>
                )}
                {performance.residual_std_dev && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Std Deviation</span>
                    <span className="font-medium">${performance.residual_std_dev.toFixed(2)}/MWh</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {featureEntries.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Top Feature Importance
            </h4>
            <div className="space-y-2">
              {featureEntries.map(([feature, importance]) => (
                <div key={feature}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground capitalize">
                      {feature.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-medium">{((importance as number) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(importance as number) * 100} className="h-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-3">
          Model: {performance.modelVersion} • Updated continuously
        </div>
      </CardContent>
    </Card>
  );
};
