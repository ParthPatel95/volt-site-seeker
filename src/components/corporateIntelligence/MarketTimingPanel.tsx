
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Target, Calendar } from 'lucide-react';

export function MarketTimingPanel() {
  const timingAnalysis = {
    currentPhase: 'expansion',
    recommendation: 'optimal_entry',
    confidenceLevel: 78,
    optimalWindow: '3-6 months',
    keyFactors: [
      'Market volatility decreasing',
      'Interest rates stabilizing',
      'Sector rotation favorable',
      'Regulatory environment stable'
    ]
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'expansion':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'peak':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'contraction':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'trough':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'optimal_entry':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good_entry':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'wait':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avoid':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Market Timing Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Current Market Phase</h4>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <Badge className={getPhaseColor(timingAnalysis.currentPhase)} size="lg">
                  {timingAnalysis.currentPhase.charAt(0).toUpperCase() + timingAnalysis.currentPhase.slice(1)}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Markets are currently in an expansion phase with positive momentum indicators.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Entry Recommendation</h4>
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <Badge className={getRecommendationColor(timingAnalysis.recommendation)} size="lg">
                  Optimal Entry
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Current conditions suggest this is an optimal time for market entry.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Timing Metrics</h4>
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Confidence Level</span>
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-lg">{timingAnalysis.confidenceLevel}%</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${timingAnalysis.confidenceLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Optimal Window</span>
                  <div className="font-bold text-lg">{timingAnalysis.optimalWindow}</div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">Key Timing Factors</h5>
                <div className="space-y-1">
                  {timingAnalysis.keyFactors.map((factor, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
