import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Download, TrendingUp, Brain, AlertCircle, CloudSun, CheckCircle, BarChart3 } from 'lucide-react';
import { useAESOPricePrediction } from '@/hooks/useAESOPricePrediction';
import { PricePredictionChart } from './PricePredictionChart';
import { FeatureImpactVisualization } from './FeatureImpactVisualization';
import { PricePredictionAlerts } from './PricePredictionAlerts';
import { ScenarioAnalysis } from './ScenarioAnalysis';
import { ModelPerformanceMetrics } from './ModelPerformanceMetrics';
import { AESOPredictionAnalytics } from './AESOPredictionAnalytics';
import { PredictionAccuracyTracker } from './PredictionAccuracyTracker';
import { BacktestingDashboard } from './BacktestingDashboard';
import { useAESOData } from '@/hooks/useAESOData';
import { useToast } from '@/hooks/use-toast';
import { ResponsivePageContainer } from '@/components/ResponsiveContainer';
import { ResponsiveMetricsGrid } from '@/components/ResponsiveGrid';

export const AESOPricePredictionDashboard = () => {
  const [horizon, setHorizon] = useState('24h');
  const { 
    predictions, 
    modelPerformance, 
    loading,
    currentStep,
    fetchPredictions, 
    fetchModelPerformance, 
    collectTrainingData,
    collectWeatherData,
    validatePredictions,
    runPhase7Pipeline
  } = useAESOPricePrediction();
  const { pricing } = useAESOData();
  const { toast } = useToast();

  useEffect(() => {
    fetchPredictions(horizon);
    fetchModelPerformance();
  }, []);

  const handleGeneratePredictions = async () => {
    await fetchPredictions(horizon);
  };

  const handleCollectData = async () => {
    await collectTrainingData();
  };

  const handleCollectWeather = async () => {
    await collectWeatherData();
  };

  const handleValidatePredictions = async () => {
    await validatePredictions();
  };

  const handleRunPhase7 = async () => {
    try {
      await runPhase7Pipeline();
      await fetchModelPerformance();
    } catch (error) {
      console.error('Phase 7 pipeline error:', error);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Predicted Price', 'Confidence Lower', 'Confidence Upper', 'Confidence Score'].join(','),
      ...predictions.map(p => [
        p.timestamp,
        p.price.toFixed(2),
        p.confidenceLower.toFixed(2),
        p.confidenceUpper.toFixed(2),
        (p.confidenceScore * 100).toFixed(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aeso-price-predictions-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <ResponsivePageContainer>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                AI Price Predictions
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                AI-powered energy price forecasting with confidence intervals
              </p>
            </div>
            
            <Select value={horizon} onValueChange={setHorizon}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleRunPhase7} variant="default" size="sm" disabled={loading} className="flex-1 sm:flex-auto bg-gradient-to-r from-primary to-primary/80">
              <Brain className="h-4 w-4 sm:mr-2" />
              <span>{loading ? 'Optimizing...' : 'Optimize & Retrain'}</span>
            </Button>
            <Button onClick={handleCollectData} variant="outline" size="sm" disabled={loading} className="flex-1 sm:flex-none">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Update Data</span>
            </Button>
            <Button onClick={handleCollectWeather} variant="outline" size="sm" disabled={loading} className="flex-1 sm:flex-none">
              <CloudSun className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Weather</span>
            </Button>
            <Button onClick={handleValidatePredictions} variant="outline" size="sm" disabled={loading} className="flex-1 sm:flex-none">
              <CheckCircle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Validate</span>
            </Button>
            <Button onClick={handleGeneratePredictions} disabled={loading} className="flex-1 sm:flex-none">
              <TrendingUp className="h-4 w-4 sm:mr-2" />
              <span>{loading ? 'Generating...' : 'Forecast'}</span>
            </Button>
            {predictions.length > 0 && (
              <Button onClick={handleExport} variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        {currentStep > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary animate-pulse" />
                    <span className="text-sm font-semibold">Optimization Progress</span>
                  </div>
                  <span className="text-sm font-bold text-primary">Step {currentStep}/3</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                          step <= currentStep 
                            ? 'bg-primary' 
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {currentStep === 1 && "Calculating enhanced features with price lags and interactions..."}
                    {currentStep === 2 && "Filtering data quality and removing outliers..."}
                    {currentStep === 3 && "Retraining AI model with optimized features..."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Model Performance */}
        {modelPerformance && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Model Performance
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Accuracy metrics for prediction model</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveMetricsGrid>
                <div className="space-y-1 text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-xs sm:text-sm text-muted-foreground">MAE</div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">${modelPerformance.mae.toFixed(2)}</div>
                </div>
                <div className="space-y-1 text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-xs sm:text-sm text-muted-foreground">RMSE</div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">${modelPerformance.rmse.toFixed(2)}</div>
                </div>
                <div className="space-y-1 text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-xs sm:text-sm text-muted-foreground">MAPE</div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{modelPerformance.mape.toFixed(1)}%</div>
                </div>
                <div className="space-y-1 text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-xs sm:text-sm text-muted-foreground">R² Score</div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{modelPerformance.rSquared.toFixed(3)}</div>
                </div>
              </ResponsiveMetricsGrid>
            </CardContent>
          </Card>
        )}

        {/* Smart Alerts */}
        {predictions.length > 0 && (
          <PricePredictionAlerts predictions={predictions} />
        )}

        {/* Info Banners */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Development Notice */}
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1 text-warning text-sm sm:text-base">Development Notice</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    This AI tool is in development. Predictions may vary as we improve the model.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Banner */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1 text-sm sm:text-base">How It Works</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    AI learns from live market data, weather, and patterns. Auto-trains every 24 hours for maximum accuracy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        {predictions.length > 0 && (
          <Tabs defaultValue="forecast" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
              <TabsTrigger value="forecast" className="text-xs sm:text-sm">Forecast</TabsTrigger>
              <TabsTrigger value="scenario" className="text-xs sm:text-sm">Scenario</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
              <TabsTrigger value="accuracy" className="text-xs sm:text-sm">Accuracy</TabsTrigger>
              <TabsTrigger value="backtest" className="text-xs sm:text-sm">Backtest</TabsTrigger>
            </TabsList>

            <TabsContent value="forecast" className="space-y-4 sm:space-y-6 mt-4">
              <PricePredictionChart 
                predictions={predictions}
                currentPrice={pricing?.current_price}
              />
              <FeatureImpactVisualization prediction={predictions[0]} />
            </TabsContent>

            <TabsContent value="scenario" className="mt-4">
              <ScenarioAnalysis basePrediction={predictions[0] || null} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <AESOPredictionAnalytics predictions={predictions} />
            </TabsContent>

            <TabsContent value="performance" className="mt-4">
              <ModelPerformanceMetrics performance={modelPerformance} />
            </TabsContent>

            <TabsContent value="accuracy" className="mt-4">
              <PredictionAccuracyTracker />
            </TabsContent>

            <TabsContent value="backtest" className="mt-4">
              <BacktestingDashboard />
            </TabsContent>
          </Tabs>
        )}

        {/* Optimization Recommendations */}
        {predictions.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Optimization Recommendations</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Smart timing for energy-intensive operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                {(() => {
                  const sortedPredictions = [...predictions].sort((a, b) => a.price - b.price);
                  const cheapestHours = sortedPredictions.slice(0, 5);
                  const expensiveHours = sortedPredictions.slice(-5).reverse();
                  
                  return (
                    <>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold mb-3 text-success flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Best Times to Operate (Lowest Prices)
                        </h4>
                        <div className="space-y-2">
                          {cheapestHours.map((pred, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-success/10 border border-success/20">
                              <span className="text-xs sm:text-sm text-foreground">
                                {new Date(pred.timestamp).toLocaleString('en-US', { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-success">${pred.price.toFixed(2)}/MWh</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold mb-3 text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Times to Avoid (Highest Prices)
                        </h4>
                        <div className="space-y-2">
                          {expensiveHours.map((pred, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                              <span className="text-xs sm:text-sm text-foreground">
                                {new Date(pred.timestamp).toLocaleString('en-US', { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-destructive">${pred.price.toFixed(2)}/MWh</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="text-xs sm:text-sm font-semibold mb-2">Potential Savings</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          By operating during the 5 cheapest hours instead of the 5 most expensive, 
                          you could save approximately{' '}
                          <span className="font-bold text-primary text-sm sm:text-base">
                            ${((expensiveHours.reduce((s, p) => s + p.price, 0) / 5) - (cheapestHours.reduce((s, p) => s + p.price, 0) / 5)).toFixed(2)}/MWh
                          </span>
                          {' '}per operating hour.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsivePageContainer>
  );
};
