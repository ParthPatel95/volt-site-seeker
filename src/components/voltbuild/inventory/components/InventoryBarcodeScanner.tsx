import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Keyboard, Loader2, X, ScanBarcode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryBarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
  isSearching?: boolean;
}

export function InventoryBarcodeScanner({
  open,
  onOpenChange,
  onScan,
  isSearching = false,
}: InventoryBarcodeScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScanResult = (result: string) => {
    if (result && !isSearching) {
      onScan(result);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  const handleClose = () => {
    setManualInput('');
    setScanError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5" />
            Scan Barcode / QR Code
          </DialogTitle>
          <DialogDescription>
            Scan a barcode to search or add items to inventory
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'camera' | 'manual')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="mt-4">
            <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-muted">
              {isSearching ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                </div>
              ) : null}
              
              <Scanner
                onScan={(result) => {
                  if (result && result.length > 0) {
                    handleScanResult(result[0].rawValue);
                  }
                }}
                onError={(error) => {
                  console.error('Scanner error:', error);
                  setScanError('Camera access denied or not available');
                }}
                constraints={{
                  facingMode: 'environment',
                }}
                styles={{
                  container: {
                    width: '100%',
                    height: '100%',
                  },
                  video: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  },
                }}
                components={{
                  torch: true,
                }}
              />

              {/* Scan overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-2 border-primary/50" />
                <div className="absolute inset-[20%] border-2 border-primary rounded-lg">
                  <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
                </div>
              </div>

              {scanError && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90">
                  <div className="text-center p-4">
                    <p className="text-destructive mb-2">{scanError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScanError(null)}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center mt-3">
              Point your camera at a barcode or QR code
            </p>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode-input">Barcode / SKU</Label>
                <Input
                  id="barcode-input"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter barcode or SKU..."
                  autoFocus
                  disabled={isSearching}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!manualInput.trim() || isSearching}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
