
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingDown, TrendingUp } from 'lucide-react';

export function CompetitorAnalysisPanel() {
  const competitors = [
    {
      name: 'TechCorp Industries',
      marketShare: 15.2,
      powerUsage: 38.5,
      trend: 'up',
      strengths: ['Strong R&D', 'Market presence'],
      weaknesses: ['High costs', 'Limited expansion']
    },
    {
      name: 'InnovateTech Solutions',
      marketShare: 12.8,
      powerUsage: 42.1,
      trend: 'down',
      strengths: ['Innovation', 'Agility'],
      weaknesses: ['Small scale', 'Limited resources']
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Competitor Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <Card key={index} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold">{competitor.name}</h4>
                    {competitor.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-500">Market Share</span>
                      <div className="font-bold">{competitor.marketShare}%</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Power Usage</span>
                      <div className="font-bold">{competitor.powerUsage} MW</div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-sm font-medium text-green-700">Strengths:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {competitor.strengths.map((strength, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-green-200">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-red-700">Weaknesses:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {competitor.weaknesses.map((weakness, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-red-200">
                          {weakness}
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
