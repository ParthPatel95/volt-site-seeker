
import type { ScrapedProperty } from '@/types/scrapedProperty';
import { PowerInfraAnalysis } from './PowerInfraAnalysis';

interface PropertyDetailsSectionProps {
  property: ScrapedProperty;
}

export function PropertyDetailsSection({ property }: PropertyDetailsSectionProps) {
  const aiAnalysis = property.ai_analysis as any;
  const powerInfra = aiAnalysis?.power_infrastructure;

  return (
    <div className="space-y-3">
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

      {/* Show power infrastructure analysis from AI if available */}
      {powerInfra && <PowerInfraAnalysis analysis={powerInfra} />}

      {/* Mining suitability from AI analysis */}
      {aiAnalysis?.bitcoin_mining_suitability && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h5 className="font-semibold text-sm">⛏️ Mining Suitability Score: {aiAnalysis.bitcoin_mining_suitability.score}/10</h5>
          {aiAnalysis.bitcoin_mining_suitability.recommended_setup && (
            <p className="text-xs text-muted-foreground">{aiAnalysis.bitcoin_mining_suitability.recommended_setup}</p>
          )}
        </div>
      )}
    </div>
  );
}
