import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Zap, Brain, AlertTriangle } from 'lucide-react';

interface TradingSignal {
  id: string;
  signal_type: 'buy' | 'sell' | 'hold';
  confidence_score: number;
  market_region: string;
  predicted_price: number;
  current_price: number;
  recommendation: string;
  risk_level: 'low' | 'medium' | 'high';
  expires_at: string;
  created_at: string;
}

interface PredictionData {
  price_forecast: number[];
  confidence_intervals: { lower: number[]; upper: number[] };
  trend_direction: 'bullish' | 'bearish' | 'neutral';
  accuracy_score: number;
}

export default function EnergyTrading() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeRegion, setActiveRegion] = useState<'ERCOT' | 'AESO'>('ERCOT');
  const { toast } = useToast();

  const fetchTradingSignals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('trading-signals', {
        body: { 
          action: 'get_signals',
          market: activeRegion,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;
      setSignals(data.signals || []);
      
      toast({
        title: "Signals Updated",
        description: `Loaded ${data.signals?.length || 0} trading signals for ${activeRegion}`,
      });
    } catch (error) {
      console.error('Error fetching trading signals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trading signals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predictive-analytics', {
        body: { 
          region: activeRegion, 
          horizon_hours: 24, 
          model_type: 'price_forecast' 
        }
      });

      if (error) throw error;
      setPredictions(data.prediction);
      
      toast({
        title: "Predictions Generated",
        description: `24-hour price forecast for ${activeRegion} completed`,
      });
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast({
        title: "Error",
        description: "Failed to generate predictions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradingSignals();
  }, [activeRegion]);

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'sell': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Zap className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sell': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Predictive Energy Trading Platform
              </h1>
              <p className="text-muted-foreground">
                AI-powered trading signals and price predictions for energy markets
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={generatePredictions} disabled={loading} className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Generate Predictions
              </Button>
              <Button onClick={fetchTradingSignals} disabled={loading} variant="outline">
                Refresh Signals
              </Button>
            </div>
          </div>
        </div>

        {/* Region Selector */}
        <Tabs value={activeRegion} onValueChange={(value) => setActiveRegion(value as 'ERCOT' | 'AESO')} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ERCOT">ERCOT (Texas)</TabsTrigger>
            <TabsTrigger value="AESO">AESO (Alberta)</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Signals */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Live Trading Signals - {activeRegion}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : signals.length > 0 ? (
                  <div className="space-y-4">
                    {signals.map((signal) => (
                      <div key={signal.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getSignalIcon(signal.signal_type)}
                            <Badge className={getSignalColor(signal.signal_type)}>
                              {signal.signal_type.toUpperCase()}
                            </Badge>
                            <Badge className={getRiskColor(signal.risk_level)}>
                              {signal.risk_level} risk
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {(signal.confidence_score * 100).toFixed(1)}%
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <div className="text-sm text-muted-foreground">Current Price</div>
                            <div className="font-semibold">${signal.current_price.toFixed(2)}/MWh</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Predicted Price</div>
                            <div className="font-semibold">${signal.predicted_price.toFixed(2)}/MWh</div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{signal.recommendation}</p>
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          Expires: {new Date(signal.expires_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No trading signals available. Click "Refresh Signals" to generate new ones.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Price Predictions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictions ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        ${predictions.price_forecast[0]?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Next Hour Forecast
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant={predictions.trend_direction === 'bullish' ? 'default' : 
                                   predictions.trend_direction === 'bearish' ? 'destructive' : 'secondary'}>
                        {predictions.trend_direction}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Model Accuracy</div>
                      <div className="text-lg font-semibold">
                        {(predictions.accuracy_score * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">24h Forecast Range</div>
                      <div className="text-xs space-y-1">
                        <div>High: ${Math.max(...predictions.price_forecast).toFixed(2)}</div>
                        <div>Low: ${Math.min(...predictions.price_forecast).toFixed(2)}</div>
                        <div>Avg: ${(predictions.price_forecast.reduce((a, b) => a + b, 0) / predictions.price_forecast.length).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Generate Predictions" to see AI-powered price forecasts</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Warning */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Warning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Energy trading involves substantial risk. Predictions are based on historical data and market conditions. Past performance does not guarantee future results. Only trade with capital you can afford to lose.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}