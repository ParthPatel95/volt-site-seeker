import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Target, Shield, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface AIAdvisory {
  summary: string;
  outlook: 'bullish' | 'bearish' | 'neutral' | 'volatile';
  confidence: number;
  key_insights: string[];
  trading_recommendations: Array<{
    action: 'buy' | 'sell' | 'hold' | 'hedge';
    timing: string;
    rationale: string;
    risk_level: 'low' | 'medium' | 'high';
  }>;
  price_targets?: {
    optimal_buy_below: number;
    optimal_sell_above: number;
    stop_loss?: number;
    take_profit?: number;
  };
  risk_assessment: {
    volatility_level: 'low' | 'moderate' | 'high' | 'extreme';
    spike_probability: number;
    major_risks: string[];
    mitigation_strategies?: string[];
  };
  opportunities?: Array<{
    type: string;
    window: string;
    potential_savings?: string;
    description: string;
  }>;
}

interface AITradingAdvisorProps {
  onGetAdvice: (market: string, type: string, context: any) => Promise<AIAdvisory | undefined>;
  loading: boolean;
}

export function AITradingAdvisor({ onGetAdvice, loading }: AITradingAdvisorProps) {
  const [advisory, setAdvisory] = useState<AIAdvisory | null>(null);

  const handleGetAdvice = async () => {
    const result = await onGetAdvice('aeso', 'trading_strategy', {
      tradingGoal: 'Maximize profit while managing risk',
      riskTolerance: 'moderate'
    });
    if (result) {
      setAdvisory(result);
    }
  };

  const getOutlookColor = (outlook: string) => {
    switch (outlook) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      case 'volatile': return 'text-orange-500';
      default: return 'text-blue-500';
    }
  };

  const getOutlookIcon = (outlook: string) => {
    switch (outlook) {
      case 'bullish': return <TrendingUp className="h-5 w-5" />;
      case 'bearish': return <TrendingDown className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sell': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'hedge': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Trading Advisor</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1 bg-primary/10">
            Phase 10: AI-Powered
          </Badge>
        </div>
        <CardDescription>
          Get intelligent trading recommendations powered by Lovable AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!advisory ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Generate AI-powered trading strategies based on current price predictions and market analysis
              </p>
              <Button onClick={handleGetAdvice} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                    Generating Advice...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Trading Advice
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Market Outlook */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={getOutlookColor(advisory.outlook)}>
                    {getOutlookIcon(advisory.outlook)}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{advisory.outlook} Outlook</div>
                    <div className="text-xs text-muted-foreground">
                      Confidence: {(advisory.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleGetAdvice} disabled={loading}>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
              <Progress value={advisory.confidence * 100} className="h-2 mb-3" />
              <p className="text-sm text-foreground">{advisory.summary}</p>
            </div>

            {/* Key Insights */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-primary" />
                Key Insights
              </div>
              <div className="space-y-2">
                {advisory.key_insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-primary/5">
                    <span className="text-primary font-medium">{idx + 1}.</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trading Recommendations */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-primary" />
                Trading Recommendations
              </div>
              <div className="space-y-3">
                {advisory.trading_recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border/50 bg-card/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getActionColor(rec.action)} variant="outline">
                        {rec.action.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Risk:</span>
                        <span className={`text-xs font-medium ${getRiskColor(rec.risk_level)}`}>
                          {rec.risk_level}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Timing:</span>
                        <span className="font-medium">{rec.timing}</span>
                      </div>
                      <p className="text-muted-foreground">{rec.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Targets */}
            {advisory.price_targets && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-sm font-medium mb-3">Price Targets</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Buy Below</div>
                    <div className="text-lg font-bold text-green-500">
                      ${advisory.price_targets.optimal_buy_below.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Sell Above</div>
                    <div className="text-lg font-bold text-red-500">
                      ${advisory.price_targets.optimal_sell_above.toFixed(2)}
                    </div>
                  </div>
                  {advisory.price_targets.stop_loss && (
                    <div>
                      <div className="text-xs text-muted-foreground">Stop Loss</div>
                      <div className="text-sm font-medium">${advisory.price_targets.stop_loss.toFixed(2)}</div>
                    </div>
                  )}
                  {advisory.price_targets.take_profit && (
                    <div>
                      <div className="text-xs text-muted-foreground">Take Profit</div>
                      <div className="text-sm font-medium">${advisory.price_targets.take_profit.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4 text-primary" />
                Risk Assessment
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-card/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volatility:</span>
                  <Badge variant="outline" className="capitalize">
                    {advisory.risk_assessment.volatility_level}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spike Probability:</span>
                  <span className="font-medium">
                    {(advisory.risk_assessment.spike_probability * 100).toFixed(0)}%
                  </span>
                </div>
                {advisory.risk_assessment.major_risks.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Major Risks:</div>
                    {advisory.risk_assessment.major_risks.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Opportunities */}
            {advisory.opportunities && advisory.opportunities.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Opportunities
                </div>
                <div className="space-y-2">
                  {advisory.opportunities.map((opp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{opp.type}</div>
                        {opp.potential_savings && (
                          <Badge variant="outline" className="text-green-500 border-green-500/20">
                            {opp.potential_savings}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">Window: {opp.window}</div>
                      <p className="text-sm">{opp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
