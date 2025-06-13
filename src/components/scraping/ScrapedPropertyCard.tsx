
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Zap, 
  Calendar,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Ruler,
  Home
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScrapedProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  property_type: string;
  square_footage?: number;
  lot_size_acres?: number;
  asking_price?: number;
  price_per_sqft?: number;
  year_built?: number;
  power_capacity_mw?: number;
  substation_distance_miles?: number;
  transmission_access: boolean;
  zoning?: string;
  description?: string;
  listing_url?: string;
  source: string;
  scraped_at: string;
  moved_to_properties: boolean;
  ai_analysis?: any;
}

interface ScrapedPropertyCardProps {
  property: ScrapedProperty;
  onMoveToProperties: () => void;
}

export function ScrapedPropertyCard({ property, onMoveToProperties }: ScrapedPropertyCardProps) {
  const [moving, setMoving] = useState(false);
  const { toast } = useToast();

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on Request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'industrial': return 'bg-blue-500';
      case 'warehouse': return 'bg-green-500';
      case 'manufacturing': return 'bg-orange-500';
      case 'data_center': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const moveToProperties = async () => {
    setMoving(true);
    try {
      // Insert into main properties table
      const { error: insertError } = await supabase
        .from('properties')
        .insert({
          address: property.address,
          city: property.city,
          state: property.state,
          zip_code: property.zip_code,
          property_type: property.property_type,
          square_footage: property.square_footage,
          lot_size_acres: property.lot_size_acres,
          asking_price: property.asking_price,
          price_per_sqft: property.price_per_sqft,
          year_built: property.year_built,
          power_capacity_mw: property.power_capacity_mw,
          substation_distance_miles: property.substation_distance_miles,
          transmission_access: property.transmission_access,
          zoning: property.zoning,
          description: property.description,
          listing_url: property.listing_url,
          source: 'ai_scraper',
          status: 'available'
        });

      if (insertError) throw insertError;

      // Mark as moved in scraped_properties table
      const { error: updateError } = await supabase
        .from('scraped_properties')
        .update({ moved_to_properties: true })
        .eq('id', property.id);

      if (updateError) throw updateError;

      toast({
        title: "Property Added!",
        description: "Property has been moved to your main property list.",
      });

      onMoveToProperties();
    } catch (error: any) {
      console.error('Error moving property:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to move property",
        variant: "destructive"
      });
    } finally {
      setMoving(false);
    }
  };

  const confidenceScore = property.ai_analysis?.confidence_score || 85;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{property.address}</CardTitle>
              <Badge className={`text-white text-xs ${getPropertyTypeColor(property.property_type)}`}>
                {property.property_type.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                AI Confidence: {confidenceScore}%
              </Badge>
            </div>
            <div className="flex items-center text-muted-foreground space-x-4 text-sm">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {property.city}, {property.state} {property.zip_code}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Found {new Date(property.scraped_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {!property.moved_to_properties ? (
            <Button 
              onClick={moveToProperties}
              disabled={moving}
              className="bg-green-600 hover:bg-green-700"
            >
              {moving ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                  Moving...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Add to Properties
                </>
              )}
            </Button>
          ) : (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              Added to Properties
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price and Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center bg-green-50 rounded-lg p-3">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            <div>
              <p className="text-lg font-bold text-green-700">{formatPrice(property.asking_price)}</p>
              <p className="text-xs text-muted-foreground">Asking Price</p>
            </div>
          </div>

          <div className="flex items-center bg-blue-50 rounded-lg p-3">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            <div>
              <p className="text-lg font-bold text-blue-700">{property.square_footage?.toLocaleString() || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Sq Ft</p>
            </div>
          </div>

          <div className="flex items-center bg-yellow-50 rounded-lg p-3">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            <div>
              <p className="text-lg font-bold text-yellow-700">{property.power_capacity_mw || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">MW Capacity</p>
            </div>
          </div>

          <div className="flex items-center bg-purple-50 rounded-lg p-3">
            <Ruler className="w-5 h-5 mr-2 text-purple-600" />
            <div>
              <p className="text-lg font-bold text-purple-700">{property.lot_size_acres || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Acres</p>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sm text-gray-700">Property Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-600">Year Built:</span>
              <span className="ml-2">{property.year_built || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Price/Sq Ft:</span>
              <span className="ml-2">${property.price_per_sqft || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Zoning:</span>
              <span className="ml-2">{property.zoning || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Substation:</span>
              <span className="ml-2">{property.substation_distance_miles || 'N/A'} mi</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Transmission:</span>
              <span className="ml-2">{property.transmission_access ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Source:</span>
              <span className="ml-2 capitalize">{property.source.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            {property.listing_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={property.listing_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Listing
                </a>
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>AI Generated Property</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
