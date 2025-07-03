
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useVoltMarketWatchlist } from '@/hooks/useVoltMarketWatchlist';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { useToast } from '@/hooks/use-toast';

interface VoltMarketWatchlistButtonProps {
  listingId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const VoltMarketWatchlistButton: React.FC<VoltMarketWatchlistButtonProps> = ({
  listingId,
  size = 'default',
  variant = 'ghost'
}) => {
  const { user } = useVoltMarketAuth();
  const { isInWatchlist, toggleWatchlist } = useVoltMarketWatchlist();
  const { toast } = useToast();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save listings to your watchlist.",
        variant: "destructive"
      });
      return;
    }

    const success = await toggleWatchlist(listingId);
    if (success) {
      const isNowInWatchlist = isInWatchlist(listingId);
      toast({
        title: isNowInWatchlist ? "Added to watchlist" : "Removed from watchlist",
        description: isNowInWatchlist 
          ? "This listing has been saved to your watchlist."
          : "This listing has been removed from your watchlist."
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  const inWatchlist = isInWatchlist(listingId);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={`${inWatchlist ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'} transition-colors`}
    >
      <Heart className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
    </Button>
  );
};
