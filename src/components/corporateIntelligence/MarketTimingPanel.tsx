
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Target } from 'lucide-react';

export function MarketTimingPanel() {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const generateAnalysis = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 2000);
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
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={generateAnalysis} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Timing'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Market Cycle</span>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-700">Mid-Cycle</div>
                <div className="text-xs text-gray-500">Optimal acquisition window</div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Fire Sale Risk</span>
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-orange-700">23%</div>
                  <Badge variant="secondary" className="text-xs">
                    Medium Risk
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">6-month probability</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Timing Recommendation</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-green-600">
                  BUY
                </Badge>
                <span className="font-medium">Recommended Action</span>
              </div>
              <p className="text-sm text-gray-700">
                Market conditions favor acquisition within the next 3-6 months. 
                Current cycle positioning and institutional activity levels suggest 
                favorable pricing opportunities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
