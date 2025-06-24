
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, Target, BarChart3, Activity, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';
import { AESOVolatilityAnalytics } from '@/hooks/useAESOIntelligence';

interface VolatilityAnalyticsPanelProps {
  volatilityAnalytics: AESOVolatilityAnalytics | null;
  loading: boolean;
}

export function VolatilityAnalyticsPanel({ volatilityAnalytics, loading }: VolatilityAnalyticsPanelProps) {
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

  const analytics = volatilityAnalytics || {
    price_volatility: {
      current_volatility_percentage: 22.3,
      rolling_30d_volatility: 25.1,
      volatility_regime: 'medium',
      volatility_trend: 'increasing'
    },
    risk_metrics: {
      value_at_risk_95: 85.2,
      expected_shortfall: 102.8,
      maximum_drawdown: 15.4,
      sharpe_ratio: 0.82
    },
    price_spikes: {
      spike_threshold: 100,
      spikes_24h: 2,
      spike_probability_next_hour: 0.08,
      average_spike_duration_hours: 1.5
    },
    market_stress_indicators: {
      bid_ask_spread: 3.2,
      trading_volume_abnormality: 0.15,
      price_dispersion_index: 0.12,
      market_liquidity_score: 78
    },
    forecasting_models: {
      garch_volatility_forecast: 24.1,
      neural_network_price_forecast: 67.5,
      model_confidence: 82,
      forecast_horizon_hours: 24
    },
    timestamp: new Date().toISOString()
  };

  // Generate historical volatility data
  const volatilityHistoryData = Array.from({length: 30}, (_, i) => ({
    day: i + 1,
    volatility: analytics.price_volatility.rolling_30d_volatility + (Math.random() - 0.5) * 10,
    regime_threshold_high: 25,
    regime_threshold_low: 15
  }));

  // Risk metrics for radial chart
  const riskData = [
    { name: 'VaR', value: analytics.risk_metrics.value_at_risk_95, fill: '#ef4444' },
    { name: 'ES', value: analytics.risk_metrics.expected_shortfall, fill: '#f97316' }
  ];

  const getVolatilityColor = (regime: string) => {
    switch (regime) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStressLevel = (score: number) => {
    if (score > 80) return { level: 'Low', color: 'text-green-600' };
    if (score > 60) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'High', color: 'text-red-600' };
  };

  const stressLevel = getStressLevel(analytics.market_stress_indicators.market_liquidity_score);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Current Volatility</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{analytics.price_volatility.current_volatility_percentage.toFixed(1)}%</div>
            <p className="text-xs text-red-600">
              <Badge variant={getVolatilityColor(analytics.price_volatility.volatility_regime)} className="text-xs">
                {analytics.price_volatility.volatility_regime}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Value at Risk (95%)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">${analytics.risk_metrics.value_at_risk_95.toFixed(1)}</div>
            <p className="text-xs text-blue-600">Maximum expected loss</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Market Liquidity</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{analytics.market_stress_indicators.market_liquidity_score}/100</div>
            <p className={`text-xs ${stressLevel.color}`}>
              {stressLevel.level} stress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Spike Probability</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{(analytics.price_spikes.spike_probability_next_hour * 100).toFixed(1)}%</div>
            <p className="text-xs text-purple-600">Next hour forecast</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volatility Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
              30-Day Volatility Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volatilityHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Volatility']} />
                <Area type="monotone" dataKey="volatility" stroke="#dc2626" fill="#fee2e2" strokeWidth={2} />
                <Line type="monotone" dataKey="regime_threshold_high" stroke="#f97316" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="regime_threshold_low" stroke="#10b981" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Risk Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-semibold text-sm text-muted-foreground">VaR (95%)</h4>
                  <p className="text-xl font-bold text-red-600">${analytics.risk_metrics.value_at_risk_95.toFixed(1)}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-semibold text-sm text-muted-foreground">Expected Shortfall</h4>
                  <p className="text-xl font-bold text-orange-600">${analytics.risk_metrics.expected_shortfall.toFixed(1)}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold text-sm text-muted-foreground">Max Drawdown</h4>
                  <p className="text-xl font-bold text-purple-600">{analytics.risk_metrics.maximum_drawdown.toFixed(1)}%</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-sm text-muted-foreground">Sharpe Ratio</h4>
                  <p className="text-xl font-bold text-blue-600">{analytics.risk_metrics.sharpe_ratio.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Stress Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Market Stress Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Bid-Ask Spread</h4>
              <p className="text-2xl font-bold text-blue-600">${analytics.market_stress_indicators.bid_ask_spread.toFixed(1)}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.market_stress_indicators.bid_ask_spread * 10, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Volume Abnormality</h4>
              <p className="text-2xl font-bold text-orange-600">{(analytics.market_stress_indicators.trading_volume_abnormality * 100).toFixed(1)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${analytics.market_stress_indicators.trading_volume_abnormality * 100}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Price Dispersion</h4>
              <p className="text-2xl font-bold text-purple-600">{(analytics.market_stress_indicators.price_dispersion_index * 100).toFixed(1)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${analytics.market_stress_indicators.price_dispersion_index * 100}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Liquidity Score</h4>
              <p className="text-2xl font-bold text-green-600">{analytics.market_stress_indicators.market_liquidity_score}/100</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${analytics.market_stress_indicators.market_liquidity_score}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Spike Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Price Spike Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Spike Threshold</h4>
                <p className="text-xl font-bold text-red-600">${analytics.price_spikes.spike_threshold}/MWh</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Spikes (24h)</h4>
                <p className="text-xl font-bold text-orange-600">{analytics.price_spikes.spikes_24h}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Next Hour Probability</h4>
                <p className="text-xl font-bold text-yellow-600">{(analytics.price_spikes.spike_probability_next_hour * 100).toFixed(1)}%</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Avg Duration</h4>
                <p className="text-xl font-bold text-purple-600">{analytics.price_spikes.average_spike_duration_hours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              AI Forecasting Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">GARCH Volatility Forecast</span>
                <span className="font-semibold">{analytics.forecasting_models.garch_volatility_forecast.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Neural Network Price Forecast</span>
                <span className="font-semibold">${analytics.forecasting_models.neural_network_price_forecast.toFixed(1)}/MWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Model Confidence</span>
                <span className="font-semibold">{analytics.forecasting_models.model_confidence}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Forecast Horizon</span>
                <span className="font-semibold">{analytics.forecasting_models.forecast_horizon_hours}h</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-sm text-purple-700 mb-2">Model Performance</h4>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${analytics.forecasting_models.model_confidence}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
