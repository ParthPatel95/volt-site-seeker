
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Settings, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AlertPreference {
  id: string;
  user_id: string;
  alert_type: string;
  criteria: any;
  notification_channels: string[];
  is_active: boolean;
  frequency: string;
  last_triggered: string;
  created_at: string;
}

export function AlertConfigurationPanel() {
  const [preferences, setPreferences] = useState<AlertPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAlert, setNewAlert] = useState({
    alert_type: 'distress_signal',
    criteria: {},
    channels: ['email'],
    frequency: 'real_time'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_alert_preferences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreferences(data || []);
    } catch (error) {
      console.error('Error loading alert preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load alert preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAlertPreference = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'configure_alerts',
          alert_type: newAlert.alert_type,
          criteria: newAlert.criteria,
          notification_channels: newAlert.channels,
          frequency: newAlert.frequency
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Alert Configured",
          description: "Successfully configured new alert preference",
        });
        loadPreferences();
        setNewAlert({
          alert_type: 'distress_signal',
          criteria: {},
          channels: ['email'],
          frequency: 'real_time'
        });
      }
    } catch (error: any) {
      console.error('Error saving alert preference:', error);
      toast({
        title: "Save Error",
        description: error.message || "Failed to save alert preference",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAlert = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_alert_preferences')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setPreferences(prev => prev.map(pref => 
        pref.id === id ? { ...pref, is_active: isActive } : pref
      ));

      toast({
        title: `Alert ${isActive ? 'Enabled' : 'Disabled'}`,
        description: `Successfully ${isActive ? 'enabled' : 'disabled'} alert`,
      });
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast({
        title: "Toggle Error",
        description: "Failed to toggle alert status",
        variant: "destructive"
      });
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_alert_preferences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPreferences(prev => prev.filter(pref => pref.id !== id));

      toast({
        title: "Alert Deleted",
        description: "Successfully deleted alert preference",
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete alert preference",
        variant: "destructive"
      });
    }
  };

  const alertTypes = [
    { value: 'distress_signal', label: 'Distress Signals' },
    { value: 'power_opportunity', label: 'Power Opportunities' },
    { value: 'investment_score', label: 'Investment Scores' },
    { value: 'news_alert', label: 'News Alerts' },
    { value: 'social_sentiment', label: 'Social Sentiment' },
    { value: 'esg_change', label: 'ESG Changes' }
  ];

  const frequencies = [
    { value: 'real_time', label: 'Real-time' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Alert Configuration
          </h2>
          <p className="text-muted-foreground">
            Configure intelligent alerts for corporate intelligence events
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Alert</CardTitle>
          <CardDescription>
            Set up customized alerts for important corporate intelligence events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Alert Type</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={newAlert.alert_type}
                onChange={(e) => setNewAlert(prev => ({ ...prev, alert_type: e.target.value }))}
              >
                {alertTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Frequency</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={newAlert.frequency}
                onChange={(e) => setNewAlert(prev => ({ ...prev, frequency: e.target.value }))}
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Notification Channels</label>
            <div className="flex gap-2">
              {['email', 'sms', 'webhook'].map(channel => (
                <label key={channel} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newAlert.channels.includes(channel)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewAlert(prev => ({ ...prev, channels: [...prev.channels, channel] }));
                      } else {
                        setNewAlert(prev => ({ ...prev, channels: prev.channels.filter(c => c !== channel) }));
                      }
                    }}
                  />
                  <span className="capitalize">{channel}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={saveAlertPreference} disabled={saving}>
            {saving ? 'Saving...' : 'Create Alert'}
            <Plus className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading alert preferences...</p>
        </div>
      ) : preferences.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Alert Preferences
            </h3>
            <p className="text-muted-foreground">
              Create your first alert to receive notifications about important events
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {preferences.map((preference) => (
            <Card key={preference.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg capitalize">
                      {preference.alert_type.replace('_', ' ')} Alert
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {preference.frequency}
                      </Badge>
                      <Badge variant="secondary">
                        {preference.notification_channels.join(', ')}
                      </Badge>
                      {preference.last_triggered && (
                        <span className="text-xs text-muted-foreground">
                          Last: {new Date(preference.last_triggered).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preference.is_active}
                      onCheckedChange={(checked) => toggleAlert(preference.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAlert(preference.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {preference.criteria && Object.keys(preference.criteria).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Alert Criteria</h4>
                    <div className="space-y-1">
                      {Object.entries(preference.criteria).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
