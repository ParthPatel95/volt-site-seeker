import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  Play,
  Loader2,
  Edit2,
  Save,
  X,
  Clock,
  Zap
} from 'lucide-react';
import { 
  useTelegramAlerts, 
  TelegramAlertRule, 
  ALERT_TYPE_INFO,
  ALERT_CATEGORIES,
  AlertType 
} from '@/hooks/useTelegramAlerts';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TelegramAlertRulesProps {
  settingId: string;
}

// Group alert types by category
const groupedAlertTypes = Object.entries(ALERT_TYPE_INFO).reduce((acc, [type, info]) => {
  const category = info.category;
  if (!acc[category]) acc[category] = [];
  acc[category].push(type as AlertType);
  return acc;
}, {} as Record<string, AlertType[]>);

export function TelegramAlertRules({ settingId }: TelegramAlertRulesProps) {
  const {
    useRulesForSetting,
    createRule,
    updateRule,
    deleteRule,
    testRule,
    isCreatingRule,
    isUpdatingRule,
    isDeletingRule,
  } = useTelegramAlerts();

  const { data: rules, isLoading } = useRulesForSetting(settingId);
  const [showNewRuleDialog, setShowNewRuleDialog] = useState(false);
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<TelegramAlertRule>>({});
  
  const [newRule, setNewRule] = useState({
    alert_type: 'price_low' as AlertType,
    condition: 'below' as 'above' | 'below' | 'equals' | 'contains' | 'change_percent',
    threshold_value: 10,
    custom_metric: '',
    message_template: '',
    cooldown_minutes: 30,
    is_active: true,
  });

  const handleCreateRule = () => {
    const alertInfo = ALERT_TYPE_INFO[newRule.alert_type];
    createRule({
      ...newRule,
      setting_id: settingId,
      threshold_value: alertInfo.isScheduled ? null : (newRule.threshold_value || null),
      custom_metric: newRule.alert_type === 'custom' ? newRule.custom_metric : null,
      message_template: newRule.message_template || null,
      // Scheduled alerts use longer cooldowns by default
      cooldown_minutes: alertInfo.isScheduled ? 55 : newRule.cooldown_minutes,
    });
    setShowNewRuleDialog(false);
    setNewRule({
      alert_type: 'price_low',
      condition: 'below',
      threshold_value: 10,
      custom_metric: '',
      message_template: '',
      cooldown_minutes: 30,
      is_active: true,
    });
  };

  const handleTestRule = async (ruleId: string) => {
    setTestingRuleId(ruleId);
    try {
      await testRule(ruleId);
    } finally {
      setTestingRuleId(null);
    }
  };

  const handleToggleActive = (rule: TelegramAlertRule) => {
    updateRule({ id: rule.id, is_active: !rule.is_active });
  };

  const startEditing = (rule: TelegramAlertRule) => {
    setEditingRuleId(rule.id);
    setEditValues({
      threshold_value: rule.threshold_value,
      cooldown_minutes: rule.cooldown_minutes,
    });
  };

  const saveEdit = (ruleId: string) => {
    updateRule({ id: ruleId, ...editValues });
    setEditingRuleId(null);
    setEditValues({});
  };

  const cancelEdit = () => {
    setEditingRuleId(null);
    setEditValues({});
  };

  const handleAlertTypeChange = (type: AlertType) => {
    const info = ALERT_TYPE_INFO[type];
    setNewRule({
      ...newRule,
      alert_type: type,
      threshold_value: info.defaultThreshold,
      condition: type === 'price_high' || type === 'grid_stress' || type === 'demand_peak' 
        ? 'above' 
        : 'below',
      cooldown_minutes: info.isScheduled ? 55 : 30,
    });
  };

  const getConditionDisplay = (rule: TelegramAlertRule) => {
    const info = ALERT_TYPE_INFO[rule.alert_type];
    
    if (info.isScheduled) {
      if (rule.alert_type === 'daily_morning_briefing') return 'Daily at 7 AM';
      if (rule.alert_type === 'daily_evening_summary') return 'Daily at 6 PM';
      return 'Hourly';
    }
    
    const unit = info.unit || '';
    return `${rule.condition} ${rule.threshold_value}${unit}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Add Presets - Only show when no rules exist */}
      {(!rules || rules.length === 0) && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Quick add popular alerts:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(['price_low', 'price_high', 'hourly_summary', 'renewable_percentage', 'daily_morning_briefing', 'price_negative'] as AlertType[])
              .map((type) => {
                const info = ALERT_TYPE_INFO[type];
                const alreadyExists = rules?.some(r => r.alert_type === type);
                
                return (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    disabled={alreadyExists || isCreatingRule}
                    onClick={() => {
                      createRule({
                        setting_id: settingId,
                        alert_type: type,
                        condition: type === 'price_high' ? 'above' : 'below',
                        threshold_value: info.isScheduled ? null : info.defaultThreshold,
                        custom_metric: null,
                        message_template: null,
                        cooldown_minutes: info.isScheduled ? 55 : 30,
                        is_active: true,
                      });
                    }}
                    className="justify-start h-auto py-2 text-left"
                  >
                    <span className="mr-2">{info.icon}</span>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium">{info.label}</span>
                      {info.isScheduled && (
                        <span className="text-[10px] text-muted-foreground">Scheduled</span>
                      )}
                    </div>
                  </Button>
                );
              })}
          </div>
        </div>
      )}

      {/* Rules List */}
      {rules && rules.length > 0 && (
        <div className="space-y-2">
          {rules.map((rule) => {
            const info = ALERT_TYPE_INFO[rule.alert_type];
            const isEditing = editingRuleId === rule.id;
            
            return (
              <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg">{info.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{info.label}</span>
                          {!rule.is_active && (
                            <Badge variant="secondary" className="text-xs">Paused</Badge>
                          )}
                          {info.isScheduled && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Clock className="h-3 w-3" />
                              Scheduled
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isEditing ? (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {!info.isScheduled && (
                                <>
                                  <span>Threshold:</span>
                                  <Input
                                    type="number"
                                    value={editValues.threshold_value ?? ''}
                                    onChange={(e) => setEditValues({ ...editValues, threshold_value: parseFloat(e.target.value) })}
                                    className="h-6 w-20 text-xs"
                                  />
                                  {info.unit && <span>{info.unit}</span>}
                                </>
                              )}
                              <span>Cooldown:</span>
                              <Input
                                type="number"
                                value={editValues.cooldown_minutes ?? ''}
                                onChange={(e) => setEditValues({ ...editValues, cooldown_minutes: parseInt(e.target.value) })}
                                className="h-6 w-16 text-xs"
                              />
                              <span>min</span>
                            </div>
                          ) : (
                            <>
                              {getConditionDisplay(rule)}
                              {' • '}Cooldown: {rule.cooldown_minutes}min
                              {rule.last_triggered_at && (
                                <> • Last: {formatDistanceToNow(new Date(rule.last_triggered_at), { addSuffix: true })}</>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => saveEdit(rule.id)}
                            disabled={isUpdatingRule}
                          >
                            <Save className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleTestRule(rule.id)}
                            disabled={testingRuleId === rule.id}
                            title="Send test alert"
                          >
                            {testingRuleId === rule.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => startEditing(rule)}
                            title="Edit rule"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={() => handleToggleActive(rule)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteRule({ id: rule.id, settingId })}
                            disabled={isDeletingRule}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Custom Rule Button */}
      <Dialog open={showNewRuleDialog} onOpenChange={setShowNewRuleDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Alert Rule
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Alert Rule</DialogTitle>
            <DialogDescription>
              Set up a new alert condition for this Telegram bot
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 pr-4">
              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Select 
                  value={newRule.alert_type} 
                  onValueChange={(v) => handleAlertTypeChange(v as AlertType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ALERT_CATEGORIES).map(([category, catInfo]) => (
                      <SelectGroup key={category}>
                        <SelectLabel className="flex items-center gap-2">
                          <span>{catInfo.icon}</span>
                          <span>{catInfo.label}</span>
                        </SelectLabel>
                        {groupedAlertTypes[category]?.map((type) => {
                          const info = ALERT_TYPE_INFO[type];
                          return (
                            <SelectItem key={type} value={type}>
                              <span className="flex items-center gap-2">
                                <span>{info.icon}</span>
                                <span>{info.label}</span>
                                {info.isScheduled && (
                                  <Badge variant="outline" className="text-[10px] ml-1">
                                    <Clock className="h-2 w-2 mr-1" />
                                    Auto
                                  </Badge>
                                )}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {ALERT_TYPE_INFO[newRule.alert_type].description}
                </p>
                {ALERT_TYPE_INFO[newRule.alert_type].isScheduled && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      This alert triggers automatically on a schedule
                    </span>
                  </div>
                )}
              </div>

              {newRule.alert_type === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom Metric</Label>
                  <Select 
                    value={newRule.custom_metric} 
                    onValueChange={(v) => setNewRule({ ...newRule, custom_metric: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poolPrice">Pool Price</SelectItem>
                      <SelectItem value="reserveMargin">Reserve Margin</SelectItem>
                      <SelectItem value="totalLoad">Total Load</SelectItem>
                      <SelectItem value="priceChange1h">Price Change (1h)</SelectItem>
                      <SelectItem value="renewablePercentage">Renewable %</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Only show condition/threshold for non-scheduled alerts */}
              {!ALERT_TYPE_INFO[newRule.alert_type].isScheduled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select 
                      value={newRule.condition} 
                      onValueChange={(v) => setNewRule({ ...newRule, condition: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="change_percent">% Change</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Threshold {ALERT_TYPE_INFO[newRule.alert_type].unit && (
                        <span className="text-muted-foreground">
                          ({ALERT_TYPE_INFO[newRule.alert_type].unit})
                        </span>
                      )}
                    </Label>
                    <Input
                      type="number"
                      value={newRule.threshold_value}
                      onChange={(e) => setNewRule({ ...newRule, threshold_value: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Cooldown (minutes)</Label>
                <Input
                  type="number"
                  value={newRule.cooldown_minutes}
                  onChange={(e) => setNewRule({ ...newRule, cooldown_minutes: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  {ALERT_TYPE_INFO[newRule.alert_type].isScheduled 
                    ? 'Time between scheduled reports (55 min recommended for hourly)'
                    : 'Minimum time between repeated alerts'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label>Custom Message Template (optional)</Label>
                <Textarea
                  value={newRule.message_template}
                  onChange={(e) => setNewRule({ ...newRule, message_template: e.target.value })}
                  placeholder="Leave empty for default template. Use ${price}, ${threshold}, ${timestamp}, ${windGen}, ${solarGen}, ${renewablePercentage}, etc."
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRule} disabled={isCreatingRule}>
              {isCreatingRule && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
