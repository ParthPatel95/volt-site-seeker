import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, TrendingUp, ArrowLeftRight, Zap } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Market {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'preview' | 'coming_soon';
}

const MARKETS: Market[] = [
  { id: 'aeso', name: 'AESO', region: 'Alberta, Canada', status: 'active' },
  { id: 'ercot', name: 'ERCOT', region: 'Texas, USA', status: 'preview' },
  { id: 'miso', name: 'MISO', region: 'Midwest, USA', status: 'preview' },
  { id: 'caiso', name: 'CAISO', region: 'California, USA', status: 'preview' },
  { id: 'pjm', name: 'PJM', region: 'Mid-Atlantic, USA', status: 'preview' }
];

interface MultiMarketSelectorProps {
  onFetchPredictions: (market: string, horizon: string, compare: boolean) => Promise<any>;
  loading: boolean;
}

export function MultiMarketSelector({ onFetchPredictions, loading }: MultiMarketSelectorProps) {
  const [selectedMarket, setSelectedMarket] = useState('aeso');
  const [horizon, setHorizon] = useState('24h');
  const [compareMarkets, setCompareMarkets] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleFetch = async () => {
    const result = await onFetchPredictions(selectedMarket, horizon, compareMarkets);
    setLastResult(result);
  };

  const selectedMarketInfo = MARKETS.find(m => m.id === selectedMarket);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Multi-Market Predictions</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            Phase 9: Global Markets
          </Badge>
        </div>
        <CardDescription>
          Generate price predictions across multiple energy markets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Market</Label>
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a market" />
              </SelectTrigger>
              <SelectContent>
                {MARKETS.map((market) => (
                  <SelectItem key={market.id} value={market.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{market.name}</span>
                      <span className="text-xs text-muted-foreground">- {market.region}</span>
                      {market.status === 'active' && (
                        <Badge variant="default" className="text-xs ml-2">Active</Badge>
                      )}
                      {market.status === 'preview' && (
                        <Badge variant="secondary" className="text-xs ml-2">Preview</Badge>
                      )}
                      {market.status === 'coming_soon' && (
                        <Badge variant="outline" className="text-xs ml-2">Soon</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time Horizon</Label>
            <Select value={horizon} onValueChange={setHorizon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="12h">12 Hours</SelectItem>
                <SelectItem value="24h">24 Hours (1 Day)</SelectItem>
                <SelectItem value="48h">48 Hours (2 Days)</SelectItem>
                <SelectItem value="72h">72 Hours (3 Days)</SelectItem>
                <SelectItem value="168h">1 Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Market Info */}
        {selectedMarketInfo && (
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{selectedMarketInfo.name}</div>
                <div className="text-xs text-muted-foreground">{selectedMarketInfo.region}</div>
              </div>
              <Badge 
                variant={selectedMarketInfo.status === 'active' ? 'default' : 'secondary'}
                className="gap-1"
              >
                <Zap className="h-3 w-3" />
                {selectedMarketInfo.status === 'active' ? 'Full Model' : 'Generic Model'}
              </Badge>
            </div>
          </div>
        )}

        {/* Comparison Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            <div>
              <Label htmlFor="compare" className="text-sm font-medium">
                Multi-Market Comparison
              </Label>
              <div className="text-xs text-muted-foreground">
                Compare prices and find arbitrage opportunities
              </div>
            </div>
          </div>
          <Switch
            id="compare"
            checked={compareMarkets}
            onCheckedChange={setCompareMarkets}
          />
        </div>

        {/* Fetch Button */}
        <Button 
          onClick={handleFetch} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <TrendingUp className="mr-2 h-4 w-4 animate-pulse" />
              Generating Predictions...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Generate {selectedMarketInfo?.name} Predictions
            </>
          )}
        </Button>

        {/* Last Result Summary */}
        {lastResult && (
          <div className="space-y-3 p-4 rounded-lg bg-secondary/30 border border-border/30">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Last Prediction</div>
              <Badge variant="outline">{lastResult.market_name}</Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Predictions</div>
                <div className="font-mono font-medium">{lastResult.predictions?.length || 0}</div>
              </div>
              {lastResult.performance && (
                <>
                  <div>
                    <div className="text-muted-foreground">Cache Hit</div>
                    <div className="font-mono font-medium text-green-500">
                      {lastResult.performance.cache_hit_rate_percent.toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Response</div>
                    <div className="font-mono font-medium">
                      {lastResult.performance.total_duration_ms}ms
                    </div>
                  </div>
                </>
              )}
            </div>

            {lastResult.market_comparison && lastResult.market_comparison.arbitrage_opportunities?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="text-xs font-medium text-orange-500">
                  ⚡ {lastResult.market_comparison.arbitrage_opportunities.length} Arbitrage Opportunities Detected
                </div>
                {lastResult.market_comparison.arbitrage_opportunities.map((opp: any, idx: number) => (
                  <div key={idx} className="text-xs text-muted-foreground">
                    • {opp.from_market.toUpperCase()} → {opp.to_market.toUpperCase()}: 
                    ${opp.price_differential.toFixed(2)} ({opp.percent}%)
                  </div>
                ))}
              </div>
            )}

            {lastResult.note && (
              <div className="text-xs text-muted-foreground italic pt-2 border-t border-border/30">
                ℹ️ {lastResult.note}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
