
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Download, 
  Upload,
  RefreshCw,
  FileText,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const mockDataSources = [
  {
    id: 1,
    name: "LoopNet Scraper",
    status: "Active",
    lastSync: "2 hours ago",
    records: "1,247",
    success: 98.5
  },
  {
    id: 2,
    name: "ERCOT Grid Data",
    status: "Active", 
    lastSync: "15 minutes ago",
    records: "892",
    success: 99.2
  },
  {
    id: 3,
    name: "Broker Contact DB",
    status: "Syncing",
    lastSync: "In progress",
    records: "3,451",
    success: 97.8
  },
  {
    id: 4,
    name: "PDF Parser Queue",
    status: "Warning",
    lastSync: "4 hours ago", 
    records: "156",
    success: 85.2
  }
];

const mockReports = [
  {
    id: 1,
    name: "Weekly Property Discovery Report",
    generated: "Today, 9:00 AM",
    size: "2.3 MB",
    type: "PDF"
  },
  {
    id: 2,
    name: "VoltScore Analytics Summary",
    generated: "Yesterday, 6:00 PM", 
    size: "1.8 MB",
    type: "Excel"
  },
  {
    id: 3,
    name: "Broker Outreach Performance",
    generated: "2 days ago",
    size: "945 KB", 
    type: "PDF"
  }
];

export function DataManagement() {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Data Management</h1>
              <p className="text-muted-foreground">Monitor data sources, exports, and system health</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>

      <div className="p-6 h-full overflow-y-auto">
        <Tabs defaultValue="sources" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Total Records</p>
                      <p className="text-2xl font-bold">5,746</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Success Rate</p>
                      <p className="text-2xl font-bold">96.8%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">Active Sources</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Last Sync</p>
                      <p className="text-2xl font-bold">15m</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Sources Status</h3>
              {mockDataSources.map((source) => (
                <Card key={source.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{source.name}</h4>
                          <Badge variant={
                            source.status === 'Active' ? 'default' : 
                            source.status === 'Syncing' ? 'secondary' : 'destructive'
                          }>
                            {source.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>Last Sync: {source.lastSync}</div>
                          <div>Records: {source.records}</div>
                          <div>Success: {source.success}%</div>
                        </div>
                        <Progress value={source.success} className="w-full" />
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exports" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Data Exports</h3>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                New Export
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="p-6 text-center">
                  <Download className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <h4 className="font-medium">Property Database</h4>
                  <p className="text-sm text-muted-foreground mt-1">Export all property data</p>
                  <Button variant="outline" className="mt-3" size="sm">Export CSV</Button>
                </CardContent>
              </Card>
              
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <h4 className="font-medium">VoltScore Analytics</h4>
                  <p className="text-sm text-muted-foreground mt-1">Score analysis and trends</p>
                  <Button variant="outline" className="mt-3" size="sm">Export Excel</Button>
                </CardContent>
              </Card>
              
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="p-6 text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <h4 className="font-medium">Broker Contacts</h4>
                  <p className="text-sm text-muted-foreground mt-1">Contact database export</p>
                  <Button variant="outline" className="mt-3" size="sm">Export JSON</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Generated Reports</h3>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
            
            <div className="space-y-4">
              {mockReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{report.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Generated: {report.generated}</span>
                          <span>Size: {report.size}</span>
                          <Badge variant="outline">{report.type}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">Data Management Settings</h3>
              <p className="text-muted-foreground mt-2">Configure data sources, retention policies, and sync schedules</p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-muted-foreground">• Automated backup configuration</p>
                <p className="text-sm text-muted-foreground">• Data retention policies</p>
                <p className="text-sm text-muted-foreground">• Sync frequency settings</p>
                <p className="text-sm text-muted-foreground">• Export format preferences</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
