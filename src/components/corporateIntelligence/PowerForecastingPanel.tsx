
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, TrendingUp, Calendar } from 'lucide-react';

export function PowerForecastingPanel() {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const generateForecast = async () => {
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
            <Zap className="w-5 h-5 mr-2" />
            Power Consumption Forecasting
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
            <Button onClick={generateForecast} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Forecast'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current Usage</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700">45.2 MW</div>
                <div className="text-xs text-gray-500">Real-time estimate</div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">6-Month Forecast</span>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-700">52.8 MW</div>
                <div className="text-xs text-gray-500">+16.8% growth projected</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
