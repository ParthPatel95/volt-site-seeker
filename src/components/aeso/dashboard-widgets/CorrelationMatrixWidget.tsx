import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { calculateCorrelationMatrix, CorrelationData } from '@/utils/advancedAnalytics';
import { HourlyDataPoint } from '@/services/historicalDataService';

interface CorrelationMatrixWidgetProps {
  config: {
    title: string;
    dataFilters?: {
      timeRange?: string;
    };
  };
}

export function CorrelationMatrixWidget({ config }: CorrelationMatrixWidgetProps) {
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<CorrelationData | null>(null);

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
        .limit(1000);

      if (error) throw error;

      const hourlyData: HourlyDataPoint[] = (data || []).map(d => ({
        ts: d.timestamp,
        price: d.pool_price,
        generation: d.generation_wind || 0,
        ail: d.ail_mw || 0,
      }));

      const correlationData = calculateCorrelationMatrix(hourlyData);
      setCorrelations(correlationData);
    } catch (error) {
      console.error('Error fetching correlation data:', error);
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

  const getCorrelationColor = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return value > 0 ? 'bg-green-500' : 'bg-red-500';
    if (absValue > 0.4) return value > 0 ? 'bg-green-400' : 'bg-red-400';
    if (absValue > 0.2) return value > 0 ? 'bg-green-300' : 'bg-red-300';
    return 'bg-muted';
  };

  const getCorrelationStrength = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue > 0.7) return 'Strong';
    if (absValue > 0.4) return 'Moderate';
    if (absValue > 0.2) return 'Weak';
    return 'Very Weak';
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {config.title}
        </CardTitle>
        <CardDescription>
          Relationships between market variables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {correlations.map((corr, idx) => (
            <div
              key={idx}
              className="cursor-pointer hover:bg-accent/50 p-3 rounded-lg transition-colors"
              onClick={() => setSelectedCell(corr)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  {corr.variable1} vs {corr.variable2}
                </div>
                <div className="flex items-center gap-2">
                  {corr.correlation > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-mono text-sm font-semibold">
                    {corr.correlation.toFixed(3)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getCorrelationColor(corr.correlation)} transition-all`}
                    style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-20 text-right">
                  {getCorrelationStrength(corr.correlation)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedCell && (
          <div className="mt-4 p-4 bg-accent/30 rounded-lg border">
            <h4 className="font-semibold mb-2">Correlation Details</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Variables: </span>
                {selectedCell.variable1} ↔ {selectedCell.variable2}
              </div>
              <div>
                <span className="text-muted-foreground">Coefficient: </span>
                <span className="font-mono">{selectedCell.correlation.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Strength: </span>
                {getCorrelationStrength(selectedCell.correlation)}
              </div>
              <div>
                <span className="text-muted-foreground">Direction: </span>
                {selectedCell.correlation > 0 ? 'Positive (↑)' : 'Negative (↓)'}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
          <p>
            <strong>Interpretation:</strong> Positive values indicate variables move together,
            negative values indicate inverse relationships. Click any correlation to see details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
