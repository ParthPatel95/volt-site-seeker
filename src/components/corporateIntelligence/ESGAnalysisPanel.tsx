
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Users, Building, Award } from 'lucide-react';

export function ESGAnalysisPanel() {
  const esgData = {
    overallScore: 72,
    environmentalScore: 78,
    socialScore: 68,
    governanceScore: 75,
    carbonFootprint: 2.4,
    renewablePercent: 35,
    sustainabilityCommitments: [
      'Net-zero by 2030',
      'Renewable energy transition',
      'Sustainable supply chain',
      'Carbon offset programs'
    ],
    riskFactors: [
      'Regulatory compliance gaps',
      'Limited diversity metrics',
      'Supply chain transparency'
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Leaf className="w-5 h-5 mr-2" />
            ESG Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={`text-center ${getScoreBg(esgData.overallScore)}`}>
              <CardContent className="p-4">
                <Award className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Overall ESG</div>
                <div className={`text-2xl font-bold ${getScoreColor(esgData.overallScore)}`}>
                  {esgData.overallScore}
                </div>
              </CardContent>
            </Card>

            <Card className={`text-center ${getScoreBg(esgData.environmentalScore)}`}>
              <CardContent className="p-4">
                <Leaf className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Environmental</div>
                <div className={`text-2xl font-bold ${getScoreColor(esgData.environmentalScore)}`}>
                  {esgData.environmentalScore}
                </div>
              </CardContent>
            </Card>

            <Card className={`text-center ${getScoreBg(esgData.socialScore)}`}>
              <CardContent className="p-4">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Social</div>
                <div className={`text-2xl font-bold ${getScoreColor(esgData.socialScore)}`}>
                  {esgData.socialScore}
                </div>
              </CardContent>
            </Card>

            <Card className={`text-center ${getScoreBg(esgData.governanceScore)}`}>
              <CardContent className="p-4">
                <Building className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Governance</div>
                <div className={`text-2xl font-bold ${getScoreColor(esgData.governanceScore)}`}>
                  {esgData.governanceScore}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Environmental Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Carbon Footprint</span>
                    <span className="font-medium">{esgData.carbonFootprint} MT CO2e</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Renewable Energy</span>
                    <span className="font-medium">{esgData.renewablePercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${esgData.renewablePercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Sustainability Commitments</h4>
                <div className="space-y-1">
                  {esgData.sustainabilityCommitments.slice(0, 3).map((commitment, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      {commitment}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Areas for Improvement</h4>
              <div className="space-y-2">
                {esgData.riskFactors.map((risk, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-1">
                    {risk}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
