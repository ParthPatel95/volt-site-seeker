
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useVoltMarketWatchlist } from '@/hooks/useVoltMarketWatchlist';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { useToast } from '@/hooks/use-toast';

interface VoltMarketWatchlistButtonProps {
  listingId: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const VoltMarketWatchlistButton: React.FC<VoltMarketWatchlistButtonProps> = ({
  listingId,
  size = 'default',
  variant = 'default'
}) => {
  const { profile } = useVoltMarketAuth();
  const { isInWatchlist, toggleWatchlist } = useVoltMarketWatchlist();
  const { toast } = useToast();

  const isWatched = isInWatchlist(listingId);

  const handleToggle = async () => {
    if (!profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save listings to your watchlist.",
        variant: "destructive"
      });
      return;
    }

    const success = await toggleWatchlist(listingId);
    if (success) {
      toast({
        title: isWatched ? "Removed from Watchlist" : "Added to Watchlist",
        description: isWatched 
          ? "This listing has been removed from your watchlist."
          : "This listing has been added to your watchlist."
      });
    }
  };

  return (
    <Button 
      onClick={handleToggle} 
      size={size}
      variant={variant}
      className={isWatched ? 'text-red-600' : ''}
    >
      <Heart className={`w-4 h-4 mr-2 ${isWatched ? 'fill-current' : ''}`} />
      {isWatched ? 'Saved' : 'Save'}
    </Button>
  );
};
