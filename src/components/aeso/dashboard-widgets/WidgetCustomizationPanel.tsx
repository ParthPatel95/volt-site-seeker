import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export interface WidgetCustomization {
  timeRange: '24h' | '7d' | '30d' | '90d' | 'custom';
  refreshInterval: 'manual' | '5m' | '15m' | '30m' | '1h';
  showTrends: boolean;
  showLegend: boolean;
  chartType?: 'line' | 'bar' | 'area';
}

interface WidgetCustomizationPanelProps {
  customization: WidgetCustomization;
  onUpdate: (customization: WidgetCustomization) => void;
  availableOptions?: {
    showChartType?: boolean;
    showTrends?: boolean;
    showLegend?: boolean;
  };
}

export function WidgetCustomizationPanel({ 
  customization, 
  onUpdate,
  availableOptions = { showChartType: true, showTrends: true, showLegend: true }
}: WidgetCustomizationPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Widget Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label>Time Range</Label>
            <Select
              value={customization.timeRange}
              onValueChange={(value: any) => onUpdate({ ...customization, timeRange: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Refresh Interval</Label>
            <Select
              value={customization.refreshInterval}
              onValueChange={(value: any) => onUpdate({ ...customization, refreshInterval: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="5m">Every 5 Minutes</SelectItem>
                <SelectItem value="15m">Every 15 Minutes</SelectItem>
                <SelectItem value="30m">Every 30 Minutes</SelectItem>
                <SelectItem value="1h">Every Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {availableOptions.showChartType && (
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select
                value={customization.chartType || 'line'}
                onValueChange={(value: any) => onUpdate({ ...customization, chartType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {availableOptions.showTrends && (
            <div className="flex items-center justify-between">
              <Label>Show Trends</Label>
              <Switch
                checked={customization.showTrends}
                onCheckedChange={(checked) => onUpdate({ ...customization, showTrends: checked })}
              />
            </div>
          )}

          {availableOptions.showLegend && (
            <div className="flex items-center justify-between">
              <Label>Show Legend</Label>
              <Switch
                checked={customization.showLegend}
                onCheckedChange={(checked) => onUpdate({ ...customization, showLegend: checked })}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
