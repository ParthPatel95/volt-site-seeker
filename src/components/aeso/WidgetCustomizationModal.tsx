import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, Bell, Settings, LineChart, BarChart3, PieChart, Table, Gauge } from 'lucide-react';

export interface WidgetCustomization {
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  thresholds?: {
    warning?: number;
    danger?: number;
    success?: number;
  };
  chartLibrary?: 'recharts' | 'plotly' | 'chart.js';
  annotations?: Array<{
    text: string;
    position: string;
  }>;
  notes?: string;
}

interface WidgetCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget: any;
  onSave: (customization: WidgetCustomization) => void;
}

const CHART_LIBRARIES = [
  { value: 'recharts', label: 'Recharts (Default)', description: 'Simple, responsive charts' },
  { value: 'plotly', label: 'Plotly', description: 'Advanced interactive charts' },
  { value: 'chart.js', label: 'Chart.js', description: 'Flexible charting' },
];

const COLOR_PRESETS = [
  { name: 'Default', primary: 'hsl(var(--primary))', secondary: 'hsl(var(--secondary))', accent: 'hsl(var(--accent))' },
  { name: 'Ocean', primary: '#0ea5e9', secondary: '#06b6d4', accent: '#3b82f6' },
  { name: 'Forest', primary: '#10b981', secondary: '#059669', accent: '#14b8a6' },
  { name: 'Sunset', primary: '#f59e0b', secondary: '#f97316', accent: '#ef4444' },
  { name: 'Purple', primary: '#a855f7', secondary: '#8b5cf6', accent: '#6366f1' },
  { name: 'Monochrome', primary: '#6b7280', secondary: '#4b5563', accent: '#374151' },
];

export function WidgetCustomizationModal({ open, onOpenChange, widget, onSave }: WidgetCustomizationModalProps) {
  const [customization, setCustomization] = useState<WidgetCustomization>({
    colorScheme: widget?.widget_config?.customization?.colorScheme || COLOR_PRESETS[0],
    thresholds: widget?.widget_config?.customization?.thresholds || {},
    chartLibrary: widget?.widget_config?.customization?.chartLibrary || 'recharts',
    annotations: widget?.widget_config?.customization?.annotations || [],
    notes: widget?.widget_config?.customization?.notes || '',
  });

  const [newAnnotation, setNewAnnotation] = useState({ text: '', position: 'top' });

  const handleSave = () => {
    onSave(customization);
    onOpenChange(false);
  };

  const addAnnotation = () => {
    if (newAnnotation.text) {
      setCustomization(prev => ({
        ...prev,
        annotations: [...(prev.annotations || []), newAnnotation],
      }));
      setNewAnnotation({ text: '', position: 'top' });
    }
  };

  const removeAnnotation = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      annotations: prev.annotations?.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Widget: {widget?.widget_config?.title}
          </DialogTitle>
          <DialogDescription>
            Personalize your widget with colors, thresholds, and visualizations
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors" className="flex items-center gap-1">
                <Palette className="h-4 w-4" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="thresholds" className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-1">
                <LineChart className="h-4 w-4" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Color Scheme</CardTitle>
                  <CardDescription>Choose a preset or customize individual colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setCustomization(prev => ({ ...prev, colorScheme: preset }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          customization.colorScheme?.primary === preset.primary
                            ? 'border-primary shadow-md'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="h-6 w-full rounded" style={{ background: preset.primary }} />
                          <div className="h-6 w-full rounded" style={{ background: preset.secondary }} />
                          <div className="h-6 w-full rounded" style={{ background: preset.accent }} />
                        </div>
                        <p className="text-xs font-medium">{preset.name}</p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        value={customization.colorScheme?.primary || COLOR_PRESETS[0].primary}
                        onChange={(e) => setCustomization(prev => ({
                          ...prev,
                          colorScheme: { ...prev.colorScheme!, primary: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <Input
                        type="color"
                        value={customization.colorScheme?.secondary || COLOR_PRESETS[0].secondary}
                        onChange={(e) => setCustomization(prev => ({
                          ...prev,
                          colorScheme: { ...prev.colorScheme!, secondary: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <Input
                        type="color"
                        value={customization.colorScheme?.accent || COLOR_PRESETS[0].accent}
                        onChange={(e) => setCustomization(prev => ({
                          ...prev,
                          colorScheme: { ...prev.colorScheme!, accent: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="thresholds" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Alert Thresholds</CardTitle>
                  <CardDescription>Set custom thresholds for visual alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">Success</Badge>
                      Threshold
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      value={customization.thresholds?.success || ''}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        thresholds: { ...prev.thresholds, success: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">Warning</Badge>
                      Threshold
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 75"
                      value={customization.thresholds?.warning || ''}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        thresholds: { ...prev.thresholds, warning: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500">Danger</Badge>
                      Threshold
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 100"
                      value={customization.thresholds?.danger || ''}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        thresholds: { ...prev.thresholds, danger: parseFloat(e.target.value) }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Chart Library</CardTitle>
                  <CardDescription>Choose your preferred charting engine</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={customization.chartLibrary}
                    onValueChange={(value: any) => setCustomization(prev => ({ ...prev, chartLibrary: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHART_LIBRARIES.map((lib) => (
                        <SelectItem key={lib.value} value={lib.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{lib.label}</span>
                            <span className="text-xs text-muted-foreground">{lib.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="pt-4 space-y-3 border-t">
                    <Label>Annotations</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add annotation text..."
                        value={newAnnotation.text}
                        onChange={(e) => setNewAnnotation(prev => ({ ...prev, text: e.target.value }))}
                      />
                      <Select
                        value={newAnnotation.position}
                        onValueChange={(value) => setNewAnnotation(prev => ({ ...prev, position: value }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addAnnotation} size="sm">Add</Button>
                    </div>
                    
                    {customization.annotations && customization.annotations.length > 0 && (
                      <div className="space-y-2">
                        {customization.annotations.map((ann, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-muted">
                            <div className="flex-1">
                              <p className="text-sm">{ann.text}</p>
                              <p className="text-xs text-muted-foreground">Position: {ann.position}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAnnotation(idx)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Widget Notes</CardTitle>
                  <CardDescription>Add context, reminders, or analysis notes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add notes about this widget..."
                    value={customization.notes}
                    onChange={(e) => setCustomization(prev => ({ ...prev, notes: e.target.value }))}
                    rows={8}
                    className="resize-none"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Customization
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
