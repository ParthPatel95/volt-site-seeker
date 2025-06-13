
import { MapPin, Calendar } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { getPropertyTypeColor } from '@/utils/scrapedPropertyUtils';
import type { ScrapedProperty } from '@/types/scrapedProperty';

interface PropertyCardHeaderProps {
  property: ScrapedProperty;
  moving: boolean;
  onMoveToProperties: () => void;
}

export function PropertyCardHeader({ property, moving, onMoveToProperties }: PropertyCardHeaderProps) {
  const confidenceScore = property.ai_analysis?.confidence_score || 85;

  return (
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
          onClick={onMoveToProperties}
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
  );
}
