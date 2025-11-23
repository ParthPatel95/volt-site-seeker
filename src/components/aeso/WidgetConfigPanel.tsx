import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WidgetConfigPresets } from './WidgetConfigPresets';
import { WidgetEditorDialog } from './WidgetEditorDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WidgetConfigPanelProps {
  dashboardId: string;
  widgets: any[];
  onWidgetsUpdate: (widgets: any[]) => void;
}

export function WidgetConfigPanel({ dashboardId, widgets, onWidgetsUpdate }: WidgetConfigPanelProps) {
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [editingWidget, setEditingWidget] = useState<any | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddPreset = async (preset: any) => {
    try {
      const { data, error } = await supabase
        .from('aeso_dashboard_widgets')
        .insert({
          dashboard_id: dashboardId,
          widget_type: preset.type,
          widget_config: preset.config,
          data_source: preset.dataSource,
          data_filters: preset.filters || {},
          position_x: 0,
          position_y: widgets.length * 4,
          width: preset.width || 4,
          height: preset.height || 4,
        })
        .select()
        .single();

      if (error) throw error;

      onWidgetsUpdate([...widgets, data]);
      
      toast({
        title: 'Widget added',
        description: `${preset.name} has been added to your dashboard`,
      });
    } catch (error) {
      console.error('Error adding widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to add widget',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('Are you sure you want to delete this widget?')) return;

    try {
      const { error } = await supabase
        .from('aeso_dashboard_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;

      onWidgetsUpdate(widgets.filter(w => w.id !== widgetId));
      
      toast({
        title: 'Widget deleted',
        description: 'Widget has been removed from your dashboard',
      });
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete widget',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateWidget = async (widgetId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('aeso_dashboard_widgets')
        .update(updates)
        .eq('id', widgetId)
        .select()
        .single();

      if (error) throw error;

      onWidgetsUpdate(widgets.map(w => w.id === widgetId ? data : w));
      
      toast({
        title: 'Widget updated',
        description: 'Widget configuration has been saved',
      });
    } catch (error) {
      console.error('Error updating widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to update widget',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Widget Presets */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Widget Library</CardTitle>
          <CardDescription>
            Choose from pre-configured widgets or create custom ones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WidgetConfigPresets onSelectPreset={handleAddPreset} />
        </CardContent>
      </Card>

      {/* Current Widgets */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Active Widgets</CardTitle>
              <CardDescription>
                {widgets.length} widget{widgets.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Custom
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {widgets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No widgets added yet</p>
              <p className="text-sm text-muted-foreground">
                Select a widget from the library or create a custom one
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {widgets.map((widget) => (
                  <Card key={widget.id} className="group hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">
                              {widget.widget_config?.title || 'Untitled Widget'}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {widget.widget_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Data: {widget.data_source}
                          </p>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setEditingWidget(widget)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:text-destructive"
                            onClick={() => handleDeleteWidget(widget.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Widget Editor Dialog */}
      {editingWidget && (
        <WidgetEditorDialog
          open={!!editingWidget}
          onOpenChange={(open) => !open && setEditingWidget(null)}
          widget={editingWidget}
          onSave={(updates) => {
            handleUpdateWidget(editingWidget.id, updates);
            setEditingWidget(null);
          }}
        />
      )}
    </div>
  );
}
