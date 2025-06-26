
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Scan, Download, Eye, AlertTriangle, Cpu, Satellite } from 'lucide-react';
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
  const [scanStage, setScanStage] = useState<string>('');
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
      setScanStage('Fetching satellite imagery...');
      
      // Simulate progress updates with realistic stages
      const stages = [
        'Fetching satellite imagery...',
        'Running Roboflow AI detection...',
        'Analyzing with OpenAI Vision...',
        'Processing grid infrastructure...',
        'Estimating capacity levels...',
        'Finalizing analysis...'
      ];
      
      let currentStage = 0;
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 15, 90));
        if (currentStage < stages.length - 1) {
          setScanStage(stages[++currentStage]);
        }
      }, 800);

      console.log('Starting grid line trace for:', input);
      await scanTransmissionLines(input as GridTracerInput);
      
      setScanProgress(100);
      setScanStage('Analysis complete!');
      clearInterval(progressInterval);
      
      toast({
        title: "Grid Scan Complete",
        description: "AI-powered transmission line analysis completed successfully"
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
      setScanStage('');
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
            <Badge variant="secondary" className="ml-2">
              <Cpu className="h-3 w-3 mr-1" />
              AI-Enhanced
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered transmission line detection using Roboflow computer vision and OpenAI analysis 
            to identify substations, estimate capacity, and trace grid infrastructure from satellite imagery.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* AI Integration Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-2 text-sm">
                <Satellite className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Satellite Analysis</span>
                <Badge variant="outline" className="text-xs">Mapbox</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-green-600" />
                <span className="font-medium">AI Detection</span>
                <Badge variant="outline" className="text-xs">Roboflow</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Vision Analysis</span>
                <Badge variant="outline" className="text-xs">OpenAI GPT-4</Badge>
              </div>
            </div>

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
                Enhanced AI Analysis
                <Badge variant="secondary" className="text-xs">OpenAI Vision</Badge>
              </Label>
            </div>
            
            <p className="text-xs text-muted-foreground">
              When enabled, uses advanced OpenAI Vision analysis for detailed substation identification, 
              voltage estimation, and capacity assessment in addition to Roboflow detection.
            </p>

            {/* Scan Progress */}
            {isScanning && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4 animate-pulse" />
                    {scanStage}
                  </span>
                  <span className="text-sm text-muted-foreground">{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="w-full" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Satellite className="h-3 w-3" />
                  <span>Processing satellite imagery with AI detection models</span>
                </div>
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
                {isScanning ? 'AI Analysis in Progress...' : 'Start AI Grid Scan'}
              </Button>
              
              {results && (
                <Button 
                  variant="outline"
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download AI Report
                </Button>
              )}
            </div>

            {/* AI Analysis Warning */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">AI-Powered Analysis</p>
                <p className="text-yellow-700">
                  Results combine Roboflow computer vision detection with OpenAI GPT-4 Vision analysis. 
                  Confidence scores and capacity estimates are AI-generated and should be verified with utility companies.
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
            <CardTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              Satellite View & AI Grid Analysis
            </CardTitle>
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
