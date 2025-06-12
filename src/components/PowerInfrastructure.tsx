
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  MapPin, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const mockSubstations = [
  {
    id: 1,
    name: "Dallas North Substation",
    voltage: "138kV",
    capacity: "150 MVA",
    status: "Active",
    distance: "2.3 miles",
    utilization: 78
  },
  {
    id: 2,
    name: "Richardson Power Hub",
    voltage: "345kV", 
    capacity: "500 MVA",
    status: "Active",
    distance: "4.1 miles",
    utilization: 65
  },
  {
    id: 3,
    name: "Plano Distribution Center",
    voltage: "69kV",
    capacity: "75 MVA", 
    status: "Maintenance",
    distance: "6.8 miles",
    utilization: 45
  }
];

const mockTransmissionLines = [
  {
    id: 1,
    name: "ERCOT Line 345-A",
    voltage: "345kV",
    capacity: "1200 MW",
    length: "12.5 miles",
    status: "Operational"
  },
  {
    id: 2,
    name: "Oncor 138kV Circuit",
    voltage: "138kV", 
    capacity: "400 MW",
    length: "8.2 miles",
    status: "Operational"
  }
];

export function PowerInfrastructure() {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Power Infrastructure</h1>
            <p className="text-muted-foreground">Grid connectivity and transmission analysis</p>
          </div>
        </div>
      </div>

      <div className="p-6 h-full overflow-y-auto">
        <Tabs defaultValue="substations" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="substations">Substations</TabsTrigger>
            <TabsTrigger value="transmission">Transmission Lines</TabsTrigger>
            <TabsTrigger value="interconnection">Interconnection Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="substations" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Active Substations</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Avg Utilization</p>
                      <p className="text-2xl font-bold">68%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Total Capacity</p>
                      <p className="text-2xl font-bold">2.1 GVA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nearby Substations</h3>
              {mockSubstations.map((substation) => (
                <Card key={substation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{substation.name}</h4>
                          <Badge variant={substation.status === 'Active' ? 'default' : 'secondary'}>
                            {substation.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>Voltage: {substation.voltage}</div>
                          <div>Capacity: {substation.capacity}</div>
                          <div>Distance: {substation.distance}</div>
                          <div>Utilization: {substation.utilization}%</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transmission" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Transmission Lines</h3>
              {mockTransmissionLines.map((line) => (
                <Card key={line.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{line.name}</h4>
                          <Badge variant="default">{line.status}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>Voltage: {line.voltage}</div>
                          <div>Capacity: {line.capacity}</div>
                          <div>Length: {line.length}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Analyze</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interconnection" className="mt-6 space-y-6">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">Interconnection Queue Monitor</h3>
              <p className="text-muted-foreground mt-2">ERCOT, PJM, MISO queue integration coming in Phase 3</p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-muted-foreground">• Real-time queue position tracking</p>
                <p className="text-sm text-muted-foreground">• Delay prediction algorithms</p>
                <p className="text-sm text-muted-foreground">• Interconnection cost estimation</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
