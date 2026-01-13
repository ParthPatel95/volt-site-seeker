import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Usb, Volume2, VolumeX, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScannerSettings {
  enabled: boolean;
  maxKeystrokeDelay: number;
  minBarcodeLength: number;
  terminatorKey: 'Enter' | 'Tab';
  audioFeedback: boolean;
}

interface InventoryScannerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ScannerSettings;
  onSettingsChange: (settings: ScannerSettings) => void;
  isConnected: boolean;
  lastScan?: string | null;
}

const DEFAULT_SETTINGS: ScannerSettings = {
  enabled: true,
  maxKeystrokeDelay: 50,
  minBarcodeLength: 4,
  terminatorKey: 'Enter',
  audioFeedback: true,
};

export function InventoryScannerSettings({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  isConnected,
  lastScan,
}: InventoryScannerSettingsProps) {
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  const handleTestScan = () => {
    if (testInput.length >= settings.minBarcodeLength) {
      setTestResult('success');
      setTimeout(() => setTestResult(null), 2000);
    } else {
      setTestResult('fail');
      setTimeout(() => setTestResult(null), 2000);
    }
    setTestInput('');
  };

  const handleReset = () => {
    onSettingsChange(DEFAULT_SETTINGS);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Scanner Settings
          </DialogTitle>
          <DialogDescription>
            Configure your hardware barcode scanner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Usb className="w-4 h-4" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-muted-foreground"
                  )} />
                  <span className="text-sm">
                    {isConnected ? 'Scanner Active' : 'Waiting for Scanner'}
                  </span>
                </div>
                {lastScan && (
                  <Badge variant="outline" className="text-xs">
                    Last: {lastScan.substring(0, 15)}...
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enable Scanner */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hardware Scanner</Label>
              <p className="text-sm text-muted-foreground">
                Enable keyboard wedge scanner detection
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                onSettingsChange({ ...settings, enabled: checked })
              }
            />
          </div>

          {/* Audio Feedback */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              {settings.audioFeedback ? (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <Label>Audio Feedback</Label>
                <p className="text-sm text-muted-foreground">
                  Play a beep on successful scan
                </p>
              </div>
            </div>
            <Switch
              checked={settings.audioFeedback}
              onCheckedChange={(checked) =>
                onSettingsChange({ ...settings, audioFeedback: checked })
              }
            />
          </div>

          {/* Keystroke Delay */}
          <div className="space-y-2">
            <Label>Keystroke Speed (ms)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Maximum delay between keystrokes to detect scanner input
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={20}
                max={200}
                value={settings.maxKeystrokeDelay}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    maxKeystrokeDelay: parseInt(e.target.value) || 50,
                  })
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                Lower = faster scanners only
              </span>
            </div>
          </div>

          {/* Min Barcode Length */}
          <div className="space-y-2">
            <Label>Minimum Barcode Length</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={settings.minBarcodeLength}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  minBarcodeLength: parseInt(e.target.value) || 4,
                })
              }
              className="w-24"
            />
          </div>

          {/* Terminator Key */}
          <div className="space-y-2">
            <Label>Terminator Key</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Key sent by scanner after barcode
            </p>
            <Select
              value={settings.terminatorKey}
              onValueChange={(v: 'Enter' | 'Tab') =>
                onSettingsChange({ ...settings, terminatorKey: v })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Enter">Enter</SelectItem>
                <SelectItem value="Tab">Tab</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Test Scanner */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Test Scanner</CardTitle>
              <CardDescription>
                Scan a barcode to test your settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Scan here to test..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === settings.terminatorKey) {
                      e.preventDefault();
                      handleTestScan();
                    }
                  }}
                  className={cn(
                    testResult === 'success' && 'border-green-500',
                    testResult === 'fail' && 'border-destructive'
                  )}
                />
                {testResult === 'success' && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {testResult === 'fail' && (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { DEFAULT_SETTINGS as defaultScannerSettings };
