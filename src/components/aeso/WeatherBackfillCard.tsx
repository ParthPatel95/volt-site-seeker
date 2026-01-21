import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cloud, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WeatherStats {
  total: number;
  withWeather: number;
  missing: number;
  coverage: number;
}

export function WeatherBackfillCard() {
  const [stats, setStats] = useState<WeatherStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [backfilling, setBackfilling] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Get total count
      const { count: total } = await supabase
        .from('aeso_training_data')
        .select('id', { count: 'exact', head: true });

      // Get count with weather data
      const { count: withWeather } = await supabase
        .from('aeso_training_data')
        .select('id', { count: 'exact', head: true })
        .not('temperature_calgary', 'is', null)
        .not('wind_speed', 'is', null);

      const totalCount = total || 0;
      const weatherCount = withWeather || 0;
      const missingCount = totalCount - weatherCount;

      setStats({
        total: totalCount,
        withWeather: weatherCount,
        missing: missingCount,
        coverage: totalCount > 0 ? (weatherCount / totalCount) * 100 : 0
      });
    } catch (error) {
      console.error('Error fetching weather stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const runBackfill = async () => {
    setBackfilling(true);
    try {
      const { data, error } = await supabase.functions.invoke('aeso-weather-backfill', {
        body: { limit: 500 }
      });

      if (error) throw error;

      toast.success(`Weather backfill complete: ${data.recordsUpdated} records updated`);
      
      // Refresh stats
      await fetchStats();
    } catch (error: any) {
      console.error('Weather backfill error:', error);
      toast.error(`Backfill failed: ${error.message}`);
    } finally {
      setBackfilling(false);
    }
  };

  const coverageColor = stats?.coverage === 100 
    ? 'text-green-600' 
    : stats?.coverage && stats.coverage > 95 
      ? 'text-yellow-600' 
      : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Weather Data Backfill
        </CardTitle>
        <CardDescription>
          Fetch historical weather data from Open-Meteo API for training records missing temperature, wind, and cloud cover data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading weather statistics...
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.withWeather.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">With Weather</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${stats.missing > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {stats.missing.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Missing</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weather Coverage</span>
                <span className={coverageColor}>{stats.coverage.toFixed(2)}%</span>
              </div>
              <Progress value={stats.coverage} className="h-2" />
            </div>

            {stats.coverage === 100 ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Weather data is 100% complete!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>{stats.missing} records need weather data</span>
              </div>
            )}

            <Button 
              onClick={runBackfill} 
              disabled={backfilling || stats.missing === 0}
              className="w-full"
            >
              {backfilling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Backfilling Weather Data...
                </>
              ) : stats.missing === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  All Records Complete
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 mr-2" />
                  Run Weather Backfill ({stats.missing} records)
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="text-muted-foreground">Unable to load statistics</div>
        )}
      </CardContent>
    </Card>
  );
}
