
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Zap, 
  BarChart3,
  Target,
  Shield,
  CheckCircle
} from 'lucide-react';

interface AIAnalysisDisplayProps {
  analysis: any;
}

export function AIAnalysisDisplay({ analysis }: AIAnalysisDisplayProps) {
  if (!analysis) {
    return null;
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'buy':
      case 'strong buy':
        return 'bg-green-600';
      case 'hold':
        return 'bg-yellow-600';
      case 'sell':
      case 'strong sell':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getRiskColor = (distressProbability: number) => {
    if (distressProbability < 0.2) return 'text-green-600';
    if (distressProbability < 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Lightbulb className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" />
            <span className="break-words">AI Company Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Investment Recommendation */}
          {analysis.investment_recommendation && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <Target className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">Investment Recommendation</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">AI-driven investment analysis</p>
                </div>
              </div>
              <Badge className={`text-white text-xs sm:text-sm flex-shrink-0 ${getRecommendationColor(analysis.investment_recommendation)}`}>
                {analysis.investment_recommendation.toUpperCase()}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Financial Outlook */}
            {analysis.financial_outlook && (
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                    <h4 className="font-semibold text-sm sm:text-base">Financial Outlook</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">{analysis.financial_outlook}</p>
                </CardContent>
              </Card>
            )}

            {/* Risk Assessment */}
            {analysis.risk_assessment && (
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Shield className="w-4 h-4 mr-2 text-orange-600 flex-shrink-0" />
                    <h4 className="font-semibold text-sm sm:text-base">Risk Assessment</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">{analysis.risk_assessment}</p>
                </CardContent>
              </Card>
            )}

            {/* Power Analysis */}
            {analysis.power_consumption_analysis && (
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Zap className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0" />
                    <h4 className="font-semibold text-sm sm:text-base">Power Infrastructure</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">{analysis.power_consumption_analysis}</p>
                </CardContent>
              </Card>
            )}

            {/* Acquisition Readiness */}
            {typeof analysis.acquisition_readiness === 'number' && (
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                    <h4 className="font-semibold text-sm sm:text-base">Acquisition Readiness</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(analysis.acquisition_readiness * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {Math.round(analysis.acquisition_readiness * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Distress Probability */}
          {typeof analysis.distress_probability === 'number' && (
            <div className="p-4 border rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <div className="flex items-center min-w-0 flex-1">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-600 flex-shrink-0" />
                  <h4 className="font-semibold text-sm sm:text-base">Distress Risk</h4>
                </div>
                <span className={`font-bold text-sm sm:text-base flex-shrink-0 ${getRiskColor(analysis.distress_probability)}`}>
                  {Math.round(analysis.distress_probability * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    analysis.distress_probability < 0.2 ? 'bg-green-600' :
                    analysis.distress_probability < 0.5 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(analysis.distress_probability * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Key Insights */}
          {analysis.key_insights && Array.isArray(analysis.key_insights) && analysis.key_insights.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                Key Insights
              </h4>
              <div className="space-y-2">
                {analysis.key_insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm break-words flex-1">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
