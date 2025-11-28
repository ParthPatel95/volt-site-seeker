import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { detectAnomalies, AnomalyPoint } from '@/utils/advancedAnalytics';
import { HourlyDataPoint } from '@/services/historicalDataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter } from 'recharts';

interface AnomalyDetectionWidgetProps {
  config: {
    title: string;
    dataFilters?: {
      timeRange?: string;
    };
  };
}

export function AnomalyDetectionWidget({ config }: AnomalyDetectionWidgetProps) {
  const [anomalies, setAnomalies] = useState<AnomalyPoint[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [config.dataFilters?.timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const days = getTimeRangeDays(config.dataFilters?.timeRange || '7days');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('aeso_training_data')
        .select('timestamp, pool_price, generation_wind, ail_mw')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true })
        .limit(2000);

      if (error) throw error;

      const hourlyData: HourlyDataPoint[] = (data || []).map(d => ({
        ts: d.timestamp,
        price: d.pool_price,
        generation: d.generation_wind || 0,
        ail: d.ail_mw || 0,
      }));

      const anomalyData = detectAnomalies(hourlyData);
      setAnomalies(anomalyData.slice(-20)); // Show last 20 anomalies

      // Prepare chart data
      const recentData = hourlyData.slice(-168); // Last 7 days
      const anomalySet = new Set(anomalyData.map(a => a.timestamp));
      
      const chart = recentData.map(d => ({
        timestamp: new Date(d.ts).toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit' 
        }),
        price: d.price,
        isAnomaly: anomalySet.has(d.ts),
      }));
      
      setChartData(chart);
    } catch (error) {
      console.error('Error fetching anomaly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeDays = (range: string): number => {
    switch (range) {
      case '24hours': return 1;
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      default: return 7;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const highCount = anomalies.filter(a => a.severity === 'high').length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {config.title}
        </CardTitle>
        <CardDescription>
          Unusual price patterns detected using statistical analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{anomalies.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-2 bg-red-100 rounded-lg">
            <div className="text-2xl font-bold text-red-800">{criticalCount}</div>
            <div className="text-xs text-red-700">Critical</div>
          </div>
          <div className="text-center p-2 bg-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-800">{highCount}</div>
            <div className="text-xs text-orange-700">High</div>
          </div>
        </div>

        {/* Price Chart with Anomalies */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
              <Scatter
                data={chartData.filter(d => d.isAnomaly)}
                fill="red"
                shape="circle"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Anomalies List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h4 className="text-sm font-semibold mb-2">Recent Anomalies</h4>
          {anomalies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No anomalies detected in the selected time range
            </div>
          ) : (
            anomalies.map((anomaly, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(anomaly.severity)}
                    <span className="text-xs font-medium">
                      {new Date(anomaly.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold">
                    ${anomaly.value.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div>
                    Expected: ${anomaly.expectedValue.toFixed(2)} 
                    <span className="ml-2 text-muted-foreground">
                      (σ = {anomaly.zScore.toFixed(2)})
                    </span>
                  </div>
                  {anomaly.factors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {anomaly.factors.map((factor, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-background/50 rounded text-xs"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
