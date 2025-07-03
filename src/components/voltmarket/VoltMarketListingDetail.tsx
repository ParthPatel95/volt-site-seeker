
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Zap, 
  Building2, 
  DollarSign, 
  MessageSquare, 
  Heart,
  FileText,
  Shield,
  Calendar,
  User,
  Eye,
  Info
} from 'lucide-react';
import { VoltMarketContactButton } from './VoltMarketContactButton';
import { VoltMarketWatchlistButton } from './VoltMarketWatchlistButton';
import { VoltMarketLOIModal } from './VoltMarketLOIModal';
import { VoltMarketDueDiligence } from './VoltMarketDueDiligence';
import { useVoltMarketLOI } from '@/hooks/useVoltMarketLOI';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  asking_price: number;
  power_capacity_mw: number;
  square_footage: number;
  listing_type: string;
  property_type: string;
  status: string;
  created_at: string;
  views_count: number;
  seller: {
    id: string;
    company_name: string;
    is_verified: boolean;
  };
  specifications: Record<string, string>;
}

export const VoltMarketListingDetail: React.FC = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLOIModalOpen, setIsLOIModalOpen] = useState(false);
  const [hasSignedNDA, setHasSignedNDA] = useState(false);
  const { submitLOI, loading: loiLoading } = useVoltMarketLOI();
  const { profile } = useVoltMarketAuth();
  const { toast } = useToast();

  const fetchListing = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('voltmarket_listings')
        .select(`
          *,
          seller:voltmarket_profiles!seller_id(
            id,
            company_name,
            is_id_verified
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform the data to match our interface
      const transformedListing: Listing = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        location: data.location,
        asking_price: data.asking_price || 0,
        power_capacity_mw: data.power_capacity_mw || 0,
        square_footage: data.square_footage || 0,
        listing_type: data.listing_type,
        property_type: data.property_type || 'data_center',
        status: data.status,
        created_at: data.created_at,
        views_count: data.views_count || 0,
        seller: {
          id: data.seller.id,
          company_name: data.seller.company_name || 'Unknown Company',
          is_verified: data.seller.is_id_verified || false
        },
        specifications: {
          voltage: '138kV',
          utility: 'Local Utility',
          cooling: data.cooling_type || 'N/A',
          tier: data.facility_tier || 'Tier III Ready',
          fiber: 'Multiple Carriers Available'
        }
      };

      setListing(transformedListing);

      // Increment view count
      await supabase
        .from('voltmarket_listings')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', id);

    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Error",
        description: "Failed to load listing details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkNDAStatus = async () => {
    if (!profile || !id) return;

    try {
      // Use any type to bypass TypeScript error until types are regenerated
      const { data, error } = await (supabase as any)
        .from('voltmarket_nda_signatures')
        .select('id')
        .eq('user_id', profile.id)
        .eq('listing_id', id)
        .maybeSingle();

      if (!error && data) {
        setHasSignedNDA(true);
      }
    } catch (error) {
      console.error('Error checking NDA status:', error);
    }
  };

  useEffect(() => {
    fetchListing();
    checkNDAStatus();
  }, [id, profile]);

  const handleLOISubmit = async (loiData: any) => {
    if (!listing) return;
    
    try {
      await submitLOI(listing.id, loiData);
      toast({
        title: "LOI Submitted Successfully",
        description: "Your Letter of Intent has been sent to the seller."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit LOI. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSignNDA = async () => {
    if (!profile || !listing) return;

    try {
      // Use any type to bypass TypeScript error until types are regenerated
      const { error } = await (supabase as any)
        .from('voltmarket_nda_signatures')
        .insert({
          user_id: profile.id,
          listing_id: listing.id,
          ip_address: 'unknown' // In a real app, you'd capture the actual IP
        });

      if (error) throw error;

      setHasSignedNDA(true);
      toast({
        title: "NDA Signed",
        description: "You now have access to confidential due diligence documents."
      });
    } catch (error) {
      console.error('Error signing NDA:', error);
      toast({
        title: "Error",
        description: "Failed to sign NDA. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRequestDocumentAccess = (documentId: string) => {
    toast({
      title: "Access Requested",
      description: "Your request for document access has been sent to the seller."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
            <p className="text-gray-600">The listing you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Images coming soon</p>
                </div>
              </div>
            </Card>

            {/* Title & Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Listed {new Date(listing.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{listing.views_count} views</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <VoltMarketWatchlistButton listingId={listing.id} />
                    <Badge variant="secondary" className="capitalize">
                      {listing.listing_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      ${(listing.asking_price / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-gray-600">Asking Price</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {listing.power_capacity_mw}MW
                    </div>
                    <div className="text-sm text-gray-600">Power Capacity</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Building2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {(listing.square_footage / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-gray-600">Square Feet</div>
                  </div>
                </div>
                
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                    <TabsTrigger value="due-diligence">Due Diligence</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="specifications" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(listing.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="due-diligence" className="mt-6">
                    <VoltMarketDueDiligence
                      listingId={listing.id}
                      hasSignedNDA={hasSignedNDA}
                      onSignNDA={handleSignNDA}
                      onRequestAccess={handleRequestDocumentAccess}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {listing.seller.company_name}
                      {listing.seller.is_verified && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {listing.seller.is_verified ? 'Verified Seller' : 'Seller'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Interested?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <VoltMarketContactButton
                  listingId={listing.id}
                  sellerId={listing.seller.id}
                  className="w-full"
                />
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsLOIModalOpen(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Letter of Intent
                </Button>
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Save for later
                  </div>
                  <VoltMarketWatchlistButton 
                    listingId={listing.id}
                    size="sm"
                    variant="outline"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Similar Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    No similar listings found
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* LOI Modal */}
      <VoltMarketLOIModal
        isOpen={isLOIModalOpen}
        onClose={() => setIsLOIModalOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        askingPrice={listing.asking_price}
        onSubmit={handleLOISubmit}
      />
    </div>
  );
};
