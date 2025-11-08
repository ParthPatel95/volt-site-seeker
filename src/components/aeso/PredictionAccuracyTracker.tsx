import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Target, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface AccuracyMetric {
  target_timestamp: string;
  predicted_price: number;
  actual_price: number;
  absolute_error: number;
  percent_error: number;
  within_confidence: boolean;
  horizon_hours: number;
}

export const PredictionAccuracyTracker = () => {
  const [accuracyData, setAccuracyData] = useState<AccuracyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    avgMAE: number;
    avgMAPE: number;
    confidenceAccuracy: number;
    totalPredictions: number;
  } | null>(null);

  useEffect(() => {
    fetchAccuracyData();
  }, []);

  const fetchAccuracyData = async () => {
    try {
      const { data, error } = await supabase
        .from('aeso_prediction_accuracy')
        .select('*')
        .order('target_timestamp', { ascending: false })
        .limit(168); // Last 7 days

      if (error) throw error;

      if (data && data.length > 0) {
        setAccuracyData(data);
        
        const avgMAE = data.reduce((sum, d) => sum + d.absolute_error, 0) / data.length;
        const avgMAPE = data.reduce((sum, d) => sum + d.percent_error, 0) / data.length;
        const withinConfidence = data.filter(d => d.within_confidence).length;
        
        setSummary({
          avgMAE,
          avgMAPE,
          confidenceAccuracy: (withinConfidence / data.length) * 100,
          totalPredictions: data.length
        });
      }
    } catch (error) {
      console.error('Error fetching accuracy data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Prediction Accuracy Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading accuracy metrics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!accuracyData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Prediction Accuracy Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No accuracy data available yet. Predictions need to be validated against actual prices.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = accuracyData
    .slice(0, 48)
    .reverse()
    .map(d => ({
      time: new Date(d.target_timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
      predicted: d.predicted_price,
      actual: d.actual_price,
      error: d.absolute_error
    }));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Error (MAE)</p>
                  <p className="text-2xl font-bold">${summary.avgMAE.toFixed(2)}</p>
                </div>
                <Target className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg MAPE</p>
                  <p className="text-2xl font-bold">{summary.avgMAPE.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confidence Hit Rate</p>
                  <p className="text-2xl font-bold">{summary.confidenceAccuracy.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Validated</p>
                  <p className="text-2xl font-bold">{summary.totalPredictions}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accuracy Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Predicted vs Actual Prices
          </CardTitle>
          <CardDescription>
            Comparison of predicted and actual prices over the last 48 hours
          </CardDescription>
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
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="Actual"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Error Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Error Analysis</CardTitle>
          <CardDescription>Distribution of prediction errors by horizon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 6, 12, 24].map(horizon => {
              const horizonData = accuracyData.filter(d => d.horizon_hours === horizon);
              if (horizonData.length === 0) return null;
              
              const avgError = horizonData.reduce((sum, d) => sum + d.absolute_error, 0) / horizonData.length;
              const avgPctError = horizonData.reduce((sum, d) => sum + d.percent_error, 0) / horizonData.length;
              
              return (
                <div key={horizon} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{horizon}h Ahead Predictions</p>
                    <p className="text-sm text-muted-foreground">
                      {horizonData.length} validated predictions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${avgError.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{avgPctError.toFixed(1)}% MAPE</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
