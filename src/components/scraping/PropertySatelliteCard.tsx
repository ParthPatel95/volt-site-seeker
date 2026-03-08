import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Satellite, Loader2, MapPin, Zap } from 'lucide-react';
import { EnhancedMapboxMap } from '../EnhancedMapboxMap';
import { supabase } from '@/integrations/supabase/client';

interface PropertySatelliteCardProps {
  property: {
    address?: string;
    city?: string;
    state?: string;
    power_infrastructure?: {
      nearest_substation?: string;
      substation_distance_miles?: number;
    };
  };
}

interface NearbySubstation {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  confidence_score?: number;
}

export function PropertySatelliteCard({ property }: PropertySatelliteCardProps) {
  const [substations, setSubstations] = useState<NearbySubstation[]>([]);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [loaded, setLoaded] = useState(false);

  const locationStr = [property.address, property.city, property.state]
    .filter(Boolean)
    .join(', ');

  const loadMapData = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);

    try {
      // Use the existing google-maps-substation-finder to get nearby substations
      const { data, error } = await supabase.functions.invoke('google-maps-substation-finder', {
        body: {
          location: locationStr,
          maxResults: 5,
          useImageAnalysis: false,
        },
      });

      if (error) throw error;

      if (data?.success) {
        const center = data.searchLocation?.coordinates;
        if (center) {
          setCoordinates([center.lng, center.lat]);
        }
        setSubstations(
          (data.substations || []).map((s: any) => ({
            name: s.name,
            latitude: s.latitude,
            longitude: s.longitude,
            address: s.address,
            confidence_score: s.confidence_score,
          }))
        );
      }
      setLoaded(true);
    } catch (err) {
      console.error('Failed to load map data:', err);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [locationStr, loaded, loading]);

  return (
    <Card className="border-border">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Satellite className="w-4 h-4 text-primary" />
            Satellite View & Substations
          </CardTitle>
          {!loaded && (
            <Button size="sm" variant="outline" onClick={loadMapData} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Loading...</>
              ) : (
                <><MapPin className="w-3 h-3 mr-1" /> Load Map</>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {loaded && coordinates && (
        <CardContent className="p-0">
          <EnhancedMapboxMap
            height="h-64"
            initialCenter={coordinates}
            initialZoom={12}
            showControls={false}
            substations={substations.map((s) => ({
              name: s.name,
              latitude: s.latitude,
              longitude: s.longitude,
              address: s.address,
            }))}
          />
          {substations.length > 0 && (
            <div className="px-4 py-2 bg-muted/50 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                <Zap className="w-3 h-3 inline mr-1" />
                {substations.length} Nearby Substations
              </p>
              <div className="flex flex-wrap gap-1">
                {substations.slice(0, 3).map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {s.name}
                  </Badge>
                ))}
                {substations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{substations.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}

      {loaded && !coordinates && (
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          Could not geocode this property location.
        </CardContent>
      )}
    </Card>
  );
}
