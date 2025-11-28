import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, RotateCcw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface SimulationResult {
  strategy: string;
  revenue: number;
  cost: number;
  profit: number;
  roi: number;
  operatingHours: number;
  avgPrice: number;
}

export function OperatingStrategySimulator() {
  const [loading, setLoading] = useState(false);
  const [capacity, setCapacity] = useState(100);
  const [costPerMWh, setCostPerMWh] = useState(50);
  const [strategy, setStrategy] = useState<'peak' | 'offpeak' | 'smart' | 'continuous'>('smart');
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const fetchHistoricalData = async () => {
    const { data } = await supabase
      .from('aeso_training_data')
      .select('pool_price, timestamp, hour_of_day')
      .order('timestamp', { ascending: false })
      .limit(720); // Last 30 days
    
    if (data) setHistoricalData(data);
  };

  const runSimulation = async () => {
    setLoading(true);
    
    // Simulate different strategies
    const strategies: Array<'peak' | 'offpeak' | 'smart' | 'continuous'> = ['peak', 'offpeak', 'smart', 'continuous'];
    const simulationResults: SimulationResult[] = [];

    for (const strat of strategies) {
      let operatingHours = 0;
      let totalRevenue = 0;
      let validPrices: number[] = [];

      historicalData.forEach((record) => {
        const price = record.pool_price;
        const hour = record.hour_of_day;
        let shouldOperate = false;

        switch (strat) {
          case 'peak':
            shouldOperate = hour >= 7 && hour <= 22;
            break;
          case 'offpeak':
            shouldOperate = hour < 7 || hour > 22;
            break;
          case 'smart':
            shouldOperate = price > 60;
            break;
          case 'continuous':
            shouldOperate = true;
            break;
        }

        if (shouldOperate && price > 0) {
          operatingHours++;
          totalRevenue += price * capacity;
          validPrices.push(price);
        }
      });

      const totalCost = operatingHours * costPerMWh * capacity;
      const profit = totalRevenue - totalCost;
      const avgPrice = validPrices.length > 0 ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : 0;

      simulationResults.push({
        strategy: strat.charAt(0).toUpperCase() + strat.slice(1),
        revenue: Math.round(totalRevenue),
        cost: Math.round(totalCost),
        profit: Math.round(profit),
        roi: totalCost > 0 ? Math.round((profit / totalCost) * 100) : 0,
        operatingHours,
        avgPrice: Math.round(avgPrice * 100) / 100,
      });
    }

    setResults(simulationResults);
    setLoading(false);
  };

  const resetSimulation = () => {
    setResults([]);
    setCapacity(100);
    setCostPerMWh(50);
    setStrategy('smart');
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Operating Strategy Simulator
        </CardTitle>
        <CardDescription>
          Compare different operating strategies based on historical price data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (MW)</Label>
            <Input
              id="capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              min={1}
              max={1000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Operating Cost ($/MWh)</Label>
            <Input
              id="cost"
              type="number"
              value={costPerMWh}
              onChange={(e) => setCostPerMWh(Number(e.target.value))}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="strategy">Default Strategy</Label>
            <Select value={strategy} onValueChange={(v: any) => setStrategy(v)}>
              <SelectTrigger id="strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peak">Peak Hours</SelectItem>
                <SelectItem value="offpeak">Off-Peak Hours</SelectItem>
                <SelectItem value="smart">Smart (Price &gt; $60)</SelectItem>
                <SelectItem value="continuous">Continuous</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={runSimulation} disabled={loading || historicalData.length === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Simulation
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetSimulation} disabled={loading}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {results.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {results.map((result) => (
                <Card key={result.strategy} className={result.profit > 0 ? 'border-green-500/50' : 'border-red-500/50'}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{result.strategy}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Profit:</span>
                      <span className={result.profit > 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
                        ${result.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ROI:</span>
                      <span className="font-semibold">{result.roi}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Hours:</span>
                      <span>{result.operatingHours}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Profit Comparison</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="strategy" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                  <Bar dataKey="cost" fill="hsl(var(--destructive))" name="Cost" />
                  <Bar dataKey="profit" fill="hsl(var(--chart-2))" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Best Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const best = results.reduce((max, r) => r.profit > max.profit ? r : max, results[0]);
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <span className="text-2xl font-bold">{best.strategy}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Profit: <span className="text-green-500 font-semibold">${best.profit.toLocaleString()}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Operating {best.operatingHours} hours at avg ${best.avgPrice}/MWh
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Worst Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const worst = results.reduce((min, r) => r.profit < min.profit ? r : min, results[0]);
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-red-500" />
                          <span className="text-2xl font-bold">{worst.strategy}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Profit: <span className="text-red-500 font-semibold">${worst.profit.toLocaleString()}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Operating {worst.operatingHours} hours at avg ${worst.avgPrice}/MWh
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
