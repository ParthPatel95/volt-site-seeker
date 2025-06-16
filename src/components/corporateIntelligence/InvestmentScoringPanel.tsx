
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Shield, Clock } from 'lucide-react';

export function InvestmentScoringPanel() {
  const scores = [
    {
      company: 'TechCorp Industries',
      overallScore: 85,
      riskScore: 72,
      opportunityScore: 91,
      timingScore: 78,
      recommendation: 'Strong Buy',
      keyFactors: ['Market leadership', 'Strong financials', 'Growth potential']
    },
    {
      company: 'DataCenter Solutions',
      overallScore: 78,
      riskScore: 68,
      opportunityScore: 84,
      timingScore: 82,
      recommendation: 'Buy',
      keyFactors: ['Infrastructure demand', 'Stable revenue', 'Geographic expansion']
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Buy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Buy':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Investment Scoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scores.map((score, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">{score.company}</h4>
                    <Badge className={getRecommendationColor(score.recommendation)}>
                      {score.recommendation}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="text-sm">Overall</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(score.overallScore)}`}>
                        {score.overallScore}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="text-sm">Risk</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(score.riskScore)}`}>
                        {score.riskScore}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm">Opportunity</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(score.opportunityScore)}`}>
                        {score.opportunityScore}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">Timing</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(score.timingScore)}`}>
                        {score.timingScore}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Key Factors:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {score.keyFactors.map((factor, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
