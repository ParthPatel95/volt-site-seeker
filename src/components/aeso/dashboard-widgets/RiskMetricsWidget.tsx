import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, Shield, TrendingDown, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface RiskMetric {
  name: string;
  value: number;
  status: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface VaRData {
  confidence: string;
  value: number;
  description: string;
}

export function RiskMetricsWidget() {
  const [loading, setLoading] = useState(true);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [varData, setVarData] = useState<VaRData[]>([]);
  const [volatilityHistory, setVolatilityHistory] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: priceData } = await supabase
      .from('aeso_training_data')
      .select('pool_price, ail_mw, generation_wind, timestamp')
      .order('timestamp', { ascending: false })
      .limit(2160); // Last 90 days

    if (priceData && priceData.length > 0) {
      // Calculate price volatility (standard deviation)
      const prices = priceData.map(d => d.pool_price || 0).filter(p => p > 0);
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);
      const volatility = (stdDev / avgPrice) * 100;

      // Calculate demand volatility
      const demands = priceData.map(d => d.ail_mw || 0).filter(d => d > 0);
      const avgDemand = demands.reduce((sum, d) => sum + d, 0) / demands.length;
      const demandVariance = demands.reduce((sum, d) => sum + Math.pow(d - avgDemand, 2), 0) / demands.length;
      const demandStdDev = Math.sqrt(demandVariance);
      const demandVolatility = (demandStdDev / avgDemand) * 100;

      // Calculate renewable intermittency risk
      const windGen = priceData.map(d => d.generation_wind || 0).filter(w => w > 0);
      const avgWind = windGen.reduce((sum, w) => sum + w, 0) / windGen.length;
      const windVariance = windGen.reduce((sum, w) => sum + Math.pow(w - avgWind, 2), 0) / windGen.length;
      const windStdDev = Math.sqrt(windVariance);
      const windVolatility = (windStdDev / avgWind) * 100;

      // Calculate concentration risk (hours with price > $100)
      const highPriceHours = prices.filter(p => p > 100).length;
      const concentrationRisk = (highPriceHours / prices.length) * 100;

      // Liquidity risk (simplified - based on price ranges)
      const priceRanges = prices.map(p => {
        if (p < 50) return 'low';
        if (p < 100) return 'medium';
        return 'high';
      });
      const highPriceCount = priceRanges.filter(r => r === 'high').length;
      const liquidityRisk = (highPriceCount / prices.length) * 100;

      const metrics: RiskMetric[] = [
        {
          name: 'Price Volatility',
          value: Math.round(volatility),
          status: volatility < 30 ? 'low' : volatility < 50 ? 'medium' : 'high',
          trend: 'stable',
          description: 'Standard deviation of pool prices as % of average',
        },
        {
          name: 'Demand Risk',
          value: Math.round(demandVolatility),
          status: demandVolatility < 10 ? 'low' : demandVolatility < 20 ? 'medium' : 'high',
          trend: 'stable',
          description: 'Variability in system demand',
        },
        {
          name: 'Renewable Intermittency',
          value: Math.round(windVolatility),
          status: windVolatility < 40 ? 'low' : windVolatility < 60 ? 'medium' : 'high',
          trend: 'up',
          description: 'Wind generation variability',
        },
        {
          name: 'Concentration Risk',
          value: Math.round(concentrationRisk),
          status: concentrationRisk < 5 ? 'low' : concentrationRisk < 15 ? 'medium' : 'high',
          trend: 'down',
          description: 'Exposure to extreme price events',
        },
        {
          name: 'Liquidity Risk',
          value: Math.round(liquidityRisk),
          status: liquidityRisk < 10 ? 'low' : liquidityRisk < 25 ? 'medium' : 'high',
          trend: 'stable',
          description: 'Market depth during high-price periods',
        },
      ];

      setRiskMetrics(metrics);

      // Calculate Value at Risk (VaR)
      const sortedPrices = [...prices].sort((a, b) => b - a);
      const var95 = sortedPrices[Math.floor(sortedPrices.length * 0.05)];
      const var99 = sortedPrices[Math.floor(sortedPrices.length * 0.01)];
      const var99_9 = sortedPrices[Math.floor(sortedPrices.length * 0.001)];

      setVarData([
        { confidence: '95%', value: Math.round(var95), description: '1 in 20 hours' },
        { confidence: '99%', value: Math.round(var99), description: '1 in 100 hours' },
        { confidence: '99.9%', value: Math.round(var99_9), description: '1 in 1000 hours' },
      ]);

      // Volatility history (weekly)
      const weeklyVolatility: any[] = [];
      for (let i = 0; i < 12; i++) {
        const weekData = priceData.slice(i * 168, (i + 1) * 168);
        const weekPrices = weekData.map(d => d.pool_price || 0).filter(p => p > 0);
        if (weekPrices.length > 0) {
          const weekAvg = weekPrices.reduce((sum, p) => sum + p, 0) / weekPrices.length;
          const weekVar = weekPrices.reduce((sum, p) => sum + Math.pow(p - weekAvg, 2), 0) / weekPrices.length;
          const weekStd = Math.sqrt(weekVar);
          const weekVol = (weekStd / weekAvg) * 100;
          weeklyVolatility.push({
            week: `Week ${12 - i}`,
            volatility: Math.round(weekVol),
          });
        }
      }
      setVolatilityHistory(weeklyVolatility.reverse());

      // Radar chart data
      const radarChartData = metrics.map(m => ({
        metric: m.name.split(' ')[0],
        score: 100 - m.value, // Invert so higher is better
        fullMark: 100,
      }));
      setRadarData(radarChartData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'low': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Low</Badge>;
      case 'medium': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Medium</Badge>;
      case 'high': return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">High</Badge>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Metrics Dashboard
        </CardTitle>
        <CardDescription>
          Comprehensive risk analysis across multiple dimensions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskMetrics.map((metric) => (
            <Card key={metric.name}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{metric.name}</CardTitle>
                  {getStatusBadge(metric.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className={`text-3xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}%
                </div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Value at Risk (VaR)
            </h4>
            <div className="space-y-3">
              {varData.map((var_item) => (
                <Card key={var_item.confidence}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold">${var_item.value}/MWh</div>
                        <div className="text-xs text-muted-foreground">{var_item.confidence} Confidence</div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {var_item.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Risk Profile
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="metric" className="text-xs" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                <Radar
                  name="Risk Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Volatility Trends (Last 12 Weeks)
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={volatilityHistory}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="week" className="text-xs" />
              <YAxis className="text-xs" label={{ value: 'Volatility %', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Line
                type="monotone"
                dataKey="volatility"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-3))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
