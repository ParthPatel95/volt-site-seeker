import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface WidgetEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget: any;
  onSave: (updates: any) => void;
}

export function WidgetEditorDialog({ open, onOpenChange, widget, onSave }: WidgetEditorDialogProps) {
  const [title, setTitle] = useState(widget.widget_config?.title || '');
  const [widgetType, setWidgetType] = useState(widget.widget_type);
  const [dataSource, setDataSource] = useState(widget.data_source);

  const handleSave = () => {
    onSave({
      widget_type: widgetType,
      data_source: dataSource,
      widget_config: {
        ...widget.widget_config,
        title,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Widget</DialogTitle>
          <DialogDescription>
            Customize widget properties and data sources
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="widget-title">Widget Title</Label>
              <Input
                id="widget-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter widget title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="widget-type">Widget Type</Label>
              <Select value={widgetType} onValueChange={setWidgetType}>
                <SelectTrigger id="widget-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stat_card">Stat Card</SelectItem>
                  <SelectItem value="line_chart">Line Chart</SelectItem>
                  <SelectItem value="bar_chart">Bar Chart</SelectItem>
                  <SelectItem value="area_chart">Area Chart</SelectItem>
                  <SelectItem value="pie_chart">Pie Chart</SelectItem>
                  <SelectItem value="gauge">Gauge</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="data-source">Data Source</Label>
              <Select value={dataSource} onValueChange={setDataSource}>
                <SelectTrigger id="data-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="historical_pricing">Historical Pricing</SelectItem>
                  <SelectItem value="predictions">Price Predictions</SelectItem>
                  <SelectItem value="generation">Generation Mix</SelectItem>
                  <SelectItem value="market_data">Market Data</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="weather">Weather Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Data filters and aggregation settings can be configured in the dashboard filters panel.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-4">
            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Style customization options coming soon. Widget colors and themes will follow your dashboard settings.
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
