
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  DollarSign,
  Lightbulb,
  BarChart3,
  Award
} from 'lucide-react';

interface AESOInvestmentPanelProps {
  marketAnalytics: any;
  historicalPrices: any;
  loading: boolean;
}

export function AESOInvestmentPanel({ marketAnalytics, historicalPrices, loading }: AESOInvestmentPanelProps) {
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

  const calculateInvestmentScore = () => {
    if (!marketAnalytics || !historicalPrices) return 0;
    
    let score = 50; // Base score
    
    // Price factors (30 points)
    if (historicalPrices.statistics.average_price > 80) score += 15;
    if (historicalPrices.statistics.price_volatility < 50) score += 15;
    
    // Market stress factors (20 points)
    if (marketAnalytics.market_stress_score < 50) score += 20;
    
    // Opportunity factors (30 points)
    const highPriorityOpps = marketAnalytics.investment_opportunities?.filter(op => op.priority === 'high').length || 0;
    score += Math.min(30, highPriorityOpps * 10);
    
    // Risk factors (-20 points max)
    if (marketAnalytics.risk_assessment.overall_risk_level === 'high') score -= 20;
    else if (marketAnalytics.risk_assessment.overall_risk_level === 'medium') score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const investmentScore = calculateInvestmentScore();

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'bg-green-500', textColor: 'text-green-600' };
    if (score >= 60) return { level: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
    if (score >= 40) return { level: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    return { level: 'Poor', color: 'bg-red-500', textColor: 'text-red-600' };
  };

  const scoreInfo = getScoreLevel(investmentScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Investment Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Investment Attractiveness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${scoreInfo.textColor}`}>
                {investmentScore}/100
              </div>
              <p className="text-sm text-muted-foreground">Overall Investment Score</p>
            </div>
            
            <Progress value={investmentScore} className="w-full h-3" />
            
            <div className="flex items-center justify-center">
              <Badge variant={
                scoreInfo.level === 'Excellent' ? 'default' :
                scoreInfo.level === 'Good' ? 'secondary' :
                scoreInfo.level === 'Fair' ? 'outline' : 'destructive'
              }>
                <Award className="w-3 h-3 mr-1" />
                {scoreInfo.level} Investment Climate
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Score Breakdown:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Market Conditions</span>
                  <span className="font-mono">
                    {historicalPrices?.statistics?.average_price > 80 ? '+15' : '0'}/15
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Price Stability</span>
                  <span className="font-mono">
                    {historicalPrices?.statistics?.price_volatility < 50 ? '+15' : '0'}/15
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Market Stress</span>
                  <span className="font-mono">
                    {marketAnalytics?.market_stress_score < 50 ? '+20' : '0'}/20
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Opportunities</span>
                  <span className="font-mono">
                    +{Math.min(30, (marketAnalytics?.investment_opportunities?.filter(op => op.priority === 'high').length || 0) * 10)}/30
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            Investment Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketAnalytics?.investment_opportunities?.length > 0 ? (
            <div className="space-y-4">
              {marketAnalytics.investment_opportunities.map((opportunity: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold capitalize">
                        {opportunity.type.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">{opportunity.reason}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={
                        opportunity.priority === 'high' ? 'destructive' :
                        opportunity.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {opportunity.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {opportunity.potential_return} return
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <h4 className="font-semibold text-sm mb-1 text-blue-800">Investment Thesis</h4>
                    <p className="text-sm text-blue-700">
                      {opportunity.type === 'generation_expansion' && 
                        'High electricity prices indicate strong market demand and potential for profitable generation assets.'
                      }
                      {opportunity.type === 'renewable_development' && 
                        'Growing renewable energy sector presents long-term growth opportunities with government support.'
                      }
                      {opportunity.type === 'storage_development' && 
                        'Energy storage becomes increasingly valuable as renewable penetration grows.'
                      }
                      {opportunity.type === 'transmission_investment' && 
                        'Grid infrastructure investments provide stable, regulated returns.'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No immediate opportunities identified</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Timing Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Market Timing Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketAnalytics?.market_timing_signals?.length > 0 ? (
            <div className="space-y-4">
              {marketAnalytics.market_timing_signals.map((signal: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">
                      {signal.type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {signal.timeframe.replace('_', ' ')} outlook
                    </div>
                  </div>
                  <Badge variant={
                    signal.strength === 'strong' ? 'default' :
                    signal.strength === 'medium' ? 'secondary' : 'outline'
                  }>
                    {signal.strength} signal
                  </Badge>
                </div>
              ))}
              
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-green-800">Timing Recommendation</h4>
                <p className="text-sm text-green-700">
                  {marketAnalytics.market_timing_signals.some(s => s.type.includes('buy')) ?
                    'Current market conditions favor new investments with strong fundamentals supporting entry.' :
                    'Monitor market conditions closely for optimal entry timing opportunities.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No timing signals detected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
            Key Financial Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historicalPrices?.statistics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${historicalPrices.statistics.average_price.toFixed(2)}
                  </div>
                  <div className="text-sm text-purple-700">Average Price</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${historicalPrices.statistics.max_price.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-700">Peak Price</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Price Range</span>
                  <span className="font-semibold">
                    ${historicalPrices.statistics.min_price.toFixed(2)} - ${historicalPrices.statistics.max_price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Volatility Index</span>
                  <span className="font-semibold">
                    {historicalPrices.statistics.price_volatility.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Data Points</span>
                  <span className="font-semibold">
                    {historicalPrices.statistics.total_records}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Market Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  {historicalPrices.statistics.average_price > 80 ?
                    'Strong pricing environment supports generation investment returns.' :
                    'Moderate pricing suggests selective investment approach.'
                  }
                  {historicalPrices.statistics.price_volatility > 50 ?
                    ' High volatility presents both opportunities and risks.' :
                    ' Stable pricing reduces investment risk profile.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Loading financial metrics...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
