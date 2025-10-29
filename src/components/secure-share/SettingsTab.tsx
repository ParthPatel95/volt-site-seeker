import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Bell, Shield, Palette, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SettingsTab() {
  const { toast } = useToast();
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [viewNotifications, setViewNotifications] = useState(true);
  const [downloadNotifications, setDownloadNotifications] = useState(false);
  
  // Security defaults
  const [defaultWatermark, setDefaultWatermark] = useState(true);
  const [defaultExpiration, setDefaultExpiration] = useState(7);
  const [requirePassword, setRequirePassword] = useState(false);
  
  // Branding
  const [companyName, setCompanyName] = useState('VoltScout');
  const [customMessage, setCustomMessage] = useState('');

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure preferences and security defaults
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 max-w-4xl">
        {/* Notifications */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-watt-primary/10 to-watt-secondary/10 border border-watt-primary/20">
                <Bell className="w-4 h-4 text-watt-primary" />
              </div>
              <CardTitle className="text-lg">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about document activity
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Document View Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone views your documents
                </p>
              </div>
              <Switch
                checked={viewNotifications}
                onCheckedChange={setViewNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Download Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when documents are downloaded
                </p>
              </div>
              <Switch
                checked={downloadNotifications}
                onCheckedChange={setDownloadNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Defaults */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-watt-primary/10 to-watt-secondary/10 border border-watt-primary/20">
                <Shield className="w-4 h-4 text-watt-primary" />
              </div>
              <CardTitle className="text-lg">Security Defaults</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Watermark by Default</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically add watermarks to new links
                </p>
              </div>
              <Switch
                checked={defaultWatermark}
                onCheckedChange={setDefaultWatermark}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Password by Default</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically enable password protection
                </p>
              </div>
              <Switch
                checked={requirePassword}
                onCheckedChange={setRequirePassword}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Default Link Expiration (Days)</Label>
              <Input
                type="number"
                value={defaultExpiration}
                onChange={(e) => setDefaultExpiration(parseInt(e.target.value))}
                min="1"
                max="365"
              />
              <p className="text-sm text-muted-foreground">
                Links will expire after this many days by default
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-watt-primary/10 to-watt-secondary/10 border border-watt-primary/20">
                <Palette className="w-4 h-4 text-watt-primary" />
              </div>
              <CardTitle className="text-lg">Branding</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Company Name"
              />
              <p className="text-sm text-muted-foreground">
                Displayed in shared document viewers
              </p>
            </div>

            <div className="space-y-2">
              <Label>Custom Message (Optional)</Label>
              <Input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Thank you for reviewing these documents"
              />
              <p className="text-sm text-muted-foreground">
                Shown to viewers when accessing documents
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-gradient-to-br from-watt-primary/10 to-watt-secondary/10 border border-watt-primary/20">
                <Mail className="w-4 h-4 text-watt-primary" />
              </div>
              <CardTitle className="text-lg">Email Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-muted/50 to-muted rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-watt-primary">✨</span>
                Coming Soon
              </h4>
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-watt-primary" />
                  Custom email templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-watt-primary" />
                  Automated follow-ups
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-watt-primary" />
                  Weekly activity digests
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleSave} 
            size="lg"
            className="bg-gradient-to-r from-watt-primary to-watt-secondary hover:opacity-90 transition-opacity"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
