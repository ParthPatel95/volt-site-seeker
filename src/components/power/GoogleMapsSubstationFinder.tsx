import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCapacityEstimator } from '@/hooks/useCapacityEstimator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  MapPin, 
  Zap,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface DiscoveredSubstation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  place_id: string;
  address: string;
  capacity_estimate?: {
    min: number;
    max: number;
    confidence: number;
  };
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed';
}

export function GoogleMapsSubstationFinder() {
  const [location, setLocation] = useState('');
  const [searching, setSearching] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [discoveredSubstations, setDiscoveredSubstations] = useState<DiscoveredSubstation[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { estimateCapacity } = useCapacityEstimator();

  const findSubstations = async () => {
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a state or province to search for substations",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    setProgress(0);
    
    try {
      console.log('Searching for substations in:', location);
      
      const { data, error } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: { 
          location: location.trim(),
          searchRadius: 100000, // Increased to 100km radius
          maxResults: 100 // Increased to find more substations
        }
      });

      if (error) throw error;

      const substations: DiscoveredSubstation[] = data.substations.map((sub: any) => ({
        ...sub,
        analysis_status: 'pending'
      }));

      setDiscoveredSubstations(substations);
      setProgress(25);

      toast({
        title: "Substations Found",
        description: `Found ${substations.length} substations in ${location}`,
      });

      // Auto-start capacity analysis
      await analyzeAllSubstations(substations);

    } catch (error: any) {
      console.error('Substation search error:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search for substations",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const analyzeAllSubstations = async (substations: DiscoveredSubstation[]) => {
    setAnalyzing(true);
    const total = substations.length;
    
    for (let i = 0; i < substations.length; i++) {
      const substation = substations[i];
      
      try {
        // Update status to analyzing
        setDiscoveredSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { ...s, analysis_status: 'analyzing' } 
            : s
          )
        );

        console.log(`Analyzing substation ${i + 1}/${total}:`, substation.name);

        const capacityResult = await estimateCapacity({
          latitude: substation.latitude,
          longitude: substation.longitude,
          manualOverride: {
            utilityContext: {
              name: substation.name,
              notes: `Auto-discovered via Google Maps API from ${location}`
            }
          }
        });

        // Update with capacity results
        setDiscoveredSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { 
                ...s, 
                analysis_status: 'completed',
                capacity_estimate: {
                  min: capacityResult.estimatedCapacity.min,
                  max: capacityResult.estimatedCapacity.max,
                  confidence: capacityResult.detectionResults.confidence
                }
              } 
            : s
          )
        );

        // Store in database with proper error handling
        await storeSubstationData(substation, capacityResult);

      } catch (error) {
        console.error(`Failed to analyze ${substation.name}:`, error);
        
        setDiscoveredSubstations(prev => 
          prev.map(s => s.id === substation.id 
            ? { ...s, analysis_status: 'failed' } 
            : s
          )
        );
      }

      // Update progress
      setProgress(25 + ((i + 1) / total) * 75);
    }

    setAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Completed capacity analysis for ${substations.length} substations`,
    });
  };

  const storeSubstationData = async (substation: DiscoveredSubstation, capacityResult: any) => {
    try {
      // First, try to insert the record
      const { error: insertError } = await supabase
        .from('substations')
        .insert({
          name: substation.name,
          latitude: substation.latitude,
          longitude: substation.longitude,
          city: extractCityFromAddress(substation.address),
          state: extractStateFromAddress(substation.address),
          capacity_mva: capacityResult.estimatedCapacity.max * 1.25, // Convert MW to MVA estimate
          voltage_level: 'Estimated',
          utility_owner: 'Unknown',
          interconnection_type: capacityResult.substationType || 'unknown',
          load_factor: 0.75, // Default estimate
          status: 'active',
          coordinates_source: 'google_maps_api'
        });

      // If insert fails due to duplicate, try to update instead
      if (insertError) {
        const { error: updateError } = await supabase
          .from('substations')
          .update({
            capacity_mva: capacityResult.estimatedCapacity.max * 1.25,
            interconnection_type: capacityResult.substationType || 'unknown',
            coordinates_source: 'google_maps_api'
          })
          .eq('name', substation.name)
          .eq('latitude', substation.latitude)
          .eq('longitude', substation.longitude);

        if (updateError) {
          console.error('Error updating substation:', updateError);
        }
      }
    } catch (error) {
      console.error('Storage error:', error);
    }
  };

  const extractCityFromAddress = (address: string): string => {
    const parts = address.split(',');
    return parts[0]?.trim() || 'Unknown';
  };

  const extractStateFromAddress = (address: string): string => {
    const parts = address.split(',');
    const statePart = parts[parts.length - 2]?.trim();
    return statePart?.split(' ')[0] || 'Unknown';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case 'analyzing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'analyzing': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Google Maps Substation Discovery</span>
            <Badge variant="outline">AI-Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="location">State or Province</Label>
              <Input
                id="location"
                placeholder="e.g., Texas, California, Ontario"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && findSubstations()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={findSubstations}
                disabled={searching || analyzing || !location.trim()}
                className="flex items-center space-x-2"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                <span>{searching ? 'Searching...' : 'Find Substations'}</span>
              </Button>
            </div>
          </div>

          {(searching || analyzing) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {searching ? 'Searching for substations...' : 'Analyzing capacity...'}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {discoveredSubstations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Discovered Substations ({discoveredSubstations.length})</span>
              </div>
              <Badge variant="secondary">
                {discoveredSubstations.filter(s => s.analysis_status === 'completed').length} Analyzed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {discoveredSubstations.map((substation) => (
                <div 
                  key={substation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{substation.name}</h4>
                      {getStatusIcon(substation.analysis_status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {substation.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      {substation.latitude.toFixed(6)}, {substation.longitude.toFixed(6)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(substation.analysis_status)}>
                      {substation.analysis_status}
                    </Badge>
                    
                    {substation.capacity_estimate && (
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          {substation.capacity_estimate.min}-{substation.capacity_estimate.max} MW
                        </div>
                        <div className="text-xs text-gray-500">
                          {substation.capacity_estimate.confidence}% confidence
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
