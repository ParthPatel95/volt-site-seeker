import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Play, TrendingUp, Target, DollarSign, Info } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BacktestResult {
  timestamp: string;
  actual_price: number;
  predicted_price: number;
  error: number;
  profit_loss: number;
}

export const BacktestingDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [backtestPeriod, setBacktestPeriod] = useState<string>('7');
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [currentModelVersion, setCurrentModelVersion] = useState<string | null>(null);
  const [backtestModelVersion, setBacktestModelVersion] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalTrades: number;
    avgError: number;
    rmse: number;
    profitLoss: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentModelVersion();
  }, []);

  const fetchCurrentModelVersion = async () => {
    try {
      const { data } = await supabase
        .from('aeso_model_performance')
        .select('model_version')
        .order('trained_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setCurrentModelVersion(data.model_version);
      }
    } catch (error) {
      console.error('Error fetching current model version:', error);
    }
  };

  const runBacktest = async () => {
    setLoading(true);
    try {
      const daysAgo = parseInt(backtestPeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch historical training data (actual prices)
      const { data: actualData, error: actualError } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true });

      if (actualError) throw actualError;

      if (!actualData || actualData.length < 24) {
        toast({
          title: "Insufficient Data",
          description: "Not enough historical data for backtesting. Need at least 24 hours.",
          variant: "destructive"
        });
        return;
      }

      // Fetch predictions that were made during this period
      const { data: predictionData, error: predError } = await supabase
        .from('aeso_price_predictions')
        .select('target_timestamp, predicted_price, prediction_timestamp, model_version')
        .gte('target_timestamp', startDate.toISOString())
        .order('target_timestamp', { ascending: true });

      if (predError) throw predError;

      // Track which model version these predictions are from
      if (predictionData && predictionData.length > 0 && predictionData[0].model_version) {
        setBacktestModelVersion(predictionData[0].model_version);
      }

      // Match predictions with actual prices
      const backtestResults: BacktestResult[] = [];
      let cumulativePL = 0;

      for (const pred of predictionData || []) {
        const actual = actualData.find(a => {
          const timeDiff = Math.abs(new Date(a.timestamp).getTime() - new Date(pred.target_timestamp).getTime());
          return timeDiff < 60 * 60 * 1000; // Within 1 hour
        });

        if (actual) {
          const error = Math.abs(actual.pool_price - pred.predicted_price);
          
          // Simple trading strategy: if prediction says price will be low, "buy"
          const expectedReturn = pred.predicted_price < 40 ? actual.pool_price - pred.predicted_price : 0;
          cumulativePL += expectedReturn;

          backtestResults.push({
            timestamp: pred.target_timestamp,
            actual_price: actual.pool_price,
            predicted_price: pred.predicted_price,
            error,
            profit_loss: cumulativePL
          });
        }
      }

      if (backtestResults.length === 0) {
        toast({
          title: "No Matching Data",
          description: "No predictions found that match actual prices in this period.",
          variant: "destructive"
        });
        return;
      }

      setResults(backtestResults);

      // Calculate summary statistics
      const avgError = backtestResults.reduce((sum, r) => sum + r.error, 0) / backtestResults.length;
      const rmse = Math.sqrt(backtestResults.reduce((sum, r) => sum + Math.pow(r.error, 2), 0) / backtestResults.length);

      setSummary({
        totalTrades: backtestResults.length,
        avgError,
        rmse,
        profitLoss: cumulativePL
      });

      toast({
        title: "Backtest Complete",
        description: `Analyzed ${backtestResults.length} predictions across ${daysAgo} days`
      });

    } catch (error: any) {
      console.error('Backtest error:', error);
      toast({
        title: "Backtest Error",
        description: error.message || "Failed to run backtest",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = results.map(r => ({
    time: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    actual: r.actual_price,
    predicted: r.predicted_price,
    pl: r.profit_loss
  }));

  const isOutdated = currentModelVersion && backtestModelVersion && currentModelVersion !== backtestModelVersion;

  return (
    <div className="space-y-4">
      {/* Model Version Warning */}
      {isOutdated && summary && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Historical Data</strong> - These backtest results use predictions from model version {backtestModelVersion}. 
            Current model is {currentModelVersion}. Run a new backtest after generating predictions with the latest model to see updated results.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Backtesting Configuration
          </CardTitle>
          <CardDescription>
            Test model performance on historical data by comparing past predictions with actual prices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="backtest-period">Backtest Period</Label>
              <Select value={backtestPeriod} onValueChange={setBacktestPeriod}>
                <SelectTrigger id="backtest-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="14">Last 14 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runBacktest} disabled={loading}>
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Running...' : 'Run Backtest'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Predictions</p>
                    <p className="text-2xl font-bold">{summary.totalTrades}</p>
                  </div>
                  <Target className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Error (MAE)</p>
                    <p className="text-2xl font-bold">${summary.avgError.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">RMSE</p>
                    <p className="text-2xl font-bold">${summary.rmse.toFixed(2)}</p>
                  </div>
                  <Target className="h-8 w-8 text-warning opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Simulated P/L</p>
                    <p className={`text-2xl font-bold ${summary.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${summary.profitLoss.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Predicted vs Actual Prices</CardTitle>
              <CardDescription>Historical comparison of model predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="time" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: '$/MWh', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Predicted"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Actual"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cumulative Profit/Loss</CardTitle>
              <CardDescription>Simulated trading performance (buy when predicted price {'<'} $40/MWh)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="time" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Profit/Loss ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pl" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="Cumulative P/L"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
