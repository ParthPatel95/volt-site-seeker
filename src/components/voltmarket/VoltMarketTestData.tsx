import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Plus, Trash2 } from 'lucide-react';

export const VoltMarketTestData: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { profile } = useVoltMarketAuth();
  const { toast } = useToast();

  const sampleListings = [
    {
      title: "Texas Data Center Site - 150MW Capacity",
      description: "Prime industrial site in Houston, TX perfect for data center development. Direct utility connections, fiber infrastructure, and 150MW power capacity available immediately.",
      location: "Houston, TX",
      listing_type: "site_sale" as const,
      asking_price: 12500000,
      power_capacity_mw: 150,
      square_footage: 250000
    },
    {
      title: "Alberta Mining Facility - Hosted Mining Services",
      description: "Professional cryptocurrency mining hosting facility in Calgary with competitive power rates and 24/7 monitoring. Tier 3 data center standards.",
      location: "Calgary, AB",
      listing_type: "hosting" as const,
      power_rate_per_kw: 0.045,
      power_capacity_mw: 85,
      square_footage: 180000
    },
    {
      title: "Quebec Hydro Industrial Site - Renewable Power",
      description: "Exceptional industrial property with direct access to Quebec's hydro grid. Ideal for large-scale operations requiring reliable, clean energy.",
      location: "Montreal, QC",
      listing_type: "site_lease" as const,
      lease_rate: 15000,
      power_capacity_mw: 200,
      square_footage: 300000
    },
    {
      title: "Georgia Solar Farm - 75MW Generation",
      description: "Established solar generation facility with long-term power purchase agreements. Fully operational with expansion opportunities.",
      location: "Atlanta, GA",
      listing_type: "site_sale" as const,
      asking_price: 95000000,
      power_capacity_mw: 75,
      square_footage: 500000
    },
    {
      title: "Ohio Industrial Complex - Multi-Use Facility",
      description: "Large-scale industrial complex suitable for manufacturing, data centers, or cryptocurrency mining. Excellent highway access and utility connections.",
      location: "Columbus, OH",
      listing_type: "site_lease" as const,
      lease_rate: 25000,
      power_capacity_mw: 125,
      square_footage: 400000
    }
  ];

  const createTestData = async () => {
    if (!profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create test data",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Insert sample listings
      const { data, error } = await supabase
        .from('voltmarket_listings')
        .insert(
          sampleListings.map(listing => ({
            ...listing,
            seller_id: profile.id,
            status: 'active' as const
          }))
        )
        .select();

      if (error) throw error;

      toast({
        title: "Test Data Created",
        description: `Successfully created ${data.length} sample listings`,
      });

      // Reload the page to show new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error creating test data:', error);
      toast({
        title: "Error",
        description: "Failed to create test data",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const clearTestData = async () => {
    if (!profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to clear test data",
        variant: "destructive"
      });
      return;
    }

    setIsClearing(true);

    try {
      // Delete listings created by this user
      const { error } = await supabase
        .from('voltmarket_listings')
        .delete()
        .eq('seller_id', profile.id);

      if (error) throw error;

      toast({
        title: "Test Data Cleared",
        description: "Successfully removed all your test listings",
      });

      // Reload the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error clearing test data:', error);
      toast({
        title: "Error",
        description: "Failed to clear test data",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please sign in to access test data tools</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          VoltMarket Test Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Use these tools to populate the marketplace with sample listings for testing and demonstration purposes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={createTestData}
            disabled={isCreating}
            className="h-12"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Sample Listings
              </>
            )}
          </Button>
          
          <Button 
            variant="destructive"
            onClick={clearTestData}
            disabled={isClearing}
            className="h-12"
          >
            {isClearing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Your Listings
              </>
            )}
          </Button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">What this creates:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 5 diverse sample listings across different types</li>
            <li>• Mix of sites for sale, lease, and hosting services</li>
            <li>• Various locations and power capacities</li>
            <li>• Realistic pricing and descriptions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};