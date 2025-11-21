import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Webhook, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: Date;
  lastUsed?: Date;
  permissions: string[];
  enabled: boolean;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  lastTriggered?: Date;
}

export function DataAPIPanel() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'aeso_live_' + Math.random().toString(36).substr(2, 24),
      created: new Date(),
      lastUsed: new Date(),
      permissions: ['read'],
      enabled: true
    }
  ]);

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      name: 'Price Alert Webhook',
      url: 'https://api.example.com/webhooks/price-alert',
      events: ['price.spike', 'price.drop'],
      enabled: true,
      lastTriggered: new Date()
    }
  ]);

  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const generateAPIKey = () => {
    if (!newKeyName) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the API key",
        variant: "destructive"
      });
      return;
    }

    const newKey: APIKey = {
      id: Math.random().toString(36).substr(2, 9),
      name: newKeyName,
      key: 'aeso_live_' + Math.random().toString(36).substr(2, 24),
      created: new Date(),
      permissions: ['read'],
      enabled: true
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    toast({
      title: "API Key Generated",
      description: "Your new API key has been created. Make sure to copy it now.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const revokeKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    toast({
      title: "API Key Revoked",
      description: "The API key has been permanently deleted",
      variant: "destructive"
    });
  };

  const addWebhook = () => {
    if (!newWebhookName || !newWebhookUrl) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and URL",
        variant: "destructive"
      });
      return;
    }

    const newWebhook: Webhook = {
      id: Math.random().toString(36).substr(2, 9),
      name: newWebhookName,
      url: newWebhookUrl,
      events: [],
      enabled: true
    };

    setWebhooks([...webhooks, newWebhook]);
    setNewWebhookName('');
    setNewWebhookUrl('');
    toast({
      title: "Webhook Added",
      description: "Your webhook has been configured",
    });
  };

  return (
    <Tabs defaultValue="keys" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="keys">
          <Key className="w-4 h-4 mr-2" />
          API Keys
        </TabsTrigger>
        <TabsTrigger value="webhooks">
          <Webhook className="w-4 h-4 mr-2" />
          Webhooks
        </TabsTrigger>
        <TabsTrigger value="docs">
          <Code className="w-4 h-4 mr-2" />
          API Docs
        </TabsTrigger>
      </TabsList>

      {/* API Keys */}
      <TabsContent value="keys" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Generate keys for programmatic access to your dashboard data
          </p>
        </div>

        {/* Generate New Key */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate New API Key</CardTitle>
            <CardDescription>Create a new key for external applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Dashboard"
              />
            </div>
            <Button onClick={generateAPIKey} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Generate API Key
            </Button>
          </CardContent>
        </Card>

        {/* Existing Keys */}
        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {apiKey.name}
                      <Badge variant={apiKey.enabled ? "default" : "secondary"}>
                        {apiKey.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Created {apiKey.created.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => revokeKey(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={showKey[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••'}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setShowKey({ ...showKey, [apiKey.id]: !showKey[apiKey.id] })}
                    >
                      {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Permissions:</span>
                    <div className="flex gap-1 mt-1">
                      {apiKey.permissions.map(perm => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {apiKey.lastUsed && (
                    <div>
                      <span className="text-muted-foreground">Last Used:</span>
                      <div className="mt-1">{apiKey.lastUsed.toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* Webhooks */}
      <TabsContent value="webhooks" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Webhook Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Subscribe to real-time updates from your dashboard
          </p>
        </div>

        {/* Add Webhook */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Webhook</CardTitle>
            <CardDescription>Configure a webhook endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook Name</Label>
              <Input
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                placeholder="e.g., Slack Notifications"
              />
            </div>
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <Input
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://api.example.com/webhooks"
              />
            </div>
            <Button onClick={addWebhook} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </CardContent>
        </Card>

        {/* Existing Webhooks */}
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {webhook.name}
                      <Badge variant={webhook.enabled ? "default" : "secondary"}>
                        {webhook.enabled ? "Active" : "Disabled"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">
                      {webhook.url}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Switch defaultChecked={webhook.enabled} />
                    <Button size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-xs">Subscribed Events</Label>
                  <div className="flex flex-wrap gap-2">
                    {['price.spike', 'price.drop', 'demand.high', 'demand.low'].map(event => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
                {webhook.lastTriggered && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Last triggered: {webhook.lastTriggered.toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      {/* API Documentation */}
      <TabsContent value="docs" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
          <p className="text-sm text-muted-foreground">
            REST endpoints for accessing your dashboard data
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Base URL</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="block p-3 bg-muted rounded text-sm font-mono">
              https://api.aeso-dashboard.com/v1
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Include your API key in the Authorization header:
            </p>
            <code className="block p-3 bg-muted rounded text-sm font-mono">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>GET</Badge>
                <code className="text-sm">/dashboards</code>
              </div>
              <p className="text-xs text-muted-foreground">List all dashboards</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>GET</Badge>
                <code className="text-sm">/dashboards/:id/data</code>
              </div>
              <p className="text-xs text-muted-foreground">Get dashboard data</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>GET</Badge>
                <code className="text-sm">/widgets/:id/data</code>
              </div>
              <p className="text-xs text-muted-foreground">Get widget-specific data</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge>POST</Badge>
                <code className="text-sm">/exports</code>
              </div>
              <p className="text-xs text-muted-foreground">Create export (PDF/Excel/etc.)</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
