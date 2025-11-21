import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Database, Wifi, Gauge, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PerformanceOptimizationPanel() {
  const { toast } = useToast();
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [websocketEnabled, setWebsocketEnabled] = useState(false);
  const [progressiveLoading, setProgressiveLoading] = useState(true);
  const [lazyLoading, setLazyLoading] = useState(true);

  const handleClearCache = () => {
    toast({
      title: "Cache Cleared",
      description: "All cached data has been removed",
    });
  };

  const handleOptimize = () => {
    toast({
      title: "Optimization Complete",
      description: "Dashboard performance has been optimized",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-chart-1" />
            Data Caching
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="cache">Enable Redis Caching</Label>
              <p className="text-xs text-muted-foreground">
                Cache frequently accessed data for faster load times
              </p>
            </div>
            <Switch
              id="cache"
              checked={cacheEnabled}
              onCheckedChange={setCacheEnabled}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
              <Badge variant="secondary">87.5%</Badge>
            </div>
            <Progress value={87.5} className="h-2" />
            
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold">24.3s</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">1.2M</p>
                <p className="text-xs text-muted-foreground">Cached Items</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">256MB</p>
                <p className="text-xs text-muted-foreground">Cache Size</p>
              </div>
            </div>
          </div>

          <Button onClick={handleClearCache} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-chart-2" />
            Real-Time Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="websocket">WebSocket Updates</Label>
              <p className="text-xs text-muted-foreground">
                Switch from polling to WebSocket for real-time data
              </p>
            </div>
            <Switch
              id="websocket"
              checked={websocketEnabled}
              onCheckedChange={setWebsocketEnabled}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Connection Status:</span>
              <Badge variant={websocketEnabled ? "default" : "secondary"}>
                {websocketEnabled ? "Connected" : "Polling"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Update Frequency:</span>
              <span className="text-sm font-medium">
                {websocketEnabled ? "Real-time" : "Every 30s"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Latency:</span>
              <span className="text-sm font-medium">
                {websocketEnabled ? "~50ms" : "~500ms"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-chart-3" />
            Loading Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="progressive">Progressive Loading</Label>
              <p className="text-xs text-muted-foreground">
                Load critical widgets first, then load the rest
              </p>
            </div>
            <Switch
              id="progressive"
              checked={progressiveLoading}
              onCheckedChange={setProgressiveLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="lazy">Lazy Loading</Label>
              <p className="text-xs text-muted-foreground">
                Only load widgets when they become visible
              </p>
            </div>
            <Switch
              id="lazy"
              checked={lazyLoading}
              onCheckedChange={setLazyLoading}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Performance Impact</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Initial Load Time:</span>
                <span className="font-medium text-green-600">-60% faster</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Memory Usage:</span>
                <span className="font-medium text-green-600">-45% lower</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time to Interactive:</span>
                <span className="font-medium text-green-600">-70% faster</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Optimization Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleOptimize} className="w-full">
            <Zap className="w-4 h-4 mr-2" />
            Run Full Optimization
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              Analyze Bundle Size
            </Button>
            <Button variant="outline" size="sm">
              Check Network Usage
            </Button>
            <Button variant="outline" size="sm">
              Review Query Performance
            </Button>
            <Button variant="outline" size="sm">
              Optimize Images
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
