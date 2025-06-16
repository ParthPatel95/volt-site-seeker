
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, AlertTriangle, Globe, Shield } from 'lucide-react';

export function SupplyChainPanel() {
  const supplyChainData = {
    riskLevel: 'medium',
    criticalSuppliers: ['Semiconductor Corp', 'Steel Industries', 'Logistics Partners'],
    geographicExposure: [
      { region: 'Asia-Pacific', exposure: 45, risk: 'high' },
      { region: 'North America', exposure: 35, risk: 'low' },
      { region: 'Europe', exposure: 20, risk: 'medium' }
    ],
    disruptionRisks: [
      'Semiconductor shortage',
      'Shipping delays',
      'Raw material price volatility',
      'Regulatory changes'
    ]
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Risk Level</span>
                  <Shield className="w-4 h-4 text-orange-600" />
                </div>
                <Badge className={getRiskColor(supplyChainData.riskLevel)} size="lg">
                  {supplyChainData.riskLevel.charAt(0).toUpperCase() + supplyChainData.riskLevel.slice(1)}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Critical Suppliers</span>
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold">{supplyChainData.criticalSuppliers.length}</div>
                <div className="text-xs text-gray-500">Key dependencies identified</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-purple-200">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Geographic Exposure</h4>
              <div className="space-y-3">
                {supplyChainData.geographicExposure.map((region, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{region.region}</span>
                        <Badge className={getRiskColor(region.risk)} size="sm">
                          {region.risk}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${region.exposure}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{region.exposure}% exposure</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                <h4 className="font-semibold">Disruption Risks</h4>
              </div>
              <div className="space-y-2">
                {supplyChainData.disruptionRisks.map((risk, index) => (
                  <div key={index} className="flex items-center p-2 rounded bg-red-50">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    <span className="text-sm">{risk}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
