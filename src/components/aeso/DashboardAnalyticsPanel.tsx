import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Eye, 
  MousePointer, 
  Clock, 
  TrendingUp,
  Download,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Start using the dashboard to generate analytics insights. Views, interactions, 
              and session data will appear here as you and your team use the platform.
            </p>
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
            Most viewed and interacted widgets will appear here
          </p>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed border-muted rounded-lg">
            <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Widget performance metrics will be tracked as you interact with dashboard widgets.
            </p>
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
          <div className="aspect-video bg-gradient-to-br from-primary/5 via-chart-2/5 to-chart-3/5 rounded-lg flex items-center justify-center border-2 border-dashed">
            <div className="text-center space-y-2">
              <MousePointer className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click heatmap visualization
              </p>
              <p className="text-xs text-muted-foreground">
                Interaction data will be displayed once available
              </p>
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
          <div className="p-8 text-center border-2 border-dashed border-muted rounded-lg">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Usage patterns will be analyzed as more data becomes available.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Peak hours, active days, and session durations will be tracked automatically.
            </p>
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
