
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoltMarketWatchlistButton } from './VoltMarketWatchlistButton';
import { supabase } from '@/integrations/supabase/client';
import { 
  MapPin, 
  Zap, 
  Building2, 
  DollarSign, 
  Calendar,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Listing {
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
  } | null;
}

interface VoltMarketListingCardProps {
  listing: Listing;
  enhanced?: boolean;
}

export const VoltMarketListingCard: React.FC<VoltMarketListingCardProps> = ({ listing, enhanced = false }) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchListingImages();
  }, [listing.id]);

  const fetchListingImages = async () => {
    try {
      const { data, error } = await supabase
        .from('voltmarket_listing_images')
        .select('image_url')
        .eq('listing_id', listing.id)
        .order('sort_order');

      if (error) throw error;
      setImages(data?.map(img => img.image_url) || []);
    } catch (error) {
      console.error('Error fetching listing images:', error);
    }
  };

  const getPriceDisplay = () => {
    if (listing.asking_price > 0) {
      return `$${listing.asking_price.toLocaleString()}`;
    } else if (listing.lease_rate > 0) {
      return `$${listing.lease_rate.toLocaleString()}/month`;
    } else if (listing.power_rate_per_kw > 0) {
      return `$${listing.power_rate_per_kw}/kW`;
    }
    return 'Contact for pricing';
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'site_sale': return 'Site for Sale';
      case 'site_lease': return 'Site for Lease';
      case 'hosting': return 'Hosting';
      case 'equipment': return 'Equipment';
      default: return type;
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Image Carousel */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <VoltMarketWatchlistButton listingId={listing.id} />
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{listing.title}</CardTitle>
          <Badge variant="secondary">
            {getListingTypeLabel(listing.listing_type)}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{listing.location}</span>
          </div>
          {listing.voltmarket_profiles?.is_id_verified && (
            <Badge variant="outline" className="text-green-600">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-4">
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
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(listing.created_at).toLocaleDateString()}
          </div>
          <Link to={`/voltmarket/listings/${listing.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
