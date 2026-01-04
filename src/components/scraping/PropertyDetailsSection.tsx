
import type { ScrapedProperty } from '@/types/scrapedProperty';

interface PropertyDetailsSectionProps {
  property: ScrapedProperty;
}

export function PropertyDetailsSection({ property }: PropertyDetailsSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-sm text-foreground">Property Details</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <span className="font-medium text-muted-foreground">Year Built:</span>
          <span className="ml-2">{property.year_built || 'N/A'}</span>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Price/Sq Ft:</span>
          <span className="ml-2">${property.price_per_sqft || 'N/A'}</span>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Zoning:</span>
          <span className="ml-2">{property.zoning || 'N/A'}</span>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Substation:</span>
          <span className="ml-2">{property.substation_distance_miles || 'N/A'} mi</span>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Transmission:</span>
          <span className="ml-2">{property.transmission_access ? 'Yes' : 'No'}</span>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Source:</span>
          <span className="ml-2 capitalize">{property.source.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  );
}
