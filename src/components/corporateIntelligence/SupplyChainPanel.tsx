
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Truck, AlertTriangle, MapPin } from 'lucide-react';

export function SupplyChainPanel() {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeSupplyChain = async () => {
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
            <Truck className="w-5 h-5 mr-2" />
            Supply Chain Analysis
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
            <Button onClick={analyzeSupplyChain} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Supply Chain'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Critical Dependencies</h4>
                <Badge variant="destructive" className="text-xs">
                  High Risk
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>Semiconductor components (Asia-Pacific: 78%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>Raw materials (Single supplier: 45%)</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Risk Assessment</h4>
                <Badge variant="outline" className="text-xs">
                  Medium
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Geographic concentration risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Single points of failure identified</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
