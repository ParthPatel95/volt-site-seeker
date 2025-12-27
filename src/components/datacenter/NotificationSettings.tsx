import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Webhook, 
  Smartphone,
  Plus,
  Trash2,
  Save,
  TestTube
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NotificationSetting {
  id: string;
  rule_id: string;
  channel: 'email' | 'sms' | 'webhook' | 'app';
  destination: string;
  notify_on_warning: boolean;
  notify_on_shutdown: boolean;
  notify_on_resume: boolean;
  delay_minutes: number;
  is_active: boolean;
}

interface ShutdownRule {
  id: string;
  rule_name: string;
}

interface NotificationSettingsProps {
  rules: ShutdownRule[];
}

const CHANNEL_ICONS = {
  email: Mail,
  sms: Smartphone,
  webhook: Webhook,
  app: Bell
};

const CHANNEL_LABELS = {
  email: 'Email',
  sms: 'SMS',
  webhook: 'Webhook',
  app: 'In-App'
};

export function NotificationSettings({ rules }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New setting form
  const [newSetting, setNewSetting] = useState<{
    rule_id: string;
    channel: 'email' | 'sms' | 'webhook' | 'app';
    destination: string;
    notify_on_warning: boolean;
    notify_on_shutdown: boolean;
    notify_on_resume: boolean;
    delay_minutes: number;
  }>({
    rule_id: '',
    channel: 'email',
    destination: '',
    notify_on_warning: true,
    notify_on_shutdown: true,
    notify_on_resume: true,
    delay_minutes: 0
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('datacenter_notification_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSettings((data || []) as NotificationSetting[]);
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSetting = async () => {
    if (!newSetting.rule_id) {
      toast.error('Please select a rule');
      return;
    }
    if (!newSetting.destination && newSetting.channel !== 'app') {
      toast.error('Please enter a destination');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('datacenter_notification_settings')
        .insert({
          rule_id: newSetting.rule_id,
          channel: newSetting.channel,
          destination: newSetting.channel === 'app' ? null : newSetting.destination,
          notify_on_warning: newSetting.notify_on_warning,
          notify_on_shutdown: newSetting.notify_on_shutdown,
          notify_on_resume: newSetting.notify_on_resume,
          delay_minutes: newSetting.delay_minutes,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setSettings(prev => [data as NotificationSetting, ...prev]);
      setNewSetting({
        rule_id: '',
        channel: 'email',
        destination: '',
        notify_on_warning: true,
        notify_on_shutdown: true,
        notify_on_resume: true,
        delay_minutes: 0
      });
      toast.success('Notification setting added');
    } catch (err) {
      console.error('Error adding notification setting:', err);
      toast.error('Failed to add notification setting');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('datacenter_notification_settings')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setSettings(prev => 
        prev.map(s => s.id === id ? { ...s, is_active: isActive } : s)
      );
      toast.success(isActive ? 'Notification enabled' : 'Notification disabled');
    } catch (err) {
      console.error('Error updating notification setting:', err);
      toast.error('Failed to update setting');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('datacenter_notification_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSettings(prev => prev.filter(s => s.id !== id));
      toast.success('Notification setting deleted');
    } catch (err) {
      console.error('Error deleting notification setting:', err);
      toast.error('Failed to delete setting');
    }
  };

  const handleTestNotification = async (setting: NotificationSetting) => {
    toast.info(`Test notification sent to ${setting.channel}: ${setting.destination || 'In-App'}`);
    // In production, this would trigger the actual notification
  };

  const getRuleName = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    return rule?.rule_name || 'Unknown Rule';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Setting */}
        <div className="p-4 rounded-lg border border-dashed border-border space-y-4">
          <p className="text-sm font-medium">Add New Notification</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Rule</Label>
              <Select 
                value={newSetting.rule_id} 
                onValueChange={(v) => setNewSetting(prev => ({ ...prev, rule_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rule" />
                </SelectTrigger>
                <SelectContent>
                  {rules.map(rule => (
                    <SelectItem key={rule.id} value={rule.id}>
                      {rule.rule_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Channel</Label>
              <Select 
                value={newSetting.channel} 
                onValueChange={(v: 'email' | 'sms' | 'webhook' | 'app') => 
                  setNewSetting(prev => ({ ...prev, channel: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="app">In-App</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {newSetting.channel === 'email' ? 'Email Address' :
                 newSetting.channel === 'sms' ? 'Phone Number' :
                 newSetting.channel === 'webhook' ? 'Webhook URL' : 'Not Required'}
              </Label>
              <Input
                value={newSetting.destination}
                onChange={(e) => setNewSetting(prev => ({ ...prev, destination: e.target.value }))}
                placeholder={
                  newSetting.channel === 'email' ? 'user@example.com' :
                  newSetting.channel === 'sms' ? '+1234567890' :
                  newSetting.channel === 'webhook' ? 'https://...' : 'N/A'
                }
                disabled={newSetting.channel === 'app'}
              />
            </div>

            <div className="space-y-2">
              <Label>Delay (minutes)</Label>
              <Input
                type="number"
                min={0}
                max={60}
                value={newSetting.delay_minutes}
                onChange={(e) => setNewSetting(prev => ({ ...prev, delay_minutes: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={newSetting.notify_on_warning}
                onCheckedChange={(v) => setNewSetting(prev => ({ ...prev, notify_on_warning: v }))}
              />
              <Label className="text-sm">Warning</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newSetting.notify_on_shutdown}
                onCheckedChange={(v) => setNewSetting(prev => ({ ...prev, notify_on_shutdown: v }))}
              />
              <Label className="text-sm">Shutdown</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newSetting.notify_on_resume}
                onCheckedChange={(v) => setNewSetting(prev => ({ ...prev, notify_on_resume: v }))}
              />
              <Label className="text-sm">Resume</Label>
            </div>
            <Button onClick={handleAddSetting} disabled={saving} className="ml-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Notification
            </Button>
          </div>
        </div>

        {/* Existing Settings */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Configured Notifications ({settings.length})</p>
          
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : settings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No notifications configured</p>
          ) : (
            <div className="space-y-2">
              {settings.map(setting => {
                const ChannelIcon = CHANNEL_ICONS[setting.channel];
                return (
                  <div 
                    key={setting.id} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      setting.is_active ? "bg-card" : "bg-muted/50 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ChannelIcon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{CHANNEL_LABELS[setting.channel]}</p>
                        <p className="text-xs text-muted-foreground">
                          {setting.destination || 'In-App'} • {getRuleName(setting.rule_id)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {setting.notify_on_warning && <Badge variant="outline" className="text-[10px]">Warning</Badge>}
                        {setting.notify_on_shutdown && <Badge variant="outline" className="text-[10px] border-destructive/50 text-destructive">Shutdown</Badge>}
                        {setting.notify_on_resume && <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-500">Resume</Badge>}
                      </div>
                      
                      <Switch
                        checked={setting.is_active}
                        onCheckedChange={(v) => handleToggleActive(setting.id, v)}
                      />
                      
                      <Button variant="ghost" size="icon" onClick={() => handleTestNotification(setting)}>
                        <TestTube className="w-4 h-4" />
                      </Button>
                      
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(setting.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
