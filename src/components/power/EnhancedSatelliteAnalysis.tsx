
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SatelliteAnalysisPanel } from './SatelliteAnalysisPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Satellite, 
  Map, 
  BarChart3, 
  Settings,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export function EnhancedSatelliteAnalysis() {
  const [activeTab, setActiveTab] = useState('discover');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Satellite Analysis Platform</h1>
          <p className="text-muted-foreground">
            AI-powered infrastructure discovery using high-resolution satellite imagery
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Real-time Analysis
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover" className="flex items-center space-x-2">
            <Satellite className="w-4 h-4" />
            <span>Discovery</span>
          </TabsTrigger>
          <TabsTrigger value="mapping" className="flex items-center space-x-2">
            <Map className="w-4 h-4" />
            <span>Mapping</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <SatelliteAnalysisPanel />
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Map className="w-5 h-5" />
                <span>Infrastructure Mapping</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-slate-100 to-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700">Interactive Satellite Map</h3>
                  <p className="text-slate-600">Real-time satellite imagery with infrastructure overlays</p>
                  <p className="text-sm text-slate-500 mt-2">Integration with mapping services coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Discoveries</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                    <p className="text-2xl font-bold">87.3%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">+3.2% accuracy improvement</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Verified Sites</p>
                    <p className="text-2xl font-bold">892</p>
                  </div>
                  <Satellite className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">71.5% verification rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold">355</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Requires manual validation</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Discovery Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-muted-foreground">Analytics dashboard with discovery trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Detection Sensitivity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Minimum Confidence</span>
                      <Badge variant="outline">75%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Infrastructure Size Filter</span>
                      <Badge variant="outline">50 MVA+</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Analysis Regions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Regions</span>
                      <Badge variant="outline">4 of 12</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scan Frequency</span>
                      <Badge variant="outline">Weekly</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
