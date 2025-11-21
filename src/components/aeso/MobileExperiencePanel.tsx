import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, WifiOff, Download, Layout } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function MobileExperiencePanel() {
  const { toast } = useToast();
  const [pwaEnabled, setPwaEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [touchOptimized, setTouchOptimized] = useState(true);
  const [mobileLayout, setMobileLayout] = useState('adaptive');

  const handleInstallPWA = () => {
    toast({
      title: "PWA Ready",
      description: "Users can now install this app on their devices",
    });
  };

  const handleTestMobile = () => {
    toast({
      title: "Mobile View Active",
      description: "Preview is now in mobile view",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Progressive Web App (PWA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="pwa">Enable PWA</Label>
              <p className="text-xs text-muted-foreground">
                Allow users to install app on their devices
              </p>
            </div>
            <Switch
              id="pwa"
              checked={pwaEnabled}
              onCheckedChange={setPwaEnabled}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">PWA Status</span>
              <Badge variant={pwaEnabled ? "default" : "secondary"}>
                {pwaEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Manifest configured</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Service worker registered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Icons optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>HTTPS enabled</span>
              </div>
            </div>
          </div>

          <Button onClick={handleInstallPWA} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Test PWA Install
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-chart-2" />
            Offline Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="offline">Enable Offline Mode</Label>
              <p className="text-xs text-muted-foreground">
                Cache data for offline access
              </p>
            </div>
            <Switch
              id="offline"
              checked={offlineMode}
              onCheckedChange={setOfflineMode}
            />
          </div>

          <div className="space-y-2">
            <Label>Cache Strategy</Label>
            <Select defaultValue="network-first">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="network-first">Network First</SelectItem>
                <SelectItem value="cache-first">Cache First</SelectItem>
                <SelectItem value="stale-while-revalidate">Stale While Revalidate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cached Data:</span>
              <span className="text-sm font-medium">156 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Updated:</span>
              <span className="text-sm font-medium">2 minutes ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Offline Availability:</span>
              <Badge variant="default">24 hours</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-chart-3" />
            Mobile Layouts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="touch">Touch Optimization</Label>
              <p className="text-xs text-muted-foreground">
                Larger touch targets and swipe gestures
              </p>
            </div>
            <Switch
              id="touch"
              checked={touchOptimized}
              onCheckedChange={setTouchOptimized}
            />
          </div>

          <div className="space-y-2">
            <Label>Layout Mode</Label>
            <Select value={mobileLayout} onValueChange={setMobileLayout}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adaptive">Adaptive (Auto-adjust)</SelectItem>
                <SelectItem value="mobile-first">Mobile First</SelectItem>
                <SelectItem value="responsive">Fully Responsive</SelectItem>
                <SelectItem value="dedicated">Dedicated Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mobile Widget Variants</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">Compact Cards</Button>
              <Button variant="outline" size="sm">Full Width</Button>
              <Button variant="outline" size="sm">Vertical Stack</Button>
              <Button variant="outline" size="sm">Swipeable</Button>
            </div>
          </div>

          <Button onClick={handleTestMobile} className="w-full" variant="secondary">
            <Smartphone className="w-4 h-4 mr-2" />
            Preview Mobile View
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">iOS</span>
                <Badge variant="default">Supported</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                iPhone 8+ • iPad • Safari 14+
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">Android</span>
                <Badge variant="default">Supported</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Android 8+ • Chrome 90+ • Samsung Internet
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">Tablet</span>
                <Badge variant="default">Optimized</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                iPadOS • Android tablets • 2-column layout
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
