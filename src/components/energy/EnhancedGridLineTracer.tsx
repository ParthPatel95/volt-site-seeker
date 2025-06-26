
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Scan, Download, Eye, AlertTriangle, Cpu, Satellite, Zap, Activity, TrendingUp, Database } from 'lucide-react';
import { EnhancedMapboxMap } from '@/components/EnhancedMapboxMap';
import { useEnhancedGridLineTracer } from '@/hooks/useEnhancedGridLineTracer';
import { EnhancedGridTracerResults } from './EnhancedGridTracerResults';
import { EnhancedGridTracerMapOverlay } from './EnhancedGridTracerMapOverlay';
import { LiveMarketDataPanel } from './LiveMarketDataPanel';
import { GridAccuracyPanel } from './GridAccuracyPanel';
import { IndustrialRateCalculator } from './IndustrialRateCalculator';

export interface EnhancedGridTracerInput {
  latitude: number;
  longitude: number;
  scanRadius: number; // km
  autoTrace: boolean;
  targetSite?: string;
  powerRequirement?: number; // MW
  customerClass?: 'Rate65' | 'Rate31' | 'Industrial' | 'Commercial';
  enableMarketAnalysis?: boolean;
  enableAccuracyEnhancement?: boolean;
  enablePredictiveAnalysis?: boolean;
}

export function EnhancedGridLineTracer() {
  const [input, setInput] = useState<Partial<EnhancedGridTracerInput>>({
    scanRadius: 5,
    autoTrace: false,
    powerRequirement: 50,
    customerClass: 'Rate65',
    enableMarketAnalysis: true,
    enableAccuracyEnhancement: true,
    enablePredictiveAnalysis: false
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState<string>('');
  const { 
    scanTransmissionLines, 
    results, 
    loading,
    downloadReport,
    liveMarketData,
    accuracyMetrics
  } = useEnhancedGridLineTracer();
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
      setScanStage('Initializing enhanced AI analysis...');
      
      // Enhanced scanning stages with more detail
      const stages = [
        'Fetching high-resolution satellite imagery...',
        'Running multi-model AI detection (Roboflow + OpenAI Vision)...',
        'Cross-referencing with utility databases...',
        'Analyzing grid topology and load flow...',
        'Fetching live market data (AESO/ERCOT)...',
        'Calculating industrial rate structures...',
        'Performing accuracy validation...',
        'Generating predictive analytics...',
        'Finalizing comprehensive analysis...'
      ];
      
      let currentStage = 0;
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 10, 90));
        if (currentStage < stages.length - 1) {
          setScanStage(stages[++currentStage]);
        }
      }, 1200);

      console.log('Starting enhanced grid line trace for:', input);
      await scanTransmissionLines(input as EnhancedGridTracerInput);
      
      setScanProgress(100);
      setScanStage('Enhanced analysis complete!');
      clearInterval(progressInterval);
      
      toast({
        title: "Enhanced Grid Scan Complete",
        description: "Comprehensive AI-powered transmission line analysis with live market data completed successfully"
      });
    } catch (error: any) {
      console.error('Enhanced grid scan error:', error);
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
      description: "Enhanced map coordinate picker integration coming soon",
    });
  };

  const handleDownloadReport = () => {
    if (results) {
      downloadReport(results, input as EnhancedGridTracerInput);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Enhanced Grid Line Tracer
            <Badge variant="secondary" className="ml-2">
              <Cpu className="h-3 w-3 mr-1" />
              Multi-AI Enhanced
            </Badge>
            <Badge variant="outline" className="ml-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Live Markets
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Advanced AI-powered transmission line detection with multi-model analysis, live market integration, 
            industrial rate calculations, and predictive analytics for comprehensive grid intelligence.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Enhanced AI Integration Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center gap-2 text-sm">
                <Satellite className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Multi-Source Imagery</span>
                <Badge variant="outline" className="text-xs">Mapbox + GEE</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Cpu className="h-4 w-4 text-green-600" />
                <span className="font-medium">Multi-AI Detection</span>
                <Badge variant="outline" className="text-xs">Roboflow + OpenAI</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Utility Data</span>
                <Badge variant="outline" className="text-xs">FERC + EIA</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Live Markets</span>
                <Badge variant="outline" className="text-xs">AESO + ERCOT</Badge>
              </div>
            </div>

            {/* Enhanced Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enhanced-lat">Latitude</Label>
                <Input
                  id="enhanced-lat"
                  type="number"
                  step="0.000001"
                  placeholder="51.0447"
                  value={input.latitude || ''}
                  onChange={(e) => setInput({ ...input, latitude: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enhanced-lng">Longitude</Label>
                <div className="flex gap-2">
                  <Input
                    id="enhanced-lng"
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
                <Label htmlFor="enhanced-radius">Scan Radius (km)</Label>
                <Input
                  id="enhanced-radius"
                  type="number"
                  min="1"
                  max="100"
                  value={input.scanRadius || 5}
                  onChange={(e) => setInput({ ...input, scanRadius: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="power-requirement">Power Requirement (MW)</Label>
                <Input
                  id="power-requirement"
                  type="number"
                  min="1"
                  max="1000"
                  value={input.powerRequirement || 50}
                  onChange={(e) => setInput({ ...input, powerRequirement: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            {/* Customer Class Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer-class">Customer Class / Rate Schedule</Label>
              <select
                id="customer-class"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={input.customerClass || 'Rate65'}
                onChange={(e) => setInput({ ...input, customerClass: e.target.value as any })}
              >
                <option value="Rate65">Rate 65 - Transmission Connected Industrial (>50MW)</option>
                <option value="Rate31">Rate 31 - Large General Service (5-50MW)</option>
                <option value="Industrial">Industrial - Standard Large Customer</option>
                <option value="Commercial">Commercial - Medium Customer</option>
              </select>
            </div>

            {/* Enhanced Analysis Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="market-analysis"
                  checked={input.enableMarketAnalysis}
                  onCheckedChange={(checked) => setInput({ ...input, enableMarketAnalysis: checked })}
                />
                <Label htmlFor="market-analysis" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Live Market Analysis
                  <Badge variant="secondary" className="text-xs">AESO/ERCOT</Badge>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="accuracy-enhancement"
                  checked={input.enableAccuracyEnhancement}
                  onCheckedChange={(checked) => setInput({ ...input, enableAccuracyEnhancement: checked })}
                />
                <Label htmlFor="accuracy-enhancement" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Multi-Model Validation
                  <Badge variant="secondary" className="text-xs">Enhanced Accuracy</Badge>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="predictive-analysis"
                  checked={input.enablePredictiveAnalysis}
                  onCheckedChange={(checked) => setInput({ ...input, enablePredictiveAnalysis: checked })}
                />
                <Label htmlFor="predictive-analysis" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Predictive Analytics
                  <Badge variant="secondary" className="text-xs">ML Forecasting</Badge>
                </Label>
              </div>
            </div>

            {/* Enhanced Auto Trace Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="enhanced-auto-trace"
                checked={input.autoTrace}
                onCheckedChange={(checked) => setInput({ ...input, autoTrace: checked })}
              />
              <Label htmlFor="enhanced-auto-trace" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Maximum AI Enhancement
                <Badge variant="secondary" className="text-xs">All AI Models</Badge>
              </Label>
            </div>
            
            <p className="text-xs text-muted-foreground">
              When enabled, uses all available AI models (Roboflow + OpenAI Vision + Google Vision), 
              cross-references with utility databases, and includes comprehensive market analysis.
            </p>

            {/* Enhanced Scan Progress */}
            {isScanning && (
              <div className="space-y-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
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
                  <span>Processing with enhanced multi-AI detection and live market integration</span>
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
                {isScanning ? 'Enhanced AI Analysis in Progress...' : 'Start Enhanced Grid Scan'}
              </Button>
              
              {results && (
                <Button 
                  variant="outline"
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Comprehensive Report
                </Button>
              )}
            </div>

            {/* Enhanced AI Analysis Warning */}
            <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Enhanced AI-Powered Analysis</p>
                <p className="text-yellow-700">
                  Results combine multiple AI models, live market data, and utility databases. 
                  All confidence scores, capacity estimates, and rate calculations are AI-generated 
                  and should be verified with utility companies and regulatory authorities.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Market Data Panel */}
      {input.enableMarketAnalysis && liveMarketData && (
        <LiveMarketDataPanel 
          marketData={liveMarketData}
          customerClass={input.customerClass || 'Rate65'}
          powerRequirement={input.powerRequirement || 50}
        />
      )}

      {/* Grid Accuracy Panel */}
      {input.enableAccuracyEnhancement && accuracyMetrics && (
        <GridAccuracyPanel 
          accuracyMetrics={accuracyMetrics}
        />
      )}

      {/* Enhanced Interactive Map */}
      {input.latitude && input.longitude && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              Enhanced Satellite View & Multi-AI Grid Analysis
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
                <EnhancedGridTracerMapOverlay 
                  results={results}
                  scanCenter={[input.longitude!, input.latitude!]}
                  scanRadius={input.scanRadius || 5}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Industrial Rate Calculator */}
      {input.customerClass && input.powerRequirement && (
        <IndustrialRateCalculator
          customerClass={input.customerClass}
          powerRequirement={input.powerRequirement}
          location={input.latitude && input.longitude ? 
            { latitude: input.latitude, longitude: input.longitude } : undefined}
        />
      )}

      {/* Enhanced Results */}
      {results && (
        <EnhancedGridTracerResults 
          results={results} 
          input={input as EnhancedGridTracerInput}
        />
      )}
    </div>
  );
}
