import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3x3, 
  Network, 
  Map, 
  CandlestickChart, 
  GitBranch,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WidgetType {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  isPremium?: boolean;
}

const widgetTypes: WidgetType[] = [
  {
    id: 'heatmap',
    name: 'Hourly Price Heatmap',
    description: 'Visualize price patterns across hours and days',
    icon: Grid3x3,
    category: 'Price Analysis',
  },
  {
    id: 'correlation',
    name: 'Correlation Matrix',
    description: 'See relationships between price, load, and generation',
    icon: Network,
    category: 'Statistical',
  },
  {
    id: 'geographic',
    name: 'Regional Map',
    description: 'Geographic visualization of regional prices and flows',
    icon: Map,
    category: 'Geographic',
    isPremium: true,
  },
  {
    id: 'candlestick',
    name: 'Price Candlestick',
    description: 'OHLC charts for price movements',
    icon: CandlestickChart,
    category: 'Price Analysis',
  },
  {
    id: 'sankey',
    name: 'Energy Flow Diagram',
    description: 'Sankey diagrams showing generation to demand flows',
    icon: GitBranch,
    category: 'Energy Flow',
    isPremium: true,
  },
];

export function AdvancedWidgetsPanel() {
  const { toast } = useToast();

  const handleAddWidget = (widgetType: WidgetType) => {
    if (widgetType.isPremium) {
      toast({
        title: "Premium Feature",
        description: `${widgetType.name} is a premium feature. Contact sales for access.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Widget Added",
        description: `${widgetType.name} has been added to your dashboard`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Widget Library</CardTitle>
          <p className="text-sm text-muted-foreground">
            Powerful visualization types for in-depth analysis
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {widgetTypes.map((widget) => {
              const Icon = widget.icon;
              return (
                <Card key={widget.id} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{widget.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {widget.category}
                          </Badge>
                        </div>
                      </div>
                      {widget.isPremium && (
                        <Badge variant="default">Premium</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {widget.description}
                    </p>
                    <Button 
                      onClick={() => handleAddWidget(widget)}
                      className="w-full"
                      variant={widget.isPremium ? "secondary" : "default"}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Widget Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Heatmap Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color Scheme:</span>
                  <span className="font-medium">Red-Yellow-Green</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Range:</span>
                  <span className="font-medium">Last 7 Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aggregation:</span>
                  <span className="font-medium">Hourly Average</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Correlation Matrix</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variables:</span>
                  <span className="font-medium">Price, Load, Wind, Solar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium">Pearson Correlation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-medium">Rolling 30 Days</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Candlestick Chart</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interval:</span>
                  <span className="font-medium">1 Hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Indicators:</span>
                  <span className="font-medium">MA(24), Bollinger Bands</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="font-medium">Show MW Volume</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
