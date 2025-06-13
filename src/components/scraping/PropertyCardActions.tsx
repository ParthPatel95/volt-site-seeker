
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { ScrapedProperty } from '@/types/scrapedProperty';

interface PropertyCardActionsProps {
  property: ScrapedProperty;
}

export function PropertyCardActions({ property }: PropertyCardActionsProps) {
  return (
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
        <span>Source: {property.source || 'Multi-platform'}</span>
      </div>
    </div>
  );
}
