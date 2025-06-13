
import type { ScrapedProperty } from '@/types/scrapedProperty';

interface PropertyDetailsSectionProps {
  property: ScrapedProperty;
}

export function PropertyDetailsSection({ property }: PropertyDetailsSectionProps) {
  return (
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
  );
}
