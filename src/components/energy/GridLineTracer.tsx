
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Scan, Download, Eye, AlertTriangle } from 'lucide-react';
import { EnhancedMapboxMap } from '@/components/EnhancedMapboxMap';
import { useGridLineTracer } from '@/hooks/useGridLineTracer';
import { GridTracerResults } from './GridTracerResults';
import { GridTracerMapOverlay } from './GridTracerMapOverlay';

export interface GridTracerInput {
  latitude: number;
  longitude: number;
  scanRadius: number; // km
  autoTrace: boolean;
  targetSite?: string;
}

export function GridLineTracer() {
  const [input, setInput] = useState<Partial<GridTracerInput>>({
    scanRadius: 5,
    autoTrace: false
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { 
    scanTransmissionLines, 
    results, 
    loading,
    downloadReport 
  } = useGridLineTracer();
  const { toast } = useToast();

  const handleScan = async () => {
    if (!input.latitude || !input.longitude) {
      toast({
        title: "Missing Coordinates",
        description: "Please enter latitude and longitude for the scan area",
        variant: "destructive"
      });
      return;
    }

    if (Math.abs(input.latitude) > 90 || Math.abs(input.longitude) > 180) {
      toast({
        title: "Invalid Coordinates",
        description: "Please enter valid coordinates",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsScanning(true);
      setScanProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      console.log('Starting grid line trace for:', input);
      await scanTransmissionLines(input as GridTracerInput);
      
      setScanProgress(100);
      clearInterval(progressInterval);
      
      toast({
        title: "Grid Scan Complete",
        description: "Transmission lines and substations have been identified"
      });
    } catch (error: any) {
      console.error('Grid scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan transmission lines",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const handleMapClick = () => {
    toast({
      title: "Map Coordinate Picker",
      description: "Map coordinate picker integration coming soon",
    });
  };

  const handleDownloadReport = () => {
    if (results) {
      downloadReport(results, input as GridTracerInput);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Grid Line Tracer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Trace transmission lines and identify substations using satellite analysis and AI detection models.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grid-lat">Latitude</Label>
                <Input
                  id="grid-lat"
                  type="number"
                  step="0.000001"
                  placeholder="51.0447"
                  value={input.latitude || ''}
                  onChange={(e) => setInput({ ...input, latitude: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grid-lng">Longitude</Label>
                <div className="flex gap-2">
                  <Input
                    id="grid-lng"
                    type="number"
                    step="0.000001"
                    placeholder="-114.0719"
                    value={input.longitude || ''}
                    onChange={(e) => setInput({ ...input, longitude: parseFloat(e.target.value) })}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleMapClick}
                    type="button"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scan-radius">Scan Radius (km)</Label>
                <Input
                  id="scan-radius"
                  type="number"
                  min="1"
                  max="50"
                  value={input.scanRadius || 5}
                  onChange={(e) => setInput({ ...input, scanRadius: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-site">Target Site (Optional)</Label>
                <Input
                  id="target-site"
                  type="text"
                  placeholder="Site name or ID"
                  value={input.targetSite || ''}
                  onChange={(e) => setInput({ ...input, targetSite: e.target.value })}
                />
              </div>
            </div>

            {/* Auto Trace Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-trace"
                checked={input.autoTrace}
                onCheckedChange={(checked) => setInput({ ...input, autoTrace: checked })}
              />
              <Label htmlFor="auto-trace" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Auto Trace Nearby Grid
                <Badge variant="secondary" className="text-xs">Beta</Badge>
              </Label>
            </div>
            
            <p className="text-xs text-muted-foreground">
              When enabled, automatically maps all nearby transmission lines and substations within the scan radius.
            </p>

            {/* Scan Progress */}
            {isScanning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scanning Grid Infrastructure...</span>
                  <span className="text-sm text-muted-foreground">{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  Analyzing satellite imagery and detecting transmission infrastructure
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleScan} 
                disabled={isScanning || loading}
                className="flex items-center gap-2"
              >
                <Scan className="h-4 w-4" />
                {isScanning ? 'Scanning...' : 'Start Grid Scan'}
              </Button>
              
              {results && (
                <Button 
                  variant="outline"
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              )}
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">AI-Powered Analysis</p>
                <p className="text-yellow-700">
                  Results are estimates based on satellite imagery analysis. 
                  Verify with utility companies for actual capacity and connection availability.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      {input.latitude && input.longitude && (
        <Card>
          <CardHeader>
            <CardTitle>Satellite View & Grid Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <EnhancedMapboxMap 
                height="h-96"
                initialCenter={[input.longitude, input.latitude]}
                initialZoom={12}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
              />
              {results && (
                <GridTracerMapOverlay 
                  results={results}
                  scanCenter={[input.longitude!, input.latitude!]}
                  scanRadius={input.scanRadius || 5}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <GridTracerResults 
          results={results} 
          input={input as GridTracerInput}
        />
      )}
    </div>
  );
}
