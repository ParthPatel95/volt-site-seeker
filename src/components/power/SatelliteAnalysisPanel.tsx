
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSatelliteAnalysis } from '@/hooks/useSatelliteAnalysis';
import { 
  Satellite, 
  Search, 
  MapPin, 
  Zap, 
  Eye, 
  CheckCircle2,
  AlertTriangle,
  Crosshair
} from 'lucide-react';

export function SatelliteAnalysisPanel() {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '', radius: '10' });
  const [analysisType, setAnalysisType] = useState<'transmission' | 'substation' | 'power_plant' | 'solar_farm'>('substation');
  
  const { 
    loading, 
    discoveries, 
    analysis,
    discoverSubstations, 
    analyzeInfrastructure, 
    validateLocation 
  } = useSatelliteAnalysis();

  const handleRegionDiscovery = async () => {
    await discoverSubstations(selectedRegion);
  };

  const handleCoordinateAnalysis = async () => {
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      return;
    }

    await analyzeInfrastructure({ lat, lng }, analysisType);
  };

  const handleLocationValidation = async (discovery: any) => {
    await validateLocation(discovery.coordinates);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Satellite Discovery Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Satellite className="w-5 h-5" />
            <span>Satellite Infrastructure Discovery</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Region-based Discovery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select region for discovery" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="texas">Texas (Permian Basin)</SelectItem>
                <SelectItem value="california">California (Central Valley)</SelectItem>
                <SelectItem value="nevada">Nevada (Solar Corridor)</SelectItem>
                <SelectItem value="colorado">Colorado (Wind/Gas Region)</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleRegionDiscovery}
              disabled={loading || !selectedRegion}
              className="w-full"
            >
              {loading ? (
                <>
                  <Satellite className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Discover Substations
                </>
              )}
            </Button>

            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="w-4 h-4 mr-2" />
              High-res imagery analysis
            </div>
          </div>

          {/* Coordinate-based Analysis */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Coordinate-Based Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Latitude"
                value={coordinates.lat}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lat: e.target.value }))}
              />
              <Input
                placeholder="Longitude"
                value={coordinates.lng}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lng: e.target.value }))}
              />
              <Select value={analysisType} onValueChange={setAnalysisType as any}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="substation">Substation</SelectItem>
                  <SelectItem value="transmission">Transmission</SelectItem>
                  <SelectItem value="power_plant">Power Plant</SelectItem>
                  <SelectItem value="solar_farm">Solar Farm</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Radius (km)"
                value={coordinates.radius}
                onChange={(e) => setCoordinates(prev => ({ ...prev, radius: e.target.value }))}
              />
              <Button 
                onClick={handleCoordinateAnalysis}
                disabled={loading || !coordinates.lat || !coordinates.lng}
              >
                <Crosshair className="w-4 h-4 mr-2" />
                Analyze
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discovery Results */}
      {discoveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Satellite Discoveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {discoveries.map((discovery) => (
                <div key={discovery.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{discovery.name}</h3>
                      <p className="text-muted-foreground flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {discovery.coordinates.lat.toFixed(4)}, {discovery.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getConfidenceColor(discovery.confidence_score)}`}>
                        {discovery.confidence_score}%
                      </div>
                      <div className="text-sm text-muted-foreground">confidence</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Infrastructure Detected</h4>
                      <div className="space-y-1">
                        <Badge variant="outline">{discovery.capacity_estimate}</Badge>
                        {discovery.voltage_indicators.map((indicator, i) => (
                          <Badge key={i} variant="secondary" className="mr-1 mb-1">
                            {indicator}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <div className="space-y-1">
                        {discovery.infrastructure_features.map((feature, i) => (
                          <Badge key={i} variant="outline" className="mr-1 mb-1">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getConfidenceBadge(discovery.confidence_score)}>
                        {discovery.analysis_method}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(discovery.satellite_timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleLocationValidation(discovery)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Validate
                      </Button>
                      <Button size="sm">
                        <Zap className="w-4 h-4 mr-2" />
                        Add to Database
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.power_capacity_estimate} MW
                  </div>
                  <div className="text-sm text-muted-foreground">Estimated Capacity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.infrastructure_detected?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Features Detected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analysis.grid_connections?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Grid Connections</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Infrastructure Detected</h4>
                  <div className="space-y-1">
                    {analysis.infrastructure_detected?.map((item: string, i: number) => (
                      <Badge key={i} variant="outline" className="mr-1 mb-1">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Grid Connections</h4>
                  <div className="space-y-1">
                    {analysis.grid_connections?.map((connection: string, i: number) => (
                      <Badge key={i} variant="secondary" className="mr-1 mb-1">
                        {connection}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Satellite Analysis Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Satellite className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium">High-Resolution Imagery</h4>
              <p className="text-sm text-muted-foreground">0.5m resolution satellite data</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <h4 className="font-medium">AI Pattern Recognition</h4>
              <p className="text-sm text-muted-foreground">ML-powered infrastructure detection</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Eye className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium">Multi-Spectral Analysis</h4>
              <p className="text-sm text-muted-foreground">Thermal & optical imaging</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium">Change Detection</h4>
              <p className="text-sm text-muted-foreground">Infrastructure monitoring</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
