import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Activity, Database, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PerformanceMetric {
  date: string;
  smape: number;
  mae: number;
  training_records: number;
}

export const ModelImprovementDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceHistory();
    checkDataQuality();
  }, []);

  const fetchPerformanceHistory = async () => {
    const { data, error } = await supabase
      .from('aeso_model_performance')
      .select('created_at, smape, mae, training_records')
      .order('created_at', { ascending: true })
      .limit(30);

    if (error) {
      console.error('Error fetching performance:', error);
      return;
    }

    const formattedData = data.map(d => ({
      date: new Date(d.created_at).toLocaleDateString(),
      smape: d.smape || 0,
      mae: d.mae || 0,
      training_records: d.training_records || 0
    }));

    setMetrics(formattedData);
    setLoading(false);
  };

  const checkDataQuality = async () => {
    try {
      const { count: totalCount } = await supabase
        .from('aeso_training_data')
        .select('*', { count: 'exact', head: true });

      const { count: validCount } = await supabase
        .from('aeso_training_data')
        .select('*', { count: 'exact', head: true })
        .eq('is_valid_record', true);

      const { data: lagData } = await supabase
        .from('aeso_training_data')
        .select('price_lag_1h, ail_mw, generation_wind')
        .limit(1000);

      const missingLag = lagData?.filter(d => d.price_lag_1h === null).length || 0;
      const missingDemand = lagData?.filter(d => d.ail_mw === null).length || 0;
      const missingGen = lagData?.filter(d => d.generation_wind === null).length || 0;

      const { data: dateRange } = await supabase
        .from('aeso_training_data')
        .select('timestamp')
        .order('timestamp', { ascending: true })
        .limit(1);

      const { data: dateRangeMax } = await supabase
        .from('aeso_training_data')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1);

      setDataQuality({
        total_records: totalCount || 0,
        valid_records: validCount || 0,
        missing_lag_features: missingLag,
        missing_demand: missingDemand,
        missing_generation: missingGen,
        earliest_data: dateRange?.[0]?.timestamp,
        latest_data: dateRangeMax?.[0]?.timestamp
      });
    } catch (error) {
      console.error('Error checking data quality:', error);
    }
  };

  const triggerImprovedTraining = async () => {
    setIsTraining(true);
    toast.info("Starting improved model training...");

    try {
      const { data, error } = await supabase.functions.invoke('aeso-model-trainer', {
        body: { mode: 'full_training' }
      });

      if (error) throw error;

      toast.success("Model training completed! Check performance metrics.");
      fetchPerformanceHistory();
    } catch (error: any) {
      toast.error(`Training failed: ${error.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const latestMetric = metrics[metrics.length - 1];
  const previousMetric = metrics[metrics.length - 2];
  const smapeImprovement = previousMetric 
    ? ((previousMetric.smape - latestMetric?.smape) / previousMetric.smape * 100).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current sMAPE</CardTitle>
            {smapeImprovement && parseFloat(smapeImprovement) > 0 ? (
              <TrendingDown className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetric?.smape.toFixed(2)}%</div>
            {smapeImprovement && (
              <p className="text-xs text-muted-foreground">
                {parseFloat(smapeImprovement) > 0 ? '↓' : '↑'} {Math.abs(parseFloat(smapeImprovement))}% from previous
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetric?.training_records.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dataQuality && `${((latestMetric?.training_records / dataQuality.valid_records) * 100).toFixed(1)}% of available`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            {dataQuality && dataQuality.missing_lag_features < 500 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            {dataQuality && (
              <>
                <div className="text-2xl font-bold">
                  {((dataQuality.valid_records / dataQuality.total_records) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {dataQuality.valid_records.toLocaleString()} valid records
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>sMAPE and MAE over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="smape" 
                stroke="hsl(var(--primary))" 
                name="sMAPE (%)"
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="mae" 
                stroke="hsl(var(--destructive))" 
                name="MAE ($)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Model Improvements
          </CardTitle>
          <CardDescription>
            Enhanced training algorithm with 4-model ensemble
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">NEW</Badge>
              <div>
                <p className="font-medium">Multi-Model Ensemble</p>
                <p className="text-sm text-muted-foreground">
                  Combines lag-based (40%), time-series decomposition (30%), volatility-adjusted (20%), and regime-based (10%) models
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">NEW</Badge>
              <div>
                <p className="font-medium">Advanced Feature Engineering</p>
                <p className="text-sm text-muted-foreground">
                  Momentum tracking, volatility patterns, hourly/weekly seasonality, and regime detection
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">NEW</Badge>
              <div>
                <p className="font-medium">All Available Data</p>
                <p className="text-sm text-muted-foreground">
                  Training on {dataQuality?.valid_records.toLocaleString()} records instead of 1,000
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">NEW</Badge>
              <div>
                <p className="font-medium">Dynamic Weighting</p>
                <p className="text-sm text-muted-foreground">
                  Adapts predictions based on market volatility and time-of-day patterns
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={triggerImprovedTraining} 
            disabled={isTraining}
            className="w-full"
          >
            <Activity className="mr-2 h-4 w-4" />
            {isTraining ? 'Training in Progress...' : 'Retrain with Improved Model'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
