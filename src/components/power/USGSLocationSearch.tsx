
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface USGSLocationSearchProps {
  coordinates: { latitude: number; longitude: number };
  setCoordinates: (coords: { latitude: number; longitude: number }) => void;
  loading: boolean;
  onSearch: () => void;
}

export function USGSLocationSearch({ coordinates, setCoordinates, loading, onSearch }: USGSLocationSearchProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="w-5 h-5 mr-2 text-blue-600" />
          Location Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              value={coordinates.latitude}
              onChange={(e) => setCoordinates({
                ...coordinates,
                latitude: parseFloat(e.target.value) || 0
              })}
              placeholder="32.7767"
              step="0.0001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              value={coordinates.longitude}
              onChange={(e) => setCoordinates({
                ...coordinates,
                longitude: parseFloat(e.target.value) || 0
              })}
              placeholder="-96.7970"
              step="0.0001"
            />
          </div>
          <Button 
            onClick={onSearch}
            disabled={loading}
            className="w-full"
          >
            <Search className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Analyze Location
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
