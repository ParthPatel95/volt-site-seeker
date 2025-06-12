
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Building, 
  TrendingUp, 
  MapPin, 
  AlertTriangle,
  DollarSign,
  Clock,
  Target
} from 'lucide-react';

const mockProperties = [
  {
    id: 1,
    title: "Industrial Complex - Dallas, TX",
    powerCapacity: "25 MW",
    voltScore: 85,
    price: "$4.2M",
    proximity: "0.3 mi to substation",
    status: "Active"
  },
  {
    id: 2,
    title: "Manufacturing Facility - Austin, TX", 
    powerCapacity: "18 MW",
    voltScore: 72,
    price: "$2.8M",
    proximity: "0.7 mi to substation",
    status: "Under Review"
  }
];

export function Dashboard() {
  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">VoltScout Dashboard</h1>
          <p className="text-muted-foreground">Heavy power site discovery and analysis</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
          <Target className="w-4 h-4 mr-2" />
          New Discovery Scan
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Properties Scanned</CardTitle>
            <Building className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-blue-200">+180 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">High VoltScore Sites</CardTitle>
            <Zap className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-green-200">Score 75+ sites</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Investment Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$127M</div>
            <p className="text-xs text-purple-200">Identified opportunities</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-orange-200">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Discoveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Recent High-Score Discoveries
            </CardTitle>
            <CardDescription>
              Properties with high potential for data center conversion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockProperties.map((property) => (
              <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="space-y-1">
                  <div className="font-medium">{property.title}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {property.proximity}
                  </div>
                  <div className="text-sm font-medium text-green-600">{property.powerCapacity}</div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant={property.voltScore > 80 ? "default" : "secondary"}>
                    VoltScore: {property.voltScore}
                  </Badge>
                  <div className="text-sm font-medium">{property.price}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest scraping and analysis updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">LoopNet scraping completed</p>
                  <p className="text-xs text-muted-foreground">47 new industrial properties identified</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">AI scoring update</p>
                  <p className="text-xs text-muted-foreground">VoltScores recalculated for Texas region</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Alert triggered</p>
                  <p className="text-xs text-muted-foreground">High-capacity site under $3M found</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
