import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2,
  Edit,
  AlertTriangle,
  DollarSign,
  Clock,
  Shield
} from 'lucide-react';
import { useDatacenterAutomation, ShutdownRule } from '@/hooks/useDatacenterAutomation';
import { cn } from '@/lib/utils';

export function ShutdownRulesPanel() {
  const { 
    rules, 
    loading,
    fetchRules, 
    createRule, 
    updateRule,
    deleteRule 
  } = useDatacenterAutomation();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ShutdownRule | null>(null);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    price_ceiling_cad: 150,
    price_floor_cad: 50,
    soft_ceiling_cad: 120,
    duration_threshold_minutes: 5,
    grace_period_seconds: 60,
    affected_priority_groups: ['low', 'medium'],
    notification_channels: ['app'],
  });

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleAddRule = async () => {
    await createRule(newRule);
    setIsAddDialogOpen(false);
    setNewRule({
      name: '',
      description: '',
      price_ceiling_cad: 150,
      price_floor_cad: 50,
      soft_ceiling_cad: 120,
      duration_threshold_minutes: 5,
      grace_period_seconds: 60,
      affected_priority_groups: ['low', 'medium'],
      notification_channels: ['app'],
    });
  };

  const handleToggleRule = async (rule: ShutdownRule) => {
    await updateRule(rule.id, { is_active: !rule.is_active });
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'critical', label: 'Critical (Not Recommended)' },
  ];

  const togglePriorityGroup = (group: string) => {
    setNewRule(prev => ({
      ...prev,
      affected_priority_groups: prev.affected_priority_groups.includes(group)
        ? prev.affected_priority_groups.filter(g => g !== group)
        : [...prev.affected_priority_groups, group]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Shutdown Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure price thresholds for automated load shedding
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Shutdown Rule</DialogTitle>
              <DialogDescription>
                Define price thresholds to automatically manage datacenter power
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input 
                  placeholder="Peak Hour Protection"
                  value={newRule.name}
                  onChange={e => setNewRule({...newRule, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input 
                  placeholder="Protects against price spikes during peak hours"
                  value={newRule.description}
                  onChange={e => setNewRule({...newRule, description: e.target.value})}
                />
              </div>

              {/* Price Thresholds */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price Thresholds (CAD/MWh)
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-destructive">Hard Ceiling (Immediate Shutdown)</Label>
                      <span className="text-sm font-mono">CA${newRule.price_ceiling_cad}</span>
                    </div>
                    <Slider
                      value={[newRule.price_ceiling_cad]}
                      onValueChange={([v]) => setNewRule({...newRule, price_ceiling_cad: v})}
                      min={50}
                      max={500}
                      step={5}
                      className="[&>span:first-child]:bg-destructive"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-yellow-500">Soft Ceiling (Warning)</Label>
                      <span className="text-sm font-mono">CA${newRule.soft_ceiling_cad}</span>
                    </div>
                    <Slider
                      value={[newRule.soft_ceiling_cad]}
                      onValueChange={([v]) => setNewRule({...newRule, soft_ceiling_cad: v})}
                      min={30}
                      max={newRule.price_ceiling_cad - 10}
                      step={5}
                      className="[&>span:first-child]:bg-yellow-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-green-500">Floor Price (Resume Operations)</Label>
                      <span className="text-sm font-mono">CA${newRule.price_floor_cad}</span>
                    </div>
                    <Slider
                      value={[newRule.price_floor_cad]}
                      onValueChange={([v]) => setNewRule({...newRule, price_floor_cad: v})}
                      min={0}
                      max={newRule.soft_ceiling_cad - 10}
                      step={5}
                      className="[&>span:first-child]:bg-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timing Configuration
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration Threshold</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        value={newRule.duration_threshold_minutes}
                        onChange={e => setNewRule({...newRule, duration_threshold_minutes: parseInt(e.target.value)})}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Price must exceed ceiling for this duration</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Grace Period</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        value={newRule.grace_period_seconds}
                        onChange={e => setNewRule({...newRule, grace_period_seconds: parseInt(e.target.value)})}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">seconds</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Time before shutdown executes</p>
                  </div>
                </div>
              </div>

              {/* Priority Groups */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Affected Priority Groups
                </h4>
                <div className="space-y-2">
                  {priorityOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={option.value}
                        checked={newRule.affected_priority_groups.includes(option.value)}
                        onCheckedChange={() => togglePriorityGroup(option.value)}
                        disabled={option.value === 'critical'}
                      />
                      <Label 
                        htmlFor={option.value}
                        className={cn(
                          "cursor-pointer",
                          option.value === 'critical' && "text-muted-foreground"
                        )}
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddRule} disabled={!newRule.name}>
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map(rule => (
          <Card key={rule.id} className={cn(
            "border-2 transition-all",
            rule.is_active ? "border-primary/50" : "border-muted opacity-60"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={rule.is_active}
                    onCheckedChange={() => handleToggleRule(rule)}
                  />
                  <CardTitle className="text-lg">{rule.name}</CardTitle>
                  {rule.is_active && (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {rule.description && (
                <p className="text-sm text-muted-foreground mb-4">{rule.description}</p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Hard Ceiling</p>
                  <p className="text-lg font-bold text-destructive">CA${rule.price_ceiling_cad}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Soft Ceiling</p>
                  <p className="text-lg font-bold text-yellow-500">CA${rule.soft_ceiling_cad || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Floor Price</p>
                  <p className="text-lg font-bold text-green-500">CA${rule.price_floor_cad}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Grace Period</p>
                  <p className="text-lg font-bold">{rule.grace_period_seconds}s</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-xs text-muted-foreground">Affects:</span>
                {rule.affected_priority_groups.map(group => (
                  <Badge key={group} variant="outline" className="text-xs capitalize">
                    {group}
                  </Badge>
                ))}
                {rule.trigger_count > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    Triggered {rule.trigger_count} times
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {rules.length === 0 && !loading && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No Shutdown Rules Configured</p>
              <p className="text-sm text-muted-foreground mb-4">Create rules to automate price-based load shedding</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Rule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
