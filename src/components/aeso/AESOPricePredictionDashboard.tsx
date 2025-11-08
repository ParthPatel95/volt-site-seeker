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

export const AESOPricePredictionDashboard = () => {
  const [horizon, setHorizon] = useState('24h');
  const { 
    predictions, 
    modelPerformance, 
    loading, 
    fetchPredictions, 
    fetchModelPerformance, 
    collectTrainingData,
    trainModel,
    collectWeatherData,
    validatePredictions
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

  const handleTrainModel = async () => {
    await trainModel();
  };

  const handleCollectWeather = async () => {
    await collectWeatherData();
  };

  const handleValidatePredictions = async () => {
    await validatePredictions();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AESO Price Predictions
          </h2>
          <p className="text-muted-foreground mt-1">
            AI-powered energy price forecasting with confidence intervals
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            <Select value={horizon} onValueChange={setHorizon}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCollectData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Data
            </Button>
            <Button onClick={handleCollectWeather} variant="outline" size="sm" disabled={loading}>
              <CloudSun className="h-4 w-4 mr-2" />
              Update Weather
            </Button>
            <Button onClick={handleTrainModel} variant="outline" size="sm" disabled={loading}>
              <Brain className="h-4 w-4 mr-2" />
              Train Model
            </Button>
            <Button onClick={handleValidatePredictions} variant="outline" size="sm" disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Button onClick={handleGeneratePredictions} disabled={loading}>
              <TrendingUp className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Forecast'}
            </Button>
            {predictions.length > 0 && (
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Model Performance */}
      {modelPerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Model Performance</CardTitle>
            <CardDescription>Accuracy metrics for prediction model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Mean Absolute Error</div>
                <div className="text-2xl font-bold">${modelPerformance.mae.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">RMSE</div>
                <div className="text-2xl font-bold">${modelPerformance.rmse.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">MAPE</div>
                <div className="text-2xl font-bold">{modelPerformance.mape.toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">R² Score</div>
                <div className="text-2xl font-bold">{modelPerformance.rSquared.toFixed(3)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Alerts */}
      {predictions.length > 0 && (
        <PricePredictionAlerts predictions={predictions} />
      )}

      {/* Development Notice */}
      <Card className="bg-warning/10 border-warning/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold mb-1 text-warning">Development Notice</h4>
              <p className="text-sm text-muted-foreground">
                This AI prediction tool is still in development and isn't fully completed yet. 
                Predictions may not be fully accurate and features are subject to change as we continue to improve the model.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold mb-1">How It Works</h4>
              <p className="text-sm text-muted-foreground">
                Our AI model continuously learns from live market data, analyzing price patterns, weather conditions, 
                time-of-day patterns, holidays, and generation mix. The system auto-trains every 24 hours when 
                sufficient data is available, using an ensemble approach for maximum accuracy. Simply click "Update Data" 
                to feed the latest market information into the AI.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      {predictions.length > 0 && (
        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="scenario">Scenario Analysis</TabsTrigger>
            <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
            <TabsTrigger value="performance">Model Performance</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy Tracker</TabsTrigger>
            <TabsTrigger value="backtest">Backtesting</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-6">
            <PricePredictionChart 
              predictions={predictions}
              currentPrice={pricing?.current_price}
            />
            <FeatureImpactVisualization prediction={predictions[0]} />
          </TabsContent>

          <TabsContent value="scenario">
            <ScenarioAnalysis basePrediction={predictions[0] || null} />
          </TabsContent>

          <TabsContent value="analytics">
            <AESOPredictionAnalytics predictions={predictions} />
          </TabsContent>

          <TabsContent value="performance">
            <ModelPerformanceMetrics performance={modelPerformance} />
          </TabsContent>

          <TabsContent value="accuracy">
            <PredictionAccuracyTracker />
          </TabsContent>

          <TabsContent value="backtest">
            <BacktestingDashboard />
          </TabsContent>
        </Tabs>
      )}

      {/* Optimization Recommendations */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
            <CardDescription>Smart timing for energy-intensive operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const sortedPredictions = [...predictions].sort((a, b) => a.price - b.price);
                const cheapestHours = sortedPredictions.slice(0, 5);
                const expensiveHours = sortedPredictions.slice(-5).reverse();
                
                return (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-success">Best Times to Operate (Lowest Prices):</h4>
                      <div className="space-y-2">
                        {cheapestHours.map((pred, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 rounded bg-success/10">
                            <span className="text-sm">
                              {new Date(pred.timestamp).toLocaleString('en-US', { 
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </span>
                            <span className="text-sm font-bold">${pred.price.toFixed(2)}/MWh</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-destructive">Times to Avoid (Highest Prices):</h4>
                      <div className="space-y-2">
                        {expensiveHours.map((pred, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 rounded bg-destructive/10">
                            <span className="text-sm">
                              {new Date(pred.timestamp).toLocaleString('en-US', { 
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </span>
                            <span className="text-sm font-bold">${pred.price.toFixed(2)}/MWh</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">Potential Savings:</h4>
                      <p className="text-sm text-muted-foreground">
                        By operating during the 5 cheapest hours instead of the 5 most expensive, 
                        you could save approximately{' '}
                        <span className="font-bold text-primary">
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
  );
};
