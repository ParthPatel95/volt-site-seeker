import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Monitor, Tablet, Smartphone, Plus, Trash2, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface LayoutPreset {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'presentation';
  layout: any[];
  thumbnail?: string;
}

interface LayoutPresetsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLayout: any[];
  presets: LayoutPreset[];
  onSavePreset: (preset: Omit<LayoutPreset, 'id'>) => void;
  onLoadPreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
}

const PRESET_TYPES = [
  { value: 'desktop', label: 'Desktop', icon: Monitor, description: '1920x1080 and above' },
  { value: 'mobile', label: 'Mobile', icon: Smartphone, description: '375x667 and below' },
  { value: 'presentation', label: 'Presentation', icon: Tablet, description: 'Optimized for presentations' },
] as const;

export function LayoutPresetsManager({
  open,
  onOpenChange,
  currentLayout,
  presets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
}: LayoutPresetsManagerProps) {
  const [presetName, setPresetName] = useState('');
  const [presetType, setPresetType] = useState<'desktop' | 'mobile' | 'presentation'>('desktop');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { toast } = useToast();

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for the preset',
        variant: 'destructive',
      });
      return;
    }

    onSavePreset({
      name: presetName,
      type: presetType,
      layout: currentLayout,
    });

    setPresetName('');
    setShowSaveDialog(false);
    
    toast({
      title: 'Preset saved',
      description: `"${presetName}" has been saved successfully`,
    });
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      onLoadPreset(presetId);
      toast({
        title: 'Preset loaded',
        description: `"${preset.name}" layout has been applied`,
      });
    }
  };

  const handleDeletePreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      onDeletePreset(presetId);
      toast({
        title: 'Preset deleted',
        description: `"${preset.name}" has been removed`,
      });
    }
  };

  const presetsByType = (type: string) => presets.filter(p => p.type === type);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Layout Presets</DialogTitle>
            <DialogDescription>
              Save and manage different layouts for desktop, mobile, and presentations
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {PRESET_TYPES.map((type) => {
                const Icon = type.icon;
                const count = presetsByType(type.value).length;
                return (
                  <Button
                    key={type.value}
                    variant={presetType === type.value ? 'default' : 'outline'}
                    onClick={() => setPresetType(type.value)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                    {count > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
            
            <Button onClick={() => setShowSaveDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Save Current
            </Button>
          </div>

          <ScrollArea className="h-[50vh]">
            <div className="grid grid-cols-2 gap-4 pr-4">
              {presetsByType(presetType).map((preset) => {
                const TypeIcon = PRESET_TYPES.find(t => t.value === preset.type)?.icon || Monitor;
                return (
                  <Card key={preset.id} className="group hover:shadow-md transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-base">{preset.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {preset.type}
                        </Badge>
                      </div>
                      <CardDescription>
                        {preset.layout.length} widgets configured
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleLoadPreset(preset.id)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeletePreset(preset.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {presetsByType(presetType).length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {presetType} presets saved yet</p>
                  <p className="text-sm mt-2">Click "Save Current" to create a new preset</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Layout Preset</DialogTitle>
            <DialogDescription>
              Create a new layout preset for {presetType} view
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Preset Name</Label>
              <Input
                placeholder={`My ${presetType} layout`}
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Layout Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant={presetType === type.value ? 'default' : 'outline'}
                      onClick={() => setPresetType(type.value)}
                      className="flex flex-col items-center gap-2 h-auto py-3"
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs opacity-70">{type.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border p-3 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Current layout: <strong>{currentLayout.length} widgets</strong>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset}>
              <Save className="h-4 w-4 mr-2" />
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
