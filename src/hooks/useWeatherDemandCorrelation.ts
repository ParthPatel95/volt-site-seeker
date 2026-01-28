import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateCorrelation } from '@/utils/aggregations';

export interface WeatherDemandDataPoint {
  temperature: number;
  demand: number;
  year: number;
  timestamp: string;
}

export interface WeatherDemandCorrelationResult {
  data: WeatherDemandDataPoint[];
  loading: boolean;
  error: string | null;
  correlation: number;
  correlationStrength: 'strong' | 'moderate' | 'weak';
  trendline: { slope: number; intercept: number };
  stats: {
    avgDemandAtExtremeCold: number;
    avgDemandAtCold: number;
    avgDemandAtMild: number;
    demandIncreasePerDegree: number;
    totalRecords: number;
    tempRange: { min: number; max: number };
    demandRange: { min: number; max: number };
  };
}

/**
 * Calculate linear regression for trendline
 */
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Get correlation strength label
 */
function getCorrelationStrength(r: number): 'strong' | 'moderate' | 'weak' {
  const absR = Math.abs(r);
  if (absR >= 0.6) return 'strong';
  if (absR >= 0.4) return 'moderate';
  return 'weak';
}

export function useWeatherDemandCorrelation(): WeatherDemandCorrelationResult {
  const [data, setData] = useState<WeatherDemandDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correlation, setCorrelation] = useState(0);
  const [trendline, setTrendline] = useState({ slope: 0, intercept: 0 });
  const [stats, setStats] = useState({
    avgDemandAtExtremeCold: 0,
    avgDemandAtCold: 0,
    avgDemandAtMild: 0,
    demandIncreasePerDegree: 0,
    totalRecords: 0,
    tempRange: { min: 0, max: 0 },
    demandRange: { min: 0, max: 0 },
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch high-demand periods with temperature data
        const { data: rawData, error: queryError } = await supabase
          .from('aeso_training_data')
          .select('temperature_edmonton, ail_mw, timestamp')
          .not('temperature_edmonton', 'is', null)
          .gte('ail_mw', 11000)
          .order('ail_mw', { ascending: false })
          .limit(1500);

        if (queryError) throw queryError;

        if (!rawData || rawData.length === 0) {
          setError('No data available');
          setLoading(false);
          return;
        }

        // Transform data
        const points: WeatherDemandDataPoint[] = rawData.map((row) => ({
          temperature: row.temperature_edmonton as number,
          demand: row.ail_mw as number,
          year: new Date(row.timestamp).getFullYear(),
          timestamp: row.timestamp,
        }));

        setData(points);

        // Calculate correlation
        const temps = points.map((p) => p.temperature);
        const demands = points.map((p) => p.demand);
        const r = calculateCorrelation(temps, demands);
        setCorrelation(r);

        // Calculate trendline
        const trend = linearRegression(temps, demands);
        setTrendline(trend);

        // Calculate stats by temperature zone
        const extremeCold = points.filter((p) => p.temperature < -20);
        const cold = points.filter((p) => p.temperature >= -20 && p.temperature < -10);
        const mild = points.filter((p) => p.temperature >= 0);

        const avgExtreme = extremeCold.length > 0
          ? extremeCold.reduce((sum, p) => sum + p.demand, 0) / extremeCold.length
          : 0;
        const avgCold = cold.length > 0
          ? cold.reduce((sum, p) => sum + p.demand, 0) / cold.length
          : 0;
        const avgMild = mild.length > 0
          ? mild.reduce((sum, p) => sum + p.demand, 0) / mild.length
          : 0;

        // Demand increase per degree (absolute value of slope)
        const demandPerDegree = Math.abs(trend.slope);

        setStats({
          avgDemandAtExtremeCold: Math.round(avgExtreme),
          avgDemandAtCold: Math.round(avgCold),
          avgDemandAtMild: Math.round(avgMild),
          demandIncreasePerDegree: Math.round(demandPerDegree * 10) / 10,
          totalRecords: points.length,
          tempRange: {
            min: Math.min(...temps),
            max: Math.max(...temps),
          },
          demandRange: {
            min: Math.min(...demands),
            max: Math.max(...demands),
          },
        });
      } catch (err) {
        console.error('Error fetching weather correlation data:', err);
        setError('Failed to load correlation data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    correlation,
    correlationStrength: getCorrelationStrength(correlation),
    trendline,
    stats,
  };
}
