import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Send,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { useTelegramAlerts, TelegramAlertSetting } from '@/hooks/useTelegramAlerts';
import { TelegramAlertRules } from './TelegramAlertRules';
import { TelegramAlertHistory } from './TelegramAlertHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { usePermissionsContext } from '@/contexts/PermissionsContext';

export function TelegramAlertSettings() {
  const { hasPermission, loading: permissionsLoading } = usePermissionsContext();
  const {
    settings,
    settingsLoading,
    createSetting,
    updateSetting,
    deleteSetting,
    testConnection,
    testingConnection,
    isCreatingSetting,
  } = useTelegramAlerts();

  const [showNewSettingDialog, setShowNewSettingDialog] = useState(false);
  const [newSetting, setNewSetting] = useState({
    name: 'AESO Alerts',
    bot_token: '',
    chat_id: '',
    is_active: true,
  });
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedSettingId, setSelectedSettingId] = useState<string | null>(null);

  const handleTestConnection = async () => {
    const result = await testConnection(newSetting.bot_token, newSetting.chat_id);
    setConnectionStatus(result.success ? 'success' : 'error');
  };

  const handleCreateSetting = () => {
    createSetting(newSetting);
    setShowNewSettingDialog(false);
    setNewSetting({ name: 'AESO Alerts', bot_token: '', chat_id: '', is_active: true });
    setConnectionStatus('idle');
  };

  const handleToggleActive = (setting: TelegramAlertSetting) => {
    updateSetting({ id: setting.id, is_active: !setting.is_active });
  };

  // Check permissions loading state
  if (permissionsLoading || settingsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Check if user has permission
  if (!hasPermission('aeso.telegram-alerts')) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have permission to access Telegram Alerts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Contact your administrator to request access to the <strong>AESO Telegram Alerts</strong> feature.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Telegram Alerts
          </h2>
          <p className="text-muted-foreground">
            Receive real-time AESO market notifications in your Telegram group
          </p>
        </div>
        <Dialog open={showNewSettingDialog} onOpenChange={setShowNewSettingDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Telegram Bot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Connect Telegram Bot</DialogTitle>
              <DialogDescription>
                Set up a Telegram bot to receive AESO market alerts
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Setup Instructions */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="instructions">
                  <AccordionTrigger className="text-sm">
                    📖 How to set up a Telegram Bot
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-2">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Open Telegram and search for <strong>@BotFather</strong></li>
                      <li>Send <code>/newbot</code> and follow the prompts</li>
                      <li>Copy the bot token provided</li>
                      <li>Create a group/channel and add your bot as admin</li>
                      <li>Get the chat ID (send a message, then visit: 
                        <code className="text-xs">api.telegram.org/bot[TOKEN]/getUpdates</code>)</li>
                    </ol>
                    <a 
                      href="https://core.telegram.org/bots#how-do-i-create-a-bot" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Full guide <ExternalLink className="h-3 w-3" />
                    </a>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="space-y-2">
                <Label htmlFor="name">Configuration Name</Label>
                <Input
                  id="name"
                  value={newSetting.name}
                  onChange={(e) => setNewSetting({ ...newSetting, name: e.target.value })}
                  placeholder="e.g., AESO Alerts, Trading Team"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bot_token">Bot Token</Label>
                <Input
                  id="bot_token"
                  type="password"
                  value={newSetting.bot_token}
                  onChange={(e) => setNewSetting({ ...newSetting, bot_token: e.target.value })}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                />
                <p className="text-xs text-muted-foreground">From @BotFather</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chat_id">Chat ID</Label>
                <Input
                  id="chat_id"
                  value={newSetting.chat_id}
                  onChange={(e) => setNewSetting({ ...newSetting, chat_id: e.target.value })}
                  placeholder="-1001234567890"
                />
                <p className="text-xs text-muted-foreground">
                  Group IDs start with -100, channel IDs with @
                </p>
              </div>

              {/* Test Connection */}
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={!newSetting.bot_token || !newSetting.chat_id || testingConnection}
                  className="w-full"
                >
                  {testingConnection ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>

              {connectionStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Connection successful! Check your Telegram for a test message.
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === 'error' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Connection failed. Please check your bot token and chat ID.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewSettingDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSetting}
                disabled={!newSetting.bot_token || !newSetting.chat_id || isCreatingSetting}
              >
                {isCreatingSetting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* No settings state */}
      {(!settings || settings.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Telegram Bots Connected</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Connect a Telegram bot to start receiving real-time AESO market alerts 
              including price changes, grid stress warnings, and emergency alerts.
            </p>
            <Button onClick={() => setShowNewSettingDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Your First Bot
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Settings List */}
      {settings && settings.length > 0 && (
        <div className="space-y-4">
          {settings.map((setting) => (
            <Card key={setting.id} className={!setting.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{setting.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        Chat: {setting.chat_id}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                      {setting.is_active ? 'Active' : 'Paused'}
                    </Badge>
                    <Switch
                      checked={setting.is_active}
                      onCheckedChange={() => handleToggleActive(setting)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSetting(setting.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="rules" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="rules">Alert Rules</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="rules" className="mt-4">
                    <TelegramAlertRules settingId={setting.id} />
                  </TabsContent>
                  <TabsContent value="history" className="mt-4">
                    <TelegramAlertHistory settingId={setting.id} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
