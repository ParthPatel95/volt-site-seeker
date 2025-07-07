import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Zap, DollarSign, Building2, Target } from 'lucide-react';

interface VoltMarketSearchMapProps {
  listings: any[];
  searchCriteria: any;
  onLocationSelect?: (location: { latitude: number; longitude: number; radius_miles: number }) => void;
}

export const VoltMarketSearchMap: React.FC<VoltMarketSearchMapProps> = ({
  listings,
  searchCriteria,
  onLocationSelect
}) => {
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of US

  useEffect(() => {
    // If there are listings with coordinates, center the map on them
    const listingsWithCoords = listings.filter(l => l.latitude && l.longitude);
    if (listingsWithCoords.length > 0) {
      const avgLat = listingsWithCoords.reduce((sum, l) => sum + l.latitude, 0) / listingsWithCoords.length;
      const avgLng = listingsWithCoords.reduce((sum, l) => sum + l.longitude, 0) / listingsWithCoords.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [listings]);

  const handleMapClick = (lat: number, lng: number) => {
    if (onLocationSelect) {
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        radius_miles: 50
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Search Results Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            {/* Placeholder for map implementation */}
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Interactive map view</p>
              <p className="text-sm text-gray-500">{listings.length} listings in search area</p>
              {searchCriteria.distance_from && (
                <Badge className="mt-2">
                  <Target className="w-3 h-3 mr-1" />
                  {searchCriteria.distance_from.radius_miles} mile radius
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Click on the map to set a search radius, or click on listing markers for details.</p>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <Card 
            key={listing.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedListing?.id === listing.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedListing(listing)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg truncate">{listing.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>{listing.power_capacity_mw}MW</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>${listing.asking_price?.toLocaleString()}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {listing.listing_type?.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Listing Details */}
      {selectedListing && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedListing.title}</h3>
                <p className="text-gray-600">{selectedListing.description}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold">${selectedListing.asking_price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="font-semibold">{selectedListing.power_capacity_mw}MW</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold">{selectedListing.listing_type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{selectedListing.location}</p>
                </div>
              </div>
              <Button className="w-full">
                View Full Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};