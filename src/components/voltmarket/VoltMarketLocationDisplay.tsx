import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Globe } from 'lucide-react';

interface VoltMarketLocationDisplayProps {
  location: string;
  listingTitle?: string;
}

export const VoltMarketLocationDisplay: React.FC<VoltMarketLocationDisplayProps> = ({
  location,
  listingTitle
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Location Details */}
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <Globe className="w-6 h-6 text-primary mt-1" />
            <div className="flex-1">
              <h4 className="font-medium text-lg mb-2">Property Location</h4>
              <p className="text-muted-foreground text-lg">{location}</p>
              {listingTitle && (
                <p className="text-sm text-muted-foreground mt-2">
                  For: {listingTitle}
                </p>
              )}
            </div>
          </div>

          {/* Map Notice */}
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Navigation className="w-8 h-8" />
            </div>
            <h4 className="font-medium mb-2">Interactive Map Unavailable</h4>
            <p className="text-sm">
              Detailed coordinates are not available for this listing yet.
            </p>
            <p className="text-xs mt-1">
              Contact the seller for more specific location details.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};