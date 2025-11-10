import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PredictionExplanationProps {
  explanation: {
    text: string;
    feature_contributions: Array<{
      feature: string;
      value: number;
      contribution: number;
      impact: number;
      direction: string;
    }>;
    key_drivers: {
      top_factors: Array<{
        feature: string;
        impact: number;
        direction: string;
      }>;
      price_increasing_factors: string[];
      price_decreasing_factors: string[];
    };
    sensitivity_analysis: Array<{
      scenario: string;
      price_impact: number;
      new_price: number;
      change_percent: string;
    }>;
    confidence_breakdown: {
      confidence_level: string;
      confidence_score: number;
      prediction_range: {
        lower: number;
        upper: number;
        width: number;
        width_percent: number;
      };
      interpretation: string;
    };
  };
  prediction: {
    price: number;
    timestamp: string;
  };
}

export function PredictionExplanation({ explanation, prediction }: PredictionExplanationProps) {
  const getImpactColor = (impact: number, maxImpact: number) => {
    const percent = (impact / maxImpact) * 100;
    if (percent > 70) return 'bg-orange-500';
    if (percent > 40) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getConfidenceColor = (level: string) => {
    if (level === 'High') return 'text-green-500';
    if (level === 'Moderate') return 'text-yellow-500';
    return 'text-orange-500';
  };

  const maxImpact = Math.max(...explanation.feature_contributions.map(f => f.impact));

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle>Prediction Insights</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            Phase 8: Explainable AI
          </Badge>
        </div>
        <CardDescription>
          Understanding what drives this ${prediction.price.toFixed(2)}/MWh prediction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Explanation */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
            {explanation.text}
          </div>
        </div>

        {/* Feature Contributions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Info className="h-4 w-4 text-primary" />
            Feature Impact Analysis
          </div>
          <div className="space-y-3">
            {explanation.feature_contributions.slice(0, 6).map((feature, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {feature.direction === 'increases' ? (
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-medium">{feature.feature}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs text-muted-foreground">
                            ({feature.value.toFixed(1)})
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current value: {feature.value.toFixed(2)}</p>
                          <p>Correlation: {feature.correlation.toFixed(3)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className={`text-xs font-mono ${
                    feature.contribution > 0 ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {feature.contribution > 0 ? '+' : ''}${feature.contribution.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(feature.impact / maxImpact) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {((feature.impact / maxImpact) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Drivers Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 text-xs font-medium text-orange-500">
              <TrendingUp className="h-3 w-3" />
              Price Increasing
            </div>
            <div className="space-y-1">
              {explanation.key_drivers.price_increasing_factors.map((factor, idx) => (
                <div key={idx} className="text-xs text-muted-foreground">• {factor}</div>
              ))}
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-xs font-medium text-green-500">
              <TrendingDown className="h-3 w-3" />
              Price Decreasing
            </div>
            <div className="space-y-1">
              {explanation.key_drivers.price_decreasing_factors.map((factor, idx) => (
                <div key={idx} className="text-xs text-muted-foreground">• {factor}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Sensitivity Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertCircle className="h-4 w-4 text-primary" />
            "What If" Scenarios
          </div>
          <div className="space-y-2">
            {explanation.sensitivity_analysis.map((scenario, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/30 text-xs">
                <div className="flex-1">
                  <div className="font-medium">{scenario.scenario}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono ${
                    scenario.price_impact > 0 ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {scenario.price_impact > 0 ? '+' : ''}${scenario.price_impact.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono font-medium">
                    ${scenario.new_price.toFixed(2)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {scenario.change_percent}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Breakdown */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Prediction Confidence</div>
            <Badge 
              variant="outline" 
              className={`${getConfidenceColor(explanation.confidence_breakdown.confidence_level)}`}
            >
              {explanation.confidence_breakdown.confidence_level}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Range:</span>
              <span className="font-mono">
                ${explanation.confidence_breakdown.prediction_range.lower.toFixed(2)} - 
                ${explanation.confidence_breakdown.prediction_range.upper.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Uncertainty:</span>
              <span className="font-mono">
                ±${(explanation.confidence_breakdown.prediction_range.width / 2).toFixed(2)} 
                ({explanation.confidence_breakdown.prediction_range.width_percent.toFixed(1)}%)
              </span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground italic">
            {explanation.confidence_breakdown.interpretation}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
