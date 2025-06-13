
import { DollarSign, Building, Zap, Ruler } from 'lucide-react';
import { formatPrice } from '@/utils/scrapedPropertyUtils';
import type { ScrapedProperty } from '@/types/scrapedProperty';

interface PropertyStatsGridProps {
  property: ScrapedProperty;
}

export function PropertyStatsGrid({ property }: PropertyStatsGridProps) {
  return (
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
  );
}
