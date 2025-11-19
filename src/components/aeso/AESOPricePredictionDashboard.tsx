import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingUp, Brain, AlertCircle } from 'lucide-react';
import { useAESOPricePrediction } from '@/hooks/useAESOPricePrediction';
import { PricePredictionChart } from './PricePredictionChart';
import { FeatureImpactVisualization } from './FeatureImpactVisualization';
import { PricePredictionAlerts } from './PricePredictionAlerts';
import { ScenarioAnalysis } from './ScenarioAnalysis';
import { AESOPredictionAnalytics } from './AESOPredictionAnalytics';
import { useAESOData } from '@/hooks/useAESOData';
import { useToast } from '@/hooks/use-toast';
import { ResponsivePageContainer } from '@/components/ResponsiveContainer';

export const AESOPricePredictionDashboard = () => {
  const [horizon, setHorizon] = useState('24h');
  const { 
    predictions, 
    modelPerformance, 
    loading,
    fetchPredictions, 
    fetchModelPerformance
  } = useAESOPricePrediction();
  const { pricing } = useAESOData();
  const { toast } = useToast();

  useEffect(() => {
    fetchPredictions(horizon, true); // Force refresh on mount to clear cache
    fetchModelPerformance();
  }, []);

  useEffect(() => {
    if (horizon) {
      fetchPredictions(horizon, true); // Refetch when horizon changes
    }
  }, [horizon]);

  const handleGeneratePredictions = async () => {
    await fetchPredictions(horizon, true);
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
            <Button 
              onClick={handleGeneratePredictions} 
              disabled={loading} 
              size="lg" 
              className="flex-1 sm:flex-auto"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Refresh Forecast'}
            </Button>
            
            {predictions.length > 0 && (
              <Button onClick={handleExport} variant="outline" size="lg" className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            )}
          </div>
        </div>

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
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="forecast" className="text-xs sm:text-sm">Forecast</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
              <TabsTrigger value="scenario" className="text-xs sm:text-sm">What-If</TabsTrigger>
            </TabsList>

            <TabsContent value="forecast" className="space-y-4 sm:space-y-6 mt-4">
              <PricePredictionChart 
                predictions={predictions}
                currentPrice={pricing?.current_price}
              />
              <FeatureImpactVisualization prediction={predictions[0]} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <AESOPredictionAnalytics predictions={predictions} />
            </TabsContent>

            <TabsContent value="scenario" className="mt-4">
              <ScenarioAnalysis basePrediction={predictions[0] || null} />
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
