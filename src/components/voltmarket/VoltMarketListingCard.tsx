
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Building2, DollarSign, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VoltMarketWatchlistButton } from './VoltMarketWatchlistButton';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    location: string;
    listing_type: string;
    asking_price: number;
    lease_rate: number;
    power_rate_per_kw: number;
    power_capacity_mw: number;
    created_at: string;
    status: string;
    seller_id: string;
    voltmarket_profiles: {
      company_name: string;
      is_id_verified: boolean;
    };
  };
}

export const VoltMarketListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'site_sale':
        return 'Site for Sale';
      case 'site_lease':
        return 'Site for Lease';
      case 'hosting':
        return 'Hosting';
      case 'equipment':
        return 'Equipment';
      default:
        return type;
    }
  };

  const getPriceDisplay = () => {
    if (listing.asking_price > 0) {
      return formatPrice(listing.asking_price);
    } else if (listing.lease_rate > 0) {
      return `${formatPrice(listing.lease_rate)}/month`;
    } else if (listing.power_rate_per_kw > 0) {
      return `$${listing.power_rate_per_kw}/kW`;
    }
    return 'Contact for pricing';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
        <Building2 className="w-12 h-12 text-gray-400" />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2">{listing.title}</CardTitle>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{listing.location}</span>
            </div>
          </div>
          <VoltMarketWatchlistButton listingId={listing.id} size="sm" variant="ghost" />
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {getListingTypeLabel(listing.listing_type)}
          </Badge>
          {listing.voltmarket_profiles.is_id_verified && (
            <Badge variant="outline" className="text-xs text-green-600">
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {listing.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-green-600 font-semibold">
            <DollarSign className="w-4 h-4 mr-1" />
            {getPriceDisplay()}
          </div>
          {listing.power_capacity_mw > 0 && (
            <div className="flex items-center text-blue-600">
              <Zap className="w-4 h-4 mr-1" />
              <span className="text-sm">{listing.power_capacity_mw}MW</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            By {listing.voltmarket_profiles.company_name}
          </div>
          <Link to={`/voltmarket/listings/${listing.id}`}>
            <Button size="sm">
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
