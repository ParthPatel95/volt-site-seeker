
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Zap, 
  Building2, 
  Server, 
  Heart,
  Shield,
  MessageSquare,
  DollarSign
} from 'lucide-react';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    location: string;
    listing_type: 'site_sale' | 'site_lease' | 'hosting' | 'equipment';
    asking_price: number;
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
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'site_sale':
      case 'site_lease':
        return <Building2 className="w-4 h-4" />;
      case 'hosting':
        return <Server className="w-4 h-4" />;
      case 'equipment':
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatListingType = (type: string) => {
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

  const formatPrice = (price: number, type: string) => {
    if (!price) return 'Contact for Price';
    
    if (type === 'hosting') {
      return `$${price.toFixed(3)}/kWh`;
    }
    
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    
    return `$${price.toLocaleString()}`;
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
            {getTypeIcon(listing.listing_type)}
          </div>
          <span className="text-sm text-gray-500">No image available</span>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {getTypeIcon(listing.listing_type)}
              {formatListingType(listing.listing_type)}
            </Badge>
            {listing.voltmarket_profiles?.is_id_verified && (
              <Shield className="w-4 h-4 text-green-500" title="Verified Seller" />
            )}
          </div>
          <Button variant="ghost" size="sm">
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
          {listing.title}
        </h3>

        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{listing.location}</span>
        </div>

        {listing.power_capacity_mw && (
          <div className="flex items-center text-gray-600 mb-3">
            <Zap className="w-4 h-4 mr-1" />
            <span className="text-sm">{listing.power_capacity_mw}MW</span>
          </div>
        )}

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-blue-600 flex items-center">
              <DollarSign className="w-5 h-5" />
              {formatPrice(listing.asking_price, listing.listing_type)}
            </div>
            <div className="text-xs text-gray-500">
              by {listing.voltmarket_profiles?.company_name || 'Private Seller'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {timeAgo(listing.created_at)}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/voltmarket/listings/${listing.id}`} className="flex-1">
            <Button className="w-full">View Details</Button>
          </Link>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
