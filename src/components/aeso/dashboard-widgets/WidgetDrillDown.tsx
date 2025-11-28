import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DrillDownData {
  title: string;
  summary: Record<string, any>;
  detailedData: Array<Record<string, any>>;
  charts?: React.ReactNode;
}

interface WidgetDrillDownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DrillDownData;
}

export function WidgetDrillDown({ open, onOpenChange, data }: WidgetDrillDownProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{data.title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Data</TabsTrigger>
            <TabsTrigger value="charts">Visualizations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(data.summary).map(([key, value]) => (
                <Card key={key} className="p-4">
                  <div className="text-sm text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {data.detailedData.map((row, idx) => (
                  <Card key={idx} className="p-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(row).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-muted-foreground capitalize text-xs">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="font-medium">
                            {typeof value === 'number' ? value.toFixed(2) : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="charts">
            <div className="h-[500px]">
              {data.charts || (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No visualizations available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
