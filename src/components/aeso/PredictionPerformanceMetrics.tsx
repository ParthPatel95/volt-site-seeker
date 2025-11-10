import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Database, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PerformanceData {
  request_timestamp: string;
  horizon_hours: number;
  cache_hit_count: number;
  cache_miss_count: number;
  total_duration_ms: number;
  predictions_generated: number;
  cache_hit_rate: number;
}

interface PredictionPerformanceMetricsProps {
  onFetchMetrics?: () => Promise<PerformanceData[] | null>;
}

export function PredictionPerformanceMetrics({ onFetchMetrics }: PredictionPerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<PerformanceData[]>([]);
  const [stats, setStats] = useState({
    avgCacheHitRate: 0,
    avgDuration: 0,
    totalRequests: 0,
    totalCacheHits: 0,
    totalCacheMisses: 0
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    if (!onFetchMetrics) return;
    
    const data = await onFetchMetrics();
    if (data && data.length > 0) {
      setMetrics(data);
      
      // Calculate aggregate stats
      const totalRequests = data.length;
      const avgCacheHitRate = data.reduce((sum, m) => sum + m.cache_hit_rate, 0) / totalRequests;
      const avgDuration = data.reduce((sum, m) => sum + m.total_duration_ms, 0) / totalRequests;
      const totalCacheHits = data.reduce((sum, m) => sum + m.cache_hit_count, 0);
      const totalCacheMisses = data.reduce((sum, m) => sum + m.cache_miss_count, 0);
      
      setStats({
        avgCacheHitRate,
        avgDuration,
        totalRequests,
        totalCacheHits,
        totalCacheMisses
      });
    }
  };

  if (metrics.length === 0) {
    return null;
  }

  const getPerformanceColor = (duration: number) => {
    if (duration < 1000) return 'text-green-500';
    if (duration < 3000) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getCacheColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 50) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Prediction Performance</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            Phase 7: Optimization
          </Badge>
        </div>
        <CardDescription>
          Real-time inference optimization with intelligent caching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="h-3 w-3" />
              Cache Hit Rate
            </div>
            <div className={`text-2xl font-bold ${getCacheColor(stats.avgCacheHitRate)}`}>
              {stats.avgCacheHitRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.totalCacheHits} hits / {stats.totalCacheMisses} misses
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Avg Response Time
            </div>
            <div className={`text-2xl font-bold ${getPerformanceColor(stats.avgDuration)}`}>
              {stats.avgDuration.toFixed(0)}ms
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.totalRequests} requests
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Total Requests
            </div>
            <div className="text-2xl font-bold text-primary">
              {stats.totalRequests}
            </div>
            <div className="text-xs text-muted-foreground">
              Last 100 requests
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              Speed Boost
            </div>
            <div className="text-2xl font-bold text-green-500">
              {stats.avgCacheHitRate > 0 ? `${(1 / (1 - stats.avgCacheHitRate / 100)).toFixed(1)}x` : '1.0x'}
            </div>
            <div className="text-xs text-muted-foreground">
              vs uncached
            </div>
          </div>
        </div>

        {/* Recent Performance Timeline */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">Recent Prediction Requests</div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {metrics.slice(0, 10).map((metric, idx) => {
              const timestamp = new Date(metric.request_timestamp);
              const timeAgo = Math.floor((Date.now() - timestamp.getTime()) / 1000 / 60);
              
              return (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/30 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">
                      {timeAgo < 1 ? 'Just now' : `${timeAgo}m ago`}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {metric.horizon_hours}h
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Database className="h-3 w-3 text-muted-foreground" />
                      <span className={getCacheColor(metric.cache_hit_rate)}>
                        {metric.cache_hit_rate.toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className={getPerformanceColor(metric.total_duration_ms)}>
                        {metric.total_duration_ms}ms
                      </span>
                    </div>
                    
                    <div className="text-muted-foreground">
                      {metric.cache_hit_count}/{metric.cache_hit_count + metric.cache_miss_count} cached
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optimization Info */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-medium text-primary">Intelligent Caching Active</div>
              <div className="text-muted-foreground">
                Predictions are cached for 15 minutes and automatically refreshed when new data is available. 
                Batch processing optimizes generation of multiple predictions.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
