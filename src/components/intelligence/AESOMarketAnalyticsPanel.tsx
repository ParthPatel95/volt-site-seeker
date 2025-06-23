
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AESOMarketAnalyticsPanelProps {
  marketAnalytics: any;
  historicalPrices: any;
  loading: boolean;
}

export function AESOMarketAnalyticsPanel({ marketAnalytics, historicalPrices, loading }: AESOMarketAnalyticsPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStressLevel = (score: number) => {
    if (score > 70) return { level: 'High', color: 'destructive', icon: AlertTriangle };
    if (score > 40) return { level: 'Medium', color: 'secondary', icon: Activity };
    return { level: 'Low', color: 'default', icon: CheckCircle };
  };

  const stressInfo = marketAnalytics ? getStressLevel(marketAnalytics.market_stress_score) : null;

  const priceChartData = historicalPrices?.prices?.slice(-24).map(price => ({
    time: new Date(price.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: price.pool_price,
    forecast: price.forecast_pool_price
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Market Stress Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-blue-600" />
            Market Stress Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketAnalytics && stressInfo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Stress Level</span>
                <Badge variant={stressInfo.color as any} className="flex items-center">
                  <stressInfo.icon className="w-3 h-3 mr-1" />
                  {stressInfo.level}
                </Badge>
              </div>
              <Progress value={marketAnalytics.market_stress_score} className="w-full" />
              <div className="text-2xl font-bold">{marketAnalytics.market_stress_score}/100</div>
              
              {marketAnalytics.risk_assessment?.risks?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Current Risks:</h4>
                  {marketAnalytics.risk_assessment.risks.map((risk: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="capitalize">{risk.type.replace('_', ' ')}</span>
                      <Badge variant={risk.level === 'high' ? 'destructive' : 'secondary'}>
                        {risk.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading stress analysis...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Price Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketAnalytics?.price_prediction ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ${marketAnalytics.price_prediction.next_hour_prediction.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Next Hour Prediction</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Confidence</span>
                <span className="font-semibold">{marketAnalytics.price_prediction.confidence}%</span>
              </div>
              <Progress value={marketAnalytics.price_prediction.confidence} className="w-full" />
              
              <div className="flex items-center space-x-2">
                {marketAnalytics.price_prediction.trend_direction === 'increasing' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm capitalize">
                  {marketAnalytics.price_prediction.trend_direction} trend
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-muted-foreground">Low</div>
                  <div className="font-semibold">${marketAnalytics.price_prediction.predicted_range.low.toFixed(2)}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-muted-foreground">High</div>
                  <div className="font-semibold">${marketAnalytics.price_prediction.predicted_range.high.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading price prediction...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical Price Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            24-Hour Price History & Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {priceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `$${value.toFixed(2)}`, 
                    name === 'price' ? 'Actual Price' : 'Forecast Price'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="price"
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading price chart...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capacity Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-600" />
            Capacity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketAnalytics?.capacity_gap_analysis ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Gap</span>
                <span className="text-lg font-bold">
                  {(marketAnalytics.capacity_gap_analysis.current_gap_mw / 1000).toFixed(1)} GW
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Utilization Rate</span>
                <span className="font-semibold">
                  {marketAnalytics.capacity_gap_analysis.utilization_rate.toFixed(1)}%
                </span>
              </div>
              <Progress value={marketAnalytics.capacity_gap_analysis.utilization_rate} className="w-full" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={
                  marketAnalytics.capacity_gap_analysis.status === 'surplus' ? 'default' :
                  marketAnalytics.capacity_gap_analysis.status === 'adequate' ? 'secondary' : 'destructive'
                }>
                  {marketAnalytics.capacity_gap_analysis.status}
                </Badge>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Recommendation</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {marketAnalytics.capacity_gap_analysis.recommendation.replace('_', ' ')}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading capacity analysis...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Timing Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Market Timing Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketAnalytics?.market_timing_signals?.length > 0 ? (
            <div className="space-y-3">
              {marketAnalytics.market_timing_signals.map((signal: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">
                      {signal.type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {signal.timeframe.replace('_', ' ')}
                    </div>
                  </div>
                  <Badge variant={
                    signal.strength === 'strong' ? 'default' :
                    signal.strength === 'medium' ? 'secondary' : 'outline'
                  }>
                    {signal.strength}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No timing signals detected</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
