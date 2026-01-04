
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, DollarSign, Building2, Trash2 } from 'lucide-react';
import { useVoltMarketWatchlist } from '@/hooks/useVoltMarketWatchlist';
import { Link } from 'react-router-dom';

export const VoltMarketWatchlist: React.FC = () => {
  const { watchlist, loading, removeFromWatchlist } = useVoltMarketWatchlist();

  const handleRemove = async (listingId: string) => {
    await removeFromWatchlist(listingId);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Watchlist</h1>
          <p className="text-muted-foreground">Keep track of your favorite listings</p>
        </div>

        {watchlist.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved listings yet</h3>
                <p className="text-gray-600 mb-6">
                  Start exploring listings and save your favorites to keep track of them here.
                </p>
                <Link to="/voltmarket/listings">
                  <Button>Browse Listings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{item.listing.title}</CardTitle>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{item.listing.location}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.listing_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatPrice(item.listing.asking_price)}
                    </div>
                    <Badge variant={item.listing.status === 'active' ? 'default' : 'secondary'}>
                      {item.listing.status}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/voltmarket/listings/${item.listing_id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Building2 className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-3">
                    Saved {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
