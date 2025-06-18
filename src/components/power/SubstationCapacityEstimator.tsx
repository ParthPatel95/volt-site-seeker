
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { EnhancedMapboxMap } from '../EnhancedMapboxMap';
import { useCapacityEstimator } from '@/hooks/useCapacityEstimator';
import { 
  MapPin, 
  Zap, 
  Satellite, 
  CheckCircle, 
  AlertTriangle,
  Target,
  Activity,
  Building2,
  Info
} from 'lucide-react';

export function SubstationCapacityEstimator() {
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [manualOverride, setManualOverride] = useState({
    transformers: '',
    capacity: '',
    substationType: '' as 'transmission' | 'distribution' | ''
  });
  const [showQA, setShowQA] = useState(false);
  const [qaIssues, setQAIssues] = useState<string[]>([]);

  const { 
    loading, 
    result, 
    error, 
    estimateCapacity, 
    validateCoordinates, 
    runQAValidation,
    clearResult,
    clearError 
  } = useCapacityEstimator();

  const handleEstimate = async () => {
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);

    if (!validateCoordinates(lat, lng)) {
      alert('Please enter valid coordinates (lat: -90 to 90, lng: -180 to 180)');
      return;
    }

    clearError();
    clearResult();

    const request = {
      latitude: lat,
      longitude: lng,
      manualOverride: {
        transformers: manualOverride.transformers ? parseInt(manualOverride.transformers) : undefined,
        capacity: manualOverride.capacity ? parseFloat(manualOverride.capacity) : undefined,
        substationType: manualOverride.substationType || undefined
      }
    };

    try {
      await estimateCapacity(request);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleQAValidation = () => {
    if (result) {
      const issues = runQAValidation(result);
      setQAIssues(issues);
      setShowQA(true);
    }
  };

  const getSubstationTypeColor = (type: string) => {
    switch (type) {
      case 'transmission': return 'bg-red-100 text-red-800';
      case 'distribution': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const mapCenter: [number, number] = result ? 
    [result.coordinates.lng, result.coordinates.lat] : 
    [-98.5795, 39.8283];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span>Substation Capacity Estimator</span>
            <Badge variant="outline" className="ml-auto">AI-Powered Analysis</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Estimate power capacity at substations using satellite imagery, AI detection, and public datasets
          </p>
        </CardHeader>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Coordinate Input</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                placeholder="e.g., 32.7767"
                value={coordinates.lat}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder="e.g., -96.7970"
                value={coordinates.lng}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lng: e.target.value }))}
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-semibold">Manual Override (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Provide known values to improve estimation accuracy
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="transformers">Number of Transformers</Label>
                <Input
                  id="transformers"
                  type="number"
                  placeholder="e.g., 3"
                  value={manualOverride.transformers}
                  onChange={(e) => setManualOverride(prev => ({ ...prev, transformers: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="capacity">Known Capacity (MW)</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 25"
                  value={manualOverride.capacity}
                  onChange={(e) => setManualOverride(prev => ({ ...prev, capacity: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="type">Substation Type</Label>
                <select
                  id="type"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={manualOverride.substationType}
                  onChange={(e) => setManualOverride(prev => ({ 
                    ...prev, 
                    substationType: e.target.value as 'transmission' | 'distribution' | ''
                  }))}
                >
                  <option value="">Auto-detect</option>
                  <option value="transmission">Transmission</option>
                  <option value="distribution">Distribution</option>
                </select>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleEstimate}
            disabled={loading || !coordinates.lat || !coordinates.lng}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Satellite className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Satellite Imagery...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Estimate Capacity
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {result && (
        <>
          {/* Capacity Estimate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Capacity Estimation Results</span>
                <Badge className={getSubstationTypeColor(result.substationType)}>
                  {result.substationType.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {result.estimatedCapacity.min}–{result.estimatedCapacity.max}
                  </div>
                  <div className="text-sm text-green-600/80 dark:text-green-400/80 font-medium">
                    MW Capacity Range
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {result.detectionResults.transformersDetected}
                  </div>
                  <div className="text-sm text-blue-600/80 dark:text-blue-400/80 font-medium">
                    Transformers Detected
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {result.detectionResults.confidence}%
                  </div>
                  <div className="text-sm text-purple-600/80 dark:text-purple-400/80 font-medium">
                    Detection Confidence
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center space-x-2">
                  <Info className="w-4 h-4" />
                  <span>Observations</span>
                </h4>
                <ul className="space-y-1">
                  {result.observations.map((observation, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span>{observation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.publicData && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>Public Data</span>
                    </h4>
                    <div className="text-sm space-y-1">
                      {result.publicData.name && (
                        <p><strong>Name:</strong> {result.publicData.name}</p>
                      )}
                      {result.publicData.operator && (
                        <p><strong>Operator:</strong> {result.publicData.operator}</p>
                      )}
                      <p><strong>Source:</strong> {result.publicData.source}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex space-x-2 mt-4">
                <Button variant="outline" onClick={handleQAValidation}>
                  Run QA Validation
                </Button>
                <Button variant="outline" onClick={() => window.open(result.satelliteImageUrl, '_blank')}>
                  View Satellite Image
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* QA Validation Results */}
          {showQA && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>QA Validation Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {qaIssues.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      All validation checks passed. The estimation appears reliable.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Issues detected:</p>
                    <ul className="space-y-1">
                      {qaIssues.map((issue, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Map Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Satellite className="w-5 h-5" />
                <span>Satellite View</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <EnhancedMapboxMap
                height="h-96"
                initialCenter={mapCenter}
                initialZoom={18}
                showControls={true}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                powerPlants={[]}
                substations={[{
                  name: result.publicData?.name || 'Analyzed Substation',
                  latitude: result.coordinates.lat,
                  longitude: result.coordinates.lng,
                  capacity_mva: result.estimatedCapacity.max,
                  voltage_level: result.substationType === 'transmission' ? '345kV' : '138kV',
                  city: 'Analysis Location',
                  state: 'Unknown'
                }]}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
