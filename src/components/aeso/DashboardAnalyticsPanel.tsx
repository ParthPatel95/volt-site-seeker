import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Eye, 
  MousePointer, 
  Clock, 
  TrendingUp,
  Download,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WidgetStats {
  id: string;
  name: string;
  views: number;
  interactions: number;
  avgTimeSpent: number;
  loadTime: number;
}

const mockWidgetStats: WidgetStats[] = [
  { id: '1', name: 'Price Chart', views: 1243, interactions: 856, avgTimeSpent: 45, loadTime: 280 },
  { id: '2', name: 'Load Forecast', views: 987, interactions: 654, avgTimeSpent: 38, loadTime: 195 },
  { id: '3', name: 'Generation Mix', views: 756, interactions: 423, avgTimeSpent: 32, loadTime: 310 },
  { id: '4', name: 'Market Alerts', views: 542, interactions: 389, avgTimeSpent: 28, loadTime: 145 },
];

export function DashboardAnalyticsPanel() {
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Analytics report is being generated",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-primary" />
              Dashboard Overview
            </CardTitle>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-chart-1" />
                <span className="text-xs text-muted-foreground">Total Views</span>
              </div>
              <p className="text-2xl font-bold">3,528</p>
              <p className="text-xs text-green-600">+12.5% vs last week</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="w-4 h-4 text-chart-2" />
                <span className="text-xs text-muted-foreground">Interactions</span>
              </div>
              <p className="text-2xl font-bold">2,322</p>
              <p className="text-xs text-green-600">+8.3% vs last week</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-chart-3" />
                <span className="text-xs text-muted-foreground">Avg Session</span>
              </div>
              <p className="text-2xl font-bold">4:32</p>
              <p className="text-xs text-green-600">+5.1% vs last week</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-chart-4" />
                <span className="text-xs text-muted-foreground">Engagement</span>
              </div>
              <p className="text-2xl font-bold">65.8%</p>
              <p className="text-xs text-green-600">+3.2% vs last week</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-chart-1" />
            Widget Performance
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Most viewed and interacted widgets
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockWidgetStats.map((widget, index) => (
              <div key={widget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      #{index + 1}
                    </Badge>
                    <div>
                      <h4 className="font-semibold text-sm">{widget.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {widget.views.toLocaleString()} views • {widget.interactions.toLocaleString()} interactions
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{widget.avgTimeSpent}s avg</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">View Rate:</span>
                    <Progress value={(widget.views / 1500) * 100} className="h-1 mt-1" />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Engagement:</span>
                    <Progress value={(widget.interactions / widget.views) * 100} className="h-1 mt-1" />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Load Time:</span>
                    <Badge variant={widget.loadTime < 200 ? "default" : "secondary"} className="text-xs">
                      {widget.loadTime}ms
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="w-5 h-5 text-chart-2" />
            Interaction Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="aspect-video bg-gradient-to-br from-primary/20 via-chart-2/20 to-chart-3/20 rounded-lg flex items-center justify-center border-2 border-dashed">
              <div className="text-center space-y-2">
                <MousePointer className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click heatmap visualization
                </p>
                <p className="text-xs text-muted-foreground">
                  Shows where users click most frequently
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-lg font-bold">32%</p>
                <p className="text-xs text-muted-foreground">Top Section</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-lg font-bold">45%</p>
                <p className="text-xs text-muted-foreground">Middle Section</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-lg font-bold">23%</p>
                <p className="text-xs text-muted-foreground">Bottom Section</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-chart-3" />
            Usage Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Peak Usage Hour:</span>
                <span className="font-medium">2:00 PM - 3:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Most Active Day:</span>
                <span className="font-medium">Tuesday</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Session Duration:</span>
                <span className="font-medium">4 min 32 sec</span>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-3">Hourly Distribution</h4>
              <div className="grid grid-cols-12 gap-1">
                {Array.from({ length: 24 }, (_, i) => {
                  const height = Math.random() * 100;
                  return (
                    <div
                      key={i}
                      className="bg-primary/20 rounded-sm hover:bg-primary/40 transition-colors"
                      style={{ height: `${height}%`, minHeight: '20%' }}
                      title={`${i}:00 - ${height.toFixed(0)}% usage`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>12 AM</span>
                <span>12 PM</span>
                <span>11 PM</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Weekly Summary Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Monthly Performance Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart className="w-4 h-4 mr-2" />
              Custom Date Range Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export All Analytics Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
