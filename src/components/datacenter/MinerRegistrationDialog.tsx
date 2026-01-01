import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  Wifi, 
  Shield, 
  MapPin,
  Zap,
  Power,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinerRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MinerFormData) => Promise<void>;
  loading?: boolean;
}

export interface MinerFormData {
  name: string;
  model: string;
  ip_address: string;
  mac_address?: string;
  api_port: number;
  http_port: number;
  firmware_type: string;
  api_username?: string;
  api_password?: string;
  priority_group: string;
  location?: string;
  target_hashrate_th?: number;
}

const MINER_MODELS = [
  { id: 's21-hydro', name: 'S21 Hydro', hashrate: 335, power: 5360, efficiency: 16 },
  { id: 's21-xp-hydro', name: 'S21 XP Hydro', hashrate: 473, power: 5676, efficiency: 12 },
  { id: 's19-xp-hydro', name: 'S19 XP Hydro', hashrate: 257, power: 5346, efficiency: 20.8 },
  { id: 's19-pro-hydro', name: 'S19 Pro+ Hydro', hashrate: 198, power: 5445, efficiency: 27.5 },
  { id: 't21-hydro', name: 'T21 Hydro', hashrate: 190, power: 3610, efficiency: 19 },
];

const FIRMWARE_TYPES = [
  { id: 'stock', name: 'Stock Bitmain', description: 'Default firmware' },
  { id: 'luxos', name: 'LuxOS', description: 'Advanced curtailment support' },
  { id: 'braiins', name: 'Braiins OS+', description: 'Power control & autotuning' },
  { id: 'foundry', name: 'Foundry', description: 'Pool-optimized firmware' },
];

const PRIORITY_GROUPS = [
  { id: 'critical', name: 'Critical', description: 'Never shut down', color: 'text-destructive' },
  { id: 'high', name: 'High Priority', description: 'Only in emergencies', color: 'text-orange-500' },
  { id: 'medium', name: 'Medium Priority', description: 'Standard curtailment', color: 'text-yellow-500' },
  { id: 'low', name: 'Low Priority', description: 'First to curtail', color: 'text-muted-foreground' },
  { id: 'curtailable', name: 'Curtailable', description: 'Aggressive curtailment', color: 'text-blue-500' },
];

export function MinerRegistrationDialog({
  open,
  onOpenChange,
  onSubmit,
  loading = false
}: MinerRegistrationDialogProps) {
  const [step, setStep] = useState<'model' | 'network' | 'auth' | 'priority' | 'review'>('model');
  const [formData, setFormData] = useState<MinerFormData>({
    name: '',
    model: '',
    ip_address: '',
    mac_address: '',
    api_port: 4028,
    http_port: 80,
    firmware_type: 'stock',
    api_username: 'root',
    api_password: '',
    priority_group: 'medium',
    location: '',
    target_hashrate_th: undefined,
  });

  const selectedModel = MINER_MODELS.find(m => m.name === formData.model);

  const handleSubmit = async () => {
    await onSubmit(formData);
    // Reset form
    setFormData({
      name: '',
      model: '',
      ip_address: '',
      mac_address: '',
      api_port: 4028,
      http_port: 80,
      firmware_type: 'stock',
      api_username: 'root',
      api_password: '',
      priority_group: 'medium',
      location: '',
      target_hashrate_th: undefined,
    });
    setStep('model');
  };

  const updateForm = (updates: Partial<MinerFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (step) {
      case 'model':
        return formData.name && formData.model;
      case 'network':
        return formData.ip_address;
      case 'auth':
        return true; // Auth is optional for stock firmware
      case 'priority':
        return formData.priority_group;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const steps: typeof step[] = ['model', 'network', 'auth', 'priority', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: typeof step[] = ['model', 'network', 'auth', 'priority', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Register New Miner
          </DialogTitle>
          <DialogDescription>
            Add a Bitmain Hydro miner to your fleet for remote control and monitoring.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {['model', 'network', 'auth', 'priority', 'review'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step === s ? "bg-primary text-primary-foreground" :
                ['model', 'network', 'auth', 'priority', 'review'].indexOf(step) > i 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                {['model', 'network', 'auth', 'priority', 'review'].indexOf(step) > i ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 4 && (
                <div className={cn(
                  "w-12 h-0.5 mx-1",
                  ['model', 'network', 'auth', 'priority', 'review'].indexOf(step) > i 
                    ? "bg-primary/50" 
                    : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {step === 'model' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Miner Name</Label>
                <Input 
                  placeholder="e.g., Rack-A1-M01"
                  value={formData.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  A unique identifier for this miner in your fleet
                </p>
              </div>

              <div className="space-y-2">
                <Label>Model</Label>
                <div className="grid grid-cols-1 gap-2">
                  {MINER_MODELS.map((model) => (
                    <Card 
                      key={model.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        formData.model === model.name 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => updateForm({ 
                        model: model.name,
                        target_hashrate_th: model.hashrate
                      })}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Cpu className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{model.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {model.efficiency} J/TH efficiency
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-emerald-500">
                            <Zap className="w-4 h-4" />
                            <span className="font-bold">{model.hashrate} TH/s</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Power className="w-3 h-3" />
                            <span>{(model.power / 1000).toFixed(1)} kW</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'network' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IP Address</Label>
                  <Input 
                    placeholder="192.168.1.100"
                    value={formData.ip_address}
                    onChange={(e) => updateForm({ ip_address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>MAC Address (optional)</Label>
                  <Input 
                    placeholder="AA:BB:CC:DD:EE:FF"
                    value={formData.mac_address}
                    onChange={(e) => updateForm({ mac_address: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CGMiner API Port</Label>
                  <Input 
                    type="number"
                    value={formData.api_port}
                    onChange={(e) => updateForm({ api_port: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Default: 4028</p>
                </div>
                <div className="space-y-2">
                  <Label>HTTP Port</Label>
                  <Input 
                    type="number"
                    value={formData.http_port}
                    onChange={(e) => updateForm({ http_port: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Default: 80</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Firmware Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FIRMWARE_TYPES.map((fw) => (
                    <Card 
                      key={fw.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        formData.firmware_type === fw.id 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => updateForm({ firmware_type: fw.id })}
                    >
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{fw.name}</p>
                        <p className="text-xs text-muted-foreground">{fw.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'auth' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Credentials are used for HTTP digest authentication to the miner's web interface.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input 
                    placeholder="root"
                    value={formData.api_username}
                    onChange={(e) => updateForm({ api_username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    value={formData.api_password}
                    onChange={(e) => updateForm({ api_password: e.target.value })}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Leave password empty if the miner uses default credentials or no authentication.
              </p>
            </div>
          )}

          {step === 'priority' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Priority Group</Label>
                <p className="text-sm text-muted-foreground">
                  Determines shutdown order during price-based curtailment events.
                </p>
                <div className="space-y-2 mt-3">
                  {PRIORITY_GROUPS.map((pg) => (
                    <Card 
                      key={pg.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        formData.priority_group === pg.id 
                          ? "ring-2 ring-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => updateForm({ priority_group: pg.id })}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className={cn("font-medium", pg.color)}>{pg.name}</p>
                          <p className="text-sm text-muted-foreground">{pg.description}</p>
                        </div>
                        {formData.priority_group === pg.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location (optional)</Label>
                <Input 
                  placeholder="e.g., Data Hall A, Row 3, Position 12"
                  value={formData.location}
                  onChange={(e) => updateForm({ location: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <h3 className="font-medium">Review Miner Configuration</h3>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="font-medium">{formData.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IP Address</p>
                    <p className="font-mono">{formData.ip_address}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Firmware</p>
                    <p className="capitalize">{formData.firmware_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <Badge variant="outline" className="capitalize">
                      {formData.priority_group}
                    </Badge>
                  </div>
                  {formData.location && (
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p>{formData.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedModel && (
                <div className="flex items-center gap-4 p-3 bg-emerald-500/10 rounded-lg">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">Expected Performance</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedModel.hashrate} TH/s @ {(selectedModel.power / 1000).toFixed(1)} kW
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step !== 'model' && (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}
          {step === 'review' ? (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Registering...' : 'Register Miner'}
            </Button>
          ) : (
            <Button onClick={nextStep} disabled={!canProceed()}>
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
